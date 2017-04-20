process.env.NODE_ENV = 'test';

const app = require('../app.js');
const chai = require('chai');
const {expect} = require('chai');
const chaiHttp = require('chai-http');
const should = require('chai').should(); //actually call the function
const mongoose = require('mongoose');
const sinon    = require('sinon');
require('sinon-mongoose');

const Category = require('../models/Category');
const Product  = require('../models/Product');
const User     = require('../models/User');

chai.use(chaiHttp);

describe('Basic routers', ()=>{
	describe('/', ()=>{
		it('GET * should return 200 OK', ()=>{
			chai.request(app)
				.get('/')
				.end((err, res)=>{
					err.should.to.be.null;
					res.should.have.status(200);
					// done();
				});
		});
	});

	describe('/login', ()=>{
		it('GET * should return 200 OK', ()=>{
			chai.request(app)
				.get('/login')
				.end((err, res)=>{
					err.should.to.be.null;
					res.should.have.status(200);
				});
		});
	});

	describe('/signup', ()=>{
		it('GET * should return 200 OK', ()=>{
			chai.request(app)
				.get('/signup')
				.end((err, res)=>{
					end.should.to.be.null;
					res.should.have.status(200);
				});
		});
	});

	describe('subdomains', ()=>{
		describe('root', ()=>{
			it('GET * should return 200 OK', ()=>{
				chai.request(app)
					.get('/s/test')
					.end((err, res)=>{
						err.should.to.be.null;
						res.should.have.status(200);
					});
			});
		});
		describe('category', ()=>{
			it('GET new category * should return 200 OK', ()=>{
				chai.request(app)
					.get('/s/test/new')
					.end((err, res)=>{
						err.should.to.be.null;
						res.should.have.status(200);
					});
			});	

			it('POST new category * should return 200 OK', ()=>{
				chai.request(app)
					.post('/s/test/new')
					.field('title', 'тест')
					.end((err, res)=>{
						err.should.to.be.null;
						res.should.have.status(200);
					});
			});

			it('not POST new category * should return 200 OK', ()=>{
				const category = {
					title: ''
				};
				chai.request(app)
					.post('/s/test/new')
					.send(category)
					.end((err, res)=>{
						res.body.should.have.property('errors');
						res.should.have.status(200);
					});
			});

			// it('GET update category * should return 200 OK', ()=>{
			// 	chai.request(app)
			// })		
		});
	});

	describe('Models', ()=>{
		describe('Category model', ()=>{
			it('should create a new category', ()=>{
				const CategoryMock = sinon.mock(new Category({
					title: 'тест', 
					description: 'test description',
					companyName: 'test'
				}));

				const category = CategoryMock.object;

				CategoryMock
					.expects('save')
					.yields(null);

				category.save(function (err, result) {
					CategoryMock.verify();
					CategoryMock.restore();
					expect(err).to.be.null;
					//done();
				});
			});

			it('should generate validation errors', ()=>{
				const CategoryMock = sinon.mock(new Category({}));
				const category = CategoryMock.object;
				const expectedError = {
					name : 'ValidationError'
				};

				CategoryMock
					.expects('save')
					.yields(expectedError);
				
				category.save((err, result)=>{
					CategoryMock.verify();
					CategoryMock.restore();
					expect(err.name).to.equal('ValidationError');
					expect(result).to.be.undefined;
				});
			});

			it('should not create category with the unique slug', ()=>{
				const CategoryMock = sinon.mock(new Category({
					title: 'тест', 
					description: 'test description',
					companyName: 'test'
				}));
				const category = CategoryMock.object;
				const expectedError = {
					name: 'MongoError',
					code: 11000
				};

				CategoryMock
					.expects('save')
					.yields(expectedError);
				
				category.save((err, result)=>{
					CategoryMock.verify();
					CategoryMock.restore();
					expect(err.name).to.equal('MongoError');
					expect(err.code).to.equal(11000);
					expect(result).to.be.undefined;
				});
			});

			it('should find category by slug', ()=>{
				const CategoryMock = sinon.mock(Category);
				const expectedCategory = {
					slug: 'test'
				}

				CategoryMock
					.expects('findOne')
					.withArgs({slug: 'test'})
					.yields(null, expectedCategory);
				
				Category.findOne({slug: 'test'}, (err, result)=>{
					CategoryMock.verify();
					CategoryMock.restore();
					expect(result).to.be.object;
					expect(result.slug).to.equal('test');
				});
			});

			it('should remove category by slug', (done)=>{
				const CategoryMock = sinon.mock(Category);
				const expectedResult = {
					nRemoved: 1
				};

				CategoryMock
					.expects('findOneAndRemove')
					.withArgs({slug: 'test'})
					.yields(null, expectedResult);

				Category.findOneAndRemove({slug: 'test'}, (err, result)=>{
					CategoryMock.verify();
					CategoryMock.restore();
					expect(err).to.be.null;
					expect(result.nRemoved).to.equal(1);
					done();
				})
			});
		});
	});
});

// describe('GET /', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/')
// 			.expect(200, done);
// 	});
// });

// describe('GET /login', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/login')
// 			.expect(200, done);
// 	});
// });

// describe('GET /signup', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/signup')
// 			.expect(200, done);
// 	});
// });

// describe('GET subdomain /category', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/s/test/category')
// 			.expect(200, done);
// 	});
// });

// describe('GET subdomain /new', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/s/test/new')
// 			.expect(200, done);
// 	});
// });

// describe('GET subdomain /product', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/s/test/category/test')
// 			.expect(200, done);
// 	});
// });

// describe('GET subdomain /product/new', () => {
// 	it('should return 200 OK', (done) => {
// 		request(app)
// 			.get('/s/test/category/test/new')
// 			.expect(200, done);
// 	});
// });

// describe('GET /random-url', () => {
// 	it('should return 404', (done) => {
// 		request(app)
// 			.get('/random-url')
// 			.expect(404, done);
// 	});
// });
