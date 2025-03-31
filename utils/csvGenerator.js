const { Parser } = require('json2csv');
const fs = require('fs');

const generateCSVReport = (reportData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Flatten the report data for CSV
      const csvData = [
        { metric: 'Total Books', value: reportData.totalBooks },
        { metric: 'Active Borrowings', value: reportData.activeBorrowings },
        { metric: 'Overdue Books', value: reportData.overdueBooks },
        ...reportData.borrowingTrend.map(item => ({
          date: item.name,
          books_borrowed: item.borrowed,
          books_returned: item.returned
        })),
        ...reportData.booksByCategory.map(cat => ({
          category: cat.category,
          book_count: cat.value
        })),
        ...reportData.topBorrowers.map(borrower => ({
          borrower_name: borrower.name,
          borrower_email: borrower.email,
          borrow_count: borrower.count
        }))
      ];

      const parser = new Parser();
      const csv = parser.parse(csvData);
      fs.writeFile(filePath, csv, (err) => {
        if (err) reject(err);
        else resolve(filePath);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCSVReport };