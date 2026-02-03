import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  AimOutlined,
  SettingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { LogoFull } from '../../assets/Logo';

const { Sider } = Layout;
const { Text } = Typography;

const navItems = [
  { key: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/campaigns', label: 'Campaigns', icon: <AimOutlined /> },
  { key: '/settings', label: 'Settings', icon: <SettingOutlined /> },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={256}
      style={{
        backgroundColor: '#fff',
        borderRight: '1px solid #f0f0f0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <LogoFull />
      </div>

      {/* Navigation */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={navItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          marginTop: 8,
        }}
      />

      {/* Quick Action */}
      <div style={{ padding: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          onClick={() => navigate('/campaigns/new')}
          style={{ borderRadius: 12, height: 44 }}
        >
          New Campaign
        </Button>
      </div>

      {/* Bottom section */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTop: '1px solid #f0f0f0',
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #e2e8f0',
        }}>
          <Text strong style={{ display: 'block', fontSize: 13 }}>Need help?</Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, marginBottom: 12 }}>
            Check our documentation or contact support.
          </Text>
          <a href="#" style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5' }}>
            View Documentation →
          </a>
        </div>
      </div>
    </Sider>
  );
}

export default Sidebar;
