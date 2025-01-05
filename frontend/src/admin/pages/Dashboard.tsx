import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  BarChart2, 
  Calendar, 
  TrendingUp,
  Calculator,
  BookOpen,
  Beaker,
  Home,
  List,
  Bell,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/admin/user-count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user count');
        const data = await response.json();
        setTotalUsers(data.count);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Registered Users"
              value={totalUsers.toString()}
              icon={<Users className="w-8 h-8" />}
              trend="+12.5%"
            />
            <StatCard
              title="Total Subscribed Users"
              value="1,433"
              icon={<UserCheck className="w-8 h-8" />}
              trend="+8.2%"
            />
            <StatCard
              title="Total Active Users"
              value="1,892"
              icon={<UserPlus className="w-8 h-8" />}
              trend="+15.3%"
            />
          </div>

          {/* Visitor Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Visitors this Week"
              value="12,847"
              icon={<BarChart2 className="w-8 h-8" />}
              trend="+22.4%"
            />
            <StatCard
              title="Total Visitors this Month"
              value="48,233"
              icon={<Calendar className="w-8 h-8" />}
              trend="+18.7%"
            />
            <StatCard
              title="Total Visitors YTD"
              value="247,891"
              icon={<TrendingUp className="w-8 h-8" />}
              trend="+25.1%"
            />
          </div>

          {/* Question Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Math Questions"
              value="3,245"
              icon={<Calculator className="w-8 h-8" />}
              trend="+5.8%"
            />
            <StatCard
              title="Total English Questions"
              value="2,879"
              icon={<BookOpen className="w-8 h-8" />}
              trend="+7.2%"
            />
            <StatCard
              title="Total Science Questions"
              value="2,567"
              icon={<Beaker className="w-8 h-8" />}
              trend="+9.4%"
            />
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="p-8 pt-0">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Recently Registered Users</h3>
            </div>
            <RecentUsersTable />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-600">{title}</h3>
        <div className="bg-indigo-50 p-3 rounded-full">
          <div className="text-indigo-600">
            {icon}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
          <span className="text-green-500 text-sm font-medium">{trend}</span>
        </div>
      </div>
    </div>
  );
};

// New component for the Recent Users Table
interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  location: string;
  isSubscribed: boolean;
}

const RecentUsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No admin token found');
        }

        console.log('Fetching users with token:', token); // Debug log

        const response = await fetch('http://localhost:5000/api/admin/recent-users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }

        const data = await response.json();
        console.log('Received data:', data); // Debug log
        setUsers(data.users);
      } catch (err: any) {
        console.error('Error fetching users:', err); // Debug log
        setError(err.message || 'Failed to load recent users');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registration Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.isSubscribed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isSubscribed ? 'Subscribed' : 'Free'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;