import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';
import axios from 'axios';

interface Topic {
  id: number;
  name: string;
  description: string;
  questionCount: number;
}

interface TopicCategory {
  name: string;
  topics: Topic[];
}

const TopicListingPage = ({ logout }: { logout: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [topicCategories, setTopicCategories] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Get subject and year from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const subject = searchParams.get('subject');
  const year = searchParams.get('year');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const normalizedSubject = subject?.toLowerCase().trim();
        console.log('Fetching topics with params:', { 
          subject: normalizedSubject, 
          year,
          url: `/topics/${normalizedSubject}/year/${year}`
        });
        
        const response = await publicApi.get(`/topics/${normalizedSubject}/year/${year}`);
        console.log('Raw API Response:', response);
        console.log('Topics data:', response.data);
        
        if (!response.data.categories) {
          console.error('Unexpected response format:', response.data);
          throw new Error('Invalid response format from server');
        }
        
        setTopicCategories(response.data.categories);
        setTotalTopics(response.data.stats.totalTopics);
        setTotalQuestions(response.data.stats.totalQuestions);
      } catch (error) {
        console.error('Error fetching topics:', error);
        if (axios.isAxiosError(error)) {
          console.error('API Error Response:', error.response?.data);
          console.error('API Error Status:', error.response?.status);
          setError(error.response?.data?.message || 'Failed to fetch topics');
        } else {
          console.error('Non-Axios error:', error);
          setError(error instanceof Error ? error.message : 'Failed to fetch topics');
        }
      } finally {
        setLoading(false);
      }
    };

    if (subject && year) {
      fetchTopics();
    }
  }, [subject, year]);

  const handleTopicClick = (topicId: number) => {
    navigate(`/quiz/topic/${topicId}`);
  };

  const getSubjectTitle = () => {
    switch (subject?.toLowerCase()) {
      case 'english':
        return 'English';
      case 'maths':
        return 'Mathematics';
      case 'science':
        return 'Science';
      default:
        return '';
    }
  };

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="flex min-h-screen bg-gray-100">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : error ? (
          <div>
            <div className="text-red-600">Error: {error}</div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Year {year} {getSubjectTitle()}</h1>
              <div className="mt-4 flex space-x-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">{totalTopics}</span>
                  </div>
                  <span className="ml-2 text-gray-600">skills</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl">{totalQuestions}</span>
                  </div>
                  <span className="ml-2 text-gray-600">questions</span>
                </div>
              </div>
            </div>

            {topicCategories.map((category, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                {category.topics.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                    No topics available for this year yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicClick(topic.id)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <h3 className="text-xl font-semibold mb-2">{topic.name}</h3>
                        <p className="text-gray-600 mb-4">{topic.description}</p>
                        <div className="text-sm text-gray-500">
                          {topic.questionCount} {topic.questionCount === 1 ? 'question' : 'questions'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicListingPage;