import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CaretRightOutlined, TeamOutlined,
  MailOutlined, MessageOutlined, CheckCircleOutlined, BarChartOutlined, SettingOutlined,
  SendOutlined, EyeOutlined, ReloadOutlined, LoadingOutlined, UploadOutlined,
  UpOutlined, DownOutlined, DownloadOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import {
  Card, Button, Typography, Table, Modal, Spin, Empty, Row, Col, Progress, Space, Checkbox, Select, Tabs, Tooltip
} from 'antd';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { campaignsApi, leadsApi, pipelineApi, outreachApi } from '../api';
import { StatusBadge, TierBadge } from '../components/common/Badge';
import { LeadFilters } from '../components/lead/LeadFilters';
import { BulkActionsBar } from '../components/lead/BulkActionsBar';
import { BulkImportModal } from '../components/lead/BulkImportModal';
import { OutreachStatsCard } from '../components/outreach/OutreachStatsCard';
import { PendingEmailsQueue } from '../components/outreach/PendingEmailsQueue';
import { TemplateSelector } from '../components/outreach/TemplateSelector';
import { AIEmailPreviewModal, AIStatusIndicator } from '../components/ai';
import { formatNumber, formatScore, maskEmail } from '../utils/formatters';
import { POLLING_INTERVALS } from '../utils/constants';

const { Title, Text } = Typography;

