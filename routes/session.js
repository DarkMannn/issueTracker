let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.get('/new', function(req, res, next) {
	res.render('login', {title: 'Enter you credentials'});
});

router.post('/', async function(req, res, next) {
	try {
		let foundUser = await User.findOne({email: req.body.email}).exec();
		if (!foundUser) return res.status(403).send({message: 'You do not have an active account.'});
		req.foundUser = foundUser;
		next();
	} catch (err) {
		if (err) return console.log(`Error while finding a user: ${err}`);
	}
});

router.post('/', async function(req, res, next) {
	let user = req.foundUser;
	let isValid = await user.isPasswordValid(req.body.password, user.password);

	if (isValid) {
		req.session.email = user.email;
		res.status(200).send({
			id: user.id,
			username: user.firstName + ' ' + user.lastName,
			message: 'Successfully logged in.'
		});
	} else {
		res.status(401).send({message: 'You have entered the wrong password.'});
	}
});

router.delete('/', function(req, res, next) {
	res.clearCookie('sessionCookie');
	req.session.destroy(err => { if (err) console.log('Session was not successfully destroyed.'); });
	res.status(200).send({
		message: 'You have been successfully logged out.'
	});
});

module.exports = router;
