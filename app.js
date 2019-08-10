// Imports
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const log = require('loglevel');
const logFormat = require('loglevel-format');
const HttpStatus = require('http-status-codes');
// App creation
const app = express();
// Parsers
const jsonParser = bodyParser.json();
// Locale to Brazilian portuguese
moment.locale('pt-BR');
// Default port
const PORT = 8080;
const HOST = "0.0.0.0";
// Log level
const LOG_LEVEL = log.levels.INFO;
log.setDefaultLevel(LOG_LEVEL);
// Log format
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
logFormat.apply(log, defaults);
// Mock DB
var meals = {
    "size": 3,
    "meals": [
        {
            "id":0,
            "name": "Batata Frita",
            "description": "Delicious :P",
            "calories": 100,
            "date": moment("2015-03-25T12:00:00Z"),
            "createdAt": moment(),
            "updatedAt": moment()
        },
        {
            "id":1,
            "name": "Milk Shake",
            "description": "Sdds Bob's Ovomaltine",
            "calories": 100,
            "date": moment("2019-08-08T11:04:00Z"),
            "createdAt": moment(),
            "updatedAt": moment()
        },
        {
            "id":2,
            "name": "Big Mac",
            "description": "2 hambúrgueres, alface, queijo e o molho especial. Cebola, pickles e o pão com gergelim",
            "calories": 1000,
            "date": moment("2019-08-09T12:00:00.000Z"),
            "createdAt": moment(),
            "updatedAt": moment()
        }
    ]
}
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
        res.json(meals);
    })
    .post(jsonParser, (req, res) => {
        let newMeal = req.body;
        // Gets date received and removes quotation marks, if any
        entry_date = String(newMeal.date).replace(/^"(.*)"$/, '$1');
        // Create new moment object
        newMeal.date = moment(newMeal.date);
        newMeal.createdAt = moment();
        newMeal.updatedAt = moment();
        // Add index
        newMeal.id = meals.size
        meals.meals.push(newMeal);
        meals.size = meals.meals.length;

        log.info(`New meal added to mock database: ${newMeal}`);
        log.info(`Mock Database now has ${meals.size} meals stored`);
        res.status(HttpStatus.CREATED);
        res.json({"result":"Success", "id":newMeal.id});
    });

app.put('/meals/:id', jsonParser, (req, res) => {
    let data = req.body;
    let id = req.params.id;
    // ID error check
    if(id < 0 || id > meals.size){
        log.warn(`In PUT /meals/:id - Invalid ID received. (${id})`);
        res.status(HttpStatus.BAD_REQUEST);
        res.json({"result":"Fail", "error":"Invalid ID (" + id + ")"});
        res.end();
        return;
    }
    let changedMeals = meals.meals.slice()
    // Process changes
    for(let f in data){
        // Verifies that received object is valid
        // That is, all keys in the object exist in meals.
        if(data.hasOwnProperty(f)){
            if(!changedMeals[id].hasOwnProperty(f)){
                log.warn(`In PUT /meals/:id - Invalid property received. (${f})`);
                res.status(HttpStatus.BAD_REQUEST);
                res.json({"result":"Fail", "error":"Meal has no property " + f});
                res.end();
                return;
            } else {
                // Change is valid
                log.debug(`In PUT /meals/:id - Changed property ${f} from meal ${id}.\nFrom ${changedMeals[id][f]} to ${data[f]}`);
                changedMeals[id][f] = data[f];
            }
        } 
    }
    // Now effectively make the changes
    changedMeals[id].updatedAt = moment();
    meals.meals = changedMeals;
    log.info(`In PUT /meals/:id - Updated meal ${id}: ${changedMeals[id]}`);
    res.status(HttpStatus.OK);
    res.json({"result":"Success", "id": id});
    res.end();
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
    // Limit is duration days before today
    // Note that subtracts change the object, so we need to do it only once
    // And it can't be in the 'now' object
    let limit = new moment(now);
    limit.subtract(duration, 'days');
    length.debug(`In GET /consume/:days - Getting meal consmed between ${limit.format("MM Do YYYY")} and ${now.format("MM Do YYYY")}`);

    for(let i = 0; i < meals.size; i++){
        let meal = meals.meals[i];
        if(meal.date.isBetween(limit, now)){
            mealsToSend.push(meal);
        }
    }
    log.debug(`${mealsToSend.length} meals sent back.`);
    res.json({"size" : mealsToSend.length, "meals": mealsToSend});
    res.end();
});

app.listen(PORT, HOST, () => {
    log.info("Server listening in port " + PORT)
});

