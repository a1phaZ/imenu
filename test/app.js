const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /login', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /signup', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET subdomain /category', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/s/test/category')
      .expect(200, done);
  });
});

describe('GET subdomain /new', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/s/test/new')
      .expect(200, done);
  });
});

describe('GET subdomain /product', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/s/test/category/test')
      .expect(200, done);
  });
});

describe('GET subdomain /product/new', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/s/test/category/test/new')
      .expect(200, done);
  });
});

describe('GET /random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/random-url')
      .expect(404, done);
  });
});
