const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
	title      : {type: String},
	description: {type: String},
	composition: {type: String},
	category   : {
		type     : mongoose.Schema.Types.ObjectId,
		ref      : 'Category'
	},
	price      : {type: Number},
	waiting    : {type: Number},
	discount   : {type: Number}
});

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;