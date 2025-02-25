import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardNav from './DashboardNav';
import PracticeChart from './PracticeChart';
import { Link, useNavigate } from 'react-router-dom';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UserDashboardProps {
  logout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ logout }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')?.trim();
        
        if (!token) {
          console.error('No token found in storage');
          navigate('/login');
          return;
        }

        console.log('Making API request with token:', token.substring(0, 10) + '...');
        
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          setUserData(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', {
          status: error.response?.status,
          message: error.response?.data?.message
        });
        
        if (error.response?.status === 403) {
          console.log('Token invalid or expired, redirecting to login');
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const renderSubjectSection = (subject: string) => {
    const subjectData = subjects.find(s => s.name.toLowerCase() === subject.toLowerCase());
    if (!subjectData) return null;

    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">{subject}</h1>
        {subjectData.years.map((year) => (
          <div key={year.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Year {year.name}</h2>
              <Link
                to={`/user/learning/${subject.toLowerCase()}/year/${year.id}/topics`}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                See all {year.topicCount} Topics
                <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">Includes:</span>{' '}
              {year.topics.length > 0 
                ? year.topics.map(topic => topic.name).join(' | ')
                : 'Content coming soon...'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav logout={logout} />
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Hello {userData?.username} 👋
          </h2>
          <p className="text-cyan-600 mt-2 text-lg">Let's learn something new today!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Score Card */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800">Your Total Score</h3>
              <div className="bg-cyan-50 p-3 rounded-full">
                <div className="w-10 h-10 flex items-center justify-center text-2xl">
                  💯
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-3xl font-bold text-cyan-700">2,040</h4>
              <div className="flex items-center">
                <p className="text-gray-600">Overall Score in all Subjects</p>
                <span className="ml-2 text-green-500 flex items-center text-sm">
                  <span className="mr-1">↑</span> 12%
                </span>
              </div>
            </div>
          </div>

          {/* Questions Answered Card */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800">Total Questions</h3>
              <div className="bg-cyan-50 p-3 rounded-full">
                <div className="w-10 h-10 flex items-center justify-center text-2xl">
                  📝
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-3xl font-bold text-cyan-700">826</h4>
              <div className="flex items-center">
                <p className="text-gray-600">Questions Answered</p>
                <span className="ml-2 text-green-500 flex items-center text-sm">
                  <span className="mr-1">↑</span> 8%
                </span>
              </div>
            </div>
          </div>

          {/* Time Spent Card */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800">Time Spent</h3>
              <div className="bg-cyan-50 p-3 rounded-full">
                <div className="w-10 h-10 flex items-center justify-center text-2xl">
                  ⏱️
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-3xl font-bold text-cyan-700">3h 14m</h4>
              <div className="flex items-center">
                <p className="text-gray-600">This Week's Learning Time</p>
                <span className="ml-2 text-green-500 flex items-center text-sm">
                  <span className="mr-1">↑</span> 15%
                </span>
              </div>
            </div>
          </div>

          {/* Practice Chart */}
          <div className="col-span-full">
            <PracticeChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;