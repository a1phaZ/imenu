const Company = require('../models/Company');
const User = require('../models/User');

/**
 * GET
 */
exports.getNewCompany = (req, res, next) =>{
	if (req.user){
		if (!req.user.companyId){
			res.render('account/convert', {
				title: 'Конвертация профиля'
			});
		} else {
			req.flash('errors',{ msg: 'Профиль уже сконвертирован'});
			res.redirect('/account');
		}
	}
};

/**
 * POST /convert
 */
exports.postNewCompany = (req, res, next) =>{
	req.assert('title', 'Название не должно быть пустым').notEmpty();
	const errors = req.validationErrors();
	if (errors){
		req.flash('errors', errors);
		return res.redirect('/convert');
	}
	let getCompanyBySlug = Company
		.findOne({slug: req.body.slug});
	getCompanyBySlug
		.then((doc)=>{
			if (doc){
				req.flash('errors', {msg: 'Короткое имя компании уже используется, выберите другое'});
				return res.redirect('/convert');
			}
			const company = new Company({
				title: req.body.title,
				description: req.body.description,
				logo: req.body.logo,
				slug: req.body.slug,
				url: req.body.slug+'.'+req.body.hostUrl,
				adminId: req.user._id,
				address:{
					region: req.body.addressRegion,
					city: req.body.addressCity,
					street: req.body.addressStreet
				}
			});
			let getUserById = User
					.findOne({_id: req.user._id});
				getUserById
					.then((user)=>{
						if(user){
							company.save((err)=>{
								if (err) {return next(err);}
								user.company = company._id;
								user.save((err)=>{
									if (err){return next(err);}
								});
								req.flash('success', {msg: 'Профиль успешно сконвертирован'});
								res.redirect('/account');
							});
						} else {

						}
					})
					.catch((err)=>{
						next(err);
					});
		})
		.catch((err)=>{
			next(err);
		});
};