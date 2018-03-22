/** 
 * Express router providing label management
 * @module routes/labels
 * @requires express
 * @requires models/label
 * @see models/label
 */

let express = require('express');
let Label = require('../models/label');
let router = express.Router();

/** One cannot do anything with labels without an active session */
router.post(/.*/, (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});
router.put(/.*/, (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

/**
 * Route serving all labels
 * @name Get all labels
 * @route {GET} /labels
 */
router.get('/', async (req, res, next) => {
	try {
		let labels = await Label
			.find({})
			.exec();
		res.status(200).send(labels);
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

/**
 * Route for creating new labels
 * @name Create label
 * @route {POST} /labels
 * @bodyparam {string} name Label name
 * @bodyparam {string} color Label color
 */
router.post('/', async (req, res, next) => {
	let {name, color} = req.body;
	let newLabel = new Label({name, color});

	try {
		let savedLabel = await newLabel.save();
		res.status(201).send({message: 'Label created', label: savedLabel});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for changing labels
 * @name Change label
 * @route {PUT} /labels
 * @routeparam {string} :labelid Id of the label
 * @bodyparam {string} name Label name
 * @bodyparam {string} color Label color
 */
router.put('/:labelid', async (req, res, next) => {
	req.labelid = req.params.labelid;
	let isValid;
	if (!req.labelid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Label.count({_id: req.labelid}).exec();
	if (!isValid) return res.status(404).send({message: 'Label not found.'});
	next();
}, async (req, res, next) => {
	let {name, color} = req.body;
	try {
		let updatedLabel = await Label.findByIdAndUpdate(
			req.labelid,
			{name: req.body.name, color: req.body.color},
			{runValidators: true, new: true}
		)
		.exec();
		res.status(201).send({message: 'Label changed!', label: updatedLabel});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

module.exports = router;
