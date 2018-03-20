/** 
 * Provides functions for validating mongoose documents
 * @module utils/validators
 * @requires mongoose-validator
 * */

let validate = require('mongoose-validator');

let isName = [
	validate({
		validator: 'isLength',
		arguments: [3, 25],
		message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
	}),
	validate({
		validator: 'isAlphanumeric',
		passIfEmpty: true,
		message: 'Name should contain alpha-numeric characters only'
	})
];

let isEmail = [
	validate({
		validator: 'isEmail',
		message: 'Email address you provided is not valid.'
	})
];

let isPassword = [
	validate({
		validator: 'isLength',
		arguments: [10, 40],
		message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
	})
];

module.exports = {
	isName,
	isEmail,
	isPassword
};
