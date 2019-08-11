const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

// Create Schema for our model
const mealSchema = new Schema({
    name: {type: String, required: true},
    description: String,
    calories: {type: Number, required: true},
    date: {type: Date, required: true},
    createdAt: Date,
    updatedAt: Date
});

// Create the model
var Meal = mongoose.model('Meal', mealSchema);
// Export model
module.exports = Meal;