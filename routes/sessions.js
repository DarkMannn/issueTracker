/** 
 * Express router providing session related routes
 * @module routes/session
 * @requires express
 * @requires models/user
 * @see module:models/user
 */
let express = require('express');
let User = require('../models/user');
let router = express.Router();

/**
 * Route serving login form
 * @name Get login form
 * @route {GET} /sessions/new
 */
router.get('/new', (req, res, next) => {
	res.render('login', {title: 'Enter you credentials'});
});

/**
 * Route for sending credentials
 * @name Log in
 * @route {POST} /sessions
 * @bodyparam {string} email User provided email address
 * @bodyparam {string} password User provided password
 */
router.post('/', (req, res, next) => {
	if (req.session.email) return res.status(400).send({message: 'You are already logged in.'});
	next();
});

router.post('/', async (req, res, next) => {
	try {
		let foundUser = await User.findOne({email: req.body.email}).exec();
		if (!foundUser) return res.status(403).send({message: 'You do not have an active account.'});
		req.foundUser = foundUser;
		next();
	} catch (err) {
		console.log(`Error while finding a user: ${err}`);
		next({error: 'Internal server error. Try to log in again.'});
	}
});

router.post('/', async (req, res, next) => {
	let user = req.foundUser;
	let isValid = await user.isPasswordValid(req.body.password, user.password);

	if (isValid) {
		req.session.email = user.email;
		res.status(201).send({
			id: user.id,
			username: user.firstName + ' ' + user.lastName,
			message: 'Successfully logged in.'
		});
	} else {
		res.status(401).send({message: 'You have entered the wrong password.'});
	}
});

/**
 * Route for removing credentials
 * @name Log out
 * @route {DELETE} /sessions
 * @authentication This route requires active session cookie
 */
router.delete('/', (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

router.delete('/', (req, res, next) => {
	res.clearCookie('sessionCookie');
	req.session.destroy(err => {
		if (err) {
			console.log('Error while destroying active session.');
			next({error: 'Internal server error. Try to log out again.'});
		}
		res.status(200).send({message: 'You have been successfully logged out.'});
	});
});

module.exports = router;
