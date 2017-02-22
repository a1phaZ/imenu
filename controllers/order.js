const Order = require('../models/Order');

/**
 * GET /order-list
 * Получение всех заказов, открытых, закрытых
 */
exports.getOrderList = (req, res, next) =>{
	let getOrderList = Order
		.find();
	getOrderList
		.then((orders) => {
			res.send(orders);
		})
		.catch((error) => {
			next(error);
		});
};

/**
 * GET /order-open
 * Получение всех открытых заказов
 */
exports.getOrderOpenList = (req, res, next) =>{
	let getOrderOpenList = Order
		.find()
		.where('closed').equals(false);
	getOrderOpenList
		.then((orders) => {
			res.send(orders);
		})
		.catch((error) => {
			next(error);
		});
};

/**
 * GET /order-close
 * Получение всех закрытых заказов
 */
exports.getOrderCloseList = (req, res, next) =>{
	let getOrderCloseList = Order
		.find()
		.where('closed').equals(true);
	getOrderCloseList
		.then((orders) => {
			res.send(orders);
		})
		.catch((error) => {
			next(error);
		});
};

/**
 * GET /order
 * Страница оформления заказа
 */
exports.getNewOrder = (req, res) =>{
	console.log(req);
	res.send(req.body);
	// res.render('order/order', {
	// 	title: 'Новый заказ'
	// });
};

/**
 * POST /order/add
 */
exports.postOrderAdd = (req, res, next) =>{
	if (req.body.orderId) {
		const FindOrderByIdAndUpdate = Order.findOne({_id: req.body.orderId});
		FindOrderByIdAndUpdate.
			then((order)=>{
				if (order){
					order.orderList.push({cartItemId: req.body.cartItemId});
					order.save((err)=>{
						if (err) next(err);
						res.send(order);
					});
				} else {
					const order = new Order();
					order.orderList.push({cartItemId: req.body.cartItemId});
					order.save((err)=>{
						if (err) next(err);
						res.send(order);
					});
				}
			}).
			catch((err)=>{
				next(err);
			});
	} else {
		const order = new Order();
		order.orderList.push({cartItemId: req.body.cartItemId});
		order.save((err)=>{
			if (err) next(err);
			res.send(order);
		});
	}
};