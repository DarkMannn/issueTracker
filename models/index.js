let mongoose = require('mongoose');
let config = require('../config.example.json');

mongoose.connect(config.mainDb)
		.catch(err => console.log(`Error while connecting to the main database: ${err}`));
