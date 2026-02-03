import { useState, useRef } from 'react';
import { Modal, Upload, Select, Button, Table, Alert, Space, Typography, Tag, Result, Spin } from 'antd';
import {
  FileExcelOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Dragger } = Upload;

const REQUIRED_FIELDS = ['business_name'];

const AVAILABLE_FIELDS = [
  { key: 'business_name', label: 'Business Name', required: true },
  { key: 'business_type', label: 'Business Type', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'address', label: 'Address', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'state', label: 'State/Region', required: false },
  { key: 'country', label: 'Country', required: false },
  { key: 'contact_name', label: 'Contact Name', required: false },
  { key: 'contact_title', label: 'Contact Title', required: false },
  { key: 'employees', label: 'Employee Count', required: false },
  { key: 'revenue', label: 'Revenue', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

export function BulkImportModal({ isOpen, onClose, onImport, campaignId }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [fieldMapping, setFieldMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setCsvData({ headers: [], rows: [] });
    setFieldMapping({});
    setImporting(false);
    setImportResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map((line) => parseRow(line));

    return { headers, rows };
  };

  const handleFileUpload = (info) => {
    const selectedFile = info.file;
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return false;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = parseCSV(text);

        if (parsed.headers.length === 0) {
          setError('CSV file appears to be empty');
          return;
        }

        setCsvData(parsed);

        const autoMapping = {};
        parsed.headers.forEach((header) => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const matchedField = AVAILABLE_FIELDS.find((f) => {
            const normalizedKey = f.key.toLowerCase();
            const normalizedLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return (
              normalizedHeader.includes(normalizedKey) ||
              normalizedKey.includes(normalizedHeader) ||
              normalizedHeader.includes(normalizedLabel)
            );
          });
          if (matchedField) {
            autoMapping[header] = matchedField.key;
          }
        });

        setFieldMapping(autoMapping);
        setStep(2);
      } catch (err) {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(selectedFile);
    return false;
  };

  const isMappingValid = () => {
    const mappedFields = Object.values(fieldMapping);
    return REQUIRED_FIELDS.every((field) => mappedFields.includes(field));
  };

  const getMappedData = () => {
    return csvData.rows.map((row) => {
      const lead = {};
      csvData.headers.forEach((header, index) => {
        const mappedField = fieldMapping[header];
        if (mappedField && row[index]) {
          lead[mappedField] = row[index];
        }
      });
      return lead;
    }).filter((lead) => lead.business_name);
  };

  const handleImport = async () => {
    setImporting(true);
    setStep(4);

    try {
      const leads = getMappedData();
      const result = await onImport(leads);
      setImportResult({
        success: true,
        imported: result.imported || leads.length,
        failed: result.failed || 0,
      });
    } catch (err) {
      setImportResult({
        success: false,
        error: err.message || 'Import failed',
      });
    }

    setImporting(false);
  };

  const getTitle = () => {
    if (step === 1) return 'Import Leads from CSV';
    if (step === 2) return 'Map Columns';
    if (step === 3) return 'Preview Import';
    return 'Importing...';
  };

  const renderStep1 = () => (
    <div>
      <Dragger
        accept=".csv"
        beforeUpload={handleFileUpload}
        showUploadList={false}
        style={{ padding: 24, borderRadius: 12 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#4f46e5' }} />
        </p>
        <p className="ant-upload-text">Drop your CSV file here or click to browse</p>
        <p className="ant-upload-hint">Supports .csv files up to 10MB</p>
      </Dragger>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />
      )}

      <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Expected columns:</Text>
        <Space wrap>
          {AVAILABLE_FIELDS.slice(0, 6).map((field) => (
            <Tag key={field.key} color={field.required ? 'blue' : 'default'}>
              {field.label}{field.required && ' *'}
            </Tag>
          ))}
          <Text type="secondary">...and more</Text>
        </Space>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <Alert
        type="success"
        style={{ marginBottom: 16 }}
        message={
          <Space>
            <FileExcelOutlined />
            <span>{file?.name}</span>
            <Text type="secondary">({csvData.rows.length} rows, {csvData.headers.length} columns)</Text>
          </Space>
        }
        action={
          <Button type="text" size="small" icon={<CloseOutlined />} onClick={resetState} />
        }
      />

      <Text strong style={{ display: 'block', marginBottom: 12 }}>Map CSV columns to lead fields:</Text>

      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {csvData.headers.map((header) => (
          <div key={header} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
              {header}
            </div>
            <ArrowRightOutlined style={{ color: '#94a3b8' }} />
            <Select
              value={fieldMapping[header] || undefined}
              onChange={(val) => setFieldMapping({ ...fieldMapping, [header]: val || '' })}
              placeholder="Skip this column"
              allowClear
              style={{ flex: 1 }}
              options={AVAILABLE_FIELDS.map((f) => ({
                value: f.key,
                label: f.label + (f.required ? ' *' : ''),
              }))}
            />
          </div>
        ))}
      </div>

      {!isMappingValid() && (
        <Alert
          type="warning"
          message='Please map "Business Name" column (required)'
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={resetState}>Back</Button>
        <Button type="primary" onClick={() => setStep(3)} disabled={!isMappingValid()}>
          Preview Import
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const previewData = getMappedData().slice(0, 5);
    const totalRows = getMappedData().length;
    const mappedFields = AVAILABLE_FIELDS.filter((f) => Object.values(fieldMapping).includes(f.key));

    const columns = mappedFields.map((field) => ({
      title: field.label,
      dataIndex: field.key,
      key: field.key,
      ellipsis: true,
    }));

    return (
      <div>
        <Alert
          type="info"
          message={`Ready to import ${totalRows} leads`}
          description={`Preview of first ${Math.min(5, totalRows)} rows below`}
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={previewData.map((row, i) => ({ ...row, key: i }))}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={() => setStep(2)}>Back</Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={handleImport}>
            Import {totalRows} Leads
          </Button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      {importing ? (
        <Spin size="large" tip="Importing leads..." />
      ) : importResult?.success ? (
        <Result
          status="success"
          title="Import Complete!"
          subTitle={`Successfully imported ${importResult.imported} leads${importResult.failed > 0 ? ` (${importResult.failed} failed)` : ''}`}
          extra={<Button type="primary" onClick={handleClose}>Done</Button>}
        />
      ) : (
        <Result
          status="error"
          title="Import Failed"
          subTitle={importResult?.error || 'An error occurred'}
          extra={[
            <Button key="retry" onClick={resetState}>Try Again</Button>,
            <Button key="close" onClick={handleClose}>Close</Button>,
          ]}
        />
      )}
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={getTitle()}
      width={720}
      footer={null}
      destroyOnClose
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Modal>
  );
}

export default BulkImportModal;
