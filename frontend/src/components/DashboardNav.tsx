import React, { useState } from 'react';
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
  Lightbulb
} from 'lucide-react';

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
  const location = useLocation();

  const menuItems: MenuItem[] = [
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
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 text-base font-medium text-white hover:bg-green-600 rounded-md"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
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