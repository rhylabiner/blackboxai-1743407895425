const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePDFReport = (reportData, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);

    // Report Header
    doc.fontSize(20).text('Library Management System Report', { align: 'center' });
    doc.moveDown();

    // Summary Section
    doc.fontSize(16).text('Summary Statistics', { underline: true });
    doc.fontSize(12).text(`Total Books: ${reportData.totalBooks}`);
    doc.text(`Active Borrowings: ${reportData.activeBorrowings}`);
    doc.text(`Overdue Books: ${reportData.overdueBooks}`);
    doc.moveDown();

    // Borrowing Trend
    doc.fontSize(16).text('Borrowing Trend', { underline: true });
    reportData.borrowingTrend.forEach(item => {
      doc.text(`${item.name}: ${item.borrowed} borrowed, ${item.returned} returned`);
    });
    doc.moveDown();

    // Categories
    doc.fontSize(16).text('Books by Category', { underline: true });
    reportData.booksByCategory.forEach(cat => {
      doc.text(`${cat.category}: ${cat.value} books`);
    });
    doc.moveDown();

    // Top Borrowers
    doc.fontSize(16).text('Top Borrowers', { underline: true });
    reportData.topBorrowers.forEach((borrower, index) => {
      doc.text(`${index + 1}. ${borrower.name} (${borrower.email}): ${borrower.count} borrowings`);
    });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generatePDFReport };