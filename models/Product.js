const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugify = require('transliteration').slugify;

const productSchema = new mongoose.Schema({
	title      : {type: String},
	slug       : {type: String, unique: true},
	description: {type: String},
	logo       : {type: String},
	composition: {type: String},
	category   : {
		type     : mongoose.Schema.Types.ObjectId,
		ref      : 'Category'
	},
	price      : {type: Number},
	waiting    : {type: Number},
	discount   : {type: Number}
});

productSchema.pre('save', function save(next, title, cb) {
	const product = this;
	product.slug = slugify(title);
	next(cb);
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;