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
		.find({
			status: {
				$lt:4
			}, 
			companyName: req.subdomains[0]
		})
		.sort({status: 1})
		.populate([{
				path: 'orderList.cartItemId'
			},{
				path: 'userId'
			},{
				path: 'historyList.cartItemId'
			},{
				path: 'orderAdminList.cartItemId'
			}]);
	getOrderOpenList
		.then((orders) => {
			res.render('order/order-open', {
				title: 'Открытые заказы',
				orderOpenList: orders
			});
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
		.find({
			status: {
				$gt:3
			}, 
			companyName: req.subdomains[0]
		})
		.sort({updatedAt: -1})
		.populate([{
				path: 'orderList.cartItemId'
			},{
				path: 'userId'
			},{
				path: 'historyList.cartItemId'
			},{
				path: 'orderAdminList.cartItemId'
			}]);
	getOrderCloseList
		.then((orders) => {
			res.render('order/order-close', {
				title: 'Закрытые заказы',
				orderOpenList: orders
			});
		})
		.catch((error) => {
			next(error);
		});
};

/**
 * GET /order/:id
 * Страница оформления заказа
 */
exports.getOrder = (req, res, next) =>{
	if (req.params.id){
		const findOrderById = Order
			.findOne({_id: req.params.id})
			.populate([{
				path: 'orderList.cartItemId'
			},{
				path: 'userId'
			},{
				path: 'historyList.cartItemId'
			}]);
		findOrderById.
			then((order)=>{
				if (order){
					res.render('order/index',{
						orderList: order.orderList,
						historyList: order.historyList,
						orderStatus: order.status,
						orderComment: order.comment,
						orderPlz: order.orderPlz,
						orderId: order._id,
						title: 'Заказ №'+order._id
					});
				} else {
					const err = new Error();
					err.status = 404;
					err.message = 'Заказ не найден';
					next(err);
				}
			}).
			catch((err)=>{
				next(err);
			})
	}
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
					const idInOrderList = order.orderList.filter((item)=>{
						if (item.cartItemId == req.body.cartItemId){
							item.count +=1;
							return true;
						} 
						return false;
					});
					if (idInOrderList.length === 0){
						order.orderList.push({cartItemId: req.body.cartItemId, count: 1});
					}
					order.save((err)=>{
						if (err) next(err);
						res.send(order);
					});
				} else {
					const order = new Order();
					order.orderList.push({cartItemId: req.body.cartItemId, count: 1});
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
		order.companyName = req.subdomains[0];
		order.orderList.push({cartItemId: req.body.cartItemId, count: 1});
		order.save((err)=>{
			if (err) next(err);
			res.send(order);
		});
	}
};

/**
 * POST /order/change
 */
exports.postOrderChange = (req, res, next) =>{
	if (req.body.orderId){
		let FindOrderByIdAndUpdate = Order
			.findOne({_id: req.body.orderId})
			.populate([{
				path: 'orderList.cartItemId'
			},{
				path: 'historyList.cartItemId'
			}]);
		FindOrderByIdAndUpdate
			.then((order)=>{
				if (order){
					order.orderList.forEach((item)=>{
						if(item.cartItemId._id == req.body.cartItemId){
							item.count = req.body.cartItemCount;
						}
					});
					order.save((err)=>{
						if (err) next(err);
						res.send(order);
					});
				} else {
					const err = new Error();
					err.status = 404;
					err.message = 'Заказ не найден';
					next(err);
				}
			})
			.catch((err)=>{
				next(err);
			});	
	}	else {
		const err = new Error();
		err.status = 404;
		err.message = 'Заказ не найден';
		next(err);
	}
};

/**
 * POST /order/item-delete
 */
