import express from "express";
import mongoose from "mongoose";

import User from "../db/models/user.js";
import Book from "../db/models/book.js";

const userRoutes = express.Router();

userRoutes.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});

userRoutes.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('books');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error get users', error });
  }
});

userRoutes.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error get user by id', error });
  }
});

userRoutes.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

userRoutes.post('/users/loan-book', async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Max 5 books per user
    if (user.books.length >= 5) {
      return res.status(400).json({ message: 'User cannot hold more than 5 books' });
    }
    const filter = { name: req.body.bookName }
    const book = await Book.findOne(filter)
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if(book.isLoaned) return res.status(400).json({ message: 'Book already loaned' });
    await Book.updateOne(filter, { isLoaned: true, loanDate: new Date() });
    user.books.push(book._id);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error adding book to user', error });
  }
});

userRoutes.put('/users/:id/return-book/:bookId', async (req, res) => {
  try {
    const bookId = req.params.bookId
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.books = user.books.filter(item => item.book.toString() !== bookId);
    Book.findByIdAndUpdate(bookId, { isLoaned: false, loanDate: null })
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error removing book from user', error });
  }
});

userRoutes.get('/users/:id/loaned-books', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('books');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.json(user.books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching loaned books', error });
    }
});

userRoutes.get('/users/availability/:bookId', async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      if (book.isLoaned) {
        const availablenssDate = calcAvailablenss(book.loanDate, book.popularity)
        return res.json(`The book ${book.name} is not available, it will be at ${availablenssDate}`)
      } 
      return res.json(`The book ${book.name} is available`)
    } catch (error) {
        res.status(500).json({ message: 'Error checking availability', error });
    }
})


const calcAvailablenss = function(loanDate, popularity) {
    let loanDuration = 7
    if (popularity == 4) loanDuration = 3
    else if (popularity == 5) loanDuration = 2

    loanDate.setDate(loanDate.getDate() + loanDuration);
    return loanDate;
}

export default userRoutes;