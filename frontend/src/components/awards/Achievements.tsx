import React from 'react';
import DashboardNav from '../DashboardNav';
import { Award, Star, Trophy, Target } from 'lucide-react';

interface AchievementsProps {
  logout: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ logout }) => {
  const achievements = [
    {
      title: 'Math Master',
      description: 'Complete 100 math problems with 90% accuracy',
      progress: 75,
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: 'Reading Champion',
      description: 'Read and complete 50 comprehension exercises',
      progress: 60,
      icon: <Star className="w-8 h-8 text-purple-500" />,
    },
    {
      title: 'Science Explorer',
      description: 'Complete all science topics in your grade',
      progress: 40,
      icon: <Target className="w-8 h-8 text-blue-500" />,
    },
  ];

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <Award className="w-8 h-8 text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold">My Achievements</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start mb-4">
                {achievement.icon}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">{achievement.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">More Achievements Coming Soon!</h2>
          <p className="text-gray-600">
            Keep learning and practicing to unlock new achievements and rewards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
