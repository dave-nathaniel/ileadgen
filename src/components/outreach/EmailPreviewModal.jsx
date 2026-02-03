import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Select, Typography, Tag, Spin, Alert } from 'antd';
import { SendOutlined, MailOutlined, BankOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { EMAIL_TEMPLATES } from '../../utils/constants';
import { outreachApi } from '../../api';

const { Text } = Typography;

export function EmailPreviewModal({
  isOpen,
  onClose,
  campaignId,
  lead,
  onSend,
  defaultTemplate = 'initial_outreach',
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreview = useCallback(async () => {
    if (!lead || !campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await outreachApi.preview(campaignId, {
        lead_id: lead.id,
        template_name: selectedTemplate,
      });
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load email preview');
      setPreview(null);
    }

    setLoading(false);
  }, [campaignId, lead, selectedTemplate]);

  // Fetch preview when template or lead changes
  useEffect(() => {
    if (isOpen && lead && campaignId) {
      fetchPreview();
    }
  }, [isOpen, lead, campaignId, fetchPreview]);

  const handleSend = async () => {
    setSending(true);
    setError(null);

    try {
      await outreachApi.send(campaignId, {
        lead_id: lead.id,
        template_name: selectedTemplate,
      });
      onSend?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send email');
    }

    setSending(false);
  };

  const handleClose = () => {
    setPreview(null);
    setError(null);
    setSelectedTemplate(defaultTemplate);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title="Email Preview"
      width={720}
      footer={null}
    >
      {/* Lead Info */}
      {lead && (
        <div style={{
          marginBottom: 16,
          padding: 16,
          backgroundColor: '#f8fafc',
          borderRadius: 12,
          border: '1px solid rgba(226, 232, 240, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            {lead.business_name?.charAt(0) || 'L'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BankOutlined style={{ color: '#94a3b8' }} />
              <Text strong style={{ color: '#1e293b' }}>{lead.business_name}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b', marginTop: 4 }}>
              <MailOutlined style={{ fontSize: 14 }} />
              <span>{lead.contact_info?.primary_email || 'No email'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8, color: '#334155' }}>
          Email Template
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            options={EMAIL_TEMPLATES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            style={{ flex: 1 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPreview}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />} />
        </div>
      ) : error ? (
        <Alert
          type="error"
          message={error}
          style={{ borderRadius: 12 }}
        />
      ) : preview ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* To */}
          <div>
            <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              To
            </Text>
            <Text style={{ color: '#1e293b' }}>{preview.to_email}</Text>
          </div>

          {/* Subject */}
          <div>
            <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Subject
            </Text>
            <Text strong style={{ color: '#1e293b' }}>{preview.subject}</Text>
          </div>

          {/* Body */}
          <div>
            <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Body
            </Text>
            <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, maxHeight: 256, overflowY: 'auto' }}>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: 14, fontFamily: 'inherit', margin: 0 }}>
                {preview.body}
              </pre>
            </div>
          </div>

          {/* Variable highlights */}
          {preview.variables && Object.keys(preview.variables).length > 0 && (
            <div>
              <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Personalization Variables
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(preview.variables).map(([key, val]) => (
                  <Tag
                    key={key}
                    color="purple"
                    style={{ margin: 0 }}
                  >
                    {key}: {val || '(empty)'}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
        <Button onClick={handleClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSend}
          loading={sending}
          disabled={!preview || !lead?.contact_info?.primary_email}
          icon={<SendOutlined />}
          style={{ flex: 1 }}
        >
          Send Email
        </Button>
      </div>
    </Modal>
  );
}

export default EmailPreviewModal;
