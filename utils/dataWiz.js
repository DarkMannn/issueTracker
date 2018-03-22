let mongooseHandler = require('../models/index');
let Issue = require('../models/issue');
let User = require('../models/user');
let Label = require('../models/label');
let faker = require('faker');

async function createUser(num, remove) {
	if (remove) await User.remove({}).exec();
	while (num) {
		let email = faker.internet.email();
		let password = faker.internet.password(12);
		let firstName = faker.name.firstName();
		let lastName = faker.name.lastName();
		let user = new User({
			email,
			password,
			firstName,
			lastName
		});
		try {
		await user.save();
		} catch (err) { console.log(err) };
		num--;
	}
}

async function createLabel(num, remove) {
	if (remove) await Label.remove({}).exec();
	let colors = ['red', 'blue', 'black', 'yellow'];
	while (num) {
		let name = faker.lorem.word();
		let color = colors[Math.floor(Math.random() * 4)];
		let label = new Label({
			name,
			color
		});
		await label.save();
		num--;
	}
}

async function createIssue(num, remove) {
	if (remove) await Issue.remove({}).exec();
	let statuses = ['open', 'closed', 'solved'];
	while (num) {
		let title = faker.lorem.sentence();
		let creator = (await User.findOne({}).skip(Math.floor(Math.random() * num)).exec()).id;
		let description = faker.lorem.lines();
		let status = statuses[Math.floor(Math.random() * 3)];
		let date = faker.date.past();
		let label = (await Label.findOne({}).skip(Math.floor(Math.random() * num)).exec()).id;
		let comments = [faker.lorem.lines(), faker.lorem.lines(), faker.lorem.lines()];
		let issue = new Issue({
			title,
			creator,
			description,
			status,
			date,
			label,
			comments
		});
		await issue.save();
		num--;
	}
}

async function deleteData(Model) {
	await Model.remove({}).exec();
}

async function fillEntireDb(num, remove) {
	try {
		await createUser(num, remove);
		await createLabel(num, remove);
		await createIssue(num, remove);
	} catch (err) {
		/** Do again if faker generated invalid data */
		fillEntireDb(num, remove);
	}
}

fillEntireDb(10, true);

module.exports = {
	createUser,
	createLabel,
	createIssue,
	deleteData,
	fillEntireDb
};
