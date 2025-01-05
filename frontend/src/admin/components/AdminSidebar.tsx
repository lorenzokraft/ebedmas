import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home,
  Users,
  UserCheck,
  List,
  Settings,
  BookOpen,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronUp,
  Sliders,
  Lock,
  Layout
} from 'lucide-react';

const AdminSidebar = () => {
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSubscriptionMenu, setShowSubscriptionMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard' },
    {
      name: 'Users Management',
      icon: <Users className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { name: 'Manage Users', path: '/admin/users/manage-users' },
        { name: 'Manage Admins', path: '/admin/users/manage-admins' }
      ]
    },
    { name: 'Manage Questions', icon: <List className="w-5 h-5" />, path: '/admin/questions' },
    { name: 'Manage Grades', icon: <Settings className="w-5 h-5" />, path: '/admin/grades' },
    { name: 'Manage Subjects', icon: <BookOpen className="w-5 h-5" />, path: '/admin/subjects' },
    { name: 'Manage Topics', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/topics' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ebedmas</h1>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2 list-none">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => setIsUsersOpen(!isUsersOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors mb-2"
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {isUsersOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {isUsersOpen && (
                    <div className="ml-12 space-y-2">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="block px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors mb-2"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
          <li>
            <button 
              onClick={() => setShowSubscriptionMenu(!showSubscriptionMenu)}
              className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded flex justify-between items-center"
            >
              Manage Subscriptions
              <span className={`transform transition-transform ${showSubscriptionMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showSubscriptionMenu && (
              <ul className="ml-4 mt-2 space-y-2 list-none">
                <li>
                  <Link to="/admin/subscriptions/plans" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Plans
                  </Link>
                </li>
                <li>
                  <Link to="/admin/subscriptions/subscribers" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Subscribers
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded flex justify-between items-center"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5" />
                <span>Settings</span>
              </div>
              <span className={`transform transition-transform ${showSettingsMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showSettingsMenu && (
              <ul className="ml-4 mt-2 space-y-2 list-none">
                <li>
                  <Link 
                    to="/admin/settings/website" 
                    className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
                  >
                    <Layout className="w-4 h-4" />
                    <span>Website Settings</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/settings/account" 
                    className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 p-4 w-64">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 