exports.postOrderItemDelete = (req, res, next) =>{
	if (req.body.orderId){
		let FindOrderByIdAndUpdate = Order
				.findOne({_id: req.body.orderId})
				.populate([{
					path: 'orderList.cartItemId'
				},{
					path: 'historyList.cartItemId'
				}]);
			FindOrderByIdAndUpdate
				.then((order)=>{
					if(order){
						let itemPosition;
						order.orderList.forEach((item, i)=>{
							if(item.cartItemId._id == req.body.cartItemId){
								itemPosition = i;
							}
						});
						order.orderList.splice(itemPosition, 1);
						order.save((err)=>{
							if (err) next(err);
							res.send(order);
						});
					} else {
						const err = new Error();
						err.status = 404;
						err.message = 'Заказ не найден';
						next(err);
					}
				})
				.catch((err)=>{
					next(err);
				});
	} else {
		const err = new Error();
		err.status = 404;
		err.message = 'Заказ не найден';
		next(err);
	}
};

/**
 * POST /order/:id
 */
exports.postOrder = (req, res, next) =>{
	req.assert('comment', 'Пожалуйста, напишите комментарий').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/order/'+req.params.id);
	}
	let FindOrderByIdAndUpdate = Order
			.findOne({_id: req.params.id});
		FindOrderByIdAndUpdate
			.then((order)=>{
				if(order){
					if (!order.userId){
						order.userId = req.user._id;
					}
					order.comment = req.body.comment;
					order.status = 1;
					//order.closed = false;
					order.orderList.forEach((item)=>{
						order.orderAdminList.push({cartItemId: item.cartItemId, count: item.count});
					});
					order.orderList.forEach((item)=>{
						order.historyList.push({cartItemId: item.cartItemId, count: item.count});
					});					
					order.orderList = [];
					order.save((err)=>{
						if (err) next(err);
						req.flash('success', {msg: 'Заказ №'+order._id+' успешно отправлен'});
						//res.send(order);
						res.redirect('/');
					});
				} else {
					const err = new Error();
					err.status = 404;
					err.message = 'Заказ не найден';
					next(err);
				}
			})
			.catch((err)=>{
				next(err);
			});
};

/**
 * GET /order/:id/close
 */
exports.getOrderClose = (req, res, next) =>{
	let findOrderById = Order
			.findOne({_id: req.params.id});
		findOrderById
			.then((order)=>{
				if(order){
					order.orderPlz = true;
					order.save((err)=>{
						req.flash('success', {msg: 'Заказ №'+order._id+' отправлен на закрытие'});
						res.redirect('/');
					})
				} else {
					const err = new Error();
					err.status = 404;
					err.message = 'Заказ не найден';
					next(err);
				}
			})
			.catch((err)=>{
				next(err);
			});
};

/**
 * POST /order/:id/status
 */
exports.changeOrderStatus = (req, res, next) =>{
	let getOrderById = Order
			.findOne({_id: req.params.id});
		getOrderById
			.then((order)=>{
				if(order){
					order.status +=1;
					order.orderAdminList = [];
					if (order.status == 4){
						order.orderPlz = false;
					}
					//order.closed = (order.status == 4);
					order.save((err)=>{
						if (err) next(err);
						res.send(order);
					});
				} else {
					const err = new Error();
					err.status = 404;
					err.message = 'Заказ не найден';
					next(err);
				}
			})
			.catch((err)=>{
				next(err);
			});
};

/**
 * GET /my
 */
exports.getMyOrders = (req, res, next) =>{
	if (!res.locals.isAdmin){
		let getOrderList = Order
			.find({userId: req.user._id})
			.sort({updatedAt: -1})
			.populate([{
				path: 'orderList.cartItemId'
			},{
				path: 'historyList.cartItemId'
			},{
				path: 'orderAdminList.cartItemId'
			}]);
		getOrderList
			.then((orders) => {
				res.render('order/my', {
					orders: orders,
					title: 'История заказов'
				});
			})
			.catch((err) => {
				next(err);
			});
	} else {
		res.redirect('/');
	}
};
