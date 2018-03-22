let server = require('../app');
let User = require('../models/user');
let {createUser, deleteData} = require('../utils/dataWiz');
let faker = require('faker');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('user specific routes', function() {

	let email, password, firstName, lastName;

	beforeEach(async function() {
		await createUser(2, true);
		email = faker.internet.email();
		password = faker.internet.password(12);
		firstName = faker.name.firstName();
		lastName = faker.name.lastName();
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
				.send({email: email, password: password, firstName: firstName, lastName: lastName});
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
					.send({email: email, password: password, firstName: firstName, lastName: lastName});
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
				.send({email: email, password: password, firstName: firstName, lastName: lastName});
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
				.send({email: email, password: password, firstName: firstName, lastName: lastName});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully registered.');
		});

		it('should not create account', async function() {
			try {
				let res = await agent
					.post('/users')
					.send({email: email, password: password, firstName: firstName, lastName: lastName});
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
				.send({email: email, password: password, firstName: firstName, lastName: lastName});
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

	describe('signing with invalid data', function() {

		it('should return false email', async function() {
			try {
				let res = await chai.request(server)
				.post('/users')
				.send({email: 'zz', password: password, firstName: firstName, lastName: lastName});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.have.string('validation failed');
			}
		});

		it('should return false short password', async function() {
			try {
				let res = await chai.request(server)
				.post('/users')
				.send({email: faker.internet.email(), password: '123', firstName: firstName, lastName: lastName});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.have.string('validation failed');
			}
		});
		
		it('should return short first name or last name', async function() {
			try {
				let res = await chai.request(server)
				.post('/users')
				.send({email: faker.internet.email(), password: password, firstName: 'jo', lastName: lastName});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.have.string('validation failed');
			}
		});

	});

	afterEach(async function() {
		await deleteData(User);
	});

});
