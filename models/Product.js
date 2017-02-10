const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	title      : {type: String},
	slug       : {type: String, unique: true},
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;