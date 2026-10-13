/*
 * errorHandler.js
 * The central error handler. Any error passed to next(err) anywhere in the
 * app ends up here, so every error response has the same JSON shape.
 */

// Express knows this is an error handler because it takes 4 arguments.
// It logs the error, then replies with { success: false, message }.
// The stack trace is only included outside production, so attackers
// can't see details about our code.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Use the error's own status if it has one (e.g. 400 for bad JSON), otherwise 500
  const status = err.status || err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
