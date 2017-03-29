const Order = require('../models/Order');

/**
 * /state
 */
exports.getState = (req, res, next) =>{
	function getOrderId(order) {
		if(order){
			//пользователь не авторизован 
			if (!req.user){
				//заказ не привязан к пользователю
				if (!order.userId){
					return {
						id: order._id,
						count: order.historyList.length + order.orderList.length
					}
				//заказ привязан к пользователю
				} else {
					return {
						id: null,
						count: null
					}
				}
			//пользователь авторизован 
			} else {
				//заказ не привязан к пользователю или пользователь совпадает
				if (!order.userId || req.user.id == order.userId){
					return {
						id: order._id,
						count: order.historyList.length + order.orderList.length
					}
				//заказ привязан к пользователю
				} else {
					return {
						id: null,
						count: null
					}
				}
			}
		}
	};

	function getPersonalOrder(order){
		if(order && order.status != 4){
			return {
				id: order._id,
				count: order.historyList.length + order.orderList.length
			}
		} else {
			return {
				id: null,
				count: null
			}
		}
	};

	if(req.body.order.id){
		let getOrder = Order
			.findOne({_id: req.body.order.id});
		getOrder
			.then((order)=>{
				res.send(getOrderId(order));
			})
			.catch((err)=>{
				next(err);
			});
	} else {
		if (req.user){
			let getOrderById = Order
				.findOne({userId: req.user._id})
				.sort({'createdAt': -1})
				.limit(1);
			getOrderById
				.then((order)=>{
					res.send(getPersonalOrder(order));
				})
				.catch((err)=>{
					next(err);
				});
		} else {
			res.send({
				id: null,
				count: null
			});
		}
	}
};