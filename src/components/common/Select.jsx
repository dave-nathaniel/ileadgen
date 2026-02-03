import { Select as AntSelect } from 'antd';

export function Select({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  value,
  onChange,
  disabled,
  ...props
}) {
  const antOptions = options.map((opt) => ({
    value: typeof opt === 'object' ? opt.value : opt,
    label: typeof opt === 'object' ? opt.label : opt,
  }));

  const handleChange = (val) => {
    if (onChange) {
      // Simulate native event for compatibility
      onChange({ target: { value: val } });
    }
  };

  const selectElement = (
    <AntSelect
      value={value || undefined}
      onChange={handleChange}
      options={antOptions}
      placeholder={placeholder}
      status={error ? 'error' : undefined}
      disabled={disabled}
      size="large"
      className={className}
      style={{ width: '100%' }}
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
        {selectElement}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{error}</div>
        )}
      </div>
    );
  }

  return selectElement;
}

export default Select;
