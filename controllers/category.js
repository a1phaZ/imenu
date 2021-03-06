const Category = require('../models/Category');

/**
 * Middleware for menu
 */
exports.getAllCategoryToRes = (req, res, next) =>{
	let getCategoryList = Category
		.find({companyName: req.subdomains[0]});
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
		title: 'Список категорий',
		description: 'IMenu - интерактивное меню для вашего кафе или ресторана.'
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
		description: req.body.description ? req.body.description : '',
		logo: req.body.avatarUrl ? req.body.avatarUrl : '/img/bg.png',
		companyName: req.params.sd
	});
	category.save(req.body.title, (err)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно создана'});
		res.redirect('/');
	});
};

//GET /update/:slug
exports.getCategoryBySlug = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category) =>{
			if (category) {
				res.render('category/category',{
					title: 'Редактирование',
					categoryTitle: category.title,
					categoryDescription: category.description,
					categorySlug: category.slug,
					avatarUrl: category.logo
				});
			} else {
				const err = new Error();
				err.status = 404;
				err.message = 'Категория не найдена';
				next(err);
			}
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
			if (req.body.avatarUrl){
				category.logo      = req.body.avatarUrl;
			}
			category.save(req.body.title, (err)=>{
				if (err) {return next(err);}
				req.flash('success', {msg: 'Информация о категории успешно обновлена'});
				res.redirect('/category');
			});
		})
		.catch((error)=>{
			next(error);
		});
};

//DELETE GET /delete/:slug
exports.getDeleteCategoryBySlug = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug.
		then((category)=>{
			if (category) {
				res.render('category/delete',{
					title: 'Удаление категории',
					categoryTitle: category.title
				});
			} else {
				const err = new Error();
				err.status = 404;
				err.message = 'Невозможно удалить несуществующую категорию';
				next(err);
			}
		}).
		catch((error)=>{
			next(error);
		});
}

//DELETE POST /delete/:slug
exports.postDeleteCategoryBySlug = (req, res, next) => {
	Category.remove({slug: req.params.slug}, (err) =>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Категория успешно удалена'});
		res.redirect('/');
	});
}

/****/
exports.getCategoryBySlugMiddleware = (req, res, next) => {
	let getCategoryBySlug = Category
		.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category) =>{
			res.locals.category = category;
			next();
		})
		.catch((error)=>{
			next(error);
		});
};