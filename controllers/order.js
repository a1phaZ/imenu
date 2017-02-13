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
 * GET /order/new
 * Страница оформления заказа
 */
exports.getNewOrder = (req, res) =>{
	res.render('order/order', {
		title: 'Новый заказ'
	});
};