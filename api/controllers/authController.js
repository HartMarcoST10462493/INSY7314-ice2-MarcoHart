/*
 * authController.js
 * The controller for user accounts: registering, logging in and viewing a profile.
 * Users are kept in an in-memory array (no database), so registered users are
 * lost when the server restarts. Passwords are never stored as plain text –
 * only a bcrypt hash is saved.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Our temporary user store. The admin account is added by seedAdmin() at startup.
const users = [];

// How many rounds of hashing bcrypt does. Higher is slower, which makes
// guessing passwords harder for an attacker.
const SALT_ROUNDS = 10;

// Returns true if the value is a string that isn't just empty space
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

// Works out the next user id (u1, u2, u3...) the same way books get b1, b2, b3...
const generateNextId = () => {
  const highest = users.reduce((max, user) => {
    const number = parseInt(user.id.slice(1), 10);
    return number > max ? number : max;
  }, 0);
  return `u${highest + 1}`;
};

// Returns a copy of the user without the password hash, so it is safe to send back
const toSafeUser = ({ password, ...safeUser }) => safeUser;

// Creates the admin account from ADMIN_EMAIL and ADMIN_PASSWORD in .env.
// Called once from index.js when the server starts.
const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set – no admin user created");
    return;
  }

  users.push({
    id: generateNextId(),
    name: "Admin",
    email: ADMIN_EMAIL.trim().toLowerCase(),
    password: await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS),
    role: "admin",
  });
};

// POST /api/auth/register - creates a new user with the role "user".
// Returns 400 if a field is missing, 409 if the email is already taken, otherwise 201.
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const errors = [];

    if (!isNonEmptyString(name)) errors.push("Name is required and must be a non-empty string");
    if (!isNonEmptyString(email)) errors.push("Email is required and must be a non-empty string");
    if (!isNonEmptyString(password)) errors.push("Password is required and must be a non-empty string");

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    // Store emails in lower case so "Bob@x.com" and "bob@x.com" count as the same account
    const normalisedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalisedEmail)) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const newUser = {
      id: generateNextId(),
      name: name.trim(),
      email: normalisedEmail,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      role: "user", // new accounts are always normal users; the client cannot choose a role
    };

    users.push(newUser);
    res.status(201).json({ success: true, message: "User registered", data: toSafeUser(newUser) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login - checks the email and password and, if they match,
// returns a JWT that expires in 1 hour. The token holds the user's id and role.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = users.find((u) => u.email === email.trim().toLowerCase());

    // bcrypt.compare hashes the password that was sent and compares it with the stored hash
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    // Same message for "no such email" and "wrong password", so attackers
    // can't use this route to find out which emails are registered
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile - returns the logged-in user's details (without the password).
// protect has already checked the token and put the user's id on req.user.
const getProfile = (req, res, next) => {
  try {
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { seedAdmin, register, login, getProfile };
