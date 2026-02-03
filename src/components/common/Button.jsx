import { Button as AntButton } from 'antd';

const variantMap = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  success: { type: 'primary', style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
  danger: { danger: true },
  ghost: { type: 'text' },
  outline: { type: 'default', ghost: true },
};

const sizeMap = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  style = {},
  ...props
}) {
  const variantProps = variantMap[variant] || variantMap.primary;
  const antSize = sizeMap[size] || 'middle';

  const iconElement = Icon ? <Icon size={16} /> : null;

  return (
    <AntButton
      {...variantProps}
      size={antSize}
      loading={loading}
      disabled={disabled}
      icon={iconPosition === 'left' ? iconElement : undefined}
      className={className}
      style={{ ...variantProps.style, ...style }}
      {...props}
    >
      {children}
      {iconPosition === 'right' && iconElement}
    </AntButton>
  );
}

export default Button;
