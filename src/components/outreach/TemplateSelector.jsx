import { useState } from 'react';
import { Modal, Select, Button, Typography, Tag, Alert } from 'antd';
import { MailOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { EMAIL_TEMPLATES } from '../../utils/constants';

const { Text, Title } = Typography;

const TEMPLATE_DETAILS = {
  initial_outreach: {
    description: 'First contact email introducing your product/service',
    bestFor: 'Initial outreach to new leads',
    timing: 'Day 0',
  },
  follow_up_value: {
    description: 'Follow-up emphasizing key value propositions',
    bestFor: 'Leads who haven\'t responded to initial outreach',
    timing: 'Day 3-5',
  },
  case_study: {
    description: 'Share a relevant case study or success story',
    bestFor: 'High-tier leads who need social proof',
    timing: 'Day 7-10',
  },
  soft_close: {
    description: 'Gentle closing email with clear CTA',
    bestFor: 'Final attempt before archiving',
    timing: 'Day 12-14',
  },
  meeting_request: {
    description: 'Direct meeting or call request',
    bestFor: 'Hot leads showing interest',
    timing: 'After engagement',
  },
  re_engagement: {
    description: 'Re-engage with cold leads',
    bestFor: 'Leads who went quiet after initial interest',
    timing: 'After 30+ days',
  },
  thank_you: {
    description: 'Thank you and next steps after meeting',
    bestFor: 'Post-meeting follow-up',
    timing: 'Same day as meeting',
  },
};

export function TemplateSelector({
  value,
  onChange,
  showDetails = true,
  compact = false,
}) {
  const [previewModal, setPreviewModal] = useState({ open: false, template: null });

  if (compact) {
    return (
      <Select
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        options={EMAIL_TEMPLATES.map((t) => ({
          value: t.value,
          label: t.label,
        }))}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {EMAIL_TEMPLATES.map((template) => {
        const details = TEMPLATE_DETAILS[template.value] || {};
        const isSelected = value === template.value;

        return (
          <div
            key={template.value}
            onClick={() => onChange(template.value)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`,
              backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Selection indicator */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#6366f1' : '#cbd5e1'}`,
                  backgroundColor: isSelected ? '#6366f1' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {isSelected && <CheckOutlined style={{ fontSize: 12, color: '#ffffff' }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOutlined style={{ fontSize: 16, color: isSelected ? '#4f46e5' : '#94a3b8' }} />
                  <Text strong style={{ color: isSelected ? '#4338ca' : '#1e293b' }}>
                    {template.label}
                  </Text>
                  {details.timing && (
                    <Tag style={{ fontSize: 12, margin: 0 }}>{details.timing}</Tag>
                  )}
                </div>

                {showDetails && details.description && (
                  <Text type="secondary" style={{ display: 'block', fontSize: 14, marginTop: 4, marginLeft: 24 }}>
                    {details.description}
                  </Text>
                )}

                {showDetails && details.bestFor && (
                  <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, marginLeft: 24, color: '#94a3b8' }}>
                    Best for: {details.bestFor}
                  </Text>
                )}
              </div>

              {/* Preview button */}
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModal({ open: true, template: template.value });
                }}
                title="Preview template"
                style={{ color: '#94a3b8' }}
              />
            </div>
          </div>
        );
      })}

      {/* Template Preview Modal */}
      <Modal
        open={previewModal.open}
        onCancel={() => setPreviewModal({ open: false, template: null })}
        title="Template Preview"
        width={720}
        footer={null}
      >
        {previewModal.template && (
          <TemplatePreviewContent
            templateName={previewModal.template}
            onClose={() => setPreviewModal({ open: false, template: null })}
          />
        )}
      </Modal>
    </div>
  );
}

function TemplatePreviewContent({ templateName, onClose }) {
  const template = EMAIL_TEMPLATES.find((t) => t.value === templateName);
  const details = TEMPLATE_DETAILS[templateName] || {};

  // Sample preview content
  const samplePreview = {
    initial_outreach: {
      subject: 'Quick question about {{business_name}}',
      body: `Hi {{contact_name}},

I noticed {{business_name}} and thought you might be interested in how we help similar businesses improve their operations.

{{company_name}} specializes in {{value_proposition}}.

Would you be open to a quick 15-minute call this week?

Best regards,
{{sender_name}}`,
    },
    follow_up_value: {
      subject: 'Following up - {{value_proposition}}',
      body: `Hi {{contact_name}},

I wanted to follow up on my previous email.

Our clients typically see significant improvements in:
- Efficiency
- Cost reduction
- Customer satisfaction

Would you like to learn more about how we can help {{business_name}}?

Best regards,
{{sender_name}}`,
    },
    // Add more templates as needed
  };

  const preview = samplePreview[templateName] || {
    subject: `[${template?.label || templateName}] Subject Line`,
    body: `Template content for ${template?.label || templateName}.\n\nVariables like {{business_name}}, {{contact_name}}, etc. will be replaced with actual values.`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Template Info */}
      <div style={{ padding: 16, backgroundColor: '#eef2ff', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.6)' }}>
        <Title level={5} style={{ margin: 0, color: '#3730a3' }}>{template?.label}</Title>
        {details.description && (
          <Text style={{ color: '#4f46e5', display: 'block', marginTop: 4 }}>{details.description}</Text>
        )}
      </div>

      {/* Sample Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Subject
          </Text>
          <Text strong style={{ color: '#1e293b' }}>{preview.subject}</Text>
        </div>

        <div>
          <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Body
          </Text>
          <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid rgba(226, 232, 240, 0.7)' }}>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: 14, fontFamily: 'inherit', margin: 0 }}>
              {preview.body}
            </pre>
          </div>
        </div>
      </div>

      {/* Variables Info */}
      <Alert
        type="warning"
        message={
          <span>
            Variables like <code style={{ backgroundColor: '#fef3c7', padding: '0 4px', borderRadius: 4 }}>{'{{business_name}}'}</code> will be automatically replaced with actual lead data.
          </span>
        }
        style={{ borderRadius: 8 }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

export default TemplateSelector;
