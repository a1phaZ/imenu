const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	title: {type: String},
	description: {type: String},
	items: {
		type: mongoose.Schema.Types.ObjectId,
		ref: ' Dish'
	}
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;