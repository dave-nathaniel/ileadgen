import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RightOutlined, LeftOutlined, CheckOutlined, ThunderboltOutlined, BulbOutlined,
  EnvironmentOutlined, DeleteOutlined, PlusOutlined, CloseOutlined, SyncOutlined,
  LoadingOutlined, CodeOutlined, CopyOutlined, DownloadOutlined, DatabaseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  Card, Button, Input, Typography, Steps, Slider, Checkbox, Select, Space, Modal, Row, Col, Spin
} from 'antd';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { campaignsApi, aiApi } from '../api';
import { ChipSelector, ListInput } from '../components/common/ChipSelector';
import { INDUSTRIES, COUNTRY_REGIONS, DEFAULT_ICP_WEIGHTS, DEFAULT_TIER_THRESHOLDS, EMAIL_TEMPLATES } from '../utils/constants';
import {
  AITargetProfileSuggestions,
  AIKeywordSuggestionsWizard,
  AISearchQuerySuggestions,
  AIValuePropSuggestionsWizard,
} from '../components/ai';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Simple YAML formatter for config preview
function toYaml(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;

    const yamlKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      yaml += `${spaces}${yamlKey}:\n`;
      value.forEach((item) => {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n`;
          yaml += toYaml(item, indent + 2).replace(/^/gm, '  ');
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${spaces}${yamlKey}:\n`;
      yaml += toYaml(value, indent + 1);
    } else {
      yaml += `${spaces}${yamlKey}: ${value}\n`;
    }
  }

  return yaml;
}

function configToYaml(config) {
  const yamlConfig = {
    campaign: {
      name: config.name,
      description: config.description,
      industry: config.industry,
      product_type: config.productType,
    },
    company: {
      name: config.companyName,
      product: config.productName,
    },
    target_market: {
      geography: {
        countries: config.countries,
        regions: config.regions,
        cities: config.cities,
        urban_preference: config.urbanPreference,
      },
      business_profile: {
        types: config.businessTypes,
        size_metric: config.sizeMetric,
        size_range: config.sizeRange,
      },
    },
    icp_scoring: {
      weights: {
        firmographic: config.weights.firmographic,
        digital_readiness: config.weights.digital_readiness,
        engagement: config.weights.engagement,
        pain_points: config.weights.pain_points,
      },
      tier_thresholds: config.tierThresholds,
      pain_points: config.painPointCategories,
    },
    data_sources: {
      google_maps: {
        enabled: config.gmapsEnabled,
        queries: config.gmapsQueries,
      },
      csv_import: {
        enabled: config.csvEnabled,
      },
    },
    outreach: {
      sender_name: config.senderName,
      sender_email: config.senderEmail,
      send_mode: config.sendMode,
      daily_limit: config.dailyLimit,
      value_propositions: config.valuePropositions,
      sequences: config.sequences,
    },
  };

  return toYaml(yamlConfig);
}

const STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'location', label: 'Location' },
  { id: 'targets', label: 'Targets' },
  { id: 'painPoints', label: 'Pain Pts' },
  { id: 'scoring', label: 'Scoring' },
  { id: 'sources', label: 'Sources' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'sequences', label: 'Sequences' },
];

const INDUSTRY_PRESETS = {
  healthcare: {
    label: 'Healthcare / MedTech',
    productType: 'software',
    industry: 'healthcare',
    businessTypes: ['hospital', 'clinic', 'diagnostic center', 'pharmacy'],
    sizeMetric: 'bed_capacity',
    sizeRange: [20, 200],
    painPoints: [
      { category: 'records', keywords: ['lost records', 'paper-based', 'no backup'] },
      { category: 'efficiency', keywords: ['wait times', 'long queue', 'scheduling'] },
    ],
  },
  technology: {
    label: 'SaaS / Technology',
    productType: 'software',
    industry: 'technology',
    businessTypes: ['startup', 'software company', 'tech company', 'digital agency'],
    sizeMetric: 'employees',
    sizeRange: [10, 200],
    painPoints: [
      { category: 'efficiency', keywords: ['manual process', 'time-consuming'] },
      { category: 'scale', keywords: ['growing', 'scaling'] },
    ],
  },
  retail: {
    label: 'Retail / POS',
    productType: 'software',
    industry: 'retail',
    businessTypes: ['retail store', 'supermarket', 'boutique'],
    sizeMetric: 'locations',
    sizeRange: [1, 50],
    painPoints: [
      { category: 'inventory', keywords: ['out of stock', 'inventory issues'] },
    ],
  },
  consulting: {
    label: 'Business Consulting',
    productType: 'consultancy',
    industry: 'general',
    businessTypes: ['manufacturing company', 'logistics company', 'trading company'],
    sizeMetric: 'employees',
    sizeRange: [20, 500],
    painPoints: [
      { category: 'manual_processes', keywords: ['manual', 'paper', 'outdated'] },
    ],
  },
};

