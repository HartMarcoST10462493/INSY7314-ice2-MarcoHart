# INSY7314 ICE Task 2 – Structured Books API

GitHub Repository: LINK_HERE

A structured backend API built with Node.js and Express for INSY7314 (Learning Unit 2, Theme 1). It manages a **books** resource stored in a temporary in-memory array. There is no database, so any books you add are lost when the server restarts.

The API includes:

- a **routes** folder (`routes/bookRoutes.js`)
- a **controllers** folder (`controllers/bookController.js`)
- a **middleware** folder containing input validation (`validateBookInput.js`) and a central error handler (`errorHandler.js`)
- a controlled **CORS** configuration (an origin allowlist that permits only GET and POST)

Each book has six attributes: `id`, `title`, `author`, `genre`, `year` and `price`. IDs follow the format `b1`, `b2`, `b3`, and so on. Three books (b1–b3) are seeded when the server starts.

## Project structure

```
secure-mern-app/
├── README.md
├── postman/
│   └── ICE2-Books.postman_collection.json
└── api/
    ├── controllers/
    │   └── bookController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── validateBookInput.js
    ├── routes/
    │   └── bookRoutes.js
    ├── .env
    ├── .gitignore
    ├── index.js
    ├── package-lock.json
    └── package.json
```

## Setup

1. Make sure Node.js (v18 or later) is installed.
2. Clone the repository and move into the `api` folder:
   ```bash
   git clone LINK_HERE
   cd secure-mern-app/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the `api` folder (see the next section).
5. Start the server:
   ```bash
   npm run dev   # development mode with nodemon (restarts on file changes)
   npm start     # plain node
   ```
6. The server runs at `http://localhost:4000`.
7. To test with Postman, import `postman/ICE2-Books.postman_collection.json` and run the requests in order on a freshly started server, so the new book IDs come out as b4–b8.

## Environment variables (`api/.env`)

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `PORT` | No (default `4000`) | `4000` | Port the server listens on |
| `CORS_ORIGIN` | Yes, for browser clients | `http://localhost:3000` | Comma-separated list of origins allowed to call the API from a browser. Requests with no origin (Postman, curl) are always allowed. |
| `NODE_ENV` | No | `production` | When set to `production`, error responses leave out the stack trace |

Example `.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

`.env` is listed in `.gitignore`, so it is not committed.

## Endpoints tested in Postman

| # | Method | URL | Purpose | Expected status |
|---|---|---|---|---|
| 1 | GET | `http://localhost:4000/` | Root route – welcome message | 200 OK |
| 2 | GET | `http://localhost:4000/health` | Health check – status, uptime and timestamp | 200 OK |
| 3 | GET | `http://localhost:4000/api/books` | Fetch all books | 200 OK |
| 4 | GET | `http://localhost:4000/api/books/b1` | Fetch one book by ID | 200 OK |
| 5 | GET | `http://localhost:4000/api/books/b99` | Fetch a book ID that doesn't exist | 404 Not Found |
| 6–10 | POST | `http://localhost:4000/api/books` | Add five new books (bodies below) | 201 Created |
| 11 | GET | `http://localhost:4000/api/books` | Confirm the five new books were added (count = 8) | 200 OK |
| 12–16 | POST | `http://localhost:4000/api/books` | Validation checks with invalid bodies (below) | 400 Bad Request |

All POST requests use the header `Content-Type: application/json`.

## Sample POST request bodies (adding new books)

Send each of these to `POST http://localhost:4000/api/books`. On a freshly started server they are assigned IDs b4 to b8.

**Book 1 – Dune** (→ `b4`)

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "genre": "Science Fiction",
  "year": 1965,
  "price": 229.99
}
```

**Book 2 – Pride and Prejudice** (→ `b5`)

```json
{
  "title": "Pride and Prejudice",
  "author": "Jane Austen",
  "genre": "Romance",
  "year": 1813,
  "price": 120
}
```

**Book 3 – The Great Gatsby** (→ `b6`)

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic",
  "year": 1925,
  "price": 145.5
}
```

**Book 4 – Sapiens** (→ `b7`)

```json
{
  "title": "Sapiens",
  "author": "Yuval Noah Harari",
  "genre": "Non-fiction",
  "year": 2011,
  "price": 280
}
```

**Book 5 – The Alchemist** (→ `b8`)

```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "genre": "Fiction",
  "year": 1988,
  "price": 175
}
```

Example successful response (`201 Created`):

```json
{
  "success": true,
  "message": "Book created",
  "data": {
    "id": "b4",
    "title": "Dune",
    "author": "Frank Herbert",
    "genre": "Science Fiction",
    "year": 1965,
    "price": 229.99
  }
}
```

## Validation rules

| Field | Rule |
|---|---|
| `title` | Required, non-empty string |
| `author` | Required, non-empty string |
| `genre` | Required, non-empty string |
| `year` | Integer between 1450 and the current year |
| `price` | Positive number (greater than 0) |

The validation middleware checks every rule and returns **all** failures together in an `errors` array.

## Invalid request bodies (validation tests)

Each of these is sent to `POST http://localhost:4000/api/books` and returns **400 Bad Request**.

### 1. Missing title

```json
{
  "author": "George Orwell",
  "genre": "Satire",
  "year": 1945,
  "price": 99.99
}
```

Expected response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title is required and must be a non-empty string"]
}
```

### 2. Invalid year (in the future)

```json
{
  "title": "Future Book",
  "author": "Unknown Author",
  "genre": "Science Fiction",
  "year": 3000,
  "price": 150
}
```

Expected response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Year must be an integer between 1450 and 2026"]
}
```

The upper limit is always the current year, so 2026 is shown here because that is the year these tests were run. A year before 1450 (e.g. `1300`) or a decimal (e.g. `1999.5`) returns the same error.

### 3. Negative price

```json
{
  "title": "Animal Farm",
  "author": "George Orwell",
  "genre": "Satire",
  "year": 1945,
  "price": -50
}
```

Expected response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Price must be a positive number"]
}
```

A price of `0` returns the same error.

### 4. Empty body

```json
{}
```

Expected response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required and must be a non-empty string",
    "Author is required and must be a non-empty string",
    "Genre is required and must be a non-empty string",
    "Year must be an integer between 1450 and 2026",
    "Price must be a positive number"
  ]
}
```

### 5. Wrong data types

```json
{
  "title": 12345,
  "author": true,
  "genre": ["Fiction"],
  "year": "1999",
  "price": "199.99"
}
```

Expected response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required and must be a non-empty string",
    "Author is required and must be a non-empty string",
    "Genre is required and must be a non-empty string",
    "Year must be an integer between 1450 and 2026",
    "Price must be a positive number"
  ]
}
```

Numbers sent as strings (`"1999"`, `"199.99"`) are rejected because `year` and `price` must be real JSON numbers.

## Other responses

| Situation | Status | Response |
|---|---|---|
| Unknown route (e.g. `GET /unknown`) | 404 | `{ "success": false, "message": "Route GET /unknown not found" }` |
| Malformed JSON body | 400 | `{ "success": false, "message": "<parse error>" }` from the central error handler |
| Browser request from an origin not in `CORS_ORIGIN` | 403 | `{ "success": false, "message": "CORS blocked: origin '...' is not allowed" }` |
