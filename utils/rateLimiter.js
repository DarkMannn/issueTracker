/** 
 * Provides protection mechanisms against brute force attacks
 * @module utils/rateLimiter
 * @requires express-rate-limit
 */

let RateLimiter = require('express-rate-limit');

/** Maximum of 20 retries in 30 minutes */
let rateLimiter = new RateLimiter({
	windowMs: 30 * 60 * 1000, // 30 minutes
	max: 20,
	delayMs: 1000,
	delayAfter: 2
  });

module.exports = rateLimiter;
