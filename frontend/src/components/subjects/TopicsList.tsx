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

interface Stats {
  skills: number;
  games: number;
}

const TopicsList = ({ logout }: { logout: () => void }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subject, yearId } = useParams();

  // Stats for the subject
  const stats: Stats = {
    skills: topics.length,
    games: 4
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        console.log('Fetching topics with params:', { subject, yearId });
        
        const response = await publicApi.get(`/topics/${subject}/year/${yearId}`);
        console.log('API Response:', response.data);
        
        if (!response.data.categories?.[0]?.topics) {
          console.error('Unexpected response format:', response.data);
        }
        
        setTopics(response.data.categories[0]?.topics || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
        console.error('Error details:', error.response?.data);
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    if (subject && yearId) {
      fetchTopics();
    }
  }, [subject, yearId]);

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
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          Year {yearId} {subject.charAt(0).toUpperCase() + subject.slice(1)}
        </h1>

        {/* Stats Display */}
        <div className="flex gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl text-purple-600">{stats.skills}</span>
            </div>
            <span className="text-gray-600">skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl text-blue-600">{stats.games}</span>
            </div>
            <span className="text-gray-600">games</span>
          </div>
        </div>

        {/* Topics Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{subject.charAt(0).toUpperCase() + subject.slice(1)} Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.length === 0 ? (
              <div className="text-gray-600">No topics available for this year.</div>
            ) : (
              topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/topic/${topic.id}/sections`}
                  className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <h3 className="text-xl font-bold mb-3">{topic.name}</h3>
                  <p className="text-gray-600 mb-4">
                    Practice questions and improve your skills
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-blue-600">
                      {topic.questionCount} questions
                    </div>
                    <div className="text-purple-600">
                      5 sections
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsList; 