import { Card, Typography } from 'antd';
import {
  MailOutlined,
  EyeOutlined,
  MessageOutlined,
  SelectOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const { Text, Title } = Typography;

export function OutreachStatsCard({ stats, showRates = true }) {
  const calculateRate = (numerator, denominator) => {
    if (!denominator || denominator === 0) return 0;
    return (numerator / denominator) * 100;
  };

  const emailStats = [
    {
      key: 'sent',
      label: 'Emails Sent',
      value: stats?.emails_sent || stats?.leads_contacted || 0,
      icon: MailOutlined,
      bgColor: '#e0e7ff',
      iconColor: '#4f46e5',
    },
    {
      key: 'opened',
      label: 'Opened',
      value: stats?.emails_opened || 0,
      rate: showRates ? calculateRate(stats?.emails_opened, stats?.emails_sent || stats?.leads_contacted) : null,
      icon: EyeOutlined,
      bgColor: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      key: 'clicked',
      label: 'Clicked',
      value: stats?.emails_clicked || 0,
      rate: showRates ? calculateRate(stats?.emails_clicked, stats?.emails_opened) : null,
      icon: SelectOutlined,
      bgColor: '#ede9fe',
      iconColor: '#7c3aed',
    },
    {
      key: 'replied',
      label: 'Replied',
      value: stats?.emails_replied || stats?.leads_responded || 0,
      rate: showRates ? calculateRate(stats?.emails_replied || stats?.leads_responded, stats?.emails_sent || stats?.leads_contacted) : null,
      icon: MessageOutlined,
      bgColor: '#d1fae5',
      iconColor: '#059669',
    },
  ];

  const getRateColor = (rate) => {
    if (rate >= 30) return '#059669';
    if (rate >= 15) return '#d97706';
    return '#64748b';
  };

  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>Outreach Performance</Title>}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Email engagement metrics</Text>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {emailStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.key}
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: '#f8fafc',
                textAlign: 'center',
                border: '1px solid rgba(226, 232, 240, 0.7)'
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40,
                height: 40,
                backgroundColor: stat.bgColor,
                borderRadius: 8,
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent style={{ fontSize: 20, color: stat.iconColor }} />
              </div>

              {/* Value */}
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>
                {formatNumber(stat.value)}
              </div>

              {/* Label */}
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginTop: 4 }}>
                {stat.label}
              </div>

              {/* Rate */}
              {stat.rate !== null && stat.rate !== undefined && (
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: getRateColor(stat.rate) }}>
                  {formatPercentage(stat.rate)} rate
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison/Benchmark */}
      {showRates && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              border: '1px solid rgba(226, 232, 240, 0.7)'
            }}>
              <Text style={{ color: '#475569' }}>Open Rate</Text>
              <span style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: calculateRate(stats?.emails_opened, stats?.emails_sent || stats?.leads_contacted) >= 25 ? '#059669' : '#d97706'
              }}>
                {formatPercentage(calculateRate(stats?.emails_opened, stats?.emails_sent || stats?.leads_contacted))}
                {calculateRate(stats?.emails_opened, stats?.emails_sent || stats?.leads_contacted) >= 25 ? (
                  <RiseOutlined style={{ fontSize: 16 }} />
                ) : (
                  <FallOutlined style={{ fontSize: 16 }} />
                )}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              border: '1px solid rgba(226, 232, 240, 0.7)'
            }}>
              <Text style={{ color: '#475569' }}>Reply Rate</Text>
              <span style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: calculateRate(stats?.emails_replied || stats?.leads_responded, stats?.emails_sent || stats?.leads_contacted) >= 10 ? '#059669' : '#d97706'
              }}>
                {formatPercentage(calculateRate(stats?.emails_replied || stats?.leads_responded, stats?.emails_sent || stats?.leads_contacted))}
                {calculateRate(stats?.emails_replied || stats?.leads_responded, stats?.emails_sent || stats?.leads_contacted) >= 10 ? (
                  <RiseOutlined style={{ fontSize: 16 }} />
                ) : (
                  <FallOutlined style={{ fontSize: 16 }} />
                )}
              </span>
            </div>
          </div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            Industry benchmarks: 20-25% open rate, 5-10% reply rate
          </Text>
        </div>
      )}
    </Card>
  );
}

export default OutreachStatsCard;
