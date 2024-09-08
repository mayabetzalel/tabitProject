import express from "express";

import Book from "../db/models/book.js";
import User from "../db/models/user.js";

const bookRoutes = express.Router();

bookRoutes.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error){
    res.status(500).json({ message:'Error get books', error });
  }
});

bookRoutes.get('/books/search', async (req, res) => {
  try {
    const { author, topic, year } = req.query;
    const filter = {};
    if (author) filter.author = author
    if (topic) filter.topic = topic;
    if (year) filter.year = Number(year)

    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error });
  }
});

bookRoutes.get('/books/:id', async (req, res) => {
    try {
      const book = await Book.findById(req.params.id)
      if (!book) return res.status(404).json({ message: 'Book not found' });
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error to get a book by id', error });
    }
  });

// Employees functions
bookRoutes.put('/books/:id', async (req, res) => {
    try {
        if (req.body.userId) await checkAuthorization(req.body.userId)
        else return res.status(404).json({ message: 'Employee user is required' });
        delete req.body.userId
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.json(updatedBook)
    } catch (error) {
      res.status(500).json({ message: 'Error updating book', error });
    }
});
  
bookRoutes.post('/books', async (req, res) => {
      try {
        if (req.body.userId) await checkAuthorization(req.body.userId)
        else return res.status(404).json({ message: 'Employee user is required' });
        delete req.body.userId
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
      } catch(error) {
        res.status(400).json({ message: 'Error creating book', error });
      }
  });
  
bookRoutes.delete('/books/:id', async (req, res) => {
    try {
        if (req.body.userId) await checkAuthorization(req.body.userId)
        else return res.status(404).json({ message: 'Employee user is required' });
        const bookToDelete = await Book.deleteOne({ _id: req.params.id, isLoaned: false })
        if (!bookToDelete) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book- book already loaned', error });
    }
  });
  
bookRoutes.get('/loaned-books', async (req, res) => {
      try {
        await checkAuthorization(req.body.userId)
        const loandBooks = await Book.find({ isLoaned: true });
        res.json(loandBooks);
      } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error });
      }
  });

  const checkAuthorization = async function(userId) {
    let user = await User.findById(userId)
    if(!user || user.role != 'employee') {
        throw new Error('Unauthorized - Access denied');
    }
}

export default bookRoutes