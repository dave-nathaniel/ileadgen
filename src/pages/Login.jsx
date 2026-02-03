import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogoFull } from '../assets/Logo';

const { Title, Text } = Typography;

export function Login() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }

    setLoading(false);
  };

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
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Welcome back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              placeholder="Enter your password"
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              required
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
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#4f46e5' }}>
              Create one
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Login;
