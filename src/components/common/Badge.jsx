import { Tag, Avatar } from 'antd';
import { TIER_COLORS, STATUS_COLORS, CAMPAIGN_STATUS_COLORS } from '../../utils/constants';
import { formatStatus } from '../../utils/formatters';

const variantColors = {
  default: 'default',
  primary: 'blue',
  success: 'green',
  warning: 'gold',
  danger: 'red',
  info: 'cyan',
};

export function Badge({ children, variant = 'default' }) {
  return (
    <Tag color={variantColors[variant] || 'default'}>
      {children}
    </Tag>
  );
}

const tierColorMap = {
  A: { color: '#52c41a', bg: '#f6ffed' },
  B: { color: '#1890ff', bg: '#e6f7ff' },
  C: { color: '#faad14', bg: '#fffbe6' },
  D: { color: '#8c8c8c', bg: '#f5f5f5' },
};

export function TierBadge({ tier }) {
  if (!tier) return null;

  const colors = tierColorMap[tier] || tierColorMap.D;

  return (
    <Avatar
      size={28}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 'bold',
        fontSize: 14,
      }}
    >
      {tier}
    </Avatar>
  );
}

const statusColorMap = {
  new: 'default',
  enriched: 'blue',
  scored: 'purple',
  contacted: 'gold',
  responded: 'green',
  qualified: 'cyan',
  converted: 'geekblue',
  lost: 'red',
};

const campaignStatusColorMap = {
  draft: 'default',
  collecting: 'blue',
  enriching: 'purple',
  scoring: 'magenta',
  ready: 'green',
  active: 'lime',
  paused: 'gold',
  completed: 'cyan',
  failed: 'red',
};

export function StatusBadge({ status, type = 'lead' }) {
  if (!status) return null;

  const colorMap = type === 'campaign' ? campaignStatusColorMap : statusColorMap;
  const color = colorMap[status] || 'default';

  return (
    <Tag color={color}>
      {formatStatus(status)}
    </Tag>
  );
}

export default Badge;
