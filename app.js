// Imports
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
// App creation
const app = express();
// Parsers
const jsonParser = bodyParser.json();
// BR, mano
moment.locale('pt-BR');
// Default port
const PORT = 8080;
const HOST = "0.0.0.0";
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

app.get('/', (req, res) => {
    res.end("Server running :+1:");
});

app.use('/time', bodyParser.text());
app.route('/time')
    .get((req, res) => {
    res.send(`Now is ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
    })
    .post(bodyParser.text(), (req, res) => {
        let date = moment(String(req.body).replace(/^"(.*)"$/, '$1'));
        if(!date.isValid()){
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

        res.json({"result":"Success", "id":newMeal.id});
    });

app.put('/meals/:id', jsonParser, (req, res) => {
    let data = req.body;
    let id = req.params.id;
    // ID error check
    if(id < 0 || id > meals.size){
        res.json({"result":"Fail", "error":"Invalid ID (" + id + ")"});
        res.end();
    }
    let changedMeals = meals.meals.slice()
    // Process changes
    for(let f in data){
        // Verifies that received object is valid
        // That is, all keys in the object exist in meals.
        if(data.hasOwnProperty(f)){
            if(!changedMeals[id].hasOwnProperty(f)){
                res.json({"result":"Fail", "error":"Meal has no property " + f});
                res.end();
                return;
            } else {
                // Change is valid
                changedMeals[id][f] = data[f];
            }
        } 
    }
    // Now effectively make the changes
    changedMeals[id].updatedAt = moment();
    meals.meals = changedMeals;
    res.json({"result":"Success", "id": id});
    res.end();
});

// Get meals from X days ago
app.get('/consume/:days', (req, res) => {
    let duration = req.params.days;
    let mealsToSend = [];
    let now = moment();
    // Limit is duration days before today
    // Note that subtracts change the object, so we need to do it only once
    // And it can't be in the 'now' object
    let limit = new moment(now);
    limit.subtract(duration, 'days');
    for(let i = 0; i < meals.size; i++){
        let meal = meals.meals[i];
        if(meal.date.isBetween(limit, now)){
            mealsToSend.push(meal);
        }
    }
    res.json({"size" : mealsToSend.length, "meals": mealsToSend});
    res.end();
});

app.listen(PORT, HOST, () => {console.log("Server listening in port " + PORT)});

