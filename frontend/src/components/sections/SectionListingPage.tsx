import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import api from '../../services/api';

interface TopicDetails {
  id: number;
  name: string;
  description: string;
  stats: {
    skills: number;
    games: number;
  };
}

interface Section {
  id: number;
  name: string;
  questionCount: number;
  topic_id: number;
}

const SectionListingPage = ({ logout }: { logout: () => void }) => {
  const { topicId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) return;
      
      setLoading(true);
      try {
        const [details, sectionsList] = await Promise.all([
          api.getTopicDetails(topicId),
          api.getSectionsByTopic(topicId)
        ]);
        
        setTopicDetails(details);
        setSections(sectionsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#ff8c1a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!topicDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No topic found</div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-7xl mx-auto p-8">
        {/* Topic Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{topicDetails.name}</h1>
          <p className="text-gray-600 mb-4">
            Ebedmas offers more than 100 Year 1 English skills and games to explore and learn! 
            Not sure where to start? Go to your personalised Recommendations wall to find a skill that looks interesting.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl text-purple-600">{sections.length}</span>
            </div>
            <span className="text-gray-600">skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl text-blue-600">{topicDetails.stats.games}</span>
            </div>
            <span className="text-gray-600">games</span>
          </div>
        </div>

        {/* Sections List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{topicDetails.name}</h2>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Link
                key={section.id}
                to={`/quiz/${topicId}/section/${section.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{index + 1}</span>
                      <h3 className="text-xl text-blue-600">{section.name}</h3>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    {section.questionCount} questions
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionListingPage;
