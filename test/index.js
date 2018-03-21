let server = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('functionality of application home page', function() {

	it('should return home page', async function() {
		let res = await chai.request(server).get('/');
		res.should.have.status(200);
		res.should.be.html;
		res.should.not.have.cookie('sessionCookie');
	});

});

describe('functionality of helmet module', function() {

	it('should have helmet safety headers', async function() {
		let res = await chai.request(server).get('/');
		res.should.have.header('X-Content-Type-Options', 'nosniff');
		res.should.have.header('X-DNS-Prefetch-Control', 'off');
		res.should.have.header('X-Download-Options', 'noopen');
		res.should.have.header('X-Frame-Options', 'SAMEORIGIN');
		res.should.have.header('X-XSS-Protection', '1; mode=block');
	});

});
