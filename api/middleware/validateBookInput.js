/*
 * validateBookInput.js
 * Middleware that checks the request body before a new book is created.
 * It checks every rule and collects all the problems, so the client sees
 * everything that is wrong in one response instead of one error at a time.
 */

// Returns true if the value is a string that isn't just empty space
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

// Checks title, author, genre, year and price. If anything fails it responds
// with 400 and an errors array; otherwise it calls next() to reach the controller
const validateBookInput = (req, res, next) => {
  const { title, author, genre, year, price } = req.body || {};
  const errors = [];
  const currentYear = new Date().getFullYear();

  if (!isNonEmptyString(title)) {
    errors.push("Title is required and must be a non-empty string");
  }

  if (!isNonEmptyString(author)) {
    errors.push("Author is required and must be a non-empty string");
  }

  if (!isNonEmptyString(genre)) {
    errors.push("Genre is required and must be a non-empty string");
  }

  // 1450 is roughly when the printing press was invented
  if (!Number.isInteger(year) || year < 1450 || year > currentYear) {
    errors.push(`Year must be an integer between 1450 and ${currentYear}`);
  }

  // Number.isFinite rules out strings, NaN and Infinity
  if (!Number.isFinite(price) || price <= 0) {
    errors.push("Price must be a positive number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

module.exports = validateBookInput;