const BUSINESS_TYPES = {
  software: ['hospital', 'clinic', 'startup', 'software company', 'tech company', 'pharmacy', 'school'],
  consultancy: ['manufacturing company', 'logistics company', 'retail store', 'real estate agency', 'law firm', 'hotel'],
};

const initialConfig = {
  productType: '',
  industry: '',
  name: '',
  description: '',
  companyName: '',
  productName: '',
  countries: [],
  regions: [],
  cities: [],
  urbanPreference: 'urban_and_semi_urban',
  businessTypes: [],
  sizeMetric: 'employees',
  sizeRange: [10, 200],
  painPointCategories: [],
  weights: { ...DEFAULT_ICP_WEIGHTS },
  tierThresholds: { ...DEFAULT_TIER_THRESHOLDS },
  gmapsEnabled: true,
  gmapsQueries: [],
  csvEnabled: true,
  senderName: '',
  senderEmail: '',
  sendMode: 'draft',
  dailyLimit: 50,
  valuePropositions: [],
  sequences: {
    a_tier: [
      { template: 'initial_outreach', delay_days: 0 },
      { template: 'follow_up_value', delay_days: 3 },
      { template: 'case_study', delay_days: 7 },
      { template: 'soft_close', delay_days: 14 },
    ],
    b_tier: [
      { template: 'initial_outreach', delay_days: 0 },
      { template: 'follow_up_value', delay_days: 5 },
      { template: 'soft_close', delay_days: 12 },
    ],
    c_tier: [
      { template: 'initial_outreach', delay_days: 0 },
      { template: 'soft_close', delay_days: 10 },
    ],
  },
};

export function CampaignCreate() {
  const navigate = useNavigate();
  const { addCampaign } = useApp();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [showYamlPreview, setShowYamlPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(configToYaml(config));
      setCopied(true);
      toast.success('Config copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadYaml = () => {
    const yaml = configToYaml(config);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'campaign'}-config.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Config downloaded');
  };

  const update = (updates) => setConfig((prev) => ({ ...prev, ...updates }));

  const applyPreset = (key) => {
    const preset = INDUSTRY_PRESETS[key];
    if (preset) {
      update({
        productType: preset.productType,
        industry: preset.industry,
        businessTypes: preset.businessTypes,
        sizeMetric: preset.sizeMetric,
        sizeRange: preset.sizeRange,
        painPointCategories: preset.painPoints,
      });
    }
  };

  // Auto-generate queries when business types change
  useEffect(() => {
    if (step === 6 && config.gmapsEnabled && config.businessTypes.length > 0 && config.gmapsQueries.length === 0) {
      generateQueries();
    }
  }, [step, config.gmapsEnabled, config.businessTypes.length]);

  // Auto-generate pain points
  useEffect(() => {
    if (step === 4 && config.businessTypes.length > 0 && config.painPointCategories.length === 0) {
      generatePainPoints();
    }
  }, [step, config.businessTypes.length]);

  const generateQueries = () => {
    setGenerating((p) => ({ ...p, queries: true }));
    setTimeout(() => {
      const types = config.businessTypes.slice(0, 3);
      const queries = types.flatMap((t) => [
        `${t} in {region}`,
        `best ${t} near {city}`,
      ]);
      if (config.industry) {
        queries.push(`${config.industry} services in {region}`);
      }
      update({ gmapsQueries: queries.slice(0, 5) });
      setGenerating((p) => ({ ...p, queries: false }));
    }, 500);
  };

  const generatePainPoints = () => {
    setGenerating((p) => ({ ...p, painPoints: true }));
    setTimeout(() => {
      const painPointsMap = {
        healthcare: [
          { category: 'patient_records', keywords: ['lost records', 'missing files', 'paper-based'] },
          { category: 'wait_times', keywords: ['long queue', 'delayed appointments', 'scheduling issues'] },
          { category: 'billing', keywords: ['billing errors', 'insurance claims', 'payment confusion'] },
        ],
        technology: [
          { category: 'efficiency', keywords: ['manual process', 'time-consuming', 'repetitive tasks'] },
          { category: 'integration', keywords: ['disconnected systems', 'data silos', 'no API'] },
          { category: 'scalability', keywords: ['cant scale', 'performance issues', 'growing pains'] },
        ],
        retail: [
          { category: 'inventory', keywords: ['out of stock', 'overstocking', 'inventory errors'] },
          { category: 'checkout', keywords: ['slow checkout', 'payment failures', 'long lines'] },
        ],
        general: [
          { category: 'manual_processes', keywords: ['manual', 'paper-based', 'outdated systems'] },
          { category: 'disorganization', keywords: ['disorganized', 'lost information', 'mistakes'] },
        ],
      };
      const industry = config.industry || 'general';
      update({ painPointCategories: painPointsMap[industry] || painPointsMap.general });
      setGenerating((p) => ({ ...p, painPoints: false }));
    }, 500);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!config.productType;
      case 1: return !!config.name;
      case 2: return config.countries.length > 0;
      case 3: return config.businessTypes.length > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: config.name,
        description: config.description,
        industry: config.industry,
        product_type: config.productType,
        target_market: {
          geography: {
            countries: config.countries,
            regions: config.regions,
            cities: config.cities,
            urban_preference: config.urbanPreference,
          },
          business_profile: {
            types: config.businessTypes,
            size_indicators: {
              metric: config.sizeMetric,
              ideal_range: config.sizeRange,
              minimum: Math.max(1, config.sizeRange[0] - 5),
            },
          },
        },
        icp_scoring: {
          weights: {
            firmographic: config.weights.firmographic / 100,
            digital_readiness: config.weights.digital_readiness / 100,
            engagement: config.weights.engagement / 100,
            pain_points: config.weights.pain_points / 100,
          },
          pain_point_keywords: config.painPointCategories.map((pp) => ({
            category: pp.category,
            keywords: pp.keywords,
            relevance: 'high',
          })),
          tier_thresholds: config.tierThresholds,
        },
        data_sources: {
          google_maps: {
            enabled: config.gmapsEnabled,
            search_queries: config.gmapsQueries,
            max_results_per_query: 20,
          },
          csv_import: { enabled: config.csvEnabled },
        },
        outreach_config: {
          email: {
            send_mode: config.sendMode,
            daily_limit: config.dailyLimit,
            sequences: config.sequences,
          },
        },
        personalization: {
          company_name: config.companyName,
          product_name: config.productName,
          value_propositions: config.valuePropositions,
          sender_signature: `Best regards,\n${config.senderName}`,
        },
      };

      const campaign = await campaignsApi.create(payload);
      addCampaign(campaign);
      toast.success('Campaign created successfully!');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepType config={config} update={update} applyPreset={applyPreset} />;
      case 1:
        return <StepCampaign config={config} update={update} />;
      case 2:
        return <StepLocation config={config} update={update} />;
      case 3:
        return <StepTargets config={config} update={update} />;
      case 4:
        return <StepPainPoints config={config} update={update} generating={generating.painPoints} onRegenerate={generatePainPoints} />;
      case 5:
        return <StepScoring config={config} update={update} />;
      case 6:
        return <StepSources config={config} update={update} generating={generating.queries} onRegenerate={generateQueries} />;
      case 7:
        return <StepOutreach config={config} update={update} />;
      case 8:
        return <StepSequences config={config} update={update} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Create Campaign</Title>
        <Text type="secondary">Set up your lead generation campaign</Text>
      </div>

      <Card>
        {/* Step Indicator */}
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 32 }}
          items={STEPS.map((s, i) => ({
            title: s.label,
            status: i < step ? 'finish' : i === step ? 'process' : 'wait',
          }))}
          onChange={(i) => i < step && setStep(i)}
        />

        {/* Step Content */}
        <div style={{ minHeight: 420, padding: '16px 0' }}>{renderStep()}</div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, marginTop: 24, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            icon={<LeftOutlined />}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next <RightOutlined />
            </Button>
          ) : (
            <Space>
              <Button
                onClick={() => setShowYamlPreview(true)}
                icon={<CodeOutlined />}
              >
                Preview Config
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckOutlined />}
                style={{ background: '#059669' }}
              >
                Create Campaign
              </Button>
            </Space>
          )}
        </div>
      </Card>

      {/* YAML Config Preview Modal */}
      <Modal
        open={showYamlPreview}
        onCancel={() => setShowYamlPreview(false)}
        title="Campaign Configuration Preview"
        width={700}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">YAML Configuration</Text>
            <Space>
              <Button
                size="small"
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyYaml}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleDownloadYaml}
              >
                Download
              </Button>
            </Space>
          </div>
          <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 12, fontSize: 12, overflow: 'auto', maxHeight: 384, fontFamily: 'monospace' }}>
            {configToYaml(config)}
          </pre>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={() => setShowYamlPreview(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Step 1: Product Type
function StepType({ config, update, applyPreset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>What are you selling?</Title>
        <Text type="secondary">Choose your product type</Text>
      </div>

      <Row gutter={16}>
        {[
          { key: 'software', icon: <ThunderboltOutlined />, title: 'Software / SaaS', desc: 'Apps, platforms, digital tools', gradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)' },
          { key: 'consultancy', icon: <BulbOutlined />, title: 'Consultancy', desc: 'Services, advisory', gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)' },
        ].map((opt) => (
          <Col xs={24} md={12} key={opt.key}>
            <Card
              hoverable
              onClick={() => update({ productType: opt.key })}
              style={{
                border: config.productType === opt.key ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                background: config.productType === opt.key ? '#eef2ff' : '#fff',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: opt.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  fontSize: 24,
                  color: '#fff',
                }}
              >
                {opt.icon}
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{opt.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{opt.desc}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ background: '#f8fafc' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Quick Start Presets</div>
        <Row gutter={[8, 8]}>
          {Object.entries(INDUSTRY_PRESETS).map(([key, p]) => (
            <Col xs={24} md={12} key={key}>
              <Button
                block
                onClick={() => applyPreset(key)}
                style={{ textAlign: 'left' }}
              >
                {p.label}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}

// Step 2: Campaign Details
function StepCampaign({ config, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Campaign Details</Title>
        <Text type="secondary">Tell us about your campaign</Text>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Campaign Name *</label>
        <Input
          value={config.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g., Q1 Hospital Outreach"
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Description</label>
        <TextArea
          value={config.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Brief description of this campaign..."
          rows={3}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Company</label>
          <Input
            value={config.companyName}
            onChange={(e) => update({ companyName: e.target.value })}
            placeholder="Acme Inc"
          />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Product</label>
          <Input
            value={config.productName}
            onChange={(e) => update({ productName: e.target.value })}
            placeholder="EHR Platform"
          />
        </Col>
      </Row>
    </div>
  );
}

// Step 3: Location
function StepLocation({ config, update }) {
  const availableRegions = config.countries.flatMap((c) => COUNTRY_REGIONS[c] || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Target Geography</Title>
        <Text type="secondary">Where are your ideal customers?</Text>
      </div>

      <ChipSelector
        label="Countries *"
        options={Object.keys(COUNTRY_REGIONS)}
        selected={config.countries}
        onChange={(v) => update({ countries: v, regions: [] })}
        allowCustom
        placeholder="Add country..."
      />

      {config.countries.length > 0 && (
        <ChipSelector
          label="Regions"
          options={availableRegions}
          selected={config.regions}
          onChange={(v) => update({ regions: v })}
          allowCustom
          placeholder="Add region..."
        />
      )}

      <ListInput
        label="Cities (optional)"
        items={config.cities}
        onChange={(v) => update({ cities: v })}
        placeholder="Add city..."
      />
    </div>
  );
}

// Step 4: Targets
function StepTargets({ config, update }) {
  const businessTypeOptions = BUSINESS_TYPES[config.productType] || BUSINESS_TYPES.software;

  // Build context for AI suggestions
  const aiContext = {
    name: config.name,
    description: config.description,
    product_type: config.productType,
    company_name: config.companyName,
    product_name: config.productName,
    industry: config.industry,
    business_types: config.businessTypes,
    geography: {
      countries: config.countries,
      regions: config.regions,
      cities: config.cities,
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Target Businesses</Title>
        <Text type="secondary">Define your ideal customer profile</Text>
      </div>

      {/* AI Target Profile Suggestions */}
      {config.name && (
        <AITargetProfileSuggestions
          name={config.name}
          description={config.description}
          productType={config.productType}
          companyName={config.companyName}
          productName={config.productName}
          currentIndustry={config.industry}
          currentBusinessTypes={config.businessTypes}
          onSelectIndustry={(ind) => update({ industry: ind })}
          onSelectBusinessTypes={(types) => update({ businessTypes: types })}
          onSelectSizeMetric={(metric) => update({ sizeMetric: metric })}
          onSelectSizeRange={(range) => update({ sizeRange: range })}
          autoFetch={true}
        />
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Target Industry</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INDUSTRIES.map((ind) => (
            <Button
              key={ind}
              type={config.industry === ind ? 'primary' : 'default'}
              onClick={() => update({ industry: ind })}
              style={{ textTransform: 'capitalize' }}
            >
              {ind}
            </Button>
          ))}
        </div>
      </div>

      <ChipSelector
        label="Business Types *"
        options={businessTypeOptions}
        selected={config.businessTypes}
        onChange={(v) => update({ businessTypes: v })}
        allowCustom
        placeholder="Add type..."
      />

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Size Metric</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['employees', 'revenue', 'bed_capacity', 'locations'].map((m) => (
            <Button
              key={m}
              type={config.sizeMetric === m ? 'primary' : 'default'}
              onClick={() => update({ sizeMetric: m })}
              style={{ textTransform: 'capitalize' }}
            >
              {m.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
          Ideal {config.sizeMetric.replace(/_/g, ' ')} Range
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            type="number"
            value={config.sizeRange[0]}
            onChange={(e) => update({ sizeRange: [parseInt(e.target.value) || 0, config.sizeRange[1]] })}
            style={{ width: 96, textAlign: 'center' }}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <Input
            type="number"
            value={config.sizeRange[1]}
            onChange={(e) => update({ sizeRange: [config.sizeRange[0], parseInt(e.target.value) || 0] })}
            style={{ width: 96, textAlign: 'center' }}
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Pain Points
function StepPainPoints({ config, update, generating, onRegenerate }) {
  const updatePainPoint = (index, field, value) => {
    const updated = [...config.painPointCategories];
    updated[index] = { ...updated[index], [field]: value };
    update({ painPointCategories: updated });
  };

  const removePainPoint = (index) => {
    update({ painPointCategories: config.painPointCategories.filter((_, i) => i !== index) });
  };

  const addPainPoint = () => {
    update({ painPointCategories: [...config.painPointCategories, { category: '', keywords: [] }] });
  };

  // Extract existing keywords for AI component
  const existingKeywords = config.painPointCategories.flatMap((pp) => pp.keywords || []);

  // Build context for AI suggestions
  const aiContext = {
    name: config.name,
    description: config.description,
    product_type: config.productType,
    company_name: config.companyName,
    product_name: config.productName,
    industry: config.industry,
    business_types: config.businessTypes,
    geography: {
      countries: config.countries,
      regions: config.regions,
      cities: config.cities,
    },
  };

  // Handle adding keywords from AI suggestions
  const handleAddKeywords = (keywords) => {
    // Group keywords into categories (or add to a new "AI Suggested" category)
    const newCategory = {
      category: 'ai_suggested',
      keywords: keywords,
    };
    update({ painPointCategories: [...config.painPointCategories, newCategory] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Pain Points</Title>
        <Text type="secondary">What problems do you solve?</Text>
      </div>

      {/* AI Keyword Suggestions */}
      {(config.industry || config.businessTypes.length > 0) && (
        <AIKeywordSuggestionsWizard
          context={aiContext}
          existingKeywords={existingKeywords}
          onAddKeywords={handleAddKeywords}
          autoFetch={config.painPointCategories.length === 0}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Pain Point Categories</span>
        <Button
          type="link"
          size="small"
          onClick={onRegenerate}
          disabled={generating}
          icon={generating ? <LoadingOutlined spin /> : <SyncOutlined />}
        >
          Regenerate (Basic)
        </Button>
      </div>

      {generating ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
          <Spin />
          <div style={{ marginTop: 8 }}>Generating pain points...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {config.painPointCategories.map((pp, i) => (
            <Card key={i} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Input
                  value={pp.category}
                  onChange={(e) => updatePainPoint(i, 'category', e.target.value)}
                  placeholder="Category name"
                  bordered={false}
                  style={{ fontWeight: 700, color: '#1e293b', textTransform: 'capitalize', flex: 1 }}
                />
                <Button type="text" danger icon={<CloseOutlined />} onClick={() => removePainPoint(i)} size="small" />
              </div>
              <Input
                value={(pp.keywords || []).join(', ')}
                onChange={(e) => updatePainPoint(i, 'keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))}
                placeholder="keyword1, keyword2, keyword3"
                style={{ background: '#f8fafc' }}
              />
            </Card>
          ))}
        </div>
      )}

      <Button
        type="dashed"
        onClick={addPainPoint}
        icon={<PlusOutlined />}
        block
      >
        Add Pain Point Category
      </Button>
    </div>
  );
}

// Step 6: Scoring
function StepScoring({ config, update }) {
  const total = Object.values(config.weights).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Scoring Weights</Title>
        <Text type="secondary">How should leads be prioritized?</Text>
      </div>

      <Card style={{ background: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'firmographic', label: 'Firmographic' },
            { key: 'digital_readiness', label: 'Digital Readiness' },
            { key: 'engagement', label: 'Engagement' },
            { key: 'pain_points', label: 'Pain Points' },
          ].map((item) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 128, fontSize: 14, fontWeight: 600, color: '#334155' }}>{item.label}</span>
              <Slider
                style={{ flex: 1 }}
                min={0}
                max={100}
                value={config.weights[item.key]}
                onChange={(val) => update({ weights: { ...config.weights, [item.key]: val } })}
              />
              <span style={{ width: 48, textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>{config.weights[item.key]}%</span>
            </div>
          ))}
          <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: total === 100 ? '#059669' : '#d97706' }}>
            Total: {total}%
          </div>
        </div>
      </Card>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 12 }}>Tier Thresholds</label>
        <Row gutter={12}>
          {[
            { t: 'A', label: 'Hot' },
            { t: 'B', label: 'Warm' },
            { t: 'C', label: 'Nurture' },
          ].map(({ t, label }) => (
            <Col xs={8} key={t}>
              <Card style={{ background: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>{t}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{label}</div>
                <Input
                  type="number"
                  value={config.tierThresholds[t]}
                  onChange={(e) => update({ tierThresholds: { ...config.tierThresholds, [t]: parseInt(e.target.value) || 0 } })}
                  style={{ width: 64, textAlign: 'center' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

// Step 7: Data Sources
function StepSources({ config, update, generating, onRegenerate }) {
  const updateQuery = (index, value) => {
    const updated = [...config.gmapsQueries];
    updated[index] = value;
    update({ gmapsQueries: updated });
  };

  const removeQuery = (index) => {
    update({ gmapsQueries: config.gmapsQueries.filter((_, i) => i !== index) });
  };

  const addQuery = () => {
    update({ gmapsQueries: [...config.gmapsQueries, ''] });
  };

  // Build context for AI suggestions
  const aiContext = {
    name: config.name,
    description: config.description,
    product_type: config.productType,
    company_name: config.companyName,
    product_name: config.productName,
    industry: config.industry,
    business_types: config.businessTypes,
    geography: {
      countries: config.countries,
      regions: config.regions,
      cities: config.cities,
    },
  };

  // Handle adding queries from AI suggestions
  const handleAddQueries = (queries) => {
    const newQueries = queries.filter((q) => !config.gmapsQueries.includes(q));
    update({ gmapsQueries: [...config.gmapsQueries, ...newQueries] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Data Sources</Title>
        <Text type="secondary">Where should we find leads?</Text>
      </div>

      <Card
        hoverable
        style={{ cursor: 'pointer' }}
        bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16 }}
        onClick={() => update({ gmapsEnabled: !config.gmapsEnabled })}
      >
        <Checkbox checked={config.gmapsEnabled} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>Google Maps Scraping</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Discover leads via Maps</div>
        </div>
        <EnvironmentOutlined style={{ fontSize: 24, color: '#4f46e5' }} />
      </Card>

      {config.gmapsEnabled && (
        <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: '2px solid #c7d2fe' }}>
          {/* AI Search Query Suggestions */}
          {config.businessTypes.length > 0 && (
            <AISearchQuerySuggestions
              context={aiContext}
              existingQueries={config.gmapsQueries}
              onAddQueries={handleAddQueries}
              autoFetch={config.gmapsQueries.length === 0}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Search Queries</label>
            <Button
              type="link"
              size="small"
              onClick={onRegenerate}
              disabled={generating}
              icon={generating ? <LoadingOutlined spin /> : <SyncOutlined />}
            >
              Regenerate (Basic)
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {config.gmapsQueries.map((query, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 12, padding: '8px 12px' }}>
                <Input
                  value={query}
                  onChange={(e) => updateQuery(i, e.target.value)}
                  bordered={false}
                  placeholder="e.g., hospitals in {region}"
                  style={{ flex: 1, background: 'transparent' }}
                />
                <Button type="text" danger icon={<CloseOutlined />} onClick={() => removeQuery(i)} size="small" />
              </div>
            ))}
          </div>
          <Button
            type="link"
            onClick={addQuery}
            icon={<PlusOutlined />}
            style={{ marginTop: 8 }}
          >
            Add query
          </Button>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Use {'{region}'}, {'{city}'} as placeholders</div>
        </div>
      )}

      <Card
        hoverable
        style={{ cursor: 'pointer' }}
        bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16 }}
        onClick={() => update({ csvEnabled: !config.csvEnabled })}
      >
        <Checkbox checked={config.csvEnabled} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>CSV Import</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Import existing lists</div>
        </div>
        <DatabaseOutlined style={{ fontSize: 24, color: '#059669' }} />
      </Card>
    </div>
  );
}

// Step 8: Outreach Settings
function StepOutreach({ config, update }) {
  // Build context for AI suggestions
  const aiContext = {
    name: config.name,
    description: config.description,
    product_type: config.productType,
    company_name: config.companyName,
    product_name: config.productName,
    industry: config.industry,
    business_types: config.businessTypes,
    geography: {
      countries: config.countries,
      regions: config.regions,
      cities: config.cities,
    },
  };

  // Extract pain points from categories
  const painPoints = config.painPointCategories.flatMap((pp) => pp.keywords || []);

  // Handle adding value props from AI suggestions
  const handleAddProps = (props) => {
    const newProps = props.filter((p) => !config.valuePropositions.includes(p));
    update({ valuePropositions: [...config.valuePropositions, ...newProps] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Outreach Settings</Title>
        <Text type="secondary">Configure email sending</Text>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Name</label>
          <Input
            value={config.senderName}
            onChange={(e) => update({ senderName: e.target.value })}
            placeholder="John Smith"
          />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Email</label>
          <Input
            type="email"
            value={config.senderEmail}
            onChange={(e) => update({ senderEmail: e.target.value })}
            placeholder="john@company.com"
          />
        </Col>
      </Row>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Send Mode</label>
        <Row gutter={12}>
          {[
            { value: 'draft', label: 'Draft', desc: 'Save as drafts' },
            { value: 'semi_auto', label: 'Semi-Auto', desc: 'Review before sending' },
            { value: 'full_auto', label: 'Full Auto', desc: 'Send automatically' },
          ].map((m) => (
            <Col xs={8} key={m.value}>
              <Card
                hoverable
                onClick={() => update({ sendMode: m.value })}
                style={{
                  textAlign: 'center',
                  background: config.sendMode === m.value ? '#4f46e5' : '#fff',
                  color: config.sendMode === m.value ? '#fff' : '#334155',
                  border: config.sendMode === m.value ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{m.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Daily Limit</label>
        <Input
          type="number"
          value={config.dailyLimit}
          onChange={(e) => update({ dailyLimit: parseInt(e.target.value) || 50 })}
          style={{ width: 128 }}
        />
      </div>

      {/* AI Value Proposition Suggestions */}
      {(config.industry || painPoints.length > 0) && (
        <AIValuePropSuggestionsWizard
          context={aiContext}
          painPoints={painPoints}
          existingProps={config.valuePropositions}
          onAddProps={handleAddProps}
          autoFetch={config.valuePropositions.length === 0}
        />
      )}

      <ListInput
        label="Value Propositions"
        items={config.valuePropositions}
        onChange={(v) => update({ valuePropositions: v })}
        placeholder="e.g., Reduce costs by 30%"
      />
    </div>
  );
}

// Step 9: Sequences
function StepSequences({ config, update }) {
  const updateSequence = (tier, steps) => {
    update({ sequences: { ...config.sequences, [tier]: steps } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Email Sequences</Title>
        <Text type="secondary">Customize follow-up timing</Text>
      </div>

      <SequenceEditor
        sequence={config.sequences.a_tier}
        onChange={(s) => updateSequence('a_tier', s)}
        tierLabel="A-Tier (Hot Leads)"
        tierColor={{ border: '#a7f3d0', background: '#ecfdf5' }}
      />

      <SequenceEditor
        sequence={config.sequences.b_tier}
        onChange={(s) => updateSequence('b_tier', s)}
        tierLabel="B-Tier (Warm Leads)"
        tierColor={{ border: '#bfdbfe', background: '#eff6ff' }}
      />

      <SequenceEditor
        sequence={config.sequences.c_tier}
        onChange={(s) => updateSequence('c_tier', s)}
        tierLabel="C-Tier (Nurture)"
        tierColor={{ border: '#fde68a', background: '#fffbeb' }}
      />
    </div>
  );
}

function SequenceEditor({ sequence, onChange, tierLabel, tierColor }) {
  const addStep = () => {
    onChange([...sequence, { template: 'follow_up_value', delay_days: 7 }]);
  };

  const updateStep = (index, field, value) => {
    const updated = [...sequence];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeStep = (index) => {
    onChange(sequence.filter((_, i) => i !== index));
  };

  return (
    <Card style={{ border: `2px solid ${tierColor.border}`, background: tierColor.background }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{tierLabel}</span>
        <Button type="link" size="small" onClick={addStep} icon={<PlusOutlined />}>
          Add
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sequence.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>
              {i + 1}
            </span>
            <Select
              value={step.template}
              onChange={(val) => updateStep(i, 'template', val)}
              style={{ flex: 1 }}
              size="small"
              options={EMAIL_TEMPLATES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: '4px 8px' }}>
              <ClockCircleOutlined style={{ fontSize: 14, color: '#94a3b8' }} />
              <Input
                type="number"
                value={step.delay_days}
                onChange={(e) => updateStep(i, 'delay_days', parseInt(e.target.value) || 0)}
                bordered={false}
                style={{ width: 40, textAlign: 'center', background: 'transparent', padding: 0 }}
                min={0}
              />
              <span style={{ fontSize: 12, color: '#64748b' }}>d</span>
            </div>
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeStep(i)} size="small" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default CampaignCreate;
