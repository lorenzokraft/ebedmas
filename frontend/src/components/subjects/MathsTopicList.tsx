import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';

interface Topic {
  id: number;
  name: string;
  description: string;
  questionCount: number;
}

interface Category {
  name: string;
  topics: Topic[];
}

interface TopicsData {
  categories: Category[];
  stats: {
    totalTopics: number;
    totalQuestions: number;
  };
}

const MathsTopicList = ({ logout }: { logout: () => void }) => {
  const [topicsData, setTopicsData] = useState<TopicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { year } = useParams();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await publicApi.get(`/topics/maths/year/${year}`);
        setTopicsData(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [year]);

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
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mathematics Topics</h1>
          <p className="text-gray-600 mt-2">
            Year {year} • {topicsData?.stats.totalTopics} Topics • {topicsData?.stats.totalQuestions} Questions
          </p>
        </div>

        {topicsData?.categories.map((category, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="grid gap-4">
              {category.topics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-2">{topic.name}</h3>
                      <p className="text-gray-600">{topic.description}</p>
                    </div>
                    <Link
                      to={`/quiz/${topic.id}`}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Start Quiz ({topic.questionCount} questions)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathsTopicList; 