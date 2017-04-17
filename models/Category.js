const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugify = require('transliteration').slugify;

const categorySchema = new mongoose.Schema({
	title      : {type: String, unique: true},
	description: {type: String},
	logo       : {type: String},
	slug       : {type: String},
	companyName: {type: String}
},{timestamps: true});

categorySchema.pre('save', function save(next, title, cb) {
	const category = this;
	category.slug = slugify(title);
	next(cb);
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;