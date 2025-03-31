import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/books');
        setBooks(res.data);
        setFilteredBooks(res.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(res.data.map(book => book.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    let results = books;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      results = results.filter(book => book.category === categoryFilter);
    }
    
    setFilteredBooks(results);
  }, [searchTerm, categoryFilter, books]);

  const handleBorrow = async (bookId) => {
    try {
      await axios.post('/transactions/borrow', { 
        userId: user.id, 
        bookId 
      });
      // Refresh books list
      const res = await axios.get('/books');
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Library Books</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
                <p className="text-gray-600 mb-1">Author: {book.author}</p>
                <p className="text-gray-600 mb-1">Category: {book.category}</p>
                <p className="text-gray-600 mb-4">ISBN: {book.isbn}</p>
                
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.availability ? 'Available' : 'Checked Out'}
                  </span>
                  
                  {user && book.availability && (
                    <button
                      onClick={() => handleBorrow(book.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Borrow
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No books found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;