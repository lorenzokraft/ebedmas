import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, logout }) => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <Link to="/" className="flex items-center py-4">
              <span className="font-semibold text-gray-500 text-lg">Ebedmas</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                Home
              </Link>
              <Link to="/about" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                About
              </Link>
              <Link to="/quiz" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                Quiz
              </Link>
              <Link to="/subscription" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                Subscribe
              </Link>
              <Link to="/contact" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/user/dashboard" className="py-2 px-4 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">
                  Dashboard
                </Link>
                <button 
                  onClick={logout} 
                  className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                  Login
                </Link>
                <Link to="/register" className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;