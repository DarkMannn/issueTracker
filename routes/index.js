/** 
 * Express router providing home page
 * @module routes/index
 * @requires express
 */
let express = require('express');
let router = express.Router();

/**
 * Route serving home page
 * @name Get home page
 * @route {GET} /
 */
router.get('/', (req, res, next) => {
	req.session.homepage = true;
	res.render('index', { title: 'Some Random Company Issue Tracker' });
});

module.exports = router;
