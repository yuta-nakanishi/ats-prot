import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Candidate } from '../../types';
import { Empty } from 'antd';

interface Props {
  candidates: Candidate[];
}

export const TimeToHire: React.FC<Props> = ({ candidates }) => {
  const hiredCandidates = candidates.filter(c => c.status === 'offered');
  const timeToHire = hiredCandidates.map(c => {
    const start = new Date(c.appliedDate);
    const interviews = c.interviews.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const end = interviews.length > 0 ? new Date(interviews[0].date) : start;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  if (timeToHire.length === 0) {
    return <Empty description="データがありません" />;
  }

  const ranges = [
    { range: '1週間以内', min: 0, max: 7 },
    { range: '2週間以内', min: 8, max: 14 },
    { range: '3週間以内', min: 15, max: 21 },
    { range: '4週間以内', min: 22, max: 28 },
    { range: '1ヶ月以上', min: 29, max: Infinity }
  ];

  const data = ranges.map(({ range, min, max }) => ({
    range,
    value: timeToHire.filter(days => days >= min && days <= max).length
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value}人`, '候補者数']}
        />
        <Bar
          dataKey="value"
          fill="#1890ff"
          label={{ position: 'top', formatter: (value: number) => `${value}人` }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};