/** Provides main connection with MongoDB for interaction with models
 * @module models/index
 * @requires config.example.json
 */

let mongoose = require('mongoose');
let config = require('../config.example.json');

/** Connect to the MongoDB */
mongoose
.connect(config.mainDb)
.catch(err => console.log(`Error while connecting to the main database: ${err}`));

/**
 * Safely shuts down MongoDB before terminating node process
 */
let safelyCloseConnection = () => {
	mongoose.connection.close(() => {
		console.log('Shutting down.');
		process.exit(0);
	});
};

/** Listeners for terminating signals, activate callback for safe shutdown */
process.on('SIGTERM', safelyCloseConnection);
process.on('SIGINT', safelyCloseConnection);
