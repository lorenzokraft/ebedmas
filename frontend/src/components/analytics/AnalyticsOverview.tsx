import React from 'react';
import DashboardNav from '../DashboardNav';
import { BarChart2, Target, TrendingUp } from 'lucide-react';

interface AnalyticsOverviewProps {
  logout: () => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ logout }) => {
  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overall Progress Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Overall Progress</h2>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-gray-600">Completion rate across all subjects</p>
          </div>

          {/* Recent Performance Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">Recent Performance</h2>
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
            <p className="text-gray-600">Average score in last 7 days</p>
          </div>

          {/* Time Spent Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart2 className="w-6 h-6 text-purple-500 mr-2" />
              <h2 className="text-xl font-semibold">Time Spent</h2>
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">12h</div>
            <p className="text-gray-600">Total learning time this week</p>
          </div>
        </div>

        {/* Placeholder for charts and detailed analytics */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
          <p className="text-gray-600">Coming soon: Detailed performance charts and statistics</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
