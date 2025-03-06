import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';
import { useAuth } from '../../context/AuthContext';

interface YearSection {
  year: number;
  title: string;
  includes: string[];
  topicCount: number;
}

const yearContent: { [key: number]: string[] } = {
  1: ['Numbers to 100', 'Addition and subtraction', 'Shapes and patterns', 'Basic measurements'],
  2: ['Multiplication tables', 'Division basics', 'Time and money', 'Data handling'],
  3: ['Numbers to 1000', 'Written calculations', 'Properties of shapes', 'Statistics'],
  4: ['Decimals', 'Area and perimeter', 'Position and direction', 'Problem solving'],
  5: ['Prime numbers', 'Fractions and decimals', 'Geometry', 'Converting units']
};

const MathsPage = ({ logout }: { logout: () => void }) => {
  const [yearSections, setYearSections] = useState<YearSection[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTopicCounts = async () => {
      try {
        // Get the topics count per year
        const topicsResponse = await publicApi.get('/topics/count/mathematics');
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
        <h1 className="text-3xl font-bold mb-8">Mathematics</h1>
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
                <Link
                  to={`/user/learning/mathematics/year/${section.year}/topics`}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                >
                  See all {section.topicCount} Topics
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MathsPage;