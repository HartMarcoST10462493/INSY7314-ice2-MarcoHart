/*
 * bookController.js
 * The controller holds the logic for each book route.
 * Books are kept in an in-memory array (no database), so any books
 * added with POST are lost when the server restarts.
 */

// Our temporary "database": an array of book objects, seeded with 3 books
const books = [
  { id: "b1", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", year: 1960, price: 189.99 },
  { id: "b2", title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949, price: 159.5 },
  { id: "b3", title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, price: 210 },
];

// Works out the next id by finding the highest number used so far and adding 1
// (e.g. if b1, b2, b3 exist, the next id is b4)
const generateNextId = () => {
  const highest = books.reduce((max, book) => {
    const number = parseInt(book.id.slice(1), 10);
    return number > max ? number : max;
  }, 0);
  return `b${highest + 1}`;
};

// GET /api/books - sends back every book in the array
const getAllBooks = (req, res, next) => {
  try {
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (err) {
    next(err); // let the central error handler deal with it
  }
};

// GET /api/books/:id - finds one book by its id, or returns 404 if it doesn't exist
const getBookById = (req, res, next) => {
  try {
    const book = books.find((b) => b.id === req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with id '${req.params.id}' not found`,
      });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// POST /api/books - adds a new book (the body has already passed validation)
// and returns it with status 201 Created
const createBook = (req, res, next) => {
  try {
    const { title, author, genre, year, price } = req.body;

    const newBook = {
      id: generateNextId(),
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      year,
      price,
    };

    books.push(newBook);
    res.status(201).json({ success: true, message: "Book created", data: newBook });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook };
