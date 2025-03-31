const express = require('express');
const { Book } = require('../models');
const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, category } = req.body;
    const newBook = await Book.create({ title, author, isbn, category, availability: true });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book availability
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    await Book.update({ availability }, { where: { id } });
    res.json({ message: 'Book availability updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Book.destroy({ where: { id } });
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;