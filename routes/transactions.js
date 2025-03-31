const express = require('express');
const { Transaction, Book } = require('../models');
const router = express.Router();

// Borrow a book
router.post('/borrow', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    
    // Check book availability
    const book = await Book.findByPk(bookId);
    if (!book.availability) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user_id: userId,
      book_id: bookId,
      borrow_date: new Date(),
      status: 'borrowed'
    });

    // Update book availability
    await Book.update({ availability: false }, { where: { id: bookId } });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Return a book
router.post('/return', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findByPk(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction
    await Transaction.update(
      { return_date: new Date(), status: 'returned' }, 
      { where: { id: transactionId } }
    );

    // Update book availability
    await Book.update(
      { availability: true }, 
      { where: { id: transaction.book_id } }
    );

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.findAll({ 
      where: { user_id: userId },
      include: [{ model: Book, attributes: ['title', 'author'] }]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;