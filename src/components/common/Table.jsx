import { Empty, Typography } from 'antd';

const { Title, Text } = Typography;

export function Table({ children, className = '' }) {
  return (
    <div style={{ overflowX: 'auto' }} className={className}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead style={{ borderBottom: '1px solid #e2e8f0' }}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeader({ children, className = '', align = 'left' }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        fontSize: 12,
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: align,
      }}
      className={className}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, onClick, className = '', style = {} }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid #f1f5f9',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', align = 'left' }) {
  return (
    <td
      style={{
        padding: '16px',
        textAlign: align,
      }}
      className={className}
    >
      {children}
    </td>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }} className={className}>
      {Icon && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            padding: 16,
            backgroundColor: '#f1f5f9',
            borderRadius: '50%',
            display: 'inline-flex',
          }}>
            <Icon size={32} style={{ color: '#94a3b8' }} />
          </div>
        </div>
      )}
      <Title level={5} style={{ marginBottom: 4 }}>{title}</Title>
      {description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, maxWidth: 320, margin: '0 auto 16px' }}>
          {description}
        </Text>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default Table;
