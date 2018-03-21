let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let helmet = require('helmet');
let mongooseHandler = require('./models/index');
let sessionMiddleware = require('./models/session');

/** Require all routers */
let index = require('./routes/index');
let sessions = require('./routes/sessions');
let users = require('./routes/users');

let app = express();

/** Configure express app */
app.set('env', require('./express.config.json').env);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** Standard express middleware for body, cookie parsing and static files */
app.use(logger('tiny'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

/** Define routes for routers */
app.use('/', index);
app.use('/sessions', sessions);
app.use('/users', users);

/** Catch 404 */
app.use(function(req, res, next) {
	res.status(404).send({message: 'Resource not found.'});
});

/** Error handler for all unhandled cases */
app.use(function(err, req, res, next) {
  res.status(500).send(err);
});

module.exports = app;
