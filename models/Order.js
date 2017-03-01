const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const orderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	comment: {type: String},
	orderList: [{
		cartItemId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		},
		count: {type: Number}
	}],
	sum: {type: Number},
	status: {type: Number},
	closed: {type: Boolean}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;