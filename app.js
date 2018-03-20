let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let mongooseHandler = require('./models/index');
let sessionMiddleware = require('./models/session');

// require all routers
let index = require('./routes/index');
let sessions = require('./routes/sessions');
let users = require('./routes/users');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// standard express middleware for body, cookie parsing and static files
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

// define routes for routers
app.use('/', index);
app.use('/sessions', sessions);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
