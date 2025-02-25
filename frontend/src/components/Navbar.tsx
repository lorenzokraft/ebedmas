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
              
                <Link
                  to="/login"
                  className="inline-block rounded-lg px-4 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/subscription"
                  className="inline-block px-4 py-2 text-sm font-semibold leading-6 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-sm transition duration-300"
                >
                  Start 7-Day Free Trial
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