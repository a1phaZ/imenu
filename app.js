const express      = require('express');
const session      = require('express-session');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const MongoStore   = require('connect-mongo')(session);
const mongoose     = require('mongoose');
const chalk        = require('chalk');
const compression  = require('compression');
const dotenv       = require('dotenv');
const expressValidator = require('express-validator');
const flash = require('express-flash');

dotenv.load({ path: '.env' });

const index = require('./routes/index');
const users = require('./routes/users');
const categoryController = require('./controllers/category');
const dishController = require('./controllers/dish');

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
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.get('/category', categoryController.getCategoryList);
app.get('/category/new', categoryController.getNewCategory);
app.post('/category', categoryController.postNewCategory);
app.post('/category/new', categoryController.postNewCategory);
app.get('/category/:slug', categoryController.getCategoryBySlug);
app.post('/category/:slug', categoryController.postCategoryBySlug);
app.delete('/category/:slug', categoryController.deleteCategoryBySlug, categoryController.getCategoryList);
app.get('/dishes', dishController.getDishesList);
app.get('/category/:slug/dishes', dishController.getDishesListByCategorySlug);


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
