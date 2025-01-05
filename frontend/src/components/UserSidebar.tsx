import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  BookOpen,
  Calculator,
  Beaker,
  LogOut
} from 'lucide-react';

interface UserSidebarProps {
  logout: () => void;
}

export default function UserSidebar({ logout }: UserSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: <Home className="w-5 h-5" />, 
      path: '/user/dashboard' 
    },
    { 
      name: 'English', 
      icon: <BookOpen className="w-5 h-5" />, 
      path: '/user/learning/english' 
    },
    { 
      name: 'Mathematics', 
      icon: <Calculator className="w-5 h-5" />, 
      path: '/user/learning/maths' 
    },
    { 
      name: 'Science', 
      icon: <Beaker className="w-5 h-5" />, 
      path: '/user/learning/science' 
    }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ebedmas</h1>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 p-4 w-64">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 