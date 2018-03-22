/** 
 * Express router providing issue related post routes
 * @module routes/issuesPost
 * @requires express
 * @requires models/issue
 * @see models/issue
 * @requires multer
 */

let express = require('express');
let multer = require('multer');
var storage = multer.diskStorage({
	destination: function(req, res, cb) {
		cb(null, `${process.cwd()}/public/files`);
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
	}
});
var upload = multer({storage: storage});
let Issue = require('../models/issue');
let router = express.Router();

/** One cannot post anything without an active session */
router.post(/.*/, (req, res, next) => {
	if (!('email' in req.session)) return res.status(400).send({message: 'You are not currently logged in.'});
	next();
});

/**
 * Route for sending information for a new issue 
 * @name Post issue
 * @route {POST} /issues
 * @bodyparam {string} title Issue title
 * @bodyparam {string} description Issue description
 * @bodyparam {string} creator Creator of the issue
 * @bodyparam {string} status open/closed/solved
 * @bodyparam {string} label Label associated with this issue
 */
router.post('/', async (req, res, next) => {
	let {title, description, creator, status, label} = req.body;
	let newIssue = new Issue({title, description, creator, status, label});

	try {
		let savedIssue = await newIssue.save();
		res.status(201).send({message: 'Issue posted!', issue: savedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for sending comments for a specific issue
 * @name Post a comment
 * @route {POST} /issues/:issueid/comments
 * @routeparam {string} :issueid The unique id of the issue
 * @bodyparam {string} comment New comment for the issue
 */
router.post('/:issueid/comments', async (req, res, next) => {
	req.issueid = req.params.issueid;
	req.com = req.body.comment;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot post a comment, issue is not found.'});
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue = await Issue.findByIdAndUpdate(
			req.issueid,
			{$push: {comments: req.com}},
			{runValidators: true, new: true}
		)
		.exec();
		res.status(201).send({message: 'Comment posted!', issue: updatedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

/**
 * Route for uploading files for a specific issue
 * @name Upload file
 * @route {POST} /issues/:issueid/files
 * @routeparam {string} :issueid The unique id of the issue
 * @bodyparam {binary} file New file
 */
router.post('/:issueid/files', async (req, res, next) => {
	req.issueid = req.params.issueid;
	let isValid;
	if (!req.issueid.match(/^[0-9a-fA-F]{24}$/)) isValid = false;
	else isValid = await Issue.count({_id: req.issueid}).exec();
	if (!isValid) return res.status(404).send({message: 'Cannot post a file, issue is not found.'});
	next();
}, (req, res, next) => {
	upload(req, res, function (err) {
		if (err) return next({error: 'Failed to upload file.'});
		next();
	});
}, (req, res, next) => {
	req.urls = [];
	req.files.forEach(file =>
		req.uploads.push(`/files/${file.fieldname + '_' + Date.now() + '_' + file.originalname}`)
	);
	next();
}, async (req, res, next) => {
	try {
		let updatedIssue;
		req.urls.forEach(async (url) => {
			updatedIssue = await Issue.findByIdAndUpdate(
				req.issueid,
				{$push: {files: url}},
				{runValidators: true, new: true}
			)
			.exec();
		});
		res.status(201).send({message: 'Files uploaded!', issue: updatedIssue});
	} catch (err) {
		if (err.name === 'ValidationError') return res.status(400).send({message: err.message});
		next({error: 'Internal server error. Try to sign up again.'});
	}
});

module.exports = router;
