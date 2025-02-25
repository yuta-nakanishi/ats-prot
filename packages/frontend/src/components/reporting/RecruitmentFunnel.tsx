import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Candidate } from '../../types';
import { Empty } from 'antd';

interface Props {
  candidates: Candidate[];
}

export const RecruitmentFunnel: React.FC<Props> = ({ candidates }) => {
  // 各ステージの候補者数を計算
  const stages = [
    { 
      stage: '応募', 
      value: candidates.length || 0
    },
    { 
      stage: '書類選考', 
      value: candidates.filter(c => ['reviewing', 'interviewed', 'offered'].includes(c.status)).length || 0
    },
    { 
      stage: '面接', 
      value: candidates.filter(c => ['interviewed', 'offered'].includes(c.status)).length || 0
    },
    { 
      stage: '内定', 
      value: candidates.filter(c => c.status === 'offered').length || 0
    }
  ].filter(stage => stage.value > 0); // 0の値を除外

  // データがない場合はEmptyコンポーネントを表示
  if (stages.length === 0) {
    return <Empty description="データがありません" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={stages}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis dataKey="stage" type="category" />
        <Tooltip
          formatter={(value: number) => [`${value}人`, '候補者数']}
          labelStyle={{ color: '#666' }}
        />
        <Bar
          dataKey="value"
          fill="#1890ff"
          label={{ position: 'right', formatter: (value: number) => `${value}人` }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};