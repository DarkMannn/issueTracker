let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let config = require('../config.example.json');

let storeInstance = new MongoStore({
	url: config.sessionDb
});

let sessionMiddleware = session({
	name: 'sessionCookie',
	secret: config.sessionSecret,
	cookie: {maxAge: 3600000, httpOnly: true, sameSite: true},
	resave: false,
	rolling: true,
	saveUninitialized: false,
	unset: 'destroy',
	store: storeInstance
});

module.exports = sessionMiddleware;
