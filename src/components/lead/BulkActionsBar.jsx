import { useState } from 'react';
import { Button, Modal, Space, Typography, Checkbox } from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  onBulkAction,
  loading = false,
}) {
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null });
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action) => {
    if (action === 'delete') {
      setConfirmModal({ open: true, action: 'delete' });
      return;
    }

    setActionLoading(action);
    try {
      await onBulkAction(action);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading('delete');
    try {
      await onBulkAction('delete');
    } finally {
      setActionLoading(null);
      setConfirmModal({ open: false, action: null });
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 16,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="text"
              icon={isAllSelected ? <CheckSquareOutlined style={{ color: '#fff' }} /> : <BorderOutlined style={{ color: '#fff' }} />}
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              style={{ color: '#fff' }}
            />
            <Text strong style={{ color: '#fff' }}>
              {selectedCount} of {totalCount} selected
            </Text>
          </div>

          <Button
            type="link"
            onClick={onDeselectAll}
            style={{ color: 'rgba(255,255,255,0.8)', padding: 0 }}
            icon={<CloseOutlined />}
          >
            Clear
          </Button>
        </div>

        <Space>
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={() => handleAction('email')}
            disabled={loading || actionLoading}
            loading={actionLoading === 'email'}
            style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Send Sequence
          </Button>

          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleAction('export')}
            disabled={loading || actionLoading}
            loading={actionLoading === 'export'}
            style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Export CSV
          </Button>

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleAction('delete')}
            disabled={loading || actionLoading}
            loading={actionLoading === 'delete'}
            style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Delete
          </Button>
        </Space>
      </div>

      <Modal
        open={confirmModal.open}
        onCancel={() => setConfirmModal({ open: false, action: null })}
        title="Delete Leads"
        width={400}
        centered
        footer={[
          <Button key="cancel" onClick={() => setConfirmModal({ open: false, action: null })}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={actionLoading === 'delete'}
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: 64,
              height: 64,
              backgroundColor: '#fff2f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <DeleteOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
          </div>
          <Text style={{ display: 'block', marginBottom: 8 }}>
            Are you sure you want to delete{' '}
            <Text strong>{selectedCount} lead{selectedCount > 1 ? 's' : ''}</Text>?
          </Text>
          <Text type="secondary">This action cannot be undone.</Text>
        </div>
      </Modal>
    </>
  );
}

export default BulkActionsBar;
