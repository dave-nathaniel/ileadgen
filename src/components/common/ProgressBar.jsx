import { Progress, Steps, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Text } = Typography;

const colorMap = {
  indigo: { from: '#6366f1', to: '#8b5cf6' },
  emerald: { from: '#10b981', to: '#14b8a6' },
  amber: { from: '#f59e0b', to: '#f97316' },
  red: { from: '#ef4444', to: '#ec4899' },
};

const sizeMap = {
  sm: 6,
  md: 10,
  lg: 16,
};

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'indigo',
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = colorMap[color] || colorMap.indigo;
  const strokeWidth = sizeMap[size] || 10;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          {label && <Text style={{ fontWeight: 500 }}>{label}</Text>}
          {showValue && <Text strong style={{ color: '#475569' }}>{Math.round(percentage)}%</Text>}
        </div>
      )}
      <Progress
        percent={percentage}
        showInfo={false}
        strokeColor={{
          from: colors.from,
          to: colors.to,
        }}
        strokeWidth={strokeWidth}
        trailColor="#e2e8f0"
      />
    </div>
  );
}

export function StepProgress({ steps, currentStep, className = '' }) {
  return (
    <Steps
      current={currentStep}
      size="small"
      className={className}
      items={steps.map((step, index) => ({
        title: '',
        icon: index < currentStep ? (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}>
            <CheckOutlined />
          </div>
        ) : (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: index === currentStep ? '#4f46e5' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: index === currentStep ? '#fff' : '#94a3b8',
            fontWeight: 'bold',
            boxShadow: index === currentStep ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
          }}>
            {index + 1}
          </div>
        ),
      }))}
    />
  );
}

export default ProgressBar;
