import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useBilling } from '../../context/BillingContext';

export function CreditBalanceChip() {
  const { balance } = useBilling();
  const navigate = useNavigate();

  if (!balance) return null;

  const credits = balance.balance;

  let color = '#10b981';
  if (credits < 50) color = '#ef4444';
  else if (credits <= 100) color = '#f59e0b';

  return (
    <Tooltip title="Credit balance - Click to manage">
      <Button
        type="text"
        onClick={() => navigate('/billing')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          height: 34,
          borderRadius: 20,
          backgroundColor: `${color}10`,
          border: `1px solid ${color}30`,
          color,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <DollarOutlined />
        {credits.toLocaleString()}
      </Button>
    </Tooltip>
  );
}

export default CreditBalanceChip;
