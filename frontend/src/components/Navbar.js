import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Library System</Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </Link>
              <Link to="/books" className="hover:bg-blue-700 px-3 py-2 rounded">
                Books
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Admin
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">
                Login
              </Link>
              <Link to="/register" className="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;