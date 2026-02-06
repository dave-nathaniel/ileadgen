import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Statistic,
  Table,
  Tag,
  Select,
  Row,
  Col,
  Collapse,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useBilling } from '../context/BillingContext';
import { useToast } from '../context/ToastContext';
import { billingApi } from '../api/billing';

const { Title, Text } = Typography;

const TRANSACTION_TYPE_COLORS = {
  purchase: 'green',
  grant: 'blue',
  free_trial: 'cyan',
  ai_usage: 'purple',
  lead_response: 'orange',
  refund: 'gold',
  adjustment: 'default',
};

const TRANSACTION_TYPE_LABELS = {
  purchase: 'Purchase',
  grant: 'Grant',
  free_trial: 'Free Trial',
  ai_usage: 'AI Usage',
  lead_response: 'Lead Response',
  refund: 'Refund',
  adjustment: 'Adjustment',
};

export function Billing() {
  const { balance, pricing, fetchBalance } = useBilling();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnPage, setTxnPage] = useState(1);
  const [txnPageSize] = useState(10);
  const [txnTypeFilter, setTxnTypeFilter] = useState(null);
  const [txnLoading, setTxnLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setTxnLoading(true);
    try {
      const data = await billingApi.getTransactions({
        page: txnPage,
        pageSize: txnPageSize,
        type: txnTypeFilter,
      });
      setTransactions(data.transactions);
      setTxnTotal(data.total);
    } catch {
      // Silently fail
    }
    setTxnLoading(false);
  }, [txnPage, txnPageSize, txnTypeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Stripe redirect
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Payment successful! Credits have been added to your account.');
      fetchBalance();
      fetchTransactions();
    } else if (payment === 'cancelled') {
      toast.info('Payment was cancelled.');
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuyPackage = async (index) => {
    setCheckoutLoading(index);
    try {
      const currentUrl = window.location.origin + '/billing';
      const data = await billingApi.createCheckoutSession(
        index,
        `${currentUrl}?payment=success`,
        `${currentUrl}?payment=cancelled`
      );
      window.location.href = data.checkout_url;
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to create checkout session');
      setCheckoutLoading(null);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      width: 160,
      render: (val) =>
        new Date(val).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'type',
      width: 130,
      render: (val) => (
        <Tag color={TRANSACTION_TYPE_COLORS[val] || 'default'}>
          {TRANSACTION_TYPE_LABELS[val] || val}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: val > 0 ? '#10b981' : '#ef4444' }}>
          {val > 0 ? '+' : ''}{val}
        </Text>
      ),
    },
    {
      title: 'Balance After',
      dataIndex: 'balance_after',
      key: 'balance_after',
      width: 120,
      align: 'right',
      render: (val) => <Text type="secondary">{val.toLocaleString()}</Text>,
    },
  ];

  const packages = pricing?.credit_packages || [];

  const packageStyles = [
    { border: '#e2e8f0', bg: '#f8fafc' },
    { border: '#4f46e5', bg: '#eef2ff' },
    { border: '#e2e8f0', bg: '#f8fafc' },
  ];

  const tierInfo = pricing
    ? [
        { tier: 'Basic', cost: pricing.ai_tier_costs.basic, desc: 'Simple lookups' },
        { tier: 'Standard', cost: pricing.ai_tier_costs.standard, desc: 'Keyword & query suggestions' },
        { tier: 'Premium', cost: pricing.ai_tier_costs.premium, desc: 'Email preview & lead analysis' },
      ]
    : [];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Billing & Credits</Title>
        <Text type="secondary">Manage your credit balance and purchases</Text>
      </div>

      {/* Section 1: Current Balance */}
      <Card>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Statistic
              title="Credit Balance"
              value={balance?.balance ?? 0}
              prefix={<DollarOutlined />}
              valueStyle={{
                fontSize: 36,
                fontWeight: 700,
                color: balance?.balance > 100 ? '#10b981' : balance?.balance > 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 32 }}>
              <Statistic title="Purchased" value={balance?.lifetime_credits_purchased ?? 0} valueStyle={{ fontSize: 20 }} />
              <Statistic title="Used" value={balance?.lifetime_credits_used ?? 0} valueStyle={{ fontSize: 20 }} />
              <Statistic title="Granted" value={balance?.lifetime_credits_granted ?? 0} valueStyle={{ fontSize: 20 }} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Section 2: Credit Packages */}
      <Card title={<><ShoppingCartOutlined /> Credit Packages</>}>
        <Row gutter={16}>
          {packages.map((pkg, idx) => {
            const style = packageStyles[idx] || packageStyles[0];
            const popular = idx === 1;
            return (
              <Col span={8} key={idx}>
                <div
                  style={{
                    border: `2px solid ${style.border}`,
                    borderRadius: 12,
                    padding: 24,
                    backgroundColor: style.bg,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {popular && (
                    <Tag
                      color="#4f46e5"
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600,
                      }}
                    >
                      Most Popular
                    </Tag>
                  )}
                  <Title level={4} style={{ margin: '8px 0 4px' }}>{pkg.label}</Title>
                  <Title level={2} style={{ margin: '0 0 4px', color: '#4f46e5' }}>
                    ${(pkg.price_cents / 100).toFixed(2)}
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {pkg.credits.toLocaleString()} credits
                  </Text>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
                    ${(pkg.price_cents / pkg.credits / 100 * 100).toFixed(1)} cents/credit
                  </Text>
                  <Button
                    type={popular ? 'primary' : 'default'}
                    block
                    size="large"
                    loading={checkoutLoading === idx}
                    onClick={() => handleBuyPackage(idx)}
                    style={{ borderRadius: 8 }}
                  >
                    Buy {pkg.label}
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Section 3: Transaction History */}
      <Card
        title={<><HistoryOutlined /> Transaction History</>}
        extra={
          <Select
            placeholder="Filter by type"
            allowClear
            value={txnTypeFilter}
            onChange={(val) => {
              setTxnTypeFilter(val);
              setTxnPage(1);
            }}
            style={{ width: 160 }}
            options={Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        }
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={txnLoading}
          pagination={{
            current: txnPage,
            pageSize: txnPageSize,
            total: txnTotal,
            onChange: (page) => setTxnPage(page),
            showTotal: (total) => `${total} transactions`,
            showSizeChanger: false,
          }}
          size="small"
        />
      </Card>

      {/* Section 4: Pricing Info */}
      <Card title={<><InfoCircleOutlined /> Pricing Info</>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>AI Credit Costs</Text>
            <Table
              dataSource={tierInfo}
              columns={[
                { title: 'Tier', dataIndex: 'tier', key: 'tier' },
                { title: 'Credits', dataIndex: 'cost', key: 'cost', render: (v) => `${v} credit${v !== 1 ? 's' : ''}` },
                { title: 'Description', dataIndex: 'desc', key: 'desc' },
              ]}
              pagination={false}
              size="small"
              rowKey="tier"
            />
          </div>

          {pricing && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}>
              <Text strong>Lead Response Cost: </Text>
              <Text>{pricing.lead_response_cost} credits</Text>
              <Text type="secondary"> (charged once per lead that responds)</Text>
            </div>
          )}

          {pricing && (
            <Collapse
              ghost
              items={[
                {
                  key: 'endpoints',
                  label: 'AI Endpoint Tier Mapping',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(pricing.ai_endpoint_tiers).map(([endpoint, tier]) => (
                        <div key={endpoint} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <Text code>{endpoint}</Text>
                          <Tag color={tier === 'premium' ? 'gold' : tier === 'standard' ? 'blue' : 'default'}>
                            {tier} ({pricing.ai_tier_costs[tier]} cr)
                          </Tag>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export default Billing;