export function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCampaign, removeCampaign } = useApp();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [runningPipeline, setRunningPipeline] = useState(false);

  // Lead filters
  const [leadFilters, setLeadFilters] = useState({
    tier: '',
    status: '',
    skip: 0,
    limit: 50,
  });

  // Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [emailPreviewModal, setEmailPreviewModal] = useState({ open: false, lead: null, preview: null });
  const [aiEmailPreviewModal, setAiEmailPreviewModal] = useState({ open: false, lead: null });
  const [deleting, setDeleting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch campaign data
  const fetchCampaign = useCallback(async () => {
    try {
      const [campaignData, statsData] = await Promise.all([
        campaignsApi.get(id),
        campaignsApi.getStats(id),
      ]);
      setCampaign(campaignData);
      setStats(statsData);
      updateCampaign(campaignData);
    } catch (error) {
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const params = { ...leadFilters };
      if (!params.tier) delete params.tier;
      if (!params.status) delete params.status;
      const data = await leadsApi.list(id, params);
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  }, [id, leadFilters]);

  // Fetch pipeline status
  const fetchPipelineStatus = useCallback(async () => {
    try {
      const status = await pipelineApi.getStatus(id);
      setPipelineStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to fetch pipeline status:', error);
      return null;
    }
  }, [id]);

  // Initial load - only run once when id changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [campaignData, statsData, pipelineStatusData] = await Promise.all([
          campaignsApi.get(id),
          campaignsApi.getStats(id),
          pipelineApi.getStatus(id).catch(() => null),
        ]);
        if (isMounted) {
          setCampaign(campaignData);
          setStats(statsData);
          setPipelineStatus(pipelineStatusData);
          updateCampaign(campaignData);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to load campaign');
          navigate('/campaigns');
        }
      }
    };
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch leads when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'leads' && !loading) {
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, leadFilters, loading]);

  // Poll pipeline status when running
  useEffect(() => {
    let interval;
    if (runningPipeline || (pipelineStatus?.status === 'PENDING' || pipelineStatus?.status === 'STARTED')) {
      interval = setInterval(async () => {
        try {
          const status = await pipelineApi.getStatus(id);
          setPipelineStatus(status);
          if (status?.status === 'SUCCESS' || status?.status === 'FAILURE') {
            setRunningPipeline(false);
            // Refresh campaign and leads data
            const [campaignData, statsData] = await Promise.all([
              campaignsApi.get(id),
              campaignsApi.getStats(id),
            ]);
            setCampaign(campaignData);
            setStats(statsData);
            if (status.status === 'SUCCESS') {
              toast.success('Pipeline completed successfully!');
            } else {
              toast.error('Pipeline failed');
            }
          }
        } catch (error) {
          console.error('Failed to poll pipeline status:', error);
        }
      }, POLLING_INTERVALS.pipelineStatus);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningPipeline, pipelineStatus?.status, id]);

  // Run pipeline
  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    try {
      await pipelineApi.run(id);
      toast.info('Pipeline started...');
      await fetchCampaign();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start pipeline');
      setRunningPipeline(false);
    }
  };

  // Delete campaign
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await campaignsApi.delete(id);
      removeCampaign(parseInt(id));
      toast.success('Campaign deleted');
      navigate('/campaigns');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
    setDeleting(false);
  };

  // Preview email
  const handlePreviewEmail = async (lead) => {
    try {
      const preview = await outreachApi.preview(id, {
        lead_id: lead.id,
        template_name: 'initial_outreach',
      });
      setEmailPreviewModal({ open: true, lead, preview });
    } catch (error) {
      toast.error('Failed to preview email');
    }
  };

  // Send email
  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await outreachApi.send(id, {
        lead_id: emailPreviewModal.lead.id,
        template_name: 'initial_outreach',
      });
      toast.success('Email sent successfully!');
      setEmailPreviewModal({ open: false, lead: null, preview: null });
      fetchLeads();
    } catch (error) {
      toast.error('Failed to send email');
    }
    setSendingEmail(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading campaign..." />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const isPipelineRunning = runningPipeline || pipelineStatus?.status === 'PENDING' || pipelineStatus?.status === 'STARTED';

  const tabItems = [
    { key: 'overview', label: <span><BarChartOutlined /> Overview</span> },
    { key: 'leads', label: <span><TeamOutlined /> Leads ({campaign.total_leads || 0})</span> },
    { key: 'outreach', label: <span><MailOutlined /> Outreach</span> },
    { key: 'settings', label: <span><SettingOutlined /> Settings</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/campaigns')}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={3} style={{ margin: 0, color: '#1e293b' }}>{campaign.name}</Title>
              <StatusBadge status={campaign.status} type="campaign" />
            </div>
            <Text type="secondary" style={{ textTransform: 'capitalize' }}>{campaign.industry}</Text>
          </div>
        </div>
        <Space>
          <AIStatusIndicator compact />
          <Link to={`/campaigns/${id}/edit`}>
            <Button icon={<EditOutlined />}>Edit</Button>
          </Link>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModal(true)}
          >
            Delete
          </Button>
        </Space>
      </div>

      {/* Pipeline Status Banner */}
      {isPipelineRunning && (
        <Card style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LoadingOutlined spin style={{ fontSize: 24, color: '#4f46e5' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#3730a3' }}>Pipeline Running</div>
              <div style={{ fontSize: 14, color: '#4f46e5' }}>
                {campaign.status === 'collecting' && 'Collecting leads from sources...'}
                {campaign.status === 'enriching' && 'Enriching lead data...'}
                {campaign.status === 'scoring' && 'Scoring leads against ICP...'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          campaign={campaign}
          stats={stats}
          onRunPipeline={handleRunPipeline}
          isPipelineRunning={isPipelineRunning}
        />
      )}

      {activeTab === 'leads' && (
        <LeadsTab
          campaignId={id}
          leads={leads}
          filters={leadFilters}
          setFilters={setLeadFilters}
          onPreviewEmail={handlePreviewEmail}
          onAiPreviewEmail={(lead) => setAiEmailPreviewModal({ open: true, lead })}
          onRefresh={fetchLeads}
          totalLeads={campaign.total_leads}
          toast={toast}
        />
      )}

      {activeTab === 'outreach' && (
        <OutreachTab campaignId={id} stats={stats} toast={toast} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab campaign={campaign} />
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        title="Delete Campaign"
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <DeleteOutlined style={{ fontSize: 32, color: '#dc2626' }} />
          </div>
          <p style={{ color: '#475569', marginBottom: 24 }}>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
          <Space style={{ width: '100%' }}>
            <Button onClick={() => setDeleteModal(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="primary" danger onClick={handleDelete} loading={deleting} style={{ flex: 1 }}>
              Delete
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Email Preview Modal */}
      <Modal
        open={emailPreviewModal.open}
        onCancel={() => setEmailPreviewModal({ open: false, lead: null, preview: null })}
        title="Email Preview"
        footer={null}
        width={700}
      >
        {emailPreviewModal.preview && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>To</label>
                <p style={{ color: '#1e293b', margin: 0 }}>{emailPreviewModal.preview.to_email}</p>
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Subject</label>
                <p style={{ color: '#1e293b', fontWeight: 500, margin: 0 }}>{emailPreviewModal.preview.subject}</p>
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Body</label>
                <div style={{ marginTop: 8, padding: 16, background: '#f8fafc', borderRadius: 12, whiteSpace: 'pre-wrap', color: '#334155', fontSize: 14, border: '1px solid #e2e8f0' }}>
                  {emailPreviewModal.preview.body}
                </div>
              </div>
            </div>
            <Space style={{ width: '100%' }}>
              <Button
                onClick={() => setEmailPreviewModal({ open: false, lead: null, preview: null })}
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
            </Space>
          </div>
        )}
      </Modal>

      {/* AI Email Preview Modal */}
      <AIEmailPreviewModal
        visible={aiEmailPreviewModal.open}
        onClose={() => setAiEmailPreviewModal({ open: false, lead: null })}
        campaignId={id}
        lead={aiEmailPreviewModal.lead}
        onSend={async (emailData) => {
          try {
            await outreachApi.send(id, {
              lead_id: emailData.leadId,
              subject: emailData.subject,
              body: emailData.body,
            });
            toast.success('Email sent successfully!');
            setAiEmailPreviewModal({ open: false, lead: null });
            fetchLeads();
          } catch (error) {
            toast.error('Failed to send email');
          }
        }}
      />
    </div>
  );
}

// Overview Tab
function OverviewTab({ campaign, stats, onRunPipeline, isPipelineRunning }) {
  const statCards = [
    { icon: <TeamOutlined />, value: formatNumber(stats?.total_leads || 0), label: 'Total Leads', color: '#4f46e5' },
    { icon: <MailOutlined />, value: formatNumber(stats?.leads_contacted || 0), label: 'Contacted', color: '#d97706' },
    { icon: <MessageOutlined />, value: formatNumber(stats?.leads_responded || 0), label: 'Responded', color: '#059669' },
    { icon: <CheckCircleOutlined />, value: formatNumber(stats?.leads_converted || 0), label: 'Converted', color: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <Row gutter={16}>
        {statCards.map((stat, i) => (
          <Col xs={12} lg={6} key={i}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24, color: stat.color }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                  <div style={{ fontSize: 14, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Actions & Distribution */}
      <Row gutter={24}>
        {/* Pipeline Actions */}
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 600 }}>Pipeline Actions</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Button
                type="primary"
                onClick={onRunPipeline}
                loading={isPipelineRunning}
                icon={<CaretRightOutlined />}
                block
                size="large"
              >
                {isPipelineRunning ? 'Pipeline Running...' : 'Run Full Pipeline'}
              </Button>
              <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', margin: 0 }}>
                Collect - Enrich - Score leads automatically
              </p>
            </div>
          </Card>
        </Col>

        {/* Tier Distribution */}
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 600 }}>Tier Distribution</span>}>
            {stats?.tier_distribution ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['A', 'B', 'C', 'D'].map((tier) => {
                  const count = stats.tier_distribution[tier] || 0;
                  const total = stats.total_leads || 1;
                  const percent = Math.round((count / total) * 100);
                  const colors = { A: '#059669', B: '#4f46e5', C: '#d97706', D: '#64748b' };
                  return (
                    <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TierBadge tier={tier} />
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={colors[tier]}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', width: 48, textAlign: 'right' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: 16, margin: 0 }}>No leads scored yet</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// Leads Tab
function LeadsTab({ campaignId, leads, filters, setFilters, onPreviewEmail, onAiPreviewEmail, onRefresh, totalLeads, toast }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'total_score', direction: 'desc' });
  const [bulkLoading, setBulkLoading] = useState(false);

  // Pagination
  const pageSize = filters.limit || 50;
  const currentPage = Math.floor((filters.skip || 0) / pageSize) + 1;

  const handlePageChange = (page, size) => {
    setFilters((f) => ({ ...f, skip: (page - 1) * size, limit: size }));
  };

  // Selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(leads.map((l) => l.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedLeads = [...leads].sort((a, b) => {
    const aVal = a[sortConfig.key] ?? 0;
    const bVal = b[sortConfig.key] ?? 0;
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return (aVal - bVal) * modifier;
  });

  // Bulk actions
  const handleBulkAction = async (action) => {
    const selectedLeadIds = Array.from(selectedIds);
    setBulkLoading(true);

    try {
      switch (action) {
        case 'export': {
          const selectedLeads = leads.filter((l) => selectedIds.has(l.id));
          const csvContent = [
            ['Business Name', 'Business Type', 'Email', 'City', 'State', 'Score', 'Tier', 'Status'].join(','),
            ...selectedLeads.map((l) =>
              [
                `"${l.business_name || ''}"`,
                `"${l.business_type || ''}"`,
                `"${l.contact_info?.primary_email || ''}"`,
                `"${l.city || ''}"`,
                `"${l.state || ''}"`,
                l.total_score || 0,
                l.tier || '',
                l.status || '',
              ].join(',')
            ),
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast?.success(`Exported ${selectedLeads.length} leads`);
          break;
        }

        case 'delete':
          await leadsApi.bulkDelete(campaignId, selectedLeadIds);
          toast?.success(`Deleted ${selectedLeadIds.length} leads`);
          deselectAll();
          onRefresh();
          break;

        case 'email':
          toast?.info('Email sequence started for selected leads');
          break;
      }
    } catch (err) {
      toast?.error(err.response?.data?.detail || `Failed to ${action} leads`);
    }

    setBulkLoading(false);
  };

  // Import
  const handleImport = async (importedLeads) => {
    const result = await leadsApi.import(campaignId, importedLeads);
    onRefresh();
    return result;
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedIds.size === leads.length && leads.length > 0}
          onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
        />
      ),
      key: 'select',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedIds.has(record.id)}
          onChange={() => toggleSelect(record.id)}
        />
      ),
    },
    {
      title: (
        <Button
          type="text"
          size="small"
          onClick={() => handleSort('business_name')}
          style={{ padding: 0, fontWeight: 600 }}
        >
          Business {sortConfig.key === 'business_name' && (sortConfig.direction === 'asc' ? <UpOutlined /> : <DownOutlined />)}
        </Button>
      ),
      dataIndex: 'business_name',
      key: 'business_name',
      render: (text, record) => (
        <div>
          <Link
            to={`/campaigns/${campaignId}/leads/${record.id}`}
            style={{ fontWeight: 500, color: '#1e293b' }}
          >
            {text}
          </Link>
          <div style={{ fontSize: 12, color: '#64748b' }}>{record.business_type}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <span style={{ color: '#475569' }}>
          {record.city}
          {record.state && <span style={{ color: '#94a3b8' }}>, {record.state}</span>}
        </span>
      ),
    },
    {
      title: (
        <Button
          type="text"
          size="small"
          onClick={() => handleSort('total_score')}
          style={{ padding: 0, fontWeight: 600 }}
        >
          Score {sortConfig.key === 'total_score' && (sortConfig.direction === 'asc' ? <UpOutlined /> : <DownOutlined />)}
        </Button>
      ),
      dataIndex: 'total_score',
      key: 'total_score',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600, color: '#334155' }}>{formatScore(val)}</span>,
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      align: 'center',
      render: (tier) => <TierBadge tier={tier} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <span style={{ fontSize: 14, color: '#64748b' }}>
          {maskEmail(record.contact_info?.primary_email)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Link to={`/campaigns/${campaignId}/leads/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Link>
          {record.contact_info?.primary_email && (
            <>
              <Tooltip title="Template Preview">
                <Button
                  type="text"
                  icon={<MailOutlined />}
                  size="small"
                  onClick={() => onPreviewEmail(record)}
                />
              </Tooltip>
              <Tooltip title="AI Email Preview">
                <Button
                  type="text"
                  icon={<ThunderboltOutlined style={{ color: '#8b5cf6' }} />}
                  size="small"
                  onClick={() => onAiPreviewEmail(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={leads.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        isAllSelected={selectedIds.size === leads.length && leads.length > 0}
        onBulkAction={handleBulkAction}
        loading={bulkLoading}
      />

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <LeadFilters
            filters={filters}
            onFilterChange={(updates) => setFilters((f) => ({ ...f, ...updates, skip: 0 }))}
            onReset={() => setFilters({ tier: '', status: '', skip: 0, limit: pageSize })}
            showAdvanced={showAdvancedFilters}
            onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setShowImportModal(true)}>
              Import CSV
            </Button>
          </Space>
        </div>
      </Card>

      {/* Leads Table */}
      <Card styles={{ body: { padding: 0 } }}>
        {sortedLeads.length > 0 ? (
          <Table
            dataSource={sortedLeads}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalLeads || leads.length,
              showSizeChanger: true,
              onChange: handlePageChange,
            }}
            size="middle"
            rowClassName={(record) => selectedIds.has(record.id) ? 'ant-table-row-selected' : ''}
          />
        ) : (
          <Empty
            image={<TeamOutlined style={{ fontSize: 48, color: '#94a3b8' }} />}
            description={
              <div>
                <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: 4 }}>No leads yet</div>
                <div style={{ color: '#64748b' }}>Run the pipeline to collect leads, or import from CSV.</div>
              </div>
            }
            style={{ padding: '64px 0' }}
          >
            <Button icon={<UploadOutlined />} onClick={() => setShowImportModal(true)}>
              Import CSV
            </Button>
          </Empty>
        )}
      </Card>

      {/* Import Modal */}
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        campaignId={campaignId}
      />
    </div>
  );
}

// Outreach Tab
function OutreachTab({ campaignId, stats, toast }) {
  const [selectedTemplate, setSelectedTemplate] = useState('initial_outreach');
  const [selectedTier, setSelectedTier] = useState('A');
  const [runningSequence, setRunningSequence] = useState(false);

  // Mock pending emails
  const [pendingEmails, setPendingEmails] = useState([]);

  const handleRunSequence = async () => {
    setRunningSequence(true);
    try {
      await outreachApi.runSequence(campaignId, {
        tier: selectedTier,
        template_name: selectedTemplate,
      });
      toast?.success(`Sequence started for Tier ${selectedTier} leads`);
    } catch (error) {
      toast?.error(error.response?.data?.detail || 'Failed to run sequence');
    }
    setRunningSequence(false);
  };

  const handleSendPendingEmail = async (email) => {
    try {
      await outreachApi.send(campaignId, {
        lead_id: email.lead_id,
        template_name: email.template_name,
      });
      setPendingEmails((prev) => prev.filter((e) => e.id !== email.id));
      toast?.success('Email sent!');
    } catch (error) {
      toast?.error('Failed to send email');
    }
  };

  const handleCancelPendingEmail = async (email) => {
    setPendingEmails((prev) => prev.filter((e) => e.id !== email.id));
    toast?.info('Email cancelled');
  };

  const tierColors = { A: '#059669', B: '#3b82f6', C: '#d97706' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Outreach Performance Stats */}
      <OutreachStatsCard stats={stats} />

      {/* Run Sequence Section */}
      <Row gutter={24}>
        {/* Sequence Runner */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Run Email Sequence</span>}
            extra={<Text type="secondary">Send templated emails to leads by tier</Text>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tier Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                  Target Tier
                </label>
                <Space>
                  {['A', 'B', 'C'].map((tier) => (
                    <Button
                      key={tier}
                      type={selectedTier === tier ? 'primary' : 'default'}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        background: selectedTier === tier ? tierColors[tier] : undefined,
                        borderColor: selectedTier === tier ? tierColors[tier] : undefined,
                      }}
                    >
                      Tier {tier}
                    </Button>
                  ))}
                </Space>
              </div>

              {/* Template Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                  Email Template
                </label>
                <TemplateSelector
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                  compact
                />
              </div>

              {/* Run Button */}
              <Button
                type="primary"
                onClick={handleRunSequence}
                loading={runningSequence}
                icon={<SendOutlined />}
                block
                size="large"
              >
                Run Sequence for Tier {selectedTier}
              </Button>

              <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: 0 }}>
                This will queue emails for all Tier {selectedTier} leads who haven't been contacted yet
              </p>
            </div>
          </Card>
        </Col>

        {/* Pending Emails Queue */}
        <Col xs={24} lg={12}>
          <PendingEmailsQueue
            pendingEmails={pendingEmails}
            onSend={handleSendPendingEmail}
            onCancel={handleCancelPendingEmail}
            onSendAll={async () => {
              for (const email of pendingEmails) {
                await handleSendPendingEmail(email);
              }
            }}
          />
        </Col>
      </Row>

      {/* Quick Stats Summary */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Campaign Summary</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 0 }}>
              {stats?.leads_contacted || 0} of {stats?.total_leads || 0} leads contacted
              ({stats?.total_leads > 0 ? Math.round(((stats?.leads_contacted || 0) / stats.total_leads) * 100) : 0}%)
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>
              {stats?.leads_responded || 0}
            </div>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>responses</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab({ campaign }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card title={<span style={{ fontWeight: 600 }}>Campaign Configuration</span>}>
        <Row gutter={[24, 24]}>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Industry</label>
            <p style={{ color: '#1e293b', textTransform: 'capitalize', margin: 0 }}>{campaign.industry}</p>
          </Col>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Product Type</label>
            <p style={{ color: '#1e293b', textTransform: 'capitalize', margin: 0 }}>{campaign.product_type}</p>
          </Col>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Target Countries</label>
            <p style={{ color: '#1e293b', margin: 0 }}>
              {campaign.target_market?.geography?.countries?.join(', ') || '-'}
            </p>
          </Col>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Business Types</label>
            <p style={{ color: '#1e293b', margin: 0 }}>
              {campaign.target_market?.business_profile?.types?.join(', ') || '-'}
            </p>
          </Col>
        </Row>
      </Card>

      <Card title={<span style={{ fontWeight: 600 }}>Personalization</span>}>
        <Row gutter={[24, 24]}>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Company Name</label>
            <p style={{ color: '#1e293b', margin: 0 }}>{campaign.personalization?.company_name || '-'}</p>
          </Col>
          <Col xs={12}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Product Name</label>
            <p style={{ color: '#1e293b', margin: 0 }}>{campaign.personalization?.product_name || '-'}</p>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default CampaignDetail;
