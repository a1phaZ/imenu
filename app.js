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
//const multer         = require('multer');
const aws              = require('aws-sdk');
const subdomain        = require('wildcard-subdomains');
// const subdomain        = require('express-subdomain');

dotenv.load({ path: '.env' });

const S3_BUCKET = process.env.S3_BUCKET_NAME;

const index              = require('./routes/index');
const users              = require('./routes/users');
const userController     = require('./controllers/user');
const categoryController = require('./controllers/category');
const productController  = require('./controllers/product');
const orderController    = require('./controllers/order');
const stateContoller     = require('./controllers/state');
const companyController  = require('./controllers/company');

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
if (process.env.NODE_ENV !== 'test'){
  app.use(logger('dev'));
};
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
app.use((req, res, next) => {
  lusca.csrf({cookie: false})(req, res, next);
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
      !req.path.match(/\./) && 
      !req.path.match(/^\/uploads/) &&
      !req.path.match(/^\/order\/[0-9a-z]*\/status/) && 
      !req.path.match(/^\/order\/status/) && 
      !req.path.match(/^\/state/)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(categoryController.getAllCategoryToRes);
//Admin?
app.use((req, res, next)=>{
  if (req.user){
    if (req.user.company){
      res.locals.isAdmin = (req.user.company.slug == req.subdomains[0]);
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
* Subdomains
*/
app.use(subdomain({
  namespace: 's',
  whitelist: ['www', 'app'],
}));

//index page
app.get('/', categoryController.getCategoryList);
//State
app.get('/state', stateContoller.getState);
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

/**
* Subdomain routers
**/
// subdomains.forEach((sd)=>{
//   app.use(sd, express.static('public'));
// });
app.get('/s/:sd', categoryController.getCategoryList);
app.get('/s/:sd/state', stateContoller.getState);
//Account
app.get('/s/:sd/login', userController.getLogin);
app.post('/s/:sd/login', userController.postLogin);
app.get('/s/:sd/logout', userController.logout);
app.get('/s/:sd/forgot', userController.getForgot);
app.post('/s/:sd/forgot', userController.postForgot);
app.get('/s/:sd/reset/:token', userController.getReset);
app.post('/s/:sd/reset/:token', userController.postReset);
app.get('/s/:sd/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/s/:sd/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/s/:sd/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/s/:sd/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/s/:sd/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
app.get('/s/:sd/signup', userController.getSignup);
app.post('/s/:sd/signup', userController.postSignup);

//company
app.get('/convert', companyController.getNewCompany);
app.post('/convert', companyController.postNewCompany);
app.get('/s/:sd/convert', companyController.getNewCompany);
app.post('/s/:sd/convert', companyController.postNewCompany);

//Category
app.get('/s/:sd/category', categoryController.getCategoryList);
app.get('/s/:sd/new', passportConfig.isAuthenticated, categoryController.getNewCategory);
app.post('/s/:sd/new', passportConfig.isAuthenticated, categoryController.postNewCategory);
app.get('/s/:sd/update/:slug', passportConfig.isAuthenticated, categoryController.getCategoryBySlug);
app.post('/s/:sd/update/:slug', passportConfig.isAuthenticated, categoryController.postCategoryBySlug);
app.get('/s/:sd/delete/:slug', passportConfig.isAuthenticated, categoryController.getDeleteCategoryBySlug);
app.post('/s/:sd/delete/:slug', passportConfig.isAuthenticated, categoryController.postDeleteCategoryBySlug);

//Product
app.get('/s/:sd/category/:slug', productController.getProductsListByCategorySlug);
app.get('/s/:sd/category/:slug/new', passportConfig.isAuthenticated, productController.getNewProduct);
app.post('/s/:sd/category/:slug/new', passportConfig.isAuthenticated, productController.postNewProduct);
app.get('/s/:sd/category/:slug/:productSlug', productController.getProductBySlug);
app.post('/s/:sd/category/:slug/:productSlug', passportConfig.isAuthenticated, productController.postProductBySlug);
app.post('/s/:sd/delete/:slug/:productSlug', passportConfig.isAuthenticated, productController.deleteProductBySlug);

//Order
app.post('/s/:sd/order/add', orderController.postOrderAdd);
app.get('/s/:sd/order/:id', passportConfig.isAuthenticated, orderController.getOrder);
app.post('/s/:sd/order/change', orderController.postOrderChange);
app.post('/s/:sd/order/item-delete', orderController.postOrderItemDelete);
app.post('/s/:sd/order/:id', passportConfig.isAuthenticated, orderController.postOrder);
app.get('/s/:sd/order-open', passportConfig.isAdmin, orderController.getOrderOpenList);
app.get('/s/:sd/order-close', passportConfig.isAdmin, orderController.getOrderCloseList);
app.post('/s/:sd/order/:id/status', passportConfig.isAdmin, orderController.changeOrderStatus);
app.get('/s/:sd/order/:id/close', orderController.getOrderClose);
app.get('/s/:sd/my', passportConfig.isAuthenticated, orderController.getMyOrders);

//Upload on S3
app.get('/s/:sd/sign-s3', (req, res)=>{
  aws.config.update({
    region: 'eu-central-1'
  })
  const s3 = new aws.S3({
    apiVersion: '2006-03-01'
  });
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data)=>{
    if(err){

      return res.send();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3-eu-central-1.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
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
