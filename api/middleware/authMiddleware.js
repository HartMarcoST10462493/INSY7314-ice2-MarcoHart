/*
 * authMiddleware.js
 * Middleware that guards routes.
 * - protect: only lets a request through if it has a valid JWT.
 * - requireRole: only lets a request through if the user has the right role.
 * protect must run before requireRole, because requireRole reads req.user.
 */

const jwt = require("jsonwebtoken");

// Checks the Authorization header for "Bearer <token>" and verifies the token.
// Returns 401 if the token is missing, badly formatted, invalid or expired.
// If it is valid, the token's id and role are saved on req.user for later use.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Not authorised: token missing or not in 'Bearer <token>' format",
    });
  }

  try {
    // verify() checks the signature and the expiry time. Only HS256 is accepted,
    // so a token can't trick the server into using a weaker algorithm.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Not authorised: token has expired" : "Not authorised: invalid token";
    return res.status(401).json({ success: false, message });
  }
};

// Builds a middleware that only allows users with one of the given roles.
// Example: requireRole("admin"). Anyone else gets 403 Forbidden.
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not have permission to do this",
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };
