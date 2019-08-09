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
    "size": 2,
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
    // Process changes
    for(let f in data){
        // Valid key
        if(data.hasOwnProperty(f)){
            if(meals.meals[id].hasOwnProperty(f)){
                meals.meals[id][f] = data[f];
            } else {
                res.json({"result":"Fail", "error":"Meal has no property " + f});
            }
        } 
    }
    meals.meals[id].updatedAt = moment();
    res.json({"result":"Success", "id": id});
});

app.listen(PORT, HOST, () => {console.log("Server listening in port " + PORT)});

