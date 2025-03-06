import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Users, Trophy, Sparkles, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import api from '../services/api';

interface YearStats {
  level: string;
  title: string;
  description: string;
  color: string;
  subjects: {
    name: string;
    display_name: string;
    skills: number;
  }[];
}

const HomePage = () => {
  const [yearGroups, setYearGroups] = useState<YearStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getSubjectStats();
        console.log('Received year groups:', stats);
        setYearGroups(stats);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load year statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Master Any Subject with Interactive Learning
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join millions of students worldwide using Ebedmas to excel in their studies
        </p>
        <a href="/quiz">
          <button className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Start Learning Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {
            icon: Star,
            title: 'Adaptive Learning',
            description: 'Personalized practice that adapts to your level',
          },
          {
            icon: Users,
            title: 'Expert Support',
            description: 'Get help from qualified teachers when needed',
          },
          {
            icon: Trophy,
            title: 'Track Progress',
            description: 'Monitor your improvement with detailed analytics',
          },
          {
            icon: Sparkles,
            title: 'Earn Rewards',
            description: 'Stay motivated with achievements and rewards',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <feature.icon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Start Learning</h2>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : !yearGroups || yearGroups.length === 0 ? (
          <div className="text-center text-gray-600">No year groups available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearGroups.map((year) => (
              <div 
                key={year.level}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-900 text-white"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    year.level === 'R' || year.level === '0' ? 'bg-teal-500' :
                    year.level === '1' ? 'bg-purple-500' :
                    year.level === '2' ? 'bg-green-500' :
                    year.level === '3' ? 'bg-blue-500' :
                    year.level === '4' ? 'bg-red-500' :
                    year.level === '5' ? 'bg-yellow-500' :
                    year.level === '6' ? 'bg-indigo-500' :
                    'bg-pink-500' // year 7 and above
                  }`}>
                    {year.level === '0' ? 'R' : year.level}
                  </span>
                  <h3 className="text-xl font-semibold">
                    {year.level === '0' ? 'Reception' : `Year ${year.level}`}
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  {year.description || 'Topics coming soon'}
                </p>
                <div className="space-y-2">
                  {year.subjects.map(subject => (
                    <div key={subject.name} className="flex justify-between items-center">
                      <span>{subject.display_name}</span>
                      <Link 
                        to={`/user/learning/${subject.name.toLowerCase() === 'mathematics' ? 'mathematics' : subject.name.toLowerCase()}/year/${year.level}/topics`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {subject.skills} skills →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What Our Students Say
        </h2>
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
            <Quote className="h-8 w-8 text-indigo-600 mb-4" />
            <p className="text-gray-600 mb-4">
              "Ebedmas has helped me improve my grades significantly. The interactive lessons and practice questions are fantastic!"
            </p>
            <p className="font-semibold">- Sarah, Year 6 Student</p>
          </div>
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
            <Quote className="h-8 w-8 text-indigo-600 mb-4" />
            <p className="text-gray-600 mb-4">
              "The personalized learning approach really works. I can focus on areas where I need more practice."
            </p>
            <p className="font-semibold">- James, Year 8 Student</p>
          </div>
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
            <Quote className="h-8 w-8 text-indigo-600 mb-4" />
            <p className="text-gray-600 mb-4">
              "As a parent, I love how I can track my child's progress. The results speak for themselves!"
            </p>
            <p className="font-semibold">- Emma, Parent</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6">
            Join over 1 million students who have mastered their subjects with Ebedmas
          </p>
          <a href="/subscription">
            <button className="px-8 py-3 bg-white text-indigo-600 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Try for Free
            </button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;