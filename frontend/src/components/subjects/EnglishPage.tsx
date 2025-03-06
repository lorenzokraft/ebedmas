import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';
import { useAuth } from '../../context/AuthContext';

interface YearSection {
  year: number;
  title: string;
  includes: string[];
  topicCount: number;
}

// Define the content for each year
const yearContent: { [key: number]: string[] } = {
  1: ['Reading comprehension', 'Basic grammar', 'Phonics and spelling', 'Writing simple sentences'],
  2: ['Story writing', 'Punctuation', 'Vocabulary building', 'Reading fluency'],
  3: ['Advanced grammar', 'Creative writing', 'Reading strategies', 'Speaking and listening'],
  4: ['Complex sentences', 'Poetry', 'Non-fiction writing', 'Comprehension skills'],
  5: ['Advanced writing techniques', 'Literary analysis', 'Research skills', 'Public speaking']
};

const EnglishPage = ({ logout }: { logout: () => void }) => {
  const navigate = useNavigate();
  const [yearSections, setYearSections] = useState<YearSection[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTopicCounts = async () => {
      try {
        // Get the topics count per year
        const topicsResponse = await publicApi.get('/topics/count/english');
        const topicCounts = topicsResponse.data;

        // Create year sections from topic counts
        const sections = Object.entries(topicCounts).map(([year, count]) => ({
          year: parseInt(year),
          title: `Year ${year}`,
          includes: yearContent[parseInt(year)] || ['Content coming soon...'],
          topicCount: count as number
        })).filter(section => section.topicCount > 0)
        .sort((a, b) => a.year - b.year);

        setYearSections(sections);
      } catch (error) {
        console.error('Error fetching topic counts:', error);
      }
    };

    fetchTopicCounts();
  }, []);

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">English</h1>
        <div className="space-y-6">
          {yearSections.map((section) => (
            <div key={section.year} className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <div className="text-gray-600">
                    <span className="font-semibold">Includes:</span>{' '}
                    {section.includes.join(' | ')}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/user/learning/english/year/${section.year}/topics`)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-colors flex items-center space-x-2"
                >
                  <span>See all {section.topicCount} Topics</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishPage; 