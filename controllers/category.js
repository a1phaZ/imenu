const Category = require('../models/Category');

//GET /category
exports.getCategoryList = (req, res, next) =>{
	let getCategoryList = Category
		.find();
	getCategoryList
		.then((categoryList) => {
			res.send(categoryList);
		})
		.catch((error) => {
			next(error);
		});
};

//GET /category/new
exports.getNewCategory = (req, res) =>{
	res.render('category/category', {
		title: 'Новая категория'
	});
};

//POST /category
//POST /category/new
exports.postNewCategory = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/category/new');
	}
	const category = new Category({
		title: req.body.title,
		description: req.body.description
	});
	category.save(req.body.title, (err)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно создана'});
		res.redirect('/category');
	});
};

//GET /category/:slug
exports.getCategoryBySlug = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category) =>{
			res.send(category);
		})
		.catch((error)=>{
			next(error);
		});
};

//POST /category/:slug
exports.postCategoryBySlug = (req, res ,next) => {
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/category'+req.params.slug);
	}
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category)=>{
			category.title = req.body.title;
			category.description = req.body.description || '';
			category.save(req.body.title, (err)=>{
				if (err) {return next(err);}
				req.flash('success', {msg: 'Информация о категории успешно обновлена'});
				res.redirect('/category');
			});
		})
		.catch((errors)=>{
			next(error);
		});
};

//DELETE /category/:slug
exports.deleteCategoryBySlug = (req, res, next) => {
	Category.findOneAndRemove({slug: req.params.slug}, (err, category) =>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно удалена'});
		next();
	});
}