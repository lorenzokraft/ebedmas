import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, logout }) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const quizMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quizMenuRef.current && !quizMenuRef.current.contains(event.target as Node)) {
        setIsQuizOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              
              {/* Quiz Dropdown */}
              <div className="relative" ref={quizMenuRef}>
                <button 
                  onClick={() => setIsQuizOpen(!isQuizOpen)}
                  className="flex items-center py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
                >
                  Learning
                  {isQuizOpen ? (
                    <ChevronUp className="ml-1 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </button>

                {isQuizOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Link
                        to="/user/learning/mathematics"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsQuizOpen(false)}
                      >
                        Mathematics
                      </Link>
                      <Link
                        to="/user/learning/english"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsQuizOpen(false)}
                      >
                        English
                      </Link>
                      <Link
                        to="/user/learning/science"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsQuizOpen(false)}
                      >
                        Science
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
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