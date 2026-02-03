import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Select, Typography, Modal, Tag, Progress, Spin, Divider, Space, Row, Col, Timeline
} from 'antd';
import {
  ArrowLeftOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, EnvironmentOutlined,
  StarFilled, SendOutlined, LinkOutlined, FacebookOutlined, LinkedinOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useToast } from '../context/ToastContext';
import { leadsApi, outreachApi } from '../api';
import { TierBadge, StatusBadge } from '../components/common/Badge';
import { AIEmailPreviewModal, LeadAIAnalysis } from '../components/ai';
import { formatDate, formatDateTime, formatScore, formatNumber } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export function LeadDetail() {
  const { campaignId, leadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lead, setLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState({ open: false, preview: null });
  const [aiEmailModal, setAiEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadData, eventsData] = await Promise.all([
          leadsApi.get(campaignId, leadId),
          leadsApi.getEvents(campaignId, leadId),
        ]);
        setLead(leadData);
        setEvents(eventsData);
      } catch (error) {
        toast.error('Failed to load lead details');
        navigate(`/campaigns/${campaignId}`);
      }
      setLoading(false);
    };
    fetchData();
  }, [campaignId, leadId, navigate, toast]);

  const handlePreviewEmail = async () => {
    try {
      const preview = await outreachApi.preview(campaignId, {
        lead_id: parseInt(leadId),
        template_name: 'initial_outreach',
      });
      setEmailModal({ open: true, preview });
    } catch (error) {
      toast.error('Failed to preview email');
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await outreachApi.send(campaignId, {
        lead_id: parseInt(leadId),
        template_name: 'initial_outreach',
      });
      toast.success('Email sent successfully!');
      setEmailModal({ open: false, preview: null });
      const [leadData, eventsData] = await Promise.all([
        leadsApi.get(campaignId, leadId),
        leadsApi.getEvents(campaignId, leadId),
      ]);
      setLead(leadData);
      setEvents(eventsData);
    } catch (error) {
      toast.error('Failed to send email');
    }
    setSendingEmail(false);
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await leadsApi.update(campaignId, leadId, { status: newStatus });
      setLead(updated);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading lead details..." />
      </div>
    );
  }

  if (!lead) return null;

  const { contact_info, digital_signals, engagement_signals, icp_score, pain_points } = lead;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/campaigns/${campaignId}?tab=leads`)}
            style={{ marginTop: 4 }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Title level={3} style={{ margin: 0 }}>{lead.business_name}</Title>
              <TierBadge tier={lead.tier} />
              <StatusBadge status={lead.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b', marginTop: 4 }}>
              <Text type="secondary" style={{ textTransform: 'capitalize' }}>{lead.business_type}</Text>
              <span>-</span>
              <Space>
                <EnvironmentOutlined />
                <Text type="secondary">{lead.city}{lead.state && `, ${lead.state}`}</Text>
              </Space>
            </div>
          </div>
        </div>
        <Space>
          <Button icon={<MailOutlined />} onClick={handlePreviewEmail}>
            Preview Email
          </Button>
          <Select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            style={{ width: 160 }}
            options={[
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'responded', label: 'Responded' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'converted', label: 'Converted' },
              { value: 'lost', label: 'Lost' },
            ]}
          />
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column - Details */}
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Contact Info */}
            <Card title="Contact Information">
              <Row gutter={[16, 16]}>
                {contact_info?.primary_email && (
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: 8, backgroundColor: '#eef2ff', borderRadius: 8 }}>
                        <MailOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                        <div>
                          <a href={`mailto:${contact_info.primary_email}`} style={{ color: '#4f46e5' }}>
                            {contact_info.primary_email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
                {contact_info?.primary_phone && (
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: 8, backgroundColor: '#ecfdf5', borderRadius: 8 }}>
                        <PhoneOutlined style={{ fontSize: 20, color: '#059669' }} />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Phone</Text>
                        <div>
                          <a href={`tel:${contact_info.primary_phone}`} style={{ color: '#1e293b' }}>
                            {contact_info.primary_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
                {contact_info?.contact_name && (
                  <Col xs={24} sm={12}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Contact</Text>
                    <div style={{ color: '#1e293b' }}>{contact_info.contact_name}</div>
                    {contact_info.contact_title && (
                      <Text type="secondary" style={{ fontSize: 14 }}>{contact_info.contact_title}</Text>
                    )}
                  </Col>
                )}
              </Row>
            </Card>

            {/* Digital Signals */}
            <Card title="Digital Presence">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <SignalIndicator
                    label="Website"
                    active={digital_signals?.has_website}
                    icon={<GlobalOutlined />}
                    link={digital_signals?.website_url}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <SignalIndicator
                    label="Social Media"
                    active={digital_signals?.has_social_media}
                    icon={<FacebookOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <SignalIndicator
                    label="Online Booking"
                    active={digital_signals?.has_online_booking}
                    icon={<LinkOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <SignalIndicator
                    label="Digital Payments"
                    active={digital_signals?.has_digital_payments}
                    icon={<LinkOutlined />}
                  />
                </Col>
              </Row>
              {digital_signals?.social_media_urls && Object.keys(digital_signals.social_media_urls).length > 0 && (
                <>
                  <Divider />
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Social Links</Text>
                  <Space>
                    {digital_signals.social_media_urls.facebook && (
                      <a href={digital_signals.social_media_urls.facebook} target="_blank" rel="noopener noreferrer">
                        <Button
                          type="text"
                          icon={<FacebookOutlined />}
                          style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                        />
                      </a>
                    )}
                    {digital_signals.social_media_urls.linkedin && (
                      <a href={digital_signals.social_media_urls.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button
                          type="text"
                          icon={<LinkedinOutlined />}
                          style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                        />
                      </a>
                    )}
                  </Space>
                </>
              )}
            </Card>

            {/* Engagement */}
            {engagement_signals && (
              <Card title="Engagement Signals">
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{
                      textAlign: 'center',
                      padding: 16,
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: 30, fontWeight: 700, color: '#1e293b' }}>
                        {formatNumber(engagement_signals.review_count)}
                      </div>
                      <Text type="secondary">Reviews</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{
                      textAlign: 'center',
                      padding: 16,
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <StarFilled style={{ fontSize: 20, color: '#eab308' }} />
                        <span style={{ fontSize: 30, fontWeight: 700, color: '#1e293b' }}>
                          {engagement_signals.average_rating?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <Text type="secondary">Rating</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{
                      textAlign: 'center',
                      padding: 16,
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: 30, fontWeight: 700, color: '#1e293b' }}>
                        {formatNumber(engagement_signals.recent_review_count)}
                      </div>
                      <Text type="secondary">Recent Reviews</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card title="Activity Timeline">
              {events.length > 0 ? (
                <Timeline
                  items={events.map((event, index) => ({
                    key: index,
                    color: event.event_type.includes('replied') ? 'green' :
                           event.event_type.includes('opened') ? 'orange' : 'blue',
                    children: (
                      <div>
                        <Text strong style={{ textTransform: 'capitalize' }}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTime(event.created_at)}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <Text type="secondary">No activity yet</Text>
                </div>
              )}
            </Card>
          </div>
        </Col>

        {/* Right Column - Score */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ICP Score Card */}
            <Card title="ICP Score">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  marginBottom: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: 30, fontWeight: 700 }}>{formatScore(lead.total_score)}</span>
                </div>
                <div>
                  <Text type="secondary">out of 100</Text>
                </div>
              </div>

              {icp_score && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ScoreBar label="Firmographic" score={icp_score.firmographic_score} max={40} color="#4f46e5" />
                  <ScoreBar label="Digital Readiness" score={icp_score.digital_readiness_score} max={30} color="#3b82f6" />
                  <ScoreBar label="Engagement" score={icp_score.engagement_score} max={20} color="#10b981" />
                  <ScoreBar label="Pain Points" score={icp_score.pain_point_score} max={10} color="#f59e0b" />
                </div>
              )}

              {icp_score?.scoring_rationale && (
                <>
                  <Divider />
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Rationale</Text>
                  <Text type="secondary">{icp_score.scoring_rationale}</Text>
                </>
              )}
            </Card>

            {/* Pain Points */}
            {pain_points?.keywords_found?.length > 0 && (
              <Card title="Pain Points Detected">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pain_points.keywords_found.map((keyword, index) => (
                    <Tag key={index} color="error">{keyword}</Tag>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Analysis */}
            <LeadAIAnalysis
              campaignId={campaignId}
              leadId={leadId}
              leadName={lead.business_name}
            />

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button type="primary" icon={<MailOutlined />} onClick={handlePreviewEmail} block>
                  Template Email
                </Button>
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={() => setAiEmailModal(true)}
                  block
                  style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}
                >
                  AI Email Preview
                </Button>
                {contact_info?.primary_phone && (
                  <a href={`tel:${contact_info.primary_phone}`}>
                    <Button icon={<PhoneOutlined />} block>
                      Call
                    </Button>
                  </a>
                )}
                {digital_signals?.website_url && (
                  <a href={digital_signals.website_url} target="_blank" rel="noopener noreferrer">
                    <Button type="text" icon={<GlobalOutlined />} block>
                      Visit Website
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Email Preview Modal */}
      <Modal
        open={emailModal.open}
        onCancel={() => setEmailModal({ open: false, preview: null })}
        title="Email Preview"
        width={640}
        footer={null}
      >
        {emailModal.preview && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <Text type="secondary" strong style={{ fontSize: 12 }}>To</Text>
                <div style={{ color: '#1e293b' }}>{emailModal.preview.to_email}</div>
              </div>
              <div>
                <Text type="secondary" strong style={{ fontSize: 12 }}>Subject</Text>
                <div style={{ color: '#1e293b', fontWeight: 500 }}>{emailModal.preview.subject}</div>
              </div>
              <div>
                <Text type="secondary" strong style={{ fontSize: 12 }}>Body</Text>
                <div style={{
                  marginTop: 8,
                  padding: 16,
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  whiteSpace: 'pre-wrap',
                  color: '#475569',
                  fontSize: 14,
                  border: '1px solid #e2e8f0'
                }}>
                  {emailModal.preview.body}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                onClick={() => setEmailModal({ open: false, preview: null })}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSendEmail}
                loading={sendingEmail}
                icon={<SendOutlined />}
                style={{ flex: 1 }}
              >
                Send Email
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Email Preview Modal */}
      <AIEmailPreviewModal
        visible={aiEmailModal}
        onClose={() => setAiEmailModal(false)}
        campaignId={campaignId}
        lead={lead}
        onSend={async (emailData) => {
          try {
            await outreachApi.send(campaignId, {
              lead_id: emailData.leadId,
              subject: emailData.subject,
              body: emailData.body,
            });
            toast.success('Email sent successfully!');
            setAiEmailModal(false);
            const [leadData, eventsData] = await Promise.all([
              leadsApi.get(campaignId, leadId),
              leadsApi.getEvents(campaignId, leadId),
            ]);
            setLead(leadData);
            setEvents(eventsData);
          } catch (error) {
            toast.error('Failed to send email');
          }
        }}
      />
    </div>
  );
}

function SignalIndicator({ label, active, icon, link }) {
  const content = (
    <div style={{
      padding: 16,
      borderRadius: 12,
      border: `1px solid ${active ? '#a7f3d0' : '#e2e8f0'}`,
      backgroundColor: active ? '#ecfdf5' : '#f8fafc'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: active ? '#059669' : '#94a3b8' }}>{icon}</span>
        <Text strong style={{ fontSize: 14, color: active ? '#047857' : '#64748b' }}>
          {active ? 'Yes' : 'No'}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
    </div>
  );

  if (link && active) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        {content}
      </a>
    );
  }

  return content;
}

function ScoreBar({ label, score, max, color }) {
  const percentage = (score / max) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
        <Text type="secondary">{label}</Text>
        <Text strong>{score?.toFixed(1)}/{max}</Text>
      </div>
      <Progress
        percent={percentage}
        showInfo={false}
        strokeColor={color}
        trailColor="#e2e8f0"
        size="small"
      />
    </div>
  );
}

export default LeadDetail;
