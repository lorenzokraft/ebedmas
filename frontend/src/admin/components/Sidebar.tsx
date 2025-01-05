import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/admin/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Dashboard
            </Link>
          </li>
          
          {/* Manage Users Dropdown */}
          <li>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded flex justify-between items-center"
            >
              Manage Users
              <span className={`transform transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showUserMenu && (
              <ul className="ml-4 mt-2 space-y-2">
                <li>
                  <Link to="/admin/users/manage-admins" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Manage Admins
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users/manage-users" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Manage Users
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/admin/questions" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Manage Questions
            </Link>
          </li>
          <li>
            <Link to="/admin/grades" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Manage Grades
            </Link>
          </li>
          <li>
            <Link to="/admin/subjects" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Manage Subjects
            </Link>
          </li>
          <li>
            <Link to="/admin/topics" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Manage Topics
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 hover:bg-red-700 rounded text-red-400 hover:text-white"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 