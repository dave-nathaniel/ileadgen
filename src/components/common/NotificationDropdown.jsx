import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Empty, Spin, Typography, Dropdown, List, Avatar, Tooltip, Switch, message } from 'antd';
import {
  BellOutlined,
  MailOutlined,
  MessageOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  RightOutlined,
  SettingOutlined,
  SoundOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { useBrowserNotifications } from '../../hooks/useBrowserNotifications';
import { formatRelativeTime } from '../../utils/formatters';

const { Text } = Typography;

const EVENT_ICONS = {
  // Email events
  email_sent: { icon: MailOutlined, color: '#1890ff', bg: '#e6f7ff' },
  email_opened: { icon: MailOutlined, color: '#faad14', bg: '#fffbe6' },
  email_replied: { icon: MessageOutlined, color: '#52c41a', bg: '#f6ffed' },
  email_delivered: { icon: MailOutlined, color: '#52c41a', bg: '#f6ffed' },
  email_bounced: { icon: MailOutlined, color: '#ff4d4f', bg: '#fff2f0' },
  // Campaign events
  campaign_status_changed: { icon: SyncOutlined, color: '#1890ff', bg: '#e6f7ff' },
  campaign_completed: { icon: CheckCircleOutlined, color: '#52c41a', bg: '#f6ffed' },
  campaign_failed: { icon: ExclamationCircleOutlined, color: '#ff4d4f', bg: '#fff2f0' },
  // Lead events
  lead_status_changed: { icon: UserSwitchOutlined, color: '#722ed1', bg: '#f9f0ff' },
  lead_responded: { icon: MessageOutlined, color: '#52c41a', bg: '#f6ffed' },
  lead_converted: { icon: ThunderboltOutlined, color: '#faad14', bg: '#fffbe6' },
  lead_created: { icon: TeamOutlined, color: '#722ed1', bg: '#f9f0ff' },
  lead_updated: { icon: TeamOutlined, color: '#eb2f96', bg: '#fff0f6' },
  // Task events
  task_started: { icon: RocketOutlined, color: '#1890ff', bg: '#e6f7ff' },
  task_progress: { icon: ClockCircleOutlined, color: '#faad14', bg: '#fffbe6' },
  task_completed: { icon: CheckCircleOutlined, color: '#52c41a', bg: '#f6ffed' },
  task_failed: { icon: ExclamationCircleOutlined, color: '#ff4d4f', bg: '#fff2f0' },
  // Legacy
  pipeline_complete: { icon: CheckCircleOutlined, color: '#52c41a', bg: '#f6ffed' },
  pipeline_failed: { icon: ExclamationCircleOutlined, color: '#ff4d4f', bg: '#fff2f0' },
  default: { icon: BellOutlined, color: '#8c8c8c', bg: '#f5f5f5' },
};

export function NotificationDropdown() {
  const { recentEvents, eventsLoading, fetchEvents } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const processedEventsRef = useRef(new Set());

  const {
    permission,
    preferences,
    loading: prefsLoading,
    requestPermission,
    updatePreferences,
    processEvent,
    isSupported,
    isEnabled,
  } = useBrowserNotifications();

  const [seenEventIds, setSeenEventIds] = useState(() => {
    try {
      const stored = localStorage.getItem('seenEventIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Process new events for browser notifications
  useEffect(() => {
    if (!isEnabled) return;

    recentEvents.forEach((event) => {
      // Only process events we haven't seen before
      if (!processedEventsRef.current.has(event.id) && !seenEventIds.has(event.id)) {
        processedEventsRef.current.add(event.id);

        // Build event object for browser notification
        const notificationEvent = {
          id: event.id,
          event_type: event.event_type,
          title: getEventTitle(event),
          message: getEventMessage(event),
          priority: event.priority || 'normal',
          should_notify: event.should_notify,
          campaign_id: event.campaign_id,
          lead_id: event.lead_id,
        };

        processEvent(notificationEvent);
      }
    });
  }, [recentEvents, isEnabled, seenEventIds, processEvent]);

  useEffect(() => {
    const count = recentEvents.filter((e) => !seenEventIds.has(e.id)).length;
    setUnreadCount(count);
  }, [recentEvents, seenEventIds]);

  const handleOpen = (open) => {
    setIsOpen(open);
    if (open) {
      fetchEvents();
      setShowSettings(false);
    }
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(recentEvents.map((e) => e.id));
    setSeenEventIds(allIds);
    setUnreadCount(0);
    try {
      localStorage.setItem('seenEventIds', JSON.stringify([...allIds]));
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      message.success('Browser notifications enabled');
    } else if (result === 'denied') {
      message.warning('Browser notifications blocked. Please enable in browser settings.');
    }
  };

  const handleTogglePreference = async (key, value) => {
    try {
      await updatePreferences({ [key]: value });
      message.success('Notification preferences updated');
    } catch (error) {
      message.error('Failed to update preferences');
    }
  };

  const getEventIcon = (eventType) => {
    return EVENT_ICONS[eventType] || EVENT_ICONS.default;
  };

  const getEventTitle = (event) => {
    // Use server-provided title if available
    if (event.title) return event.title;

    switch (event.event_type) {
      case 'campaign_completed':
        return 'Campaign Completed';
      case 'campaign_failed':
        return 'Campaign Failed';
      case 'lead_responded':
        return 'Lead Response';
      case 'lead_converted':
        return 'Lead Converted';
      case 'task_started':
        return 'Task Started';
      case 'task_completed':
        return 'Task Completed';
      case 'task_failed':
        return 'Task Failed';
      default:
        return 'iLeadGen';
    }
  };

  const getEventMessage = (event) => {
    // Use server-provided message if available
    if (event.message) return event.message;

    switch (event.event_type) {
      case 'email_sent':
        return `Email sent to ${event.lead_name || 'lead'}`;
      case 'email_opened':
        return `${event.lead_name || 'Lead'} opened your email`;
      case 'email_replied':
        return `${event.lead_name || 'Lead'} replied to your email`;
      case 'email_delivered':
        return `Email delivered to ${event.lead_name || 'lead'}`;
      case 'email_bounced':
        return `Email to ${event.lead_name || 'lead'} bounced`;
      case 'campaign_completed':
        return `Campaign "${event.campaign_name || ''}" completed`;
      case 'campaign_failed':
        return `Campaign "${event.campaign_name || ''}" failed`;
      case 'campaign_status_changed':
        return `Campaign status changed`;
      case 'lead_responded':
        return `${event.lead_name || 'Lead'} responded`;
      case 'lead_converted':
        return `${event.lead_name || 'Lead'} converted`;
      case 'lead_created':
        return `New lead: ${event.lead_name || 'Unknown'}`;
      case 'lead_updated':
        return `Lead updated: ${event.lead_name || 'Unknown'}`;
      case 'lead_status_changed':
        return `Lead status changed`;
      case 'task_started':
        return event.event_data?.task_name || 'Task started';
      case 'task_progress':
        return `Progress: ${event.event_data?.progress || 0}%`;
      case 'task_completed':
        return event.event_data?.task_name || 'Task completed';
      case 'task_failed':
        return event.event_data?.error || 'Task failed';
      case 'pipeline_complete':
        return 'Pipeline completed successfully';
      case 'pipeline_failed':
        return 'Pipeline failed';
      default:
        return event.event_type?.replace(/_/g, ' ') || 'New event';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#faad14';
      case 'normal':
        return '#1890ff';
      default:
        return '#8c8c8c';
    }
  };

  const settingsContent = (
    <div style={{ padding: 16 }}>
      <Text strong style={{ display: 'block', marginBottom: 16 }}>Notification Settings</Text>

      {/* Browser Permission */}
      {isSupported && permission !== 'granted' && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>Enable browser notifications to receive alerts even when this tab isn't focused.</Text>
          <Button type="primary" size="small" icon={<BellOutlined />} onClick={handleRequestPermission}>
            Enable Notifications
          </Button>
        </div>
      )}

      {!isSupported && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 8 }}>
          <Text type="secondary">Browser notifications are not supported in this browser.</Text>
        </div>
      )}

      {/* Desktop Notifications Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text>Desktop Notifications</Text>
        <Switch
          checked={preferences.desktop_enabled}
          onChange={(checked) => handleTogglePreference('desktop_enabled', checked)}
          disabled={permission !== 'granted'}
          loading={prefsLoading}
        />
      </div>

      {/* Sound Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text><SoundOutlined style={{ marginRight: 8 }} />Sound</Text>
        <Switch
          checked={preferences.sound_enabled}
          onChange={(checked) => handleTogglePreference('sound_enabled', checked)}
          loading={prefsLoading}
        />
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>Notify me when:</Text>

      {/* Event Type Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>Campaign completed</Text>
          <Switch
            size="small"
            checked={preferences.notify_campaign_completed}
            onChange={(checked) => handleTogglePreference('notify_campaign_completed', checked)}
            loading={prefsLoading}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>Campaign failed</Text>
          <Switch
            size="small"
            checked={preferences.notify_campaign_failed}
            onChange={(checked) => handleTogglePreference('notify_campaign_failed', checked)}
            loading={prefsLoading}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>Lead responded</Text>
          <Switch
            size="small"
            checked={preferences.notify_lead_responded}
            onChange={(checked) => handleTogglePreference('notify_lead_responded', checked)}
            loading={prefsLoading}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>Lead converted</Text>
          <Switch
            size="small"
            checked={preferences.notify_lead_converted}
            onChange={(checked) => handleTogglePreference('notify_lead_converted', checked)}
            loading={prefsLoading}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13 }}>Task failed</Text>
          <Switch
            size="small"
            checked={preferences.notify_task_failed}
            onChange={(checked) => handleTogglePreference('notify_task_failed', checked)}
            loading={prefsLoading}
          />
        </div>
      </div>
    </div>
  );

  const dropdownContent = (
    <div style={{ width: 360, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#1e293b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Text strong style={{ color: '#fff', fontSize: 15 }}>
          {showSettings ? 'Settings' : 'Notifications'}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!showSettings && unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllRead} style={{ color: 'rgba(255,255,255,0.8)', padding: 0, fontSize: 12 }}>
              Mark all read
            </Button>
          )}
          <Tooltip title={showSettings ? 'Back to notifications' : 'Notification settings'}>
            <Button
              type="text"
              size="small"
              icon={showSettings ? <BellOutlined style={{ color: '#fff', fontSize: 14 }} /> : <SettingOutlined style={{ color: '#fff', fontSize: 14 }} />}
              onClick={() => setShowSettings(!showSettings)}
            />
          </Tooltip>
          <Button type="text" size="small" icon={<CloseOutlined style={{ color: '#fff', fontSize: 12 }} />} onClick={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {showSettings ? (
          settingsContent
        ) : eventsLoading && recentEvents.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spin />
          </div>
        ) : recentEvents.length > 0 ? (
          <List
            dataSource={recentEvents.slice(0, 15)}
            renderItem={(event, index) => {
              const { icon: Icon, color, bg } = getEventIcon(event.event_type);
              const isUnread = !seenEventIds.has(event.id);
              const priorityColor = getPriorityColor(event.priority);

              return (
                <List.Item
                  key={event.id || index}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: isUnread ? '#f0f5ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    borderLeft: event.priority === 'critical' || event.priority === 'high'
                      ? `3px solid ${priorityColor}`
                      : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
                    <Avatar
                      icon={<Icon />}
                      style={{ backgroundColor: bg, color: color, flexShrink: 0 }}
                      size={36}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontWeight: isUnread ? 600 : 400, display: 'block' }}>
                        {getEventMessage(event)}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatRelativeTime(event.created_at)}
                        </Text>
                        {event.campaign_name && (
                          <Text style={{ fontSize: 12, color: '#4f46e5' }}>
                            {event.campaign_name}
                          </Text>
                        )}
                        {event.priority === 'critical' && (
                          <Text style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 500 }}>
                            CRITICAL
                          </Text>
                        )}
                      </div>
                    </div>
                    {isUnread && (
                      <div style={{
                        width: 8,
                        height: 8,
                        backgroundColor: '#4f46e5',
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginTop: 6,
                      }} />
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications yet"
            style={{ padding: 48 }}
          />
        )}
      </div>

      {/* Footer */}
      {!showSettings && recentEvents.length > 0 && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            style={{ color: '#4f46e5', fontWeight: 500, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            View all activity
            <RightOutlined style={{ fontSize: 11 }} />
          </Link>
          {isSupported && (
            <Tooltip title={isEnabled ? 'Browser notifications enabled' : 'Browser notifications disabled'}>
              <BellOutlined style={{ color: isEnabled ? '#52c41a' : '#d9d9d9', fontSize: 16 }} />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      open={isOpen}
      onOpenChange={handleOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ padding: 8 }}
        />
      </Badge>
    </Dropdown>
  );
}

export default NotificationDropdown;
