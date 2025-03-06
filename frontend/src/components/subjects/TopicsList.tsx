import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ChevronRight, CheckCircle, Clock } from 'lucide-react';

interface Section {
  id: number;
  name: string;
  questionCount: number;
  topic_id: number;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  questionCount: number;
  sections?: Section[];
}

interface Stats {
  skills: number;
  games: number;
  videos: number;
}

const TopicsList = ({ logout }: { logout: () => void }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subject, yearId } = useParams();
  const { isAuthenticated } = useAuth();

  // Calculate stats from the actual data
  const stats: Stats = {
    skills: topics.length, // Total number of topics
    videos: topics.reduce((total, topic) => total + (topic.sections?.length || 0), 0), // Total sections
    games: topics.reduce((total, topic) => total + (topic.questionCount || 0), 0), // Total questions
  };

  useEffect(() => {
    const fetchTopicsAndSections = async () => {
      try {
        setLoading(true);
        // Map 'maths' to 'Mathematics' for the API call
        const apiSubject = subject?.toLowerCase() === 'maths' ? 'Mathematics' : subject;
        // Fetch topics
        const topicsResponse = await publicApi.get(`/topics/${apiSubject}/year/${yearId}`);
        const topicsData = topicsResponse.data.categories[0]?.topics || [];
        
        // Fetch sections for each topic
        const topicsWithSections = await Promise.all(
          topicsData.map(async (topic: Topic) => {
            const sectionsResponse = await publicApi.get(`/sections/topic/${topic.id}`);
            return {
              ...topic,
              sections: sectionsResponse.data
            };
          })
        );
        
        setTopics(topicsWithSections);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (subject && yearId) {
      fetchTopicsAndSections();
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
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl text-emerald-600">{stats.skills}</span>
            </div>
            <span className="text-gray-600">topics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl text-blue-600">{stats.videos}</span>
            </div>
            <span className="text-gray-600">sections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl text-purple-600">{stats.games}</span>
            </div>
            <span className="text-gray-600">questions</span>
          </div>
        </div>

        {/* Topics and Sections */}
        <div className="space-y-8">
          {topics.length === 0 ? (
            <div className="text-gray-600">No topics available for this year.</div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                {/* Topic Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        {topic.name}
                      </h3>
                      <p className="text-gray-600">{topic.description || 'Master these concepts through practice'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        {topic.sections?.length || 0} sections
                      </span>
                      <span className="text-gray-500">
                        {topic.questionCount || 0} questions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sections List */}
                <div className="divide-y divide-gray-100">
                  {topic.sections?.map((section) => (
                    <Link
                      key={section.id}
                      to={`/quiz/${topic.id}/section/${section.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                            {section.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {section.questionCount} questions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsList;