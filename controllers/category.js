const Category = require('../models/Category');

/**
 * comment
 */
exports.getAllCategoryToRes = (req, res, next) =>{
	let getCategoryList = Category
		.find();
	getCategoryList
		.then((categoryList) => {
			res.locals.categoryList = categoryList;
			next();
		})
		.catch((error) => {
			next(error);
		});
};

//GET /category
exports.getCategoryList = (req, res) =>{
	res.render('category/index', {
		title: 'Список категорий'
	});
};

//GET /new
exports.getNewCategory = (req, res) =>{
	res.render('category/category', {
		title: 'Новая категория'
	});
};

//POST /new
exports.postNewCategory = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/new');
	}
	const category = new Category({
		title: req.body.title,
		description: req.body.description ? req.body.description : ''
	});
	category.save(req.body.title, (err)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно создана'});
		res.redirect('/category');
	});
};

//GET /update/:slug
exports.getCategoryBySlug = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category) =>{
			res.render('category/category',{
				title: 'Новая категория',
				categoryTitle: category.title,
				categoryDescription: category.description
			});
		})
		.catch((error)=>{
			next(error);
		});
};

//POST /update/:slug
exports.postCategoryBySlug = (req, res ,next) => {
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/update/'+req.params.slug);
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

//DELETE /delete/:slug
exports.deleteCategoryBySlug = (req, res, next) => {
	Category.findOneAndRemove({slug: req.params.slug}, (err, category) =>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно удалена'});
		next();
	});
}

exports.getCategoryBySlugMiddleware = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category) =>{
			res.category = category;
			res.locals.category = category;
			next();
		})
		.catch((error)=>{
			next(error);
		});
};