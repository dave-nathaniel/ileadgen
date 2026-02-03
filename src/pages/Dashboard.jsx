import { Link } from 'react-router-dom';
import { PlusOutlined, AimOutlined } from '@ant-design/icons';
import { Card, Table, Typography, Button, Empty, Row, Col, Spin } from 'antd';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { LeadFunnelChart } from '../components/dashboard/LeadFunnelChart';
import { CampaignPerformanceChart } from '../components/dashboard/CampaignPerformanceChart';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { formatDate, formatNumber } from '../utils/formatters';

const { Title, Text } = Typography;

export function Dashboard() {
  const { campaigns, campaignsLoading, recentEvents, stats } = useApp();

  const columns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Link
            to={`/campaigns/${record.id}`}
            style={{ fontWeight: 500, color: '#1e293b' }}
          >
            {text}
          </Link>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
            {record.industry}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} type="campaign" />,
    },
    {
      title: 'Leads',
      dataIndex: 'total_leads',
      key: 'total_leads',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>
          {formatNumber(val || 0)}
        </span>
      ),
    },
    {
      title: 'Responded',
      dataIndex: 'leads_responded',
      key: 'leads_responded',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#059669' }}>
          {formatNumber(val || 0)}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span style={{ fontSize: 14, color: '#64748b' }}>
          {formatDate(date)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Dashboard</Title>
          <Text type="secondary">Overview of your lead generation activity</Text>
        </div>
        <Link to="/campaigns/new">
          <Button type="primary" icon={<PlusOutlined />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Charts Row */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <LeadFunnelChart stats={stats} />
        </Col>
        <Col xs={24} lg={12}>
          <CampaignPerformanceChart campaigns={campaigns} />
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={24}>
        {/* Recent Campaigns Table */}
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Recent Campaigns</span>}
            extra={
              <Link to="/campaigns" style={{ color: '#4f46e5', fontWeight: 500 }}>
                View all
              </Link>
            }
            bodyStyle={{ padding: 0 }}
          >
            {campaignsLoading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Spin size="large" />
              </div>
            ) : campaigns.length > 0 ? (
              <Table
                dataSource={campaigns.slice(0, 5)}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty
                image={<AimOutlined style={{ fontSize: 48, color: '#94a3b8' }} />}
                description={
                  <div>
                    <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: 4 }}>No campaigns yet</div>
                    <div style={{ color: '#64748b' }}>Create your first campaign to start generating leads.</div>
                  </div>
                }
                style={{ padding: '48px 0' }}
              >
                <Link to="/campaigns/new">
                  <Button type="primary" size="small" icon={<PlusOutlined />}>
                    Create Campaign
                  </Button>
                </Link>
              </Empty>
            )}
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={8}>
          <RecentActivityFeed events={recentEvents} maxItems={8} showViewAll={false} />
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
