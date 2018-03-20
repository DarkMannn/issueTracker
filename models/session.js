/** Provides connection with MongoDB session store
 * @module models/session
 * @requires express-session
 * @requires connect-mongo
 * @requires config.example.json
 */

let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let config = require('../config.example.json');

/** MongoDB session store instance */
let storeInstance = new MongoStore({
	url: config.sessionDb
});

/** Initializing middleware for sessions with options for session cookies */
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
