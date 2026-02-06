import { useState } from 'react';
import { Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../../context/BillingContext';

export function LowBalanceWarning() {
  const { balance } = useBilling();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!balance || balance.balance >= 50 || dismissed) return null;

  return (
    <Alert
      type="warning"
      showIcon
      closable
      onClose={() => setDismissed(true)}
      message="Your credit balance is low. Top up to continue using AI features."
      action={
        <Button size="small" type="primary" onClick={() => navigate('/billing')}>
          Top Up
        </Button>
      }
      style={{ marginBottom: 16, borderRadius: 8 }}
    />
  );
}

export default LowBalanceWarning;
