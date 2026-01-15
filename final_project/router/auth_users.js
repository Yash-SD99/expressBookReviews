const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

// Check username uniqueness
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

// Check login credentials
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// LOGIN
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username },
      "fingerprint_customer",
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  }

  return res.status(401).json({ message: "Invalid login credentials" });
});

// ADD / MODIFY review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

// DELETE review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  }

  return res.status(404).json({ message: "No review found for this user" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
