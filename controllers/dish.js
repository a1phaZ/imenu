const Dish = require('../models/Dish');

// GET /dishes
exports.getDishesList = (req, res, next) =>{
	let getDishesList = Dish
		.find()
		.populate({
			path: 'category'
		});
	getDishesList
		.then((dishesList) => {
			res.send(dishesList);
		})
		.catch((error) => {
			next(error);
		});
};

// GET /category/:slug/dishes
exports.getDishesListByCategorySlug = (req, res, next) =>{
	let getDishesList = Dish
		.find({category: req.params.slug})
		.populate({
			path: 'category'
		});
	getDishesList
		.then((dishesList) => {
			res.send(dishesList);
		})
		.catch((error) => {
			next(error);
		});
};

