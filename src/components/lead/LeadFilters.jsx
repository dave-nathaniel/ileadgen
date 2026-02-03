import { useState } from 'react';
import { Input, Select, Button, Row, Col, Card, InputNumber, Typography } from 'antd';
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function LeadFilters({
  filters,
  onFilterChange,
  onReset,
  showAdvanced = false,
  onToggleAdvanced,
}) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearchSubmit = () => {
    onFilterChange({ search: searchQuery });
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'skip' && key !== 'limit'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Primary Filters Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Search */}
        <Input
          placeholder="Search leads..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearchSubmit}
          style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />

        {/* Tier Filter */}
        <Select
          value={filters.tier || undefined}
          onChange={(val) => onFilterChange({ tier: val || '' })}
          placeholder="All Tiers"
          allowClear
          style={{ width: 120 }}
          options={[
            { value: 'A', label: 'Tier A' },
            { value: 'B', label: 'Tier B' },
            { value: 'C', label: 'Tier C' },
            { value: 'D', label: 'Tier D' },
          ]}
        />

        {/* Status Filter */}
        <Select
          value={filters.status || undefined}
          onChange={(val) => onFilterChange({ status: val || '' })}
          placeholder="All Statuses"
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 'new', label: 'New' },
            { value: 'enriched', label: 'Enriched' },
            { value: 'scored', label: 'Scored' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'responded', label: 'Responded' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'converted', label: 'Converted' },
          ]}
        />

        {/* Advanced Toggle */}
        {onToggleAdvanced && (
          <Button
            type={showAdvanced ? 'default' : 'text'}
            icon={<FilterOutlined />}
            onClick={onToggleAdvanced}
          >
            Advanced
          </Button>
        )}

        {/* Reset Filters */}
        {activeFiltersCount > 0 && (
          <Button type="text" icon={<CloseOutlined />} onClick={onReset}>
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card size="small" style={{ backgroundColor: '#f8fafc' }}>
          <Row gutter={[16, 16]}>
            {/* Score Range */}
            <Col xs={24} sm={12} lg={6}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Score Range
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InputNumber
                  value={filters.minScore || undefined}
                  onChange={(val) => onFilterChange({ minScore: val || '' })}
                  placeholder="Min"
                  min={0}
                  max={100}
                  style={{ flex: 1 }}
                />
                <Text type="secondary">-</Text>
                <InputNumber
                  value={filters.maxScore || undefined}
                  onChange={(val) => onFilterChange({ maxScore: val || '' })}
                  placeholder="Max"
                  min={0}
                  max={100}
                  style={{ flex: 1 }}
                />
              </div>
            </Col>

            {/* City Filter */}
            <Col xs={24} sm={12} lg={6}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                City
              </Text>
              <Input
                value={filters.city || ''}
                onChange={(e) => onFilterChange({ city: e.target.value })}
                placeholder="Filter by city"
              />
            </Col>

            {/* Has Email */}
            <Col xs={24} sm={12} lg={6}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Has Email
              </Text>
              <Select
                value={filters.hasEmail || undefined}
                onChange={(val) => onFilterChange({ hasEmail: val || '' })}
                placeholder="Any"
                allowClear
                style={{ width: '100%' }}
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
            </Col>

            {/* Has Website */}
            <Col xs={24} sm={12} lg={6}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Has Website
              </Text>
              <Select
                value={filters.hasWebsite || undefined}
                onChange={(val) => onFilterChange({ hasWebsite: val || '' })}
                placeholder="Any"
                allowClear
                style={{ width: '100%' }}
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}

export default LeadFilters;
