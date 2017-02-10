const mongoose = require('mongoose');
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const Category = require('../models/Category');
const Product = require('../models/Product');

describe('Category model', ()=>{
	it('should create a new category', (done)=>{
		const CategoryMock = sinon.mock(new Category({title: 'тест', description: 'test description'}));
		const category = CategoryMock.object;

		CategoryMock
			.expects('save')
			.yields(null);

		category.save(function (err, result) {
			CategoryMock.verify();
			CategoryMock.restore();
			expect(err).to.be.null;
			done();
		});
	});

	it('should return error if category is not created', (done)=>{
		const CategoryMock = sinon.mock(new Category({title: 'тест', description: 'test description'}));
		const category = CategoryMock.object;
		const expectedError = {
			name: 'ValidationError'
		};

		CategoryMock
			.expects('save')
			.yields(expectedError);

		category.save(function (err, result) {
			CategoryMock.verify();
			CategoryMock.restore();
			expect(err.name).to.equal('ValidationError');
			expect(result).to.be.undefined;
			done();
		});
	});

	it('should not create a category with the unique slug', (done)=>{
		const CategoryMock = sinon.mock(new Category({title: 'тест', description: 'test description'}));
		const category = CategoryMock.object;
		const expectedError = {
			name: 'MongoError',
      code: 11000
		};
		CategoryMock
			.expects('save')
			.yields(expectedError);

		category.save(function (err, result) {
			CategoryMock.verify();
			CategoryMock.restore();
			expect(err.name).to.equal('MongoError');
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined;
			done();
		});
	});

	it('should find category by slug', (done) => {
		const CategoryMock = sinon.mock(Category);
		const expectedCategory = {
			slug: 'test'
		};

		CategoryMock
			.expects('findOne')
			.withArgs({slug: 'test'})
			.yields(null, expectedCategory);

		Category.findOne({slug: 'test'}, (err, result) => {
			CategoryMock.verify();
			CategoryMock.restore();
			expect(result.slug).to.equal('test');
			done();
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

describe('Product model', ()=>{
	it('should create a new product', (done)=>{
		const ProductMock = sinon.mock(new Product({
			title: 'продукт'
		}));
		const product = ProductMock.object;

		ProductMock
			.expects('save')
			.yields(null);

		product.save(function (err, result) {
			ProductMock.verify();
			ProductMock.restore();
			expect(err).to.be.null;
			done();
		});
	});

	it('should return error if product is not created', (done)=>{
		const ProductMock = sinon.mock(new Product({
			title: 'продукт'
		}));
		const product = ProductMock.object;
		const expectedError = {
			name: 'ValidationError'
		};

		ProductMock
			.expects('save')
			.yields(expectedError);

		product.save(function (err, result) {
			ProductMock.verify();
			ProductMock.restore();
			expect(err.name).to.equal('ValidationError');
			expect(result).to.be.undefined;
			done();
		});
	});

	it('should not create a product with the unique slug', (done)=>{
		const ProductMock = sinon.mock(new Product({
			title: 'продукт'
		}));
		const product = ProductMock.object;
		const expectedError = {
			name: 'MongoError',
      code: 11000
		};
		ProductMock
			.expects('save')
			.yields(expectedError);

		product.save(function (err, result) {
			ProductMock.verify();
			ProductMock.restore();
			expect(err.name).to.equal('MongoError');
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined;
			done();
		});
	});

	it('should find product by slug', (done) => {
		const ProductMock = sinon.mock(Product);
		const expectedProduct = {
			slug: 'product'
		};

		ProductMock
			.expects('findOne')
			.withArgs({slug: 'product'})
			.yields(null, expectedProduct);

		Product.findOne({slug: 'product'}, (err, result) => {
			ProductMock.verify();
			ProductMock.restore();
			expect(result.slug).to.equal('product');
			done();
		});
	});

	it('should remove category by slug', (done)=>{
		const ProductMock = sinon.mock(Product);
		const expectedResult = {
			nRemoved: 1
		};

		ProductMock
			.expects('findOneAndRemove')
			.withArgs({slug: 'product'})
			.yields(null, expectedResult);

		Product.findOneAndRemove({slug: 'product'}, (err, result)=>{
			ProductMock.verify();
			ProductMock.restore();
			expect(err).to.be.null;
			expect(result.nRemoved).to.equal(1);
			done();
		});
	});
})