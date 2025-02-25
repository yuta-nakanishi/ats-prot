import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Candidate } from '../../types';
import { Empty } from 'antd';

interface Props {
  candidates: Candidate[];
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export const SourceDistribution: React.FC<Props> = ({ candidates }) => {
  const sourceCount = candidates.reduce((acc, candidate) => {
    acc[candidate.source] = (acc[candidate.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sourceCount).map(([name, value]) => ({
    name,
    value
  }));

  if (data.length === 0) {
    return <Empty description="データがありません" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, value, percent }) => 
            `${name}: ${value}人 (${(percent * 100).toFixed(1)}%)`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}人`, '候補者数']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};