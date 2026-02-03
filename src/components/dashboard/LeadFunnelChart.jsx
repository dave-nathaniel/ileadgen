import { Typography, Progress, Divider } from 'antd';
import {
  TeamOutlined,
  MailOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { Card, CardHeader } from '../common/Card';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const { Text } = Typography;

const stageColors = {
  indigo: '#4f46e5',
  blue: '#3b82f6',
  emerald: '#10b981',
  purple: '#a855f7',
};

export function LeadFunnelChart({ stats }) {
  const funnelStages = [
    {
      key: 'collected',
      label: 'Collected',
      value: stats?.totalLeads || 0,
      icon: <TeamOutlined />,
      color: stageColors.indigo,
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: stats?.contacted || 0,
      icon: <MailOutlined />,
      color: stageColors.blue,
    },
    {
      key: 'responded',
      label: 'Responded',
      value: stats?.responded || 0,
      icon: <MessageOutlined />,
      color: stageColors.emerald,
    },
    {
      key: 'converted',
      label: 'Converted',
      value: stats?.converted || 0,
      icon: <CheckCircleOutlined />,
      color: stageColors.purple,
    },
  ];

  const maxValue = Math.max(...funnelStages.map((s) => s.value), 1);

  const getConversionRate = (currentIndex) => {
    if (currentIndex === 0) return 100;
    const previousValue = funnelStages[currentIndex - 1].value;
    if (previousValue === 0) return 0;
    return (funnelStages[currentIndex].value / previousValue) * 100;
  };

  return (
    <Card>
      <CardHeader title="Lead Funnel" subtitle="Conversion through stages" />

      <div style={{ marginTop: 16 }}>
        {funnelStages.map((stage, index) => {
          const widthPercent = Math.max((stage.value / maxValue) * 100, 10);
          const conversionRate = getConversionRate(index);

          return (
            <div key={stage.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 96, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: stage.color }}>{stage.icon}</span>
                  <Text style={{ fontWeight: 500, fontSize: 13 }}>{stage.label}</Text>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{
                    height: 40,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: stage.color,
                        borderRadius: 8,
                        transition: 'width 0.5s',
                        width: `${widthPercent}%`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text strong style={{ color: '#fff', fontSize: 13 }}>
                        {formatNumber(stage.value)}
                      </Text>
                    </div>
                  </div>
                </div>

                <div style={{ width: 64, textAlign: 'right' }}>
                  {index > 0 && (
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: conversionRate >= 50 ? '#10b981' : conversionRate >= 25 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {formatPercentage(conversionRate)}
                    </Text>
                  )}
                </div>
              </div>

              {index < funnelStages.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <ArrowDownOutlined style={{ color: '#cbd5e1' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text type="secondary">Overall Conversion Rate</Text>
        <Text strong style={{ color: '#4f46e5' }}>
          {stats?.totalLeads > 0
            ? formatPercentage((stats?.converted / stats?.totalLeads) * 100)
            : '0%'}
        </Text>
      </div>
    </Card>
  );
}

export default LeadFunnelChart;
