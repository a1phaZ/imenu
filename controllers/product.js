const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /category/:slug
exports.getProductsListByCategorySlug = (req, res, next) =>{
	let getCategoryBySlug = Category.findOne({slug: req.params.slug});
	getCategoryBySlug.
		then((category)=>{
			if (category){
				let getProductsList = Product
					.find({category: category._id})
					.populate({
						path: 'category'
					});
				getProductsList
					.then((productList) => {
						res.render('product/index',{
							productList: productList,
							title: category.title,
							categoryTitle: category.title,
							categorySlug: category.slug
						});
					})
					.catch((error) => {
						next(error);
					});
			} else {
				const err = new Error();
				err.status = 404;
				err.message = 'Категория не найдена';
				next(err);
			}
		}).
		catch((error)=>{
			next(error);
		})
	
};

/**
 * GET /category/:slug/new
 */
exports.getNewProduct = (req, res, next) =>{
	const getCategoryBySlug = Category.findOne({slug: req.params.slug});
	getCategoryBySlug.
		then((category)=>{
			if (category){
				res.render('product/product', {
					title: 'Новый продукт',
					categoryTitle: category.title,
					categorySlug: category.slug
				});
			} else {
				const err = new Error();
				err.status = 404;
				err.message = 'Категория не найдена';
				next(err);
			}
		}).
		catch((error)=>{
			next(error);
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

	const getCategoryBySlug = Category.findOne({slug: req.params.slug});
	getCategoryBySlug.
		then((category)=>{
			if (category){
				const product = new Product({
					title: req.body.title,
					description:  req.body.description || '',
					composition:  req.body.composition || '',
					category: category._id,
					price: req.body.price,
					waiting: req.body.waiting,
					discount:  req.body.discount || 0,
					logo: req.body.avatarUrl ? req.body.avatarUrl : '/img/bg.png'
				});
				product.save(req.body.title, (err)=>{
					if (err) {return next(err);}
					req.flash('success', {msg: 'Товар успешно создан' });
					res.redirect('/category/'+req.params.slug);
				});
			}
		}).
		catch((error)=>{
			next(error);
		});	
};

/**
 * GET /category/:slug/:productSlug
 */
exports.getProductBySlug = (req, res, next) =>{
	let getCategoryBySlug = Category.findOne({slug: req.params.slug});
	getCategoryBySlug
		.then((category)=>{
			if(category){
				let getProductBySlug = Product
					.findOne({slug: req.params.productSlug})
					.populate({
						path: 'category'
					});
				getProductBySlug
					.then((product)=>{
						if (product){
							const template = res.locals.isAdmin ? 'product/product' : 'product/view';
							res.render(template, {
								title: product.title,
								productId: product._id,
								productTitle: product.title,
								productSlug: product.slug,
								productDescription: product.description,
								productComposition: product.composition,
								productPrice: product.price,
								productWaiting: product.waiting,
								productDiscount: product.discount,
								productLogo: product.logo,
								categoryTitle: category.title,
								categorySlug: category.slug
							});
						} else {
							const err = new Error();
							err.status = 404;
							err.message = 'Продукт не найден';
							next(err);
						}
					})
					.catch((error)=>{
						next(error);
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
		})

};

/**
 * POST /category/:slug/:productSlug
 */
exports.postProductBySlug = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	req.assert('price', 'Цена не должна быть пустой').notEmpty();
	req.assert('waiting', 'Введите время ожидания').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return req.redirect('/products/new');
	}
	let getCategoryBySlug = Category.findOne({slug: req.params.slug});
	getCategoryBySlug.
		then((category)=>{
			if(category){
				let getProductBySlug = Product
						.findOne({slug: req.params.productSlug});
					getProductBySlug
						.then((product)=>{
							if(product){
								product.title = req.body.title;
								product.description = req.body.description || '';
								product.composition = req.body.composition || '';
								product.price = req.body.price;
								product.waiting = req.body.waiting;
								product.discount = req.body.discount || 0 ;
								if (req.body.avatarUrl){
									product.logo = req.body.avatarUrl;
								}
								product.save(req.body.title, (err)=>{
									if (err) {return next(err);}
									req.flash('success', {msg: 'Информация о товаре успешно обновлена'});
									res.redirect('/category/'+category.slug);
								});
							} else {
								const err = new Error();
								err.status = 404;
								err.message = 'Продукт не найден';
								next(err);
							}
						})
						.catch((error)=>{
							next(error);
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

/**
 * DELETE /product/:slug
 */
exports.deleteProductBySlug = (req, res, next) =>{
	Product.findOneAndRemove({slug: req.params.productSlug}, (err, product)=>{
		if (err) {return next(err);}
		req.flash('success', {msg: 'Продукт успешно удален'});
		res.redirect('/category/'+req.params.slug);
	});
};
