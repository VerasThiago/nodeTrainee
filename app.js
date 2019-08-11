// Imports
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const log = require('loglevel');
const logFormat = require('loglevel-format');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const Meal = require('./models');
// App creation
const app = express();
// Parsers
const jsonParser = bodyParser.json();
// Locale to Brazilian portuguese (for datetime objects)
moment.locale('pt-BR');
// Default port
const PORT = 8080;
const HOST = "0.0.0.0";
const MONGO = process.env.CONN;
// Log level
const LOG_LEVEL = log.levels.INFO;
log.setDefaultLevel(LOG_LEVEL);
// Log format.
// Message example: [INFO] 15:08:26: Server listening in port 8080
var defaults = {
template: '[%l] %t: %m',
    messageFormatter: function(data){
        return data;  
    },
    timestampFormatter: function (date) {
        return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
    },
    levelFormatter: function (level) {
        return level.toUpperCase();
    },
    nameFormatter: function (name) {
        return name || 'root';
    },
    appendExtraArguments: false
};
// Apply format to logs
logFormat.apply(log, defaults);
// Connect to MongoDB
mongoose.connect('mongodb://' + MONGO + ':27017/nodeTreinee', {useNewUrlParser: true});
// Log all incoming requests for debug
app.use( (req, res, next) => {
    log.debug(`Received ${req.method} ${req.url}`);
    next();
});

// ROUTE PATHS
app.get('/', (req, res) => {
    res.end(`
    Welcome to our simple API :D
    Methods:

    GET /time - Get current time
    POST /time, send timestamp or time string - Get how long ago that moment was

    GET /meals - Get all meals stored
    POST /meals, send meal in json format - Add new meal.
    PUT /meals/:id, send meal fields - Update meal
    `);
});

app.use('/time', bodyParser.text());
app.route('/time')
    .get((req, res) => {
        res.send(`Now is ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
    })
    .post(bodyParser.text(), (req, res) => {
        let date = moment(String(req.body).replace(/^"(.*)"$/, '$1'));
        if(!date.isValid()){
            log.info(`Invalid date (${date}) received at POST /time`);
            res.status(HttpStatus.BAD_REQUEST)
            res.end(`${req.body} is not a valid date`);
        } else {
            res.end(`Received ${date.format("dddd, MMMM Do YYYY, h:mm:ss a")} (${date.fromNow()})\nNow is ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
        }
    });
    
app.route('/meals')
    .get((req, res) => {
        let allMeals = Meal.find({}).select("-__v");

        allMeals.exec((err, meals) => {
            if(err){
                log.error("In GET /meals - " + err.mesage);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.json({"result": "Fail", "error": "Could not load meals."});
                res.end();
            } else {
                res.json({"size": meals.length, "meals": meals});
            }
        });
    })
    .post(jsonParser, (req, res) => {
        let newMeal = req.body;
        // Gets date received and removes quotation marks, if any
        entry_date = String(newMeal.date).replace(/^"(.*)"$/, '$1');
        // Create new moment object
        newMeal.date = moment(newMeal.date);
        newMeal.createdAt = moment();
        newMeal.updatedAt = moment();
        // Add newMeal to database
        Meal(newMeal).save( (err, data) =>{
            if(err){
                log.error("In POST /meals - " + err.message);
                res.json({"result": "Fail", "error": err.message});
            } else {
                log.info(`New meal added to database: ${newMeal}`);
                res.status(HttpStatus.CREATED);
                res.json({"result":"Success", "id":data._id});
            }
        });
    });

app.put('/meals/:id', jsonParser, (req, res) => {
    var data = req.body;
    let id = req.params.id;
    
    Meal.findById(id, (err, meal) => {
        if(err){
            log.error("In PUT /meals/:id - " + err.message);
            res.json({"result": "Fail", "error": err.message});
            res.end();
            return;
        }

        for(let f in data){
            // Verifies that received object is valid
            // That is, all keys in the object exist in meals.
            if(data.hasOwnProperty(f)){
                if(!meal[f]){
                    log.warn(`In PUT /meals/:id - Invalid property received. (${f})`);
                    res.status(HttpStatus.BAD_REQUEST);
                    res.json({"result":"Fail", "error":"Meal has no property " + f});
                    res.end();
                    return;
                } else {
                    // Change is valid
                    meal[f] = data[f];
                }
            } 
        }
        meal.updatedAt = moment();
        meal.save( (err) => {
            if(err){
                log.error("In PUT /meals/:id - " + err.message);
                res.json({"result": "Fail", "error": err.message});
                res.end();
                return;
            } else {
                log.debug(`In PUT /meals/:id - Changed meal successfully.`);
                res.json({"result":"Success"});
                res.end();
            }
        });
    });
});

// Get meals from X days ago
app.get('/consume/:days', (req, res) => {
    let duration = req.params.days;
    if(isNaN(duration) || duration < 0){
        log.info(`In GET /consume/:days - Received invalid duration ${duration}`);
        res.status(HttpStatus.BAD_REQUEST);
        res.json({"result": "Fail", "error": "Number of days is not a valid number."});
        res.end();
        return;
    }
    let mealsToSend = [];
    let now = moment();
    let totalCalories = 0.0;
    // Limit is duration days before today
    // Note that subtracts change the object, so we need to do it only once
    // And it can't be in the 'now' object
    let limit = new moment(now);
    limit.subtract(duration, 'days');
    length.debug(`In GET /consume/:days - Getting meal consmed between ${limit.format("MM Do YYYY")} and ${now.format("MM Do YYYY")}`);

    for(let i = 0; i < meals.size; i++){
        let meal = meals.meals[i];
        if(meal.date.isBetween(limit, now)){
            html += "<li><h2>" + meal.name + "</h2></li>";
            html += "<ul>";
            html += "<li><h3>Calories : " + meal.calories.toString() + "</h3></li>";
            html += "</ul>";
            mealsToSend.push(meal);
            totalCalories += meal.calories;
        }
    }
    log.debug(`${mealsToSend.length} meals sent back.`);
    res.json({"size" : mealsToSend.length, "meals": mealsToSend});
    res.end();
});

app.listen(PORT, HOST, () => {
    log.info("Server listening in port " + PORT)
});

