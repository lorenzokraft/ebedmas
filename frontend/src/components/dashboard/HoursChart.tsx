import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const HoursChart: React.FC = () => {
  const data = [
    { month: 'Jan', study: 40, online: 24 },
    { month: 'Feb', study: 30, online: 13 },
    { month: 'Mar', study: 50, online: 35 },
    { month: 'Apr', study: 45, online: 25 },
    { month: 'May', study: 20, online: 15 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="study" fill="#10B981" />
        <Bar dataKey="online" fill="#6EE7B7" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HoursChart; 