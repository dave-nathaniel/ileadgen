import { Layout as AntLayout } from 'antd';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const { Content } = AntLayout;

const SIDEBAR_WIDTH = 256;

export function Layout({ children }) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout style={{ marginLeft: SIDEBAR_WIDTH }}>
        <Header />
        <Content style={{
          padding: '24px 32px',
          minHeight: 280,
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      {children}
    </div>
  );
}

export default Layout;
