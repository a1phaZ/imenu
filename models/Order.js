const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const orderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	comment: {type: String},
	orderPlz: {type: Boolean},
	orderAdminList: [{
		cartItemId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		},
		count: {type: Number}
	}],
	orderList: [{
		cartItemId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		},
		count: {type: Number}
	}],
	historyList: [{
		cartItemId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		},
		count: {type: Number}
	}],
	sum: {type: Number},
	status: {type: Number},
	closed: {type: Boolean}
},{timestamps: true});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;