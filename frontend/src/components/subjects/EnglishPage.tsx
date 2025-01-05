import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';

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

  useEffect(() => {
    const fetchTopicCounts = async () => {
      try {
        const response = await publicApi.get('/grades/public');
        const grades = response.data;

        // Create year sections based on grades that have English topics
        const activeYears = grades
          .filter((grade: any) => {
            const englishSubject = grade.subjects.find((s: any) => 
              s.name.toLowerCase() === 'english' || 
              s.name.toLowerCase() === 'english language' ||
              s.name.toLowerCase().includes('english')
            );
            return englishSubject && englishSubject.topicCount > 0;
          })
          .map((grade: any) => {
            const year = parseInt(grade.name.replace(/\D/g, ''));
            const englishSubject = grade.subjects.find((s: any) => 
              s.name.toLowerCase() === 'english' || 
              s.name.toLowerCase() === 'english language' ||
              s.name.toLowerCase().includes('english')
            );

            return {
              year,
              title: `Year ${year}`,
              includes: yearContent[year] || ['Content coming soon...'],
              topicCount: englishSubject?.topicCount || 0
            };
          })
          .sort((a, b) => a.year - b.year); // Sort by year

        setYearSections(activeYears);
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
                  onClick={() => navigate(`/topics?subject=english&year=${section.year}`)}
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