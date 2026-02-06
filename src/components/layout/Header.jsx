import { Layout, Input, Avatar, Dropdown, Button, Typography } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { CreditBalanceChip } from '../billing/CreditBalanceChip';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'header',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong style={{ display: 'block' }}>{user?.full_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        height: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Search */}
      <div style={{ flex: 1, maxWidth: 400 }}>
        <Input
          placeholder="Search campaigns, leads..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 12,
          }}
        />
      </div>

      {/* Right: Credits + Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CreditBalanceChip />
        <NotificationDropdown />

        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            style={{
              height: 'auto',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Avatar
              style={{ backgroundColor: '#4f46e5', fontWeight: 400, fontSize: 14, fontFamily: 'Poppins' }}
              size={34}
            >
              {getInitials(user?.full_name)}
            </Avatar>
            <Text style={{ maxWidth: 120, fontWeight: 500 }} ellipsis>
              {user?.full_name || 'User'}
            </Text>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;
