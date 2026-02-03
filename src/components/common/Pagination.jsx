import { Pagination as AntPagination, Select, Typography } from 'antd';

const { Text } = Typography;

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  showInfo = true,
  className = '',
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
      className={className}
    >
      {showInfo && totalItems > 0 && (
        <Text type="secondary">
          Showing <Text strong>{startItem}</Text> to{' '}
          <Text strong>{endItem}</Text> of{' '}
          <Text strong>{totalItems}</Text> results
        </Text>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showPageSize && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary">Show</Text>
            <Select
              value={pageSize}
              onChange={onPageSizeChange}
              size="small"
              style={{ width: 80 }}
              options={pageSizeOptions.map((size) => ({ value: size, label: size }))}
            />
          </div>
        )}

        {totalPages > 1 && (
          <AntPagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
            showQuickJumper={false}
            size="small"
          />
        )}
      </div>
    </div>
  );
}

export default Pagination;
