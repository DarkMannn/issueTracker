let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.get('/new', function(req, res, next) {
	res.render('signup', {title: 'Please register'});
});

router.post('/', async function(req, res, next) {
	let potentialNewUser = await User.find({email: req.body.email}).exec();

	if (potentialNewUser.length) {
		res.status(400).send({
			message: 'That email is already taken. You have probably entered the wrong email.'
		});
	} else {
		next();
	}
});

router.post('/', async function(req, res, next) {
	let {email, password, firstName, lastName} = req.body;
	let newUser = new User({email, password, firstName, lastName});

	try {
		let savedUser = await newUser.save();
		res.status(200).send({
			id: savedUser.id,
			username: savedUser.firstName + ' ' + savedUser.lastName,
			message: 'Successfully registered.'
		});
	} catch (err) {
		console.log(`Error while saving a new user: ${err}`);
	}
});

router.delete('/:userid', async function(req, res, next) {
	// returns if no active session
	try {
		await User.findByIdAndRemove(req.params.userid).exec();
		res.clearCookie('sessionCookie');
		req.session.destroy(err => { if (err) console.log('Session was not successfully destroyed.'); });
		res.status(200).send({message: 'Account successfully removed.'});
	} catch (err) {
		console.log(`Error while trying to delete user: ${err}`);
		res.status(500).send({message: 'Server error. Unsuccessful account removal.'});
	}
});

module.exports = router;
