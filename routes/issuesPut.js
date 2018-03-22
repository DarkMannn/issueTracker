/** 
 * Express router providing updating issue related properties
 * @module routes/issuesPut
 * @requires express
 * @requires models/issue
 * @see models/issue
 */

let express = require('express');
let Issue = require('../models/issue');
let Label = require('../models/label');
let User = require('../models/user');
let router = express.Router();

/** One cannot put anything without an active session */
router.put(/.*/, (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

/**
 * Route for updating status for a specific issue
 * @name Update status
 * @route {PUT} /issues/:issueid/status
 * @routeparam {string} :issueid The unique id of the issue
 * @bodyparam {string} status New status
 */
router.put('/:issueid/status', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot update status, issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue = await Issue.findByIdAndUpdate(
			req.issueid,
			{status: req.body.status},
			{runValidators: true, new: true}
		)
		.exec();
		res.status(201).send({message: 'Status changed!', issue: updatedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for updating description for a specific issue
 * @name Update description
 * @route {PUT} /issues/:issueid/description
 * @routeparam {string} :issueid The unique id of the issue
 * @bodyparam {string} description New description
 */
router.put('/:issueid/description', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot update description, issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue = await Issue.findByIdAndUpdate(
			req.issueid,
			{description: req.body.description},
			{runValidators: true, new: true}
		)
		.exec();
		res.status(201).send({message: 'Description changed!', issue: updatedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for changing label of an issue
 * @name Change label
 * @route {PUT} /issues/:issueid/label
 * @routeparam {string} :issueid The unique id of the issue
 * @bodyparam {string} labelid The id of a new label
 */
router.put('/:issueid/label', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot update label, issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue = await Issue.findByIdAndUpdate(
			req.issueid,
			{label: req.body.labelid},
			{runValidators: true, new: true}
		)
		.exec();
		res.status(201).send({message: 'Label changed!', issue: updatedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

module.exports = router;
