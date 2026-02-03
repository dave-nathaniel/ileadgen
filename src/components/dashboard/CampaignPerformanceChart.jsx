import { Link } from 'react-router-dom';
import { Typography, Empty, Space, Divider } from 'antd';
import {
  AimOutlined,
  TeamOutlined,
  MailOutlined,
  MessageOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Card, CardHeader } from '../common/Card';
import { StatusBadge } from '../common/Badge';
import { formatNumber } from '../../utils/formatters';

const { Text } = Typography;

export function CampaignPerformanceChart({ campaigns }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader title="Campaign Performance" />
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No campaigns to display"
          style={{ padding: '48px 0' }}
        />
      </Card>
    );
  }

  const topCampaigns = [...campaigns]
    .sort((a, b) => (b.total_leads || 0) - (a.total_leads || 0))
    .slice(0, 5);

  const maxLeads = Math.max(...topCampaigns.map((c) => c.total_leads || 0), 1);

  return (
    <Card>
      <CardHeader
        title="Campaign Performance"
        subtitle="Top campaigns by lead count"
        action={
          <Link to="/campaigns" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontSize: 13 }}>
            View all <RightOutlined style={{ fontSize: 11 }} />
          </Link>
        }
      />

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {topCampaigns.map((campaign) => {
          const leadsWidth = Math.max(((campaign.total_leads || 0) / maxLeads) * 100, 5);
          const responseRate =
            campaign.total_leads > 0
              ? ((campaign.leads_responded || 0) / campaign.total_leads) * 100
              : 0;

          return (
            <Link
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
              style={{ display: 'block' }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c7d2fe';
                  e.currentTarget.style.backgroundColor = 'rgba(238, 242, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong>{campaign.name}</Text>
                    <StatusBadge status={campaign.status} type="campaign" />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'capitalize' }}>{campaign.industry}</Text>
                </div>

                <div style={{ position: 'relative', height: 32, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: '0 auto 0 0',
                      backgroundColor: '#818cf8',
                      borderRadius: 8,
                      transition: 'width 0.3s',
                      width: `${leadsWidth}%`,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '0 auto 0 0',
                      backgroundColor: '#3b82f6',
                      borderRadius: 8,
                      opacity: 0.6,
                      width: `${((campaign.leads_contacted || 0) / maxLeads) * 100}%`,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '0 auto 0 0',
                      backgroundColor: '#10b981',
                      borderRadius: 8,
                      width: `${((campaign.leads_responded || 0) / maxLeads) * 100}%`,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12 }}>
                  <Space size={4}>
                    <TeamOutlined style={{ color: '#818cf8' }} />
                    <Text type="secondary">{formatNumber(campaign.total_leads || 0)} leads</Text>
                  </Space>
                  <Space size={4}>
                    <MailOutlined style={{ color: '#3b82f6' }} />
                    <Text type="secondary">{formatNumber(campaign.leads_contacted || 0)} contacted</Text>
                  </Space>
                  <Space size={4}>
                    <MessageOutlined style={{ color: '#10b981' }} />
                    <Text type="secondary">{formatNumber(campaign.leads_responded || 0)} responded</Text>
                  </Space>
                  <div style={{ marginLeft: 'auto' }}>
                    <Text
                      strong
                      style={{
                        color: responseRate >= 10 ? '#10b981' : responseRate >= 5 ? '#f59e0b' : '#64748b',
                      }}
                    >
                      {responseRate.toFixed(1)}% response
                    </Text>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#a5b4fc' }} />
          <Text type="secondary">Total Leads</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#3b82f6' }} />
          <Text type="secondary">Contacted</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#10b981' }} />
          <Text type="secondary">Responded</Text>
        </div>
      </div>
    </Card>
  );
}

export default CampaignPerformanceChart;
