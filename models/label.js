/** Provides interface for interaction with Issue labels
 * @module models/label
 * @requires mongoose
 * @requires utils/validators
 */

let mongoose = require('mongoose');
let {isLabel} = require('../utils/validators');
let Schema = mongoose.Schema;

/** Define a schema for Label model */
let labelSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Label name is required.'],
		trim: true,
		index: {unique: true},
		validate: isLabel
	},
	color: {
		type: String,
		enum: {
			values: ['red', 'black', 'blue', 'pink', 'green', 'yellow'],
			message: 'You did not provide valid color name'
		},
		defaults: 'red'
	}
});

module.exports = mongoose.model('Label', labelSchema);
