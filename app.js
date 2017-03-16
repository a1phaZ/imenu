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
const multer           = require('multer');

const upload = multer({ 
  dest: path.join(__dirname, 'public/uploads'), 
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Только изображения разрешены к загрузке'));
    }
    cb(null, true);
  }
});

dotenv.load({ path: '.env' });

const index              = require('./routes/index');
const users              = require('./routes/users');
const userController     = require('./controllers/user');
const categoryController = require('./controllers/category');
const productController  = require('./controllers/product');
const orderController  = require('./controllers/order');

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
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
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
//app.use(upload.single('imageFile'));
app.use((req, res, next) => {
  // if (req.path === '/api/upload') {
  //   next();
  // } else {
    lusca.csrf({cookie: true})(req, res, next);
  // }
});
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
// app.use(categoryController.getCategoryBySlugMiddleware);
//Admin?
app.use((req, res, next)=>{
  if (req.user){
    if (req.user.email){
      res.locals.isAdmin = (req.user.email.toLowerCase() == process.env.ADMIN_EMAIL.toLowerCase());
    }
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

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
app.get('/new', passportConfig.isAuthenticated, categoryController.getNewCategory);
app.post('/new', passportConfig.isAuthenticated, categoryController.postNewCategory);
app.get('/update/:slug', passportConfig.isAuthenticated, categoryController.getCategoryBySlug);
app.post('/update/:slug', passportConfig.isAuthenticated, categoryController.postCategoryBySlug);
app.get('/delete/:slug', passportConfig.isAuthenticated, categoryController.getDeleteCategoryBySlug);
app.post('/delete/:slug', passportConfig.isAuthenticated, categoryController.postDeleteCategoryBySlug);

//Product
app.get('/category/:slug', productController.getProductsListByCategorySlug);
app.get('/category/:slug/new', passportConfig.isAuthenticated, productController.getNewProduct);
app.post('/category/:slug/new', passportConfig.isAuthenticated, productController.postNewProduct);
app.get('/category/:slug/:productSlug', productController.getProductBySlug);
app.post('/category/:slug/:productSlug', passportConfig.isAuthenticated, productController.postProductBySlug);
app.post('/category/:slug/:productSlug', passportConfig.isAuthenticated, productController.deleteProductBySlug);

//Order
// app.post('/order', orderController.getNewOrder);
app.post('/order/add', orderController.postOrderAdd);
app.get('/order/:id', passportConfig.isAuthenticated, orderController.getOrder);
app.post('/order/change', orderController.postOrderChange);
app.post('/order/item-delete', orderController.postOrderItemDelete);
app.post('/order/:id', passportConfig.isAuthenticated, orderController.postOrder);
app.get('/order-open', passportConfig.isAdmin, orderController.getOrderOpenList);
app.get('/order-close', passportConfig.isAdmin, orderController.getOrderCloseList);
app.get('/order/:id/status', orderController.getOrderStatusById);
app.post('/order/:id/status', passportConfig.isAdmin, orderController.changeOrderStatus);
app.get('/order/:id/close', orderController.getOrderClose);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/vkontakte', passport.authenticate('vkontakte', { scope: ['email'] }));
app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});


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
