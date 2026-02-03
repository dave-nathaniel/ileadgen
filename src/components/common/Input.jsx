import { Input as AntInput, Form } from 'antd';

const { TextArea } = AntInput;

export function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) {
  const prefix = Icon ? <Icon size={18} style={{ color: '#94a3b8' }} /> : undefined;

  const inputElement = type === 'password' ? (
    <AntInput.Password
      prefix={prefix}
      status={error ? 'error' : undefined}
      size="large"
      className={className}
      {...props}
    />
  ) : (
    <AntInput
      type={type}
      prefix={prefix}
      status={error ? 'error' : undefined}
      size="large"
      className={className}
      {...props}
    />
  );

  if (label) {
    return (
      <div style={{ width: '100%' }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: '#334155',
          marginBottom: 8
        }}>
          {label}
        </label>
        {inputElement}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{error}</div>
        )}
      </div>
    );
  }

  return inputElement;
}

export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  const textareaElement = (
    <TextArea
      rows={rows}
      status={error ? 'error' : undefined}
      className={className}
      {...props}
    />
  );

  if (label) {
    return (
      <div style={{ width: '100%' }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: '#334155',
          marginBottom: 8
        }}>
          {label}
        </label>
        {textareaElement}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{error}</div>
        )}
      </div>
    );
  }

  return textareaElement;
}

export default Input;
