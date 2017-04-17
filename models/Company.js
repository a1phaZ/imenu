const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugify = require('transliteration').slugify;

const companySchema = new mongoose.Schema({
	title: {type: String},
	description: {type: String},
	logo: {type: String},
	slug: {type: String, unique: true},
	url: {type: String},
	adminId: {
    type     : mongoose.Schema.Types.ObjectId,
    ref      : 'User'
  },
	address : {
		region: String,
		city  : String,
		street: String
  }
},{timestamps: true});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;