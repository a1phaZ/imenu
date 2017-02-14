const mongoose = reqiure('mongoose');
mongoose.Promise = global.Promise;

const orderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	description: {type: String},
	product: [{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		}
	}],
	sum: {type: Number},
	closed: {type: Boolean}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;