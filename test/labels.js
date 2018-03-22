let server = require('../app');
let Label = require('../models/label');
let User = require('../models/user');
let {createLabel, deleteData} = require('../utils/dataWiz');
let faker = require('faker');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('label specific routes', function() {

	let name, color;
	
	before(async function() {
		await createLabel(2, true);
		name = 'Importantstuff';
		color = 'green';
		let label = new Label({
			name,
			color
		});
		await label.save();
		let user = new User({
			email: 'd@d.com',
			password: '1111111111',
			firstName: 'Randomname',
			lastName: 'Randomlastname'
		});
		await user.save();
	});

	describe('getting all the labels', function() {

		it('should return all labels', async function() {
			let res = await chai.request(server).get('/labels');
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.have.lengthOf(3);
		});

	});

	describe('posting new label and changing it', function() {

		let agent = chai.request.agent(server);
		let id;

		it('should log in', async function() {
			let res = await agent
				.post('/sessions')
				.send({email: 'd@d.com', password: '1111111111'});
		});

		it('should create new label', async function() {
			let name = 'Trivial';
			let color = 'red';
			let res = await agent
				.post('/labels')
				.send({name, color});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.label.name.should.equal('Trivial');
			res.body.label.color.should.equal('red');
			id = res.body.label._id;
		});

		it('should change existing label', async function() {
			let name = 'NonTrivial';
			let color = 'green';
			let res = await agent
				.put('/labels/' + id)
				.send({name, color});
			res.should.have.status(201);
			res.should.be.json;
			res.should.have.cookie('sessionCookie');
			res.body.label.name.should.equal('NonTrivial');
			res.body.label.color.should.equal('green');
		});

	});

	after(async function() {
		await deleteData(Label);
	});

});
