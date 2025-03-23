import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label
} from 'recharts';
import { format, eachDayOfInterval, subDays, startOfToday } from 'date-fns';
import axios from 'axios';

interface SubjectPractice {
  subject: string;
  questions: number;
  timeSpent: number;
}

interface PracticeData {
  date: string;
  totalQuestions: number;
  practices: SubjectPractice[];
}

interface QuizProgress {
  topic_id: number;
  question_id: number;
  is_correct: boolean;
  time_spent: number;
  score: number;
  created_at: string;
  subject_name: string;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { practices } = payload[0].payload;
    const totalTime = practices.reduce((sum: number, p: SubjectPractice) => sum + p.timeSpent, 0);
    const totalQuestions = practices.reduce((sum: number, p: SubjectPractice) => sum + p.questions, 0);

    return (
      <div className="bg-white p-4 shadow-lg border rounded-lg min-w-[280px]">
        <div className="border-b border-gray-200 pb-2 mb-3">
          <p className="text-gray-600 font-medium text-lg">{label}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="bg-cyan-50 p-2 rounded">
              <p className="text-sm text-cyan-600 font-medium">
                Total Time
              </p>
              <p className="text-cyan-700 font-bold">
                {formatTime(totalTime)}
              </p>
            </div>
            <div className="bg-cyan-50 p-2 rounded">
              <p className="text-sm text-cyan-600 font-medium">
                Total Questions
              </p>
              <p className="text-cyan-700 font-bold">
                {totalQuestions}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {practices.map((practice: SubjectPractice, index: number) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-white border border-cyan-100"
            >
              <div>
                <p className="font-medium text-cyan-700">{practice.subject}</p>
                <p className="text-sm text-cyan-600">
                  {practice.questions} questions
                </p>
              </div>
              <div className="text-sm bg-cyan-100 px-3 py-1 rounded-full text-cyan-700 font-medium">
                {formatTime(practice.timeSpent)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PracticeChart: React.FC = () => {
  const [data, setData] = useState<PracticeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<QuizProgress[]>('http://localhost:5000/api/quizzes/quiz-progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Quiz progress data:', response.data); // Debug log

      // Group progress by date and subject
      const progressByDate = response.data.reduce((acc: { [key: string]: { [subject: string]: SubjectPractice } }, item) => {
        const date = format(new Date(item.created_at), 'dd MMM');
        
        if (!acc[date]) {
          acc[date] = {};
        }
        
        if (!acc[date][item.subject_name]) {
          acc[date][item.subject_name] = {
            subject: item.subject_name,
            questions: 0,
            timeSpent: 0
          };
        }
        
        acc[date][item.subject_name].questions += 1;
        acc[date][item.subject_name].timeSpent += Math.floor(item.time_spent / 60); // Convert seconds to minutes
        
        return acc;
      }, {});

      // Format data for chart
      const today = startOfToday();
      const dates = eachDayOfInterval({
        start: subDays(today, 30),
        end: today
      });

      const chartData = dates.map(date => {
        const dateKey = format(date, 'dd MMM');
        const practices = progressByDate[dateKey] 
          ? Object.values(progressByDate[dateKey])
          : [];

        return {
          date: dateKey,
          totalQuestions: practices.reduce((sum, p) => sum + p.questions, 0),
          practices
        };
      });

      console.log('Formatted chart data:', chartData); // Debug log
      setData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz progress:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizProgress();
  }, []);

  // Add event listener for quiz completion
  useEffect(() => {
    const handleQuizComplete = () => {
      console.log('Quiz completed, refreshing chart data');
      fetchQuizProgress();
    };

    window.addEventListener('quizComplete', handleQuizComplete);
    return () => window.removeEventListener('quizComplete', handleQuizComplete);
  }, []);

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-xl mb-6">Practice By Day</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 40,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12, fill: '#374151' }}
              stroke="#9CA3AF"
            >
              <Label
                value="Days Practice"
                position="bottom"
                offset={40}
                style={{ 
                  textAnchor: 'middle', 
                  fontSize: '14px', 
                  fill: '#374151',
                  fontWeight: 500 
                }}
              />
            </XAxis>
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#374151' }}
            >
              <Label
                value="Questions Answered"
                angle={-90}
                position="left"
                offset={-20}
                style={{ 
                  textAnchor: 'middle', 
                  fontSize: '14px', 
                  fill: '#374151',
                  fontWeight: 500 
                }}
              />
            </YAxis>
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 188, 212, 0.1)' }}
            />
            <Bar
              dataKey="totalQuestions"
              fill="#00bcd4"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PracticeChart;