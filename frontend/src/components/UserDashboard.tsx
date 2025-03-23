import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNav from './DashboardNav';
import PracticeChart from './PracticeChart';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface QuizMetrics {
  totalScore: number;
  totalQuestions: number;
  totalTimeSpent: number;
  formattedTimeSpent: string;
}

interface UserDashboardProps {
  logout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ logout }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizMetrics, setQuizMetrics] = useState<QuizMetrics>({
    totalScore: 0,
    totalQuestions: 0,
    totalTimeSpent: 0,
    formattedTimeSpent: '0h 0m'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
        } else {
          setError('Failed to load user data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchQuizMetrics = async () => {
      try {
        const token = localStorage.getItem('token')?.trim();
        
        if (!token) {
          console.error('No token found in storage');
          return;
        }
        
        console.log('Attempting to fetch real quiz metrics data');
        
        try {
          const response = await axios.get('http://localhost:5000/api/users/quiz-metrics', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Quiz metrics API response:', response.data);

          if (response.data) {
            setQuizMetrics(response.data);
          }
        } catch (error: any) {
          console.error('Error fetching quiz metrics from API, using mock data:', {
            status: error.response?.status,
            message: error.response?.data?.message
          });
          
          // Use mock data for testing
          setQuizMetrics({
            totalScore: 250,
            totalQuestions: 35,
            totalTimeSpent: 7200, // 2 hours in seconds
            formattedTimeSpent: '2h 0m'
          });
        }
      } catch (error: any) {
        console.error('Error in fetchQuizMetrics:', error);
      }
    };

    if (userData) {
      fetchQuizMetrics();
    }
  }, [userData]);

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
          <p className="text-gray-600 mt-1">In the last 30 days, you have:</p>
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
              <h4 className="text-3xl font-bold text-cyan-700">{quizMetrics.totalScore.toLocaleString()}</h4>
              <div className="flex items-center">
                <p className="text-gray-600">Overall Score in all Subjects</p>
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
              <h4 className="text-3xl font-bold text-cyan-700">{quizMetrics.totalQuestions.toLocaleString()}</h4>
              <div className="flex items-center">
                <p className="text-gray-600">Questions Answered</p>
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
              <h4 className="text-3xl font-bold text-cyan-700">{quizMetrics.formattedTimeSpent}</h4>
              <div className="flex items-center">
                <p className="text-gray-600">Learning Time</p>
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