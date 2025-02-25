import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Candidate } from '../../types';
import { Empty } from 'antd';

interface Props {
  candidates: Candidate[];
  dateRange: [Date, Date];
}

export const TrendChart: React.FC<Props> = ({ candidates, dateRange }) => {
  const getDaysArray = (start: Date, end: Date) => {
    const arr = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  };

  const days = getDaysArray(dateRange[0], dateRange[1]);
  const chartData = days.map(date => {
    const dayStr = date.toISOString().split('T')[0];
    return {
      date: dayStr,
      応募数: candidates.filter(c => 
        c.appliedDate.split('T')[0] === dayStr
      ).length || 0,
      内定数: candidates.filter(c => 
        c.status === 'offered' &&
        c.interviews.some(i => i.date.split('T')[0] === dayStr)
      ).length || 0
    };
  });

  if (candidates.length === 0) {
    return <Empty description="データがありません" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString('ja-JP')}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => new Date(date).toLocaleDateString('ja-JP')}
          formatter={(value: number, name: string) => [`${value}人`, name]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="応募数"
          stroke="#1890ff"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="内定数"
          stroke="#52c41a"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};