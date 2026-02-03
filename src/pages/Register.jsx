import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Alert, Progress } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogoFull } from '../assets/Logo';

const { Title, Text } = Typography;

export function Register() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', percent: 0 };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#eab308', '#3b82f6', '#10b981'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '#e2e8f0',
      percent: (strength / 4) * 100,
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.7)',
          padding: 8
        }}
        bodyStyle={{ padding: 32 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <LogoFull />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Create account</Title>
          <Text type="secondary">Start generating leads today</Text>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Full Name
            </label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              required
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              required
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Password
            </label>
            <Input.Password
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              required
              size="large"
              style={{ borderRadius: 8 }}
            />
            {formData.password && (
              <div style={{ marginTop: 8 }}>
                <Progress
                  percent={passwordStrength.percent}
                  showInfo={false}
                  strokeColor={passwordStrength.color}
                  trailColor="#e2e8f0"
                  size="small"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Password strength: {passwordStrength.label}
                </Text>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#334155' }}>
              Company Name (optional)
            </label>
            <Input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Acme Inc"
              prefix={<BankOutlined style={{ color: '#94a3b8' }} />}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ borderRadius: 8 }}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            style={{ borderRadius: 8, height: 44 }}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#4f46e5' }}>
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Register;
