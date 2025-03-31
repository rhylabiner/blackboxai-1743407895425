const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Book extends Model {}

Book.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    field: 'publication_year',
    validate: {
      isInt: true
    }
  },
  publisher: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING,
    field: 'cover_image'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  available: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  location: {
    type: DataTypes.STRING
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
  modelName: 'Book',
  tableName: 'books',
  timestamps: true,
  underscored: true
});

module.exports = Book;