import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  TeamOutlined,
  MailOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const { Text } = Typography;

const iconStyles = {
  indigo: { backgroundColor: '#eef2ff', color: '#4f46e5' },
  amber: { backgroundColor: '#fffbeb', color: '#f59e0b' },
  emerald: { backgroundColor: '#ecfdf5', color: '#10b981' },
  purple: { backgroundColor: '#faf5ff', color: '#a855f7' },
};

export function StatsOverview({ stats, previousStats = null }) {
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const statCards = [
    {
      key: 'totalLeads',
      label: 'Total Leads',
      value: stats?.totalLeads || 0,
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      style: iconStyles.indigo,
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: stats?.contacted || 0,
      icon: <MailOutlined style={{ fontSize: 24 }} />,
      style: iconStyles.amber,
    },
    {
      key: 'responded',
      label: 'Responded',
      value: stats?.responded || 0,
      icon: <MessageOutlined style={{ fontSize: 24 }} />,
      style: iconStyles.emerald,
    },
    {
      key: 'converted',
      label: 'Converted',
      value: stats?.converted || 0,
      icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
      style: iconStyles.purple,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {statCards.map((stat) => {
        const trend = previousStats ? calculateTrend(stat.value, previousStats[stat.key]) : null;

        return (
          <Col xs={24} sm={12} lg={6} key={stat.key}>
            <Card styles={{ 
              body: { 
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              } 
              }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <span style={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumber(stat.value)}
                </span>
                <Text type="secondary" style={{ fontWeight: 500 }}>{stat.label}</Text>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  ...stat.style,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </div>

            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default StatsOverview;
