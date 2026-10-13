/*
 * bookRoutes.js
 * Connects each book URL to its controller function.
 * These routes are mounted at /api/books in index.js, so "/" here means /api/books.
 */

const express = require("express");
const { getAllBooks, getBookById, createBook } = require("../controllers/bookController");
const validateBookInput = require("../middleware/validateBookInput");

const router = express.Router();

// GET /api/books - list all books
router.get("/", getAllBooks);

// GET /api/books/:id - get one book by id (e.g. /api/books/b1)
router.get("/:id", getBookById);

// POST /api/books - validate the body first, then create the book
router.post("/", validateBookInput, createBook);

module.exports = router;
