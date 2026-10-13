/*
 * rateLimiter.js
 * Limits how often someone can call the login route, to slow down
 * brute-force attacks (an attacker trying many passwords quickly).
 */

const { rateLimit } = require("express-rate-limit");

// Allows 5 login requests per IP address every 15 minutes.
// The 6th request inside that window gets 429 Too Many Requests.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes, in milliseconds
  limit: 5,
  standardHeaders: "draft-8", // tell the client its limit in the RateLimit headers
  legacyHeaders: false, // don't send the older X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

module.exports = { loginLimiter };
