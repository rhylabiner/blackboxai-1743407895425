const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Transaction extends Model {}

Transaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'book_id',
    references: {
      model: 'books',
      key: 'id'
    }
  },
  borrowDate: {
    type: DataTypes.DATE,
    field: 'borrow_date',
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date',
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    field: 'return_date'
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    defaultValue: 'borrowed'
  },
  fine: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Transaction',
  tableName: 'transactions',
  timestamps: true,
  underscored: true
});

module.exports = Transaction;