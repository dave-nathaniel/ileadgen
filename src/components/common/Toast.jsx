import { useEffect } from 'react';
import { Alert, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const typeMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function Toast({ id, type = 'info', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <Alert
      message={message}
      type={typeMap[type] || 'info'}
      showIcon
      closable
      onClose={() => onClose(id)}
      style={{
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
        animation: 'slideIn 0.3s ease-out',
      }}
    />
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 1050,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 380,
    }}>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

export default Toast;
