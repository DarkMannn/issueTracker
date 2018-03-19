let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.get('/new', function(req, res, next) {
	res.render('login', {title: 'Enter you credentials'});
});

router.post('/', function(req, res, next) {
	let email = req.body.email;
	let password = req.body.password;

	User
	.findOne({email: email})
	.exec((err, user) => {
		if (err) return console.log(err);
		let isValid = User.isPasswordValid(password, user.password);
		if (isValid) {
			req.session.email = email;
			req.session.name = user.firstName + ' ' + user.lastName;
			res.type('json');
			res.status(200).send(JSON.stringify({name: req.session.name}));
		} else {
			res.status(401).send('You have entered wrong password.');
		}
	});

});

router.delete('/', function(req, res, next) {
	res.clearCookie('sessionCookie');
	req.session.destroy(err => { if (err) console.log('Session was not successfully destroyed.'); });
	res.status(200).send('You have been successfully logged out.');
});

module.exports = router;
