let server = require('../app');
let User = require('../models/user');
let {createUser, deleteData} = require('../utils/dataWiz');
let faker = require('faker');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('session specific routes', function() {

	let email, password, firstName, lastName;
	
	before(async function() {
		await createUser(2, true);
		email = faker.internet.email();
		password = faker.internet.password(12);
		firstName = faker.name.firstName();
		lastName = faker.name.lastName();
		let user = new User({
			email,
			password,
			firstName,
			lastName
		});
		await user.save();
	});

	describe('getting the login form', function() {

		it('should return html', async function() {
			let res = await chai.request(server).get('/sessions/new');
			res.should.have.status(200);
			res.should.be.html;
			res.should.not.have.cookie('sessionCookie');
		});

	});

	describe('logging without an account', function() {

		it('should not log in', async function() {
			try {
				let res = await chai.request(server)
					.post('/sessions')
					.send({email: 'notRealAccount.com', password: 'fdfd'});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(403);
				res.body.message.should.be.equal('You do not have an active account.');
			}
		});

	});

	describe('logging with wrong password', function() {

		it('should not log in', async function() {
			try {
				let res = await chai.request(server)
					.post('/sessions')
					.send({email: email, password: 'asdfasdfasdf'});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(401);
				res.body.message.should.be.equal('You have entered the wrong password.');
			}
		});

	});

	describe('logging in and out', function() {
		let agent = chai.request.agent(server);

		it('should log in and give active session cookie', async function() {
			let res = await agent
				.post('/sessions')
				.send({email: email, password: password});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully logged in.');
		});

		it('should log out', async function() {
			let res = await agent
				.del('/sessions');
			res.should.have.status(200);
			res.body.message.should.be.equal('You have been successfully logged out.');
		});

	});

	describe('logging in twice', function() {
		let agent = chai.request.agent(server);

		it('should log in and give active session cookie', async function() {
			let res = await agent
				.post('/sessions')
				.send({email: email, password: password});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.message.should.be.equal('Successfully logged in.');
		});

		it('should reject login request', async function() {
			try {
				let res = await agent
					.post('/sessions')
					.send({email: email, password: password});
			} catch (not2xx) {
				let res = not2xx.response;
				res.should.have.status(400);
				res.body.message.should.be.equal('You are already logged in.');
				res.should.have.cookie('sessionCookie');
			}
		});
	});

	after(async function() {
		await deleteData(User);
	});

});
