let server = require('../app');
let User = require('../models/user');
let faker = require('faker');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('user specific routes', function() {

	let email, password, firstName, lastName;
	let email2, password2, firstName2, lastName2;

	beforeEach(function() {
		User.remove({}).exec();
		email = faker.internet.email();
		email2 = faker.internet.email();
		password = faker.internet.password(12);
		password2 = faker.internet.password(12);
		firstName = faker.name.firstName();
		firstName2 = faker.name.firstName();
		lastName = faker.name.lastName();
		lastName2 = faker.name.lastName();
		let user = new User({
			email,
			password,
			firstName,
			lastName
		});
		return user.save();
	});

	describe('getting the signin form', function() {

		it('should return html', async function() {
			let res = await chai.request(server).get('/users/new');
			res.should.have.status(200);
			res.should.be.html;
			res.should.not.have.cookie('sessionCookie');
		});

	});

	describe('signing in for the first time', function() {

		it('should create an account', async function() {
			let res = await chai.request(server)
				.post('/users')
				.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully registered.');
		});

	});

	describe('signing in with existing account', function() {

		it('should not sign in', async function() {
			try {
				let res = await chai.request(server)
					.post('/users')
					.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.be.equal('That email is already taken. You have probably entered the wrong email.');
			}
		});

	});

	describe('signing in and logging out', function() {
		let agent = chai.request.agent(server);

		it('should create an account', async function() {
			let res = await agent
				.post('/users')
				.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully registered.');
		});

		it('should log out', async function() {
			let res = await agent
				.del('/sessions');
			res.should.have.status(200);
			res.body.message.should.be.equal('You have been successfully logged out.');
		});

	});

	describe('signing in twice', function() {
		let agent = chai.request.agent(server);

		it('should create an account', async function() {
			let res = await agent
				.post('/users')
				.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully registered.');
		});

		it('should not create account', async function() {
			try {
				let res = await agent
					.post('/users')
					.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.be.equal('You already have an active account.');
			}
		});

	});

	describe('signing in and deleting the account', function() {
		let agent = chai.request.agent(server);
		let userid;

		it('should create an account', async function() {
			let res = await agent
				.post('/users')
				.send({email: email2, password: password2, firstName: firstName2, lastName: lastName2});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully registered.');
			userid = res.body.id;
		});

		it('should remove an account', async function() {
			let res = await agent
				.del('/users/' + userid);
			res.should.have.status(200);
			res.body.message.should.be.equal('Account successfully removed.');
			res.should.not.have.cookie('sessionCookie');
		});
	});

	afterEach(function() {
		return User.remove({}).exec();
	});

});
