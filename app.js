const express          = require('express');
const session          = require('express-session');
const path             = require('path');
const favicon          = require('serve-favicon');
const logger           = require('morgan');
const cookieParser     = require('cookie-parser');
const bodyParser       = require('body-parser');
const MongoStore       = require('connect-mongo')(session);
const mongoose         = require('mongoose');
const chalk            = require('chalk');
const compression      = require('compression');
const dotenv           = require('dotenv');
const expressValidator = require('express-validator');
const flash            = require('express-flash');
const lusca            = require('lusca');
const passport         = require('passport');
const sass             = require('node-sass-middleware');

dotenv.load({ path: '.env' });

const index              = require('./routes/index');
const users              = require('./routes/users');
const userController     = require('./controllers/user');
const categoryController = require('./controllers/category');
const productController  = require('./controllers/product');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(categoryController.getAllCategoryToRes);
app.use(categoryController.getCategoryBySlugMiddleware);
//Admin?
app.use((req, res, next)=>{
  if (req.user){
    res.locals.isAdmin = (req.user.email.toLowerCase() == process.env.ADMIN_EMAIL.toLowerCase());
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
//index page
app.get('/', categoryController.getCategoryList);
app.use('/users', users);
//Account
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);

// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
//Category
app.get('/category', categoryController.getCategoryList);
app.get('/new', categoryController.getNewCategory);
app.post('/new', categoryController.postNewCategory);
app.get('/update/:slug', categoryController.getCategoryBySlug);
app.post('/update/:slug', categoryController.postCategoryBySlug);
app.get('/delete/:slug', categoryController.getDeleteCategoryBySlug);
app.post('/delete/:slug', categoryController.postDeleteCategoryBySlug);

//Product
//TODO Подумать надо роутингом
app.get('/category/:slug', productController.getProductsListByCategorySlug);
app.get('/category/:slug/new', productController.getNewProduct);
app.post('/category/:slug/new', productController.postNewProduct);
app.get('/category/:slug/:productSlug', productController.getProductBySlug);
app.post('/category/:slug/:productSlug', productController.postProductBySlug);
app.post('/category/:slug/:productSlug', productController.deleteProductBySlug);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
