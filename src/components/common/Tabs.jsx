import { Tabs as AntTabs, Badge } from 'antd';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  const items = tabs.map((tab) => ({
    key: tab.id,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {tab.icon && <tab.icon size={16} />}
        {tab.label}
        {tab.count !== undefined && (
          <Badge
            count={tab.count}
            showZero
            style={{
              backgroundColor: activeTab === tab.id ? '#e0e7ff' : '#f1f5f9',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              boxShadow: 'none',
            }}
          />
        )}
      </span>
    ),
  }));

  return (
    <AntTabs
      activeKey={activeTab}
      onChange={onChange}
      items={items}
      className={className}
    />
  );
}

export default Tabs;
