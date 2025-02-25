import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Typography, DatePicker, Space, Select } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Candidate, JobPosting } from '../../types';
import { RecruitmentFunnel } from '../reporting/RecruitmentFunnel';
import { TrendChart } from '../reporting/TrendChart';
import { SourceDistribution } from '../reporting/SourceDistribution';
import { TimeToHire } from '../reporting/TimeToHire';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Props {
  candidates: Candidate[];
  jobPostings: JobPosting[];
}

export const Dashboard: React.FC<Props> = ({ candidates, jobPostings }) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);
  const [selectedJob, setSelectedJob] = useState<string>('all');

  const filteredCandidates = candidates.filter(candidate => {
    const appliedDate = new Date(candidate.appliedDate);
    return (
      appliedDate >= dateRange[0] &&
      appliedDate <= dateRange[1] &&
      (selectedJob === 'all' || candidate.jobPostingId === selectedJob)
    );
  });

  const stats = {
    totalCandidates: filteredCandidates.length,
    activeJobs: jobPostings.filter(job => job.status === 'open').length,
    hired: filteredCandidates.filter(c => c.status === 'offered').length,
    inProgress: filteredCandidates.filter(c => 
      ['reviewing', 'interviewed'].includes(c.status)
    ).length,
    conversionRate: filteredCandidates.length > 0
      ? ((filteredCandidates.filter(c => c.status === 'offered').length / filteredCandidates.length) * 100).toFixed(1)
      : 0
  };

  const timeToHire = filteredCandidates
    .filter(c => c.status === 'offered')
    .map(c => {
      const start = new Date(c.appliedDate);
      const interviews = c.interviews.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const end = interviews.length > 0 ? new Date(interviews[0].date) : start;
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });

  const avgTimeToHire = timeToHire.length > 0
    ? Math.round(timeToHire.reduce((a, b) => a + b, 0) / timeToHire.length)
    : 0;

  return (
    <div className="space-y-6">
      <Space className="w-full justify-between">
        <Title level={4}>採用ダッシュボード</Title>
        <Space>
          <Select
            value={selectedJob}
            onChange={setSelectedJob}
            style={{ width: 200 }}
          >
            <Select.Option value="all">全ての求人</Select.Option>
            {jobPostings.map(job => (
              <Select.Option key={job.id} value={job.id}>{job.title}</Select.Option>
            ))}
          </Select>
          <RangePicker
            value={[dateRange[0], dateRange[1]].map(date => dayjs(date))}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0].toDate(), dates[1].toDate()]);
              }
            }}
          />
        </Space>
      </Space>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="総応募者数"
              value={stats.totalCandidates}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="公開中の求人"
              value={stats.activeJobs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="採用決定"
              value={stats.hired}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="選考中"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="採用率"
              value={stats.conversionRate}
              prefix={<RiseOutlined />}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均採用日数"
              value={avgTimeToHire}
              prefix={<BarChartOutlined />}
              suffix="日"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="採用ファネル">
            <RecruitmentFunnel candidates={filteredCandidates} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="応募者トレンド">
            <TrendChart
              candidates={filteredCandidates}
              dateRange={dateRange}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="応募経路分布">
            <SourceDistribution candidates={filteredCandidates} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="採用までの日数">
            <TimeToHire candidates={filteredCandidates} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};