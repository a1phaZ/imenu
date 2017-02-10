const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /category', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/category')
      .expect(200, done);
  });
});

describe('GET /category/new', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/category/new')
      .expect(200, done);
  });
});

describe('GET /product', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/product')
      .expect(200, done);
  });
});

describe('GET /product/new', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/product/new')
      .expect(200, done);
  });
});

describe('GET /random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/reset')
      .expect(404, done);
  });
});
