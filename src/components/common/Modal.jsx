import { Modal as AntModal } from 'antd';

const sizeMap = {
  sm: 400,
  md: 520,
  lg: 720,
  xl: 900,
  full: 1200,
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) {
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={null}
      closable={showClose}
      width={sizeMap[size] || sizeMap.md}
      className={className}
      centered
      destroyOnClose
    >
      {children}
    </AntModal>
  );
}

export default Modal;
