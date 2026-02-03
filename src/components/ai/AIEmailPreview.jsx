import React, { useState, useCallback } from 'react';
import {
  Modal,
  Button,
  Card,
  Radio,
  Select,
  Spin,
  Typography,
  Space,
  Divider,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  ThunderboltOutlined,
  EditOutlined,
  RobotOutlined,
  EyeOutlined,
  SendOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { aiApi } from '../../api';

const { Text, Paragraph, Title } = Typography;
const { Option } = Select;

const EMAIL_TEMPLATES = [
  { value: 'initial_outreach', label: 'Initial Outreach' },
  { value: 'follow_up_value', label: 'Follow-up (Value)' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'soft_close', label: 'Soft Close' },
];

/**
 * AI Email Preview Modal Component
 * Allows previewing AI-generated or AI-enhanced emails for a lead
 */
export function AIEmailPreviewModal({
  visible,
  onClose,
  campaignId,
  lead,
  onSend,
}) {
  const [aiMode, setAiMode] = useState('enhance');
  const [templateType, setTemplateType] = useState('initial_outreach');
  const [sequenceStep, setSequenceStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const fetchPreview = useCallback(async () => {
    if (!campaignId || !lead?.id) return;

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.previewEmail(campaignId, {
        lead_id: lead.id,
        template_type: templateType,
        ai_mode: aiMode,
        sequence_step: sequenceStep,
        total_steps: 4,
      });
      setPreview(result);
    } catch (err) {
      console.error('Error fetching email preview:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available. Check your API configuration.');
      } else {
        setError('Failed to generate email preview');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId, lead?.id, templateType, aiMode, sequenceStep]);

  const handleCopyToClipboard = () => {
    if (preview) {
      const text = `Subject: ${preview.subject}\n\n${preview.body}`;
      navigator.clipboard.writeText(text);
      message.success('Email copied to clipboard');
    }
  };

  const handleSend = () => {
    if (preview && onSend) {
      onSend({
        leadId: lead.id,
        subject: preview.subject,
        body: preview.body,
        templateType,
        aiMode,
      });
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Email Preview</span>
          {lead && <Tag>{lead.business_name}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        preview && (
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyToClipboard}>
            Copy
          </Button>
        ),
        preview && onSend && (
          <Button key="send" type="primary" icon={<SendOutlined />} onClick={handleSend}>
            Send Email
          </Button>
        ),
      ]}
    >
      {/* Configuration Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              AI Mode
            </Text>
            <Radio.Group value={aiMode} onChange={(e) => setAiMode(e.target.value)}>
              <Radio.Button value="enhance">
                <EditOutlined /> Enhance Template
              </Radio.Button>
              <Radio.Button value="generate">
                <RobotOutlined /> Generate New
              </Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Email Template
              </Text>
              <Select
                value={templateType}
                onChange={setTemplateType}
                style={{ width: '100%' }}
              >
                {EMAIL_TEMPLATES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ width: 120 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Step
              </Text>
              <Select value={sequenceStep} onChange={setSequenceStep} style={{ width: '100%' }}>
                {[1, 2, 3, 4].map((step) => (
                  <Option key={step} value={step}>
                    Step {step}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={fetchPreview}
            loading={loading}
            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
          >
            Generate Preview
          </Button>
        </Space>
      </Card>

      {/* Preview Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="AI is generating your email..." />
        </div>
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : preview ? (
        <Card>
          {/* Mode indicator */}
          <div style={{ marginBottom: 16 }}>
            <Tag color={preview.ai_mode === 'generate' ? 'purple' : 'blue'}>
              {preview.ai_mode === 'generate' ? 'AI Generated' : 'AI Enhanced'}
            </Tag>
            {preview.changes_made?.length > 0 && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Changes: {preview.changes_made.join(', ')}
              </Text>
            )}
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Subject
            </Text>
            <Title level={5} style={{ margin: 0 }}>
              {preview.subject}
            </Title>
          </div>

          <Divider />

          {/* Body */}
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Body
            </Text>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                lineHeight: 1.6,
              }}
            >
              {preview.body}
            </div>
          </div>

          {/* CTA */}
          {preview.cta && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                Call to Action
              </Text>
              <Tag color="green">{preview.cta}</Tag>
            </div>
          )}
        </Card>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            backgroundColor: '#f9fafb',
            borderRadius: 8,
          }}
        >
          <RobotOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
          <Paragraph type="secondary">
            Configure your email settings above and click "Generate Preview" to see the AI-powered
            email.
          </Paragraph>
        </div>
      )}
    </Modal>
  );
}

/**
 * AI Email Preview Button Component
 * A button that opens the AI email preview modal
 */
export function AIEmailPreviewButton({ campaignId, lead, onSend, disabled = false }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Button
        icon={<ThunderboltOutlined />}
        onClick={() => setModalVisible(true)}
        disabled={disabled || !lead}
        style={{
          color: '#8b5cf6',
          borderColor: '#8b5cf6',
        }}
      >
        AI Preview
      </Button>

      <AIEmailPreviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        campaignId={campaignId}
        lead={lead}
        onSend={onSend}
      />
    </>
  );
}

/**
 * Lead AI Analysis Component
 * Shows AI-generated analysis of a lead
 */
export function LeadAIAnalysis({ campaignId, leadId, leadName }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = useCallback(async () => {
    if (!campaignId || !leadId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.analyzeLead(campaignId, leadId, {
        include_pain_points: true,
        include_rationale: true,
      });
      setAnalysis(result);
    } catch (err) {
      console.error('Error fetching lead analysis:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available');
      } else {
        setError('Failed to analyze lead');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId, leadId]);

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Analysis</span>
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<RobotOutlined />}
          onClick={fetchAnalysis}
          loading={loading}
        >
          Analyze
        </Button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is analyzing this lead..." />
        </div>
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : analysis ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Scoring Rationale */}
          {analysis.scoring_rationale && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Scoring Rationale
              </Text>
              <Paragraph style={{ margin: 0 }}>{analysis.scoring_rationale}</Paragraph>
            </div>
          )}

          {/* Pain Point Analysis */}
          {analysis.pain_point_analysis && (
            <div>
              <Divider style={{ margin: '12px 0' }} />
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Pain Points Identified
              </Text>
              {analysis.pain_point_analysis.pain_points?.map((point, index) => (
                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Tag color="blue">{point.category}</Tag>
                      <Tag
                        color={
                          point.relevance === 'high'
                            ? 'green'
                            : point.relevance === 'medium'
                            ? 'orange'
                            : 'default'
                        }
                      >
                        {point.relevance}
                      </Tag>
                    </div>
                    <Text>{point.description}</Text>
                    {point.indicators?.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Evidence: {point.indicators.join(', ')}
                      </Text>
                    )}
                  </Space>
                </Card>
              ))}
              {analysis.pain_point_analysis.analysis_summary && (
                <Text type="secondary">{analysis.pain_point_analysis.analysis_summary}</Text>
              )}
            </div>
          )}
        </Space>
      ) : (
        <Text type="secondary">
          Click "Analyze" to get AI-powered insights about this lead's pain points and fit.
        </Text>
      )}
    </Card>
  );
}
