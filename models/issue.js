/** Provides interface for interaction with Issues
 * @module models/issue
 * @requires mongoose
 * @requires utils/validators
 */

let mongoose = require('mongoose');
let {isTitle} = require('../utils/validators');
let User = require('./user');
let Label = require('./label');
let Schema = mongoose.Schema;

/** Define a schema for Issue model */
let issueSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Title is required for a new issue.'],
		trim: true,
		validate: isTitle
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Author data was not delivered.']
	},
	description: {
		type: String,
		trim: true
	},
	status: {
		type: String,
		trim: true,
		enum: {
			values: ['open', 'closed', 'solved'],
			message: 'Status you provided is not valid.'
		},
		default: 'open'
	},
	date: {
		type: Date,
		default: Date.now
	},
	label: {
		type: Schema.Types.ObjectId,
		ref: 'Label'
	},
	comments: {
		type: []
	},
	files: {
		type: []
	}
});

/** Pre save hook for sanitizing issue */
issueSchema.pre('save', async function(next) {
	let issue = this;

	try {
		let creator = await User.findById(issue.creator);
		let label = await Label.findById(issue.label);
		if (creator && label) next();
		else next(new Error('User with given id does not exist.'));
	} catch (err) {
		console.log(`Error while creating issue: ${err}`);
		next(err);
	};
	
});

module.exports = mongoose.model('Issue', issueSchema);
