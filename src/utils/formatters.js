// Date formatting
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

// Number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (num, decimals = 1) => {
  if (num === null || num === undefined) return '-';
  return `${num.toFixed(decimals)}%`;
};

export const formatScore = (score) => {
  if (score === null || score === undefined) return '-';
  return score.toFixed(1);
};

// String formatting
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatStatus = (status) => {
  if (!status) return '-';
  return status.split('_').map(capitalize).join(' ');
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

// Email masking
export const maskEmail = (email) => {
  if (!email) return '-';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 3
    ? local.slice(0, 2) + '***' + local.slice(-1)
    : local;
  return `${maskedLocal}@${domain}`;
};

// Template name formatting
export const formatTemplateName = (template) => {
  if (!template) return '-';
  return template.split('_').map(capitalize).join(' ');
};
