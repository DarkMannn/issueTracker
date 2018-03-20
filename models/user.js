/** Provides interface for interaction with User data
 * @module models/user
 * @requires mongoose
 * @requires bcrypt
 * @requires config.example.json
 */

let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let saltFactor = require('../config.example.json').saltFactor;
let Schema = mongoose.Schema;

/** Define a schema for User model */
let userSchema = new Schema({
	email: {
		type: String,
		required: true,
		index: {unique: true}
	},
	password: {
		type: String,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	}
});

/** Pre save hook for hashing user plaintext password */
userSchema.pre('save', async function(next) {
	let user = this;

	if (!user.isModified('password')) return next();

	try {
		let hash = await bcrypt.hash(user.password, saltFactor);
		user.password = hash;
		next();
	} catch (err) {
		console.log(`Error while hashing user password: ${err}`);
	};
	
});

/** Define method for evaulating the given password */
userSchema.methods.isPasswordValid = async function(candidatePassword, hash) {
	try {
		return await bcrypt.compare(candidatePassword, hash);
	} catch (err) {
		console.log(`Error while evaluating password: ${err}`);
	}
};

module.exports = mongoose.model('User', userSchema);
