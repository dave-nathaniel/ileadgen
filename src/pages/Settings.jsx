import { useState } from 'react';
import { Card, Input, Button, Typography, Tag, Divider } from 'antd';
import { UserOutlined, BankOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const { Title, Text } = Typography;

export function Settings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Settings</Title>
        <Text type="secondary">Manage your account settings</Text>
      </div>

      {/* Profile Section */}
      <Card title="Profile Information">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Full Name
            </label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your name"
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Email
            </label>
            <Input
              value={user?.email || ''}
              disabled
              size="large"
              style={{ borderRadius: 8, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Company Name
            </label>
            <Input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Your company"
              prefix={<BankOutlined style={{ color: '#94a3b8' }} />}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>

          <div style={{ paddingTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Info */}
      <Card title="Account Information">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid rgba(226, 232, 240, 0.7)'
          }}>
            <div>
              <Text strong style={{ display: 'block', color: '#1e293b' }}>Account Status</Text>
              <Text type="secondary" style={{ fontSize: 14 }}>Your account verification status</Text>
            </div>
            <Tag color={user?.is_verified ? 'success' : 'warning'}>
              {user?.is_verified ? 'Verified' : 'Pending Verification'}
            </Tag>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0'
          }}>
            <div>
              <Text strong style={{ display: 'block', color: '#1e293b' }}>Member Since</Text>
              <Text type="secondary" style={{ fontSize: 14 }}>When you created your account</Text>
            </div>
            <Text style={{ color: '#475569' }}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </Text>
          </div>
        </div>
      </Card>

      {/* API Keys Section (Future) */}
      <Card
        title="API Integrations"
        extra={<Text type="secondary">Coming soon</Text>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: 0.5 }}>
          <div style={{
            padding: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            border: '1px solid rgba(226, 232, 240, 0.7)'
          }}>
            <Text strong style={{ display: 'block', color: '#1e293b' }}>Google Maps API</Text>
            <Text type="secondary" style={{ fontSize: 14 }}>For lead discovery</Text>
          </div>
          <div style={{
            padding: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            border: '1px solid rgba(226, 232, 240, 0.7)'
          }}>
            <Text strong style={{ display: 'block', color: '#1e293b' }}>SendGrid API</Text>
            <Text type="secondary" style={{ fontSize: 14 }}>For email delivery</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
