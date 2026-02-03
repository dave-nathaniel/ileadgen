import { Spin, Skeleton, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({ size = 'md', className = '' }) {
  const iconSize = sizeMap[size] || 24;
  return (
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: iconSize }} spin />}
      className={className}
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    }}>
      <Spinner size="xl" />
      <Text type="secondary" style={{ marginTop: 16 }}>{message}</Text>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: 16,
    }}>
      <Spinner size="lg" />
      {message && <Text style={{ marginTop: 12 }}>{message}</Text>}
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = 16 }) {
  return (
    <Skeleton.Input
      active
      style={{ width, height, minWidth: 'auto' }}
      size="small"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: 24,
      }}
      className={className}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Skeleton.Avatar active size={48} shape="square" style={{ borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <Skeleton.Input active style={{ width: '33%', marginBottom: 8 }} size="small" />
          <Skeleton.Input active style={{ width: '50%', height: 12 }} size="small" />
        </div>
      </div>
      <Skeleton.Input active style={{ width: '100%', marginBottom: 8 }} size="small" />
      <Skeleton.Input active style={{ width: '80%' }} size="small" />
    </div>
  );
}

export default Spinner;
