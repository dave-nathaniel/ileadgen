import { Card as AntCard, Typography, Space, Tag, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <AntCard
      className={className}
      styles={{
        body: padding ? { padding: 24 } : { padding: 0 }
      }}
      {...props}
    >
      {children}
    </AntCard>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        {subtitle && <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const colorStyles = {
  indigo: { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
  blue: { background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
  emerald: { background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
  amber: { background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' },
  purple: { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
};

export function StatCard({ icon: Icon, value, label, color = 'indigo', trend, className = '' }) {
  return (
    <Card className={className}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            ...colorStyles[color],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} color="white" />
        </div>
        {trend !== undefined && trend !== null && (
          <Tag color={trend > 0 ? 'green' : 'red'} style={{ margin: 0 }}>
            {trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {' '}{Math.abs(trend)}%
          </Tag>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <Statistic
          value={value}
          valueStyle={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b' }}
        />
        <Text type="secondary">{label}</Text>
      </div>
    </Card>
  );
}

export default Card;
