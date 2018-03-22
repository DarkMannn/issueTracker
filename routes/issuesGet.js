/** 
 * Express router providing issue related get routes
 * @module routes/issuesGet
 * @requires express
 * @requires models/issue
 * @see models/issue
 */

let express = require('express');
let Issue = require('../models/issue');
let Label = require('../models/label');
let User = require('../models/user');
let router = express.Router();

/**
 * Route serving all issues
 * @name Get all issues
 * @route {GET} /issues
 */
router.get('/', async (req, res, next) => {
	if (req.query.labelid || req.query.status || req.query.creatorid) return next();
	try {
		let issues = await Issue
			.find({})
			.sort('-date')
			.select('title creator label description date')
			.populate('label', 'name color')
			.populate('creator', 'firstName email')
			.exec();
		res.status(200).send(issues);
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

/**
 * Route serving specific issue
 * @name Get specific issue
 * @route {GET} /issues/:issueid
 * @routeparam {string} :issueid The unique identifier of the issue
 */
router.get('/:issueid', async (req, res, next) => {
	req.id = req.params.issueid;
	let isValid;
	if (!req.id.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.id}).exec();
	if (!isValid) return res.status(404).send({message: 'Issue not found'});
	next();
}, async (req, res, next) => {
	try {
		let issue = await Issue
			.findById(req.id)
			.exec();
		res.status(200).send(issue);
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

/**
 * Route serving issues with chosen label
 * @name Get issue by label
 * @route {GET} /issues?labelid=x
 * @queryparam {string} labelid Will get issues with that label only
 */
router.get('/', async (req, res, next) => {
	if (req.query.creatorid || req.query.status) return next('route');
	req.labelid = req.query.labelid;
	let isValid;
	if (!req.labelid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Label.count({_id: req.labelid}).exec();
	if (!isValid) return res.status(404).send({message: 'Issue not found'});
	next();
}, async (req, res, next) => {
	try {
		let issues = await Issue
			.find({label: req.labelid})
			.sort('-date')
			.select('title creator label description date')
			.populate('label', 'name color')
			.populate('creator', 'firstName email')
			.exec();
		if (issues) res.status(200).send(issues);
		else res.status(404).send({message: 'Not found'});
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

/**
 * Route serving issues by its creator
 * @name Get issue by creator
 * @route {GET} /issues?creatorid=x
 * @queryparam {string} creatorid Will get issues created by x
 */
router.get('/', async (req, res, next) => {
	if (req.query.status) return next('route');
	req.creatorid = req.query.creatorid;
	let isValid;
	if (!req.creatorid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await User.count({_id: req.creatorid}).exec();
	if (!isValid) return res.status(404).send({message: 'Issue not found'});
	next();
}, async (req, res, next) => {
	try {
		let issues = await Issue
			.find({creator: req.creatorid})
			.sort('-date')
			.select('title creator label description date')
			.populate('label', 'name color')
			.populate('creator', 'firstName email')
			.exec();
		if (issues) res.status(200).send(issues);
		else res.status(404).send({message: 'Not found'});
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

/**
 * Route serving issues with same status
 * @name Get issue by status
 * @route {GET} /issues?status=x
 * @queryparam {string} status Will get issues by status x
 */
router.get('/', async (req, res, next) => {
	req.status = req.query.status;
	try {
		let issues = await Issue
			.find({status: req.status})
			.sort('-date')
			.select('title creator label description date')
			.populate('label', 'name color')
			.populate('creator', 'firstName email')
			.exec();
		if (issues) res.status(200).send(issues);
		else res.status(404).send({message: 'Not found'});
	} catch (err) {
		next({error: 'Internal server error. Try again.'});
	}
});

module.exports = router;
