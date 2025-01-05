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
        console.log('Fetching topics for:', subject, year);
        
        const response = await publicApi.get(`/topics/${subject}/year/${year}`);
        console.log('Topics response:', response.data);
        
        setTopicCategories(response.data.categories);
        setTotalTopics(response.data.stats.totalTopics);
        setTotalQuestions(response.data.stats.totalQuestions);
      } catch (error) {
        console.error('Error fetching topics:', error);
        if (axios.isAxiosError(error)) {
          const serverError = error.response?.data;
          console.error('Server error details:', serverError);
        }
        setError(error instanceof Error ? error.message : 'Failed to fetch topics');
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="p-8">
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
              <span className="ml-2 text-gray-600">games</span>
            </div>
          </div>
        </div>

        {topicCategories.map((category) => (
          <div key={category.name} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.id)}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
                >
                  <h3 className="font-medium text-lg mb-2">{topic.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{topic.description}</p>
                  <div className="text-blue-600 text-sm">
                    {topic.questionCount} questions
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicListingPage; 