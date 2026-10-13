/*
 * authRoutes.js
 * Connects each authentication URL to its controller function.
 * These routes are mounted at /api/auth in index.js.
 */

const express = require("express");
const { register, login, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// POST /api/auth/register - create a new user account
router.post("/register", register);

// POST /api/auth/login - rate limited, then check credentials and return a JWT
router.post("/login", loginLimiter, login);

// GET /api/auth/profile - must be logged in (valid token required)
router.get("/profile", protect, getProfile);

module.exports = router;
