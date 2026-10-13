/*
 * bookRoutes.js
 * Connects each book URL to its controller function.
 * These routes are mounted at /api/books in index.js, so "/" here means /api/books.
 * Reading books is public; creating needs a login; deleting needs an admin.
 */

const express = require("express");
const { getAllBooks, getBookById, createBook, deleteBook } = require("../controllers/bookController");
const validateBookInput = require("../middleware/validateBookInput");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/books - list all books (public)
router.get("/", getAllBooks);

// GET /api/books/:id - get one book by id, e.g. /api/books/b1 (public)
router.get("/:id", getBookById);

// POST /api/books - must be logged in; validate the body, then create the book
router.post("/", protect, validateBookInput, createBook);

// DELETE /api/books/:id - must be logged in AND be an admin
router.delete("/:id", protect, requireRole("admin"), deleteBook);

module.exports = router;
