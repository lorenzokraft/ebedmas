import React from 'react';
import { Link } from 'react-router-dom';

interface YearContent {
  title: string;
  topics: string[];
  skillCount: number;
}

interface SubjectLayoutProps {
  subject: string;
  years: YearContent[];
  colorClass: string;
  numberClass: string;
}

const SubjectLayout: React.FC<SubjectLayoutProps> = ({ subject, years, colorClass, numberClass }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{subject}</h1>
      <div className="space-y-6">
        {years.map((year, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
              {/* Year Number */}
              <div className={`${numberClass} w-24 flex items-center justify-center text-white text-5xl font-bold`}>
                {index + 1}
              </div>
              
              {/* Year Content */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Year {index + 1}</h2>
                    <p className="text-gray-600">
                      <span className="font-medium">Includes:</span>{' '}
                      {year.topics.join(' | ')}
                    </p>
                  </div>
                  <Link
                    to={`/user/learning/${subject.toLowerCase()}/year-${index + 1}`}
                    className={`${colorClass} text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity`}
                  >
                    See all {year.skillCount} skills →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectLayout; 