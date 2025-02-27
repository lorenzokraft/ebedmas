import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  BarChart2, 
  Award, 
  GraduationCap, 
  LogOut,
  Calculator,
  Globe2,
  Beaker,
  Clock,
  Target,
  Brain,
  Lightbulb,
  User,
  Settings,
  Users
} from 'lucide-react';
import axios from 'axios';

interface Learner {
  id: number;
  name: string;
  grade: string;
}

interface SubMenuItem {
  name: string;
  path: string;
  isNew?: boolean;
  icon: React.ReactNode;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
  path?: string;
}

interface DashboardNavProps {
  logout: () => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ logout }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [learners, setLearners] = useState<Learner[]>([]);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/learners', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLearners(response.data);
      } catch (error) {
        console.error('Error fetching learners:', error);
      }
    };

    fetchLearners();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <BarChart2 className="w-5 h-5" />,
      path: '/user/dashboard'
    },
    {
      name: "My Learning",
      icon: <BookOpen className="w-5 h-5" />,
      subItems: [
        { name: "Maths", path: "/user/learning/maths", icon: <Calculator className="w-4 h-4" /> },
        { name: "English", path: "/user/learning/english", icon: <Globe2 className="w-4 h-4" /> },
        { name: "Science", path: "/user/learning/science", isNew: true, icon: <Beaker className="w-4 h-4" /> }
      ]
    },
    {
      name: "Analytics",
      icon: <BarChart2 className="w-5 h-5" />,
      subItems: [
        { name: "Progress", path: "/user/analytics/progress", icon: <Target className="w-4 h-4" /> },
        { name: "Usage", path: "/user/analytics/usage", icon: <Clock className="w-4 h-4" /> },
        { name: "Scores", path: "/user/analytics/scores", icon: <Brain className="w-4 h-4" /> },
        { name: "Questions", path: "/user/analytics/questions", icon: <Lightbulb className="w-4 h-4" /> }
      ]
    },
    {
      name: "Courses",
      icon: <GraduationCap className="w-5 h-5" />,
      subItems: [
        { name: "Maths", path: "/user/courses/maths", icon: <Calculator className="w-4 h-4" /> },
        { name: "English", path: "/user/courses/english", icon: <Globe2 className="w-4 h-4" /> },
        { name: "Science", path: "/user/courses/science", isNew: true, icon: <Beaker className="w-4 h-4" /> }
      ]
    },
   
    {
      name: "My Awards",
      icon: <Award className="w-5 h-5" />,
      path: "/user/awards"
    }
  ];

  const toggleMenu = (menuName: string) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  };

  const isMenuOpen = (menuName: string) => activeMenu === menuName;
  const isActive = (path: string) => location.pathname === path;

  // Get active menu's subitems for secondary nav
  const activeSubItems = menuItems.find(item => item.name === activeMenu)?.subItems;

  return (
    <div className="bg-white shadow-lg">
      {/* Main Navigation */}
      <nav className="bg-green-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/user/dashboard" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-white">Ebedmas</h1>
              </Link>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={`inline-flex items-center px-4 py-2 text-base font-medium text-white hover:bg-green-600 rounded-md ${
                            isMenuOpen(item.name) ? 'bg-green-600' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {item.icon}
                            <span>{item.name}</span>
                            {isMenuOpen(item.name) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={item.path!}
                        className={`inline-flex items-center px-4 py-2 text-base font-medium text-white hover:bg-green-600 rounded-md ${
                          isActive(item.path!) ? 'bg-green-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="inline-flex items-center px-4 py-2 text-base font-medium text-white hover:bg-green-600 rounded-md transition-colors duration-200"
                >
                  <User className="w-5 h-5 mr-2" />
                  <span>Account</span>
                  {isUserMenuOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Learners</p>
                      {learners.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {learners.map((learner) => (
                            <div key={learner.id} className="flex items-center text-sm text-gray-700">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {learner.name} - Grade {learner.grade}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">No learners added yet</p>
                      )}
                    </div>
                    
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </div>
                    </Link>
                    
                    <Link
                      to="/user/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - Only shown when a menu with subitems is active */}
      {activeSubItems && (
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center space-x-12 py-4">
              {activeSubItems.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium relative group ${
                    isActive(subItem.path) ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {subItem.icon}
                  <span>{subItem.name}</span>
                  {subItem.isNew && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New!
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform origin-left transition-transform duration-200 ${
                      isActive(subItem.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNav; 