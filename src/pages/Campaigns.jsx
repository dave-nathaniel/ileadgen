import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusOutlined, AimOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Table, Typography, Button, Input, Select, Modal, Empty, Space, Spin } from 'antd';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { campaignsApi } from '../api';
import { StatusBadge } from '../components/common/Badge';
import { formatDate, formatNumber } from '../utils/formatters';

const { Title, Text } = Typography;

export function Campaigns() {
  const { campaigns, campaignsLoading, removeCampaign, fetchCampaigns } = useApp();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, campaign: null });
  const [deleting, setDeleting] = useState(false);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async () => {
    if (!deleteModal.campaign) return;
    setDeleting(true);
    try {
      await campaignsApi.delete(deleteModal.campaign.id);
      removeCampaign(deleteModal.campaign.id);
      toast.success('Campaign deleted successfully');
      setDeleteModal({ open: false, campaign: null });
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
    setDeleting(false);
  };

  if (campaignsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading campaigns..." />
      </div>
    );
  }

  const columns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/campaigns/${record.id}`} style={{ fontWeight: 600, color: '#1e293b' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (text) => <span style={{ color: '#475569', textTransform: 'capitalize' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} type="campaign" />,
    },
    {
      title: 'Leads',
      dataIndex: 'total_leads',
      key: 'total_leads',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 500, color: '#334155' }}>{formatNumber(val)}</span>,
    },
    {
      title: 'Contacted',
      dataIndex: 'leads_contacted',
      key: 'leads_contacted',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 500, color: '#d97706' }}>{formatNumber(val)}</span>,
    },
    {
      title: 'Responded',
      dataIndex: 'leads_responded',
      key: 'leads_responded',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 500, color: '#059669' }}>{formatNumber(val)}</span>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <span style={{ fontSize: 14, color: '#64748b' }}>{formatDate(date)}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Link to={`/campaigns/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Link>
          <Link to={`/campaigns/${record.id}/edit`}>
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => setDeleteModal({ open: true, campaign: record })}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Campaigns</Title>
          <Text type="secondary">Manage your lead generation campaigns</Text>
        </div>
        <Link to="/campaigns/new">
          <Button type="primary" icon={<PlusOutlined />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search campaigns..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
            allowClear
          />
          <Select
            value={statusFilter || undefined}
            onChange={(val) => setStatusFilter(val || '')}
            placeholder="All Statuses"
            style={{ width: 180 }}
            allowClear
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'collecting', label: 'Collecting' },
              { value: 'ready', label: 'Ready' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card bodyStyle={{ padding: 0 }}>
        {filteredCampaigns.length > 0 ? (
          <Table
            dataSource={filteredCampaigns}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
          />
        ) : (
          <Empty
            image={<AimOutlined style={{ fontSize: 48, color: '#94a3b8' }} />}
            description={
              <div>
                <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: 4 }}>No campaigns found</div>
                <div style={{ color: '#64748b' }}>
                  {searchQuery || statusFilter
                    ? 'Try adjusting your filters'
                    : 'Create your first campaign to start generating leads.'}
                </div>
              </div>
            }
            style={{ padding: '64px 0' }}
          >
            {!searchQuery && !statusFilter && (
              <Link to="/campaigns/new">
                <Button type="primary" size="small" icon={<PlusOutlined />}>
                  Create Campaign
                </Button>
              </Link>
            )}
          </Empty>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, campaign: null })}
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
            Are you sure you want to delete <strong>{deleteModal.campaign?.name}</strong>?
            This will also delete all leads associated with this campaign.
          </p>
          <Space style={{ width: '100%' }}>
            <Button
              onClick={() => setDeleteModal({ open: false, campaign: null })}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleDelete}
              loading={deleting}
              style={{ flex: 1 }}
            >
              Delete
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}

export default Campaigns;
