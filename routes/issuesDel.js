/** 
 * Express router providing routes for removing issues and issue components
 * @module routes/issuesDel
 * @requires express
 * @requires models/issue
 * @see models/issue
 */

let express = require('express');
let Issue = require('../models/issue');
let Label = require('../models/label');
let User = require('../models/user');
let router = express.Router();

/** One cannot delete anything without an active session */
router.delete(/.*/, (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

/**
 * Route for removing a specific issue
 * @name Delete an issue
 * @route {DELETE} /issues/:issueid
 * @routeparam {string} :issueid The unique id of the issue
 */
router.delete('/:issueid', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		await Issue.findByIdAndRemove(req.issueid).exec();
		res.status(200).send({message: 'Issue removed'});
	} catch (err) {
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for removing files for a specific issue
 * @name Remove file
 * @route {DELETE} /issues/:issueid/files?fileurl=x
 * @routeparam {string} :issueid The unique id of the issue
 * @queryparam {string} fileurl The url for stored file
 */
router.delete('/:issueid/files', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot delete a file, issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue;
		updatedIssue = await Issue.findByIdAndUpdate(
			req.issueid,
			{$pull: {files: req.params.fileurl}}
		)
		.exec();
		res.status(200).send({message: 'File removed!', issue: updatedIssue});
	} catch (err) {
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

module.exports = router;
