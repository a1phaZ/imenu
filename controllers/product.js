const Product = require('../models/Product');

// GET /product
exports.getProductsList = (req, res, next) =>{
	let getProductsList = Product
		.find()
		.populate({
			path: 'category'
		});
	getProductsList
		.then((productsList) => {
			res.send(productsList);
		})
		.catch((error) => {
			next(error);
		});
};

// GET /category/:slug
exports.getProductsListByCategorySlug = (req, res, next) =>{
	let getProductsList = Product
		.find({category: res.locals.category._id})
		.populate({
			path: 'category'
		});
	getProductsList
		.then((productList) => {
			res.render('product/index',{
				productList: productList,
				title: res.locals.category.title
			});
		})
		.catch((error) => {
			next(error);
		});
};

/**
 * GET /product/new
 */
exports.getNewProduct = (req, res) =>{
	res.render('product/product', {
		title: 'Новый продукт'
	});
};

/**
 * POST /category/:slug/new
 */
exports.postNewProduct = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	req.assert('composition', 'Состав не должен быть пустым').notEmpty();
	req.assert('price', 'Цена не должна быть пустой').notEmpty();
	req.assert('waiting', 'Введите время ожидания').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/products/new');
	}
	const product = new Product({
		title: req.body.title,
		description:  req.body.description || '',
		composition:  req.body.composition || '',
		category: res.locals.category._id,
		price: req.body.price,
		waiting: req.body.waiting,
		discount:  req.body.discount || 0
	});
	product.save(req.body.title, (err)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Товар успешно создан' });
		res.redirect('/category/'+req.params.slug);
	});
};

/**
 * GET /product/:slug
 */
exports.getProductBySlug = (req, res, next) =>{
	let getProductBySlug = Product
		.findOne({slug: req.params.slug})
		.populate({
			path: 'category'
		});
	getProductBySlug
		.then((product)=>{
				res.render('product/product', {
					title: product.title,
					productTitle: product.title,
					productDescription: product.description,
					productComposition: product.composition,
					productPrice: product.price,
					productWaiting: product.waiting,
					productDiscount: product.discount
				});
			res.send(product);
		})
		.catch((errors)=>{
			next(error);
		});	
};

/**
 * POST /product/:slug
 */
exports.postProductBySlug = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	req.assert('category', 'Выберите категорию').notEmpty();
	req.assert('price', 'Цена не должна быть пустой').notEmpty();
	req.assert('waiting', 'Введите время ожидания').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return req.redirect('/products/new');
	}
	let getProductBySlug = Product
			.findOne({slug: req.params.slug});
		getProductBySlug
			.then((product)=>{
				title = req.body.title;
				description = req.body.description || '';
				composition = req.body.composition || '';
				category = req.body.category;
				price = req.body.price;
				waiting = req.body.waiting;
				discount = req.body.discount || 0 ;
				product.save(req.body.title, (err)=>{
					if (err) {return next(err);}
					req.flash('success', {msg: 'Информация о товаре успешно обновлена'});
					req.redirect('/product');
				});
			})
			.catch((errors)=>{
				next(error);
			});
};

/**
 * DELETE /product/:slug
 */
exports.deleteProductBySlug = (req, res, next) =>{
	Product.findOneAndRemove({slug: req.params.slug}, (err, product)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Продукт успешно удален'});
		next();
	})
};
