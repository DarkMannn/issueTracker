/** 
 * Provides functions for validating mongoose documents
 * @module utils/validators
 * @requires mongoose-validator
 */

let validate = require('mongoose-validator');

let isName = [
	validate({
		validator: 'isLength',
		arguments: [3, 25],
		message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
	}),
	validate({
		validator: 'isAscii',
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

let isLabel = [
	validate({
		validator: 'isLength',
		arguments: [2, 35],
		message: 'Label name should be between {ARGS[0]} and {ARGS[1]} characters'
	}),
	validate({
		validator: 'isAlpha',
		message: 'Label should contain letters only'
	})
];

let isTitle = [
	validate({
		validator: 'isLength',
		arguments: [3, 300],
		message: 'Title should be between {ARGS[0]} and {ARGS[1]} characters'
	}),
	validate({
		validator: 'isAscii',
		message: 'Comment should contain alpha-numeric characters only'
	})
];

module.exports = {
	isName,
	isEmail,
	isPassword,
	isTitle,
	isLabel
};
