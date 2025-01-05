import React from 'react';
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

const generateMockData = (): PracticeData[] => {
  const today = startOfToday();
  const dates = eachDayOfInterval({
    start: subDays(today, 30),
    end: today
  });

  const subjects = ['Mathematics', 'English', 'Science'];

  return dates.map(date => {
    // Generate 1-3 subject practices for each day
    const numPractices = Math.floor(Math.random() * 3) + 1;
    const practices = subjects
      .slice(0, numPractices)
      .map(subject => ({
        subject,
        questions: Math.floor(Math.random() * 20),
        timeSpent: Math.floor(Math.random() * 120)
      }));

    return {
      date: format(date, 'dd MMM'),
      totalQuestions: practices.reduce((sum, p) => sum + p.questions, 0),
      practices
    };
  });
};

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

const PracticeChart = () => {
  const data = generateMockData();

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
              tick={{ fontSize: 12 }}
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
            <YAxis>
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PracticeChart; 