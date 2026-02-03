import { Link } from 'react-router-dom';
import { Typography, Empty, Avatar, Button } from 'antd';
import {
  MailOutlined,
  MessageOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  AimOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Card, CardHeader } from '../common/Card';
import { formatRelativeTime } from '../../utils/formatters';

const { Text } = Typography;

const EVENT_CONFIG = {
  email_sent: {
    icon: <MailOutlined />,
    color: '#1890ff',
    bg: '#e6f7ff',
    getMessage: (e) => `Email sent to ${e.lead_name || 'a lead'}`,
  },
  email_opened: {
    icon: <MailOutlined />,
    color: '#faad14',
    bg: '#fffbe6',
    getMessage: (e) => `${e.lead_name || 'Lead'} opened email`,
  },
  email_replied: {
    icon: <MessageOutlined />,
    color: '#52c41a',
    bg: '#f6ffed',
    getMessage: (e) => `${e.lead_name || 'Lead'} replied!`,
  },
  lead_created: {
    icon: <TeamOutlined />,
    color: '#722ed1',
    bg: '#f9f0ff',
    getMessage: (e) => `New lead: ${e.lead_name || 'Unknown'}`,
  },
  lead_scored: {
    icon: <AimOutlined />,
    color: '#eb2f96',
    bg: '#fff0f6',
    getMessage: (e) => `${e.lead_name || 'Lead'} scored ${e.score || ''}`,
  },
  lead_converted: {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    bg: '#f6ffed',
    getMessage: (e) => `${e.lead_name || 'Lead'} converted!`,
  },
  pipeline_started: {
    icon: <AimOutlined />,
    color: '#722ed1',
    bg: '#f9f0ff',
    getMessage: (e) => `Pipeline started for ${e.campaign_name || 'campaign'}`,
  },
  pipeline_complete: {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    bg: '#f6ffed',
    getMessage: (e) => `Pipeline completed for ${e.campaign_name || 'campaign'}`,
  },
  pipeline_failed: {
    icon: <ExclamationCircleOutlined />,
    color: '#ff4d4f',
    bg: '#fff2f0',
    getMessage: (e) => `Pipeline failed for ${e.campaign_name || 'campaign'}`,
  },
  default: {
    icon: <ClockCircleOutlined />,
    color: '#8c8c8c',
    bg: '#f5f5f5',
    getMessage: (e) => e.event_type?.replace(/_/g, ' ') || 'Activity',
  },
};

export function RecentActivityFeed({ events, maxItems = 10, showViewAll = true }) {
  const displayEvents = events?.slice(0, maxItems) || [];

  if (displayEvents.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recent activity"
          style={{ padding: '48px 0' }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          showViewAll && (
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontSize: 13 }}>
              View all <RightOutlined style={{ fontSize: 11 }} />
            </Link>
          )
        }
      />

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {displayEvents.map((event, index) => {
          const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.default;
          const message = config.getMessage(event);

          return (
            <div
              key={event.id || index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Avatar
                icon={config.icon}
                style={{
                  backgroundColor: config.bg,
                  color: config.color,
                  flexShrink: 0,
                }}
                size={36}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 13 }}>{message}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatRelativeTime(event.created_at)}
                  </Text>
                  {event.campaign_name && (
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>•</Text>
                      <Text style={{ fontSize: 12, color: '#4f46e5', maxWidth: 120 }} ellipsis>
                        {event.campaign_name}
                      </Text>
                    </>
                  )}
                </div>
              </div>

              {event.campaign_id && (
                <Link to={`/campaigns/${event.campaign_id}`}>
                  <Button
                    type="text"
                    size="small"
                    icon={<RightOutlined />}
                    style={{ flexShrink: 0 }}
                  />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default RecentActivityFeed;
