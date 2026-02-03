import { useState } from 'react';
import { Card, Button, Modal, Typography, Tag, Spin } from 'antd';
import {
  ClockCircleOutlined,
  MailOutlined,
  SendOutlined,
  EyeOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { formatRelativeTime } from '../../utils/formatters';

const { Text, Title } = Typography;

const TIER_COLORS = {
  hot: { color: '#dc2626', bg: '#fef2f2' },
  warm: { color: '#f59e0b', bg: '#fffbeb' },
  cold: { color: '#3b82f6', bg: '#eff6ff' },
};

function TierBadge({ tier }) {
  const config = TIER_COLORS[tier] || { color: '#64748b', bg: '#f1f5f9' };
  return (
    <Tag style={{ backgroundColor: config.bg, color: config.color, border: 'none', margin: 0 }}>
      {tier?.toUpperCase()}
    </Tag>
  );
}

export function PendingEmailsQueue({
  pendingEmails = [],
  onSend,
  onPreview,
  onCancel,
  onSendAll,
  loading = false,
}) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null });

  const handleSend = async (email) => {
    setActionLoading(email.id);
    try {
      await onSend?.(email);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (email) => {
    setActionLoading(`cancel-${email.id}`);
    try {
      await onCancel?.(email);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendAll = async () => {
    setConfirmModal({ open: false, type: null });
    setActionLoading('all');
    try {
      await onSendAll?.();
    } finally {
      setActionLoading(null);
    }
  };

  if (pendingEmails.length === 0) {
    return (
      <Card
        title={<Title level={5} style={{ margin: 0 }}>Pending Emails</Title>}
      >
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: 64,
            height: 64,
            backgroundColor: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <MailOutlined style={{ fontSize: 32, color: '#94a3b8' }} />
          </div>
          <Text type="secondary">No pending emails in queue</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 14, marginTop: 4 }}>
            Emails will appear here when scheduled for sending
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>Pending Emails</Title>}
      extra={
        <Button
          type="primary"
          size="small"
          icon={actionLoading === 'all' ? <LoadingOutlined spin /> : <SendOutlined />}
          onClick={() => setConfirmModal({ open: true, type: 'sendAll' })}
          disabled={loading || actionLoading}
        >
          Send All
        </Button>
      }
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {pendingEmails.length} email{pendingEmails.length > 1 ? 's' : ''} waiting to be sent
      </Text>

      <div style={{ maxHeight: 384, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pendingEmails.map((email) => (
          <div
            key={email.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid rgba(226, 232, 240, 0.7)',
              transition: 'all 0.2s',
            }}
          >
            {/* Status indicator */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ClockCircleOutlined style={{ fontSize: 20, color: '#d97706' }} />
            </div>

            {/* Email info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.lead_name || email.to_email}
                </Text>
                {email.tier && <TierBadge tier={email.tier} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b', marginTop: 4 }}>
                <MailOutlined style={{ fontSize: 14 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.template_name || 'initial_outreach'}
                </span>
                <span style={{ color: '#cbd5e1' }}>-</span>
                <span>Scheduled {formatRelativeTime(email.scheduled_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {/* Preview */}
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedEmail(email);
                  onPreview?.(email);
                }}
                title="Preview email"
                style={{ color: '#94a3b8' }}
              />

              {/* Send now */}
              <Button
                type="text"
                icon={actionLoading === email.id ? <LoadingOutlined spin /> : <SendOutlined />}
                onClick={() => handleSend(email)}
                disabled={actionLoading === email.id}
                title="Send now"
                style={{ color: '#94a3b8' }}
              />

              {/* Cancel */}
              <Button
                type="text"
                icon={actionLoading === `cancel-${email.id}` ? <LoadingOutlined spin /> : <DeleteOutlined />}
                onClick={() => handleCancel(email)}
                disabled={actionLoading === `cancel-${email.id}`}
                title="Cancel"
                style={{ color: '#94a3b8' }}
                danger
              />
            </div>
          </div>
        ))}
      </div>

      {/* Queue summary */}
      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid rgba(226, 232, 240, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b' }}>
          <span>{pendingEmails.length} pending</span>
          <span>-</span>
          <span>
            Next send: {pendingEmails[0]?.scheduled_at
              ? formatRelativeTime(pendingEmails[0].scheduled_at)
              : 'Now'}
          </span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<PauseCircleOutlined />}
          onClick={() => setConfirmModal({ open: true, type: 'pause' })}
        >
          Pause Queue
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModal.open}
        onCancel={() => setConfirmModal({ open: false, type: null })}
        title={confirmModal.type === 'sendAll' ? 'Send All Emails' : 'Pause Queue'}
        width={400}
        footer={null}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            backgroundColor: confirmModal.type === 'sendAll' ? '#e0e7ff' : '#fef3c7'
          }}>
            {confirmModal.type === 'sendAll' ? (
              <SendOutlined style={{ fontSize: 32, color: '#4f46e5' }} />
            ) : (
              <PauseCircleOutlined style={{ fontSize: 32, color: '#d97706' }} />
            )}
          </div>
          <Text style={{ color: '#475569', display: 'block', marginBottom: 24 }}>
            {confirmModal.type === 'sendAll'
              ? `Send all ${pendingEmails.length} pending emails now?`
              : 'Pause the email queue? Scheduled emails will not be sent until resumed.'}
          </Text>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              onClick={() => setConfirmModal({ open: false, type: null })}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type={confirmModal.type === 'sendAll' ? 'primary' : 'default'}
              onClick={confirmModal.type === 'sendAll' ? handleSendAll : () => setConfirmModal({ open: false, type: null })}
              loading={actionLoading === 'all'}
              style={{ flex: 1 }}
            >
              {confirmModal.type === 'sendAll' ? 'Send All' : 'Pause'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export default PendingEmailsQueue;
