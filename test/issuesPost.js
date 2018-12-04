let server = require('../app');
let User = require('../models/user');
let Label = require('../models/label');
let Issue = require('../models/issue');
let dataWiz = require('../utils/dataWiz');
let faker = require('faker');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('issue specific routes', function() {

	let email, password, firstName, lastName;

	before(async function fill() {
		await dataWiz.fillEntireDb(10, true);
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
	});

	describe('trying to post without active account', function() {

		it('should return 400', async function() {
			let res = await chai.request(server)
				.post('/issues');
			res.should.have.status(400);
		});

	});

	// describe('getting specific issue', function() {

	// 	it('should return all issues', async function() {
	// 		let issue = await Issue.findOne({}).exec();
	// 		let res = await chai.request(server).get('/issues/' + issue._id);
	// 		res.should.have.status(200);
	// 		res.should.be.json;
	// 		res.body._id.should.be.equal(issue._id.toString());
	// 	});

	// });

	after(async function() {
		await dataWiz.deleteData(User);
		await dataWiz.deleteData(Label);
		await dataWiz.deleteData(Issue);
	});

});
