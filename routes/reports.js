const express = require('express');
const { Book, User, Transaction } = require('../models');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const { generatePDFReport } = require('../utils/pdfGenerator');
const { generateCSVReport } = require('../utils/csvGenerator');
const fs = require('fs');
const path = require('path');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}


// Helper function to calculate date range
const getDateRange = (range) => {
  const now = new Date();
  let fromDate;

  switch (range) {
    case 'week':
      fromDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      fromDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      fromDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      fromDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return { fromDate, toDate: new Date() };
};

// Helper function to generate report data
const generateReportData = async (range) => {
  const { fromDate, toDate } = getDateRange(range);

  // Get basic counts
  const totalBooks = await Book.count();
  const activeBorrowings = await Transaction.count({
    where: { status: 'borrowed' }
  });
  const overdueBooks = await Transaction.count({
    where: { 
      status: 'borrowed',
      dueDate: { [Op.lt]: new Date() }
    }
  });

  // Get borrowing trend data
  const borrowingTrend = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('borrow_date')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      'status'
    ],
    where: {
      borrow_date: { [Op.between]: [fromDate, toDate] }
    },
    group: ['date', 'status'],
    order: [['date', 'ASC']],
    raw: true
  });

  // Format trend data for chart
  const trendMap = {};
  borrowingTrend.forEach(item => {
    if (!trendMap[item.date]) {
      trendMap[item.date] = { name: item.date, borrowed: 0, returned: 0 };
    }
    trendMap[item.date][item.status === 'borrowed' ? 'borrowed' : 'returned'] = item.count;
  });
  const formattedTrend = Object.values(trendMap);

  // Get books by category
  const booksByCategory = await Book.findAll({
    attributes: [
      'category',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'value']
    ],
    group: ['category'],
    raw: true
  });

  // Get top borrowers
  const topBorrowers = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      [Sequelize.col('user.name'), 'name'],
      [Sequelize.col('user.email'), 'email']
    ],
    include: [{
      model: User,
      attributes: []
    }],
    where: {
      borrow_date: { [Op.between]: [fromDate, toDate] }
    },
    group: ['user_id'],
    order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
    limit: 5,
    raw: true
  });

  return {
    totalBooks,
    activeBorrowings,
    overdueBooks,
    borrowingTrend: formattedTrend,
    booksByCategory,
    topBorrowers
  };
};

// Generate library reports
router.get('/', async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const reportData = await generateReportData(range);
    res.json(reportData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export PDF report
router.get('/export/pdf', async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const reportData = await generateReportData(range);
    const filePath = path.join(tempDir, `report_${Date.now()}.pdf`);
    
    await generatePDFReport(reportData, filePath);
    
    res.download(filePath, 'library_report.pdf', (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {}); // Delete temp file after download
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate PDF report' });
  }
});

// Export CSV report
router.get('/export/csv', async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const reportData = await generateReportData(range);
    const filePath = path.join(tempDir, `report_${Date.now()}.csv`);
    
    await generateCSVReport(reportData, filePath);
    
    res.download(filePath, 'library_report.csv', (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {}); // Delete temp file after download
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate CSV report' });
  }
});

  try {
    const { range = 'month' } = req.query;
    const { fromDate, toDate } = getDateRange(range);

    // Get basic counts
    const totalBooks = await Book.count();
    const activeBorrowings = await Transaction.count({
      where: { status: 'borrowed' }
    });
    const overdueBooks = await Transaction.count({
      where: { 
        status: 'borrowed',
        dueDate: { [Op.lt]: new Date() }
      }
    });

    // Get borrowing trend data
    const borrowingTrend = await Transaction.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('borrow_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        'status'
      ],
      where: {
        borrow_date: { [Op.between]: [fromDate, toDate] }
      },
      group: ['date', 'status'],
      order: [['date', 'ASC']],
      raw: true
    });

    // Format trend data for chart
    const trendMap = {};
    borrowingTrend.forEach(item => {
      if (!trendMap[item.date]) {
        trendMap[item.date] = { name: item.date, borrowed: 0, returned: 0 };
      }
      trendMap[item.date][item.status === 'borrowed' ? 'borrowed' : 'returned'] = item.count;
    });
    const formattedTrend = Object.values(trendMap);

    // Get books by category
    const booksByCategory = await Book.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'value']
      ],
      group: ['category'],
      raw: true
    });

    // Get top borrowers
    const topBorrowers = await Transaction.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.col('user.name'), 'name'],
        [Sequelize.col('user.email'), 'email']
      ],
      include: [{
        model: User,
        attributes: []
      }],
      where: {
        borrow_date: { [Op.between]: [fromDate, toDate] }
      },
      group: ['user_id'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      totalBooks,
      activeBorrowings,
      overdueBooks,
      borrowingTrend: formattedTrend,
      booksByCategory,
      topBorrowers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;