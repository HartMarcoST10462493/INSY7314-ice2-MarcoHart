/*
 * index.js
 * The entry point of the API. It loads settings from .env, sets up
 * middleware (JSON parsing and CORS), mounts the routes, and starts the server.
 * Order matters: routes come first, then the 404 handler, then the error handler.
 */

require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/bookRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// Turn the comma-separated CORS_ORIGIN value into a list of allowed sites
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Decides whether a request's origin is allowed. Requests with no origin
// (Postman, curl, server-to-server) are allowed; browsers from other sites are blocked.
const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  const err = new Error(`CORS blocked: origin '${origin}' is not allowed`);
  err.status = 403;
  callback(err);
};

// Middleware: read JSON request bodies, and apply our CORS rules
app.use(express.json());
app.use(cors({ origin: checkOrigin, methods: ["GET", "POST"] }));

// GET / - a simple welcome message to show the API is running
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the Books API" });
});

// GET /health - reports that the server is up, how long it has been running, and the time
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// All book routes live under /api/books
app.use("/api/books", bookRoutes);

// 404 handler: runs only if no route above matched the request
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Central error handler must be registered last
app.use(errorHandler);

// Start the server and print the address
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
