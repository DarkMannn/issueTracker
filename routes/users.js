/** 
 * Express router providing user/account related routes
 * @module routes/users
 * @requires express
 * @requires models/user
 * @see models/user
 */

let express = require('express');
let User = require('../models/user');
let router = express.Router();

/**
 * Route serving signup form
 * @name Get signup form
 * @route {GET} /users/new
 */
router.get('/new', (req, res, next) => {
	res.render('signup', {title: 'Please register'});
});

/**
 * Route for sending information for a new account 
 * @name Sign up
 * @route {POST} /users
 * @bodyparam {string} email Users email address
 * @bodyparam {string} password Users password
 * @bodyparam {string} firstName Users first name
 * @bodyparam {string} lastName Users last name
 */
router.post('/', (req, res, next) => {
	if (req.session.email) return res.status(400).send({message: 'You already have an active account.'});
	next();
});

router.post('/', async (req, res, next) => {
	let potentialNewUser = await User.find({email: req.body.email}).exec();

	if (potentialNewUser.length) {
		res.status(400).send({
			message: 'That email is already taken. You have probably entered the wrong email.'
		});
	} else {
		next();
	}
});

router.post('/', async (req, res, next) => {
	let {email, password, firstName, lastName} = req.body;
	let newUser = new User({email, password, firstName, lastName});

	try {
		req.session.email = email;
		let savedUser = await newUser.save();
		res.status(201).send({
			id: savedUser.id,
			username: savedUser.firstName + ' ' + savedUser.lastName,
			message: 'Successfully registered.'
		});
	} catch (err) {
		console.log(`Error while saving a new user: ${err}`);
	}
});

/**
 * Route for removing an account
 * @name Delete account
 * @route {DELETE} /users/:userid
 * @authentication This route requires active session cookie
 * @routeparam {string} :userid The unique identifier of the user
 */
router.delete('/:userid', (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

router.delete('/:userid', async (req, res, next) => {
	try {
		let deletedUser = await User.findByIdAndRemove(req.params.userid).exec();
		res.clearCookie('sessionCookie');
		req.session.destroy();
		res.status(200).send({message: 'Account successfully removed.'});
	} catch (err) {
		console.log(`Error while trying to delete user: ${err}`);
		res.status(500).send({message: 'Server error. Unsuccessful account removal.'});
	}
});

module.exports = router;
