import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RightOutlined, LeftOutlined, CheckOutlined, EnvironmentOutlined,
  DeleteOutlined, PlusOutlined, CloseOutlined, SyncOutlined,
  LoadingOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,
  DatabaseOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import {
  Card, Button, Input, Typography, Steps, Slider, Checkbox, Select, Space, Modal, Row, Col, Spin, Tag
} from 'antd';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { campaignsApi } from '../api';
import { ChipSelector, ListInput } from '../components/common/ChipSelector';
import { AIKeywordSuggestions, AIValuePropSuggestions, AIStatusIndicator } from '../components/ai';
import { INDUSTRIES, COUNTRY_REGIONS, DEFAULT_ICP_WEIGHTS, DEFAULT_TIER_THRESHOLDS, EMAIL_TEMPLATES } from '../utils/constants';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEPS = [
  { id: 'campaign', label: 'Campaign' },
  { id: 'location', label: 'Location' },
  { id: 'targets', label: 'Targets' },
  { id: 'painPoints', label: 'Pain Pts' },
  { id: 'scoring', label: 'Scoring' },
  { id: 'sources', label: 'Sources' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'sequences', label: 'Sequences' },
];

const BUSINESS_TYPES = {
  software: ['hospital', 'clinic', 'startup', 'software company', 'tech company', 'pharmacy', 'school'],
  consultancy: ['manufacturing company', 'logistics company', 'retail store', 'real estate agency', 'law firm', 'hotel'],
};

// Transform API campaign data to form config
function campaignToConfig(campaign) {
  const targetMarket = campaign.target_market || {};
  const geography = targetMarket.geography || {};
  const businessProfile = targetMarket.business_profile || {};
  const sizeIndicators = businessProfile.size_indicators || {};
  const icpScoring = campaign.icp_scoring || {};
  const weights = icpScoring.weights || {};
  const dataSources = campaign.data_sources || {};
  const gmaps = dataSources.google_maps || {};
  const csvImport = dataSources.csv_import || {};
  const outreachConfig = campaign.outreach_config?.email || {};
  const personalization = campaign.personalization || {};

  return {
    productType: campaign.product_type || 'software',
    industry: campaign.industry || '',
    name: campaign.name || '',
    description: campaign.description || '',
    companyName: personalization.company_name || '',
    productName: personalization.product_name || '',
    countries: geography.countries || [],
    regions: geography.regions || [],
    cities: geography.cities || [],
    urbanPreference: geography.urban_preference || 'urban_and_semi_urban',
    businessTypes: businessProfile.types || [],
    sizeMetric: sizeIndicators.metric || 'employees',
    sizeRange: sizeIndicators.ideal_range || [10, 200],
    painPointCategories: (icpScoring.pain_point_keywords || []).map(pp => ({
      category: pp.category,
      keywords: pp.keywords || [],
    })),
    weights: {
      firmographic: Math.round((weights.firmographic || 0.4) * 100),
      digital_readiness: Math.round((weights.digital_readiness || 0.3) * 100),
      engagement: Math.round((weights.engagement || 0.2) * 100),
      pain_points: Math.round((weights.pain_points || 0.1) * 100),
    },
    tierThresholds: icpScoring.tier_thresholds || { ...DEFAULT_TIER_THRESHOLDS },
    gmapsEnabled: gmaps.enabled !== false,
    gmapsQueries: gmaps.search_queries || [],
    csvEnabled: csvImport.enabled !== false,
    senderName: personalization.sender_signature?.split('\n').pop() || '',
    senderEmail: outreachConfig.sender_email || '',
    sendMode: outreachConfig.send_mode || 'draft',
    dailyLimit: outreachConfig.daily_limit || 50,
    valuePropositions: personalization.value_propositions || [],
    sequences: outreachConfig.sequences || {
      a_tier: [{ template: 'initial_outreach', delay_days: 0 }],
      b_tier: [{ template: 'initial_outreach', delay_days: 0 }],
      c_tier: [{ template: 'initial_outreach', delay_days: 0 }],
    },
  };
}

export function CampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCampaign } = useApp();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [generating, setGenerating] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const update = (updates) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(originalConfig));
      return newConfig;
    });
  };

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const campaign = await campaignsApi.get(id);
        const formConfig = campaignToConfig(campaign);
        setConfig(formConfig);
        setOriginalConfig(formConfig);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load campaign');
        navigate('/campaigns');
      }
    };
    loadCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleConfirmLeave = () => {
    setHasChanges(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleNavigateBack = () => {
    if (hasChanges) {
      setPendingNavigation(`/campaigns/${id}`);
      setShowUnsavedModal(true);
    } else {
      navigate(`/campaigns/${id}`);
    }
  };

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
        ],
        technology: [
          { category: 'efficiency', keywords: ['manual process', 'time-consuming', 'repetitive tasks'] },
          { category: 'integration', keywords: ['disconnected systems', 'data silos', 'no API'] },
        ],
        retail: [
          { category: 'inventory', keywords: ['out of stock', 'overstocking', 'inventory errors'] },
        ],
        general: [
          { category: 'manual_processes', keywords: ['manual', 'paper-based', 'outdated systems'] },
        ],
      };
      const industry = config.industry || 'general';
      update({ painPointCategories: painPointsMap[industry] || painPointsMap.general });
      setGenerating((p) => ({ ...p, painPoints: false }));
    }, 500);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!config?.name;
      case 1: return config?.countries?.length > 0;
      case 2: return config?.businessTypes?.length > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
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

      const updatedCampaign = await campaignsApi.update(id, payload);
      updateCampaign(updatedCampaign);
      setHasChanges(false);
      toast.success('Campaign updated successfully!');
      navigate(`/campaigns/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update campaign');
    }
    setSaving(false);
  };

  if (loading || !config) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading campaign..." />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepCampaign config={config} update={update} />;
      case 1:
        return <StepLocation config={config} update={update} />;
      case 2:
        return <StepTargets config={config} update={update} />;
      case 3:
        return <StepPainPoints config={config} update={update} generating={generating.painPoints} onRegenerate={generatePainPoints} campaignId={id} />;
      case 4:
        return <StepScoring config={config} update={update} />;
      case 5:
        return <StepSources config={config} update={update} generating={generating.queries} onRegenerate={generateQueries} />;
      case 6:
        return <StepOutreach config={config} update={update} campaignId={id} />;
      case 7:
        return <StepSequences config={config} update={update} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleNavigateBack}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Edit Campaign</Title>
          <Text type="secondary">Modify your campaign settings</Text>
        </div>
        <AIStatusIndicator compact />
        {hasChanges && (
          <Tag color="warning">Unsaved changes</Tag>
        )}
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
          onChange={(i) => setStep(i)}
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
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={saving}
              disabled={!hasChanges}
              icon={<CheckOutlined />}
              style={{ background: '#059669' }}
            >
              Save Changes
            </Button>
          )}
        </div>
      </Card>

      {/* Unsaved Changes Modal */}
      <Modal
        open={showUnsavedModal}
        onCancel={() => setShowUnsavedModal(false)}
        title="Unsaved Changes"
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ExclamationCircleOutlined style={{ fontSize: 32, color: '#d97706' }} />
          </div>
          <p style={{ color: '#475569', marginBottom: 24 }}>
            You have unsaved changes. Are you sure you want to leave without saving?
          </p>
          <Space style={{ width: '100%' }}>
            <Button onClick={() => setShowUnsavedModal(false)} style={{ flex: 1 }}>
              Stay
            </Button>
            <Button type="primary" danger onClick={handleConfirmLeave} style={{ flex: 1 }}>
              Leave
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}

// Step 1: Campaign Details
function StepCampaign({ config, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Campaign Details</Title>
        <Text type="secondary">Update your campaign information</Text>
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
    </div>
  );
}

// Step 2: Location
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

// Step 3: Targets
function StepTargets({ config, update }) {
  const businessTypeOptions = BUSINESS_TYPES[config.productType] || BUSINESS_TYPES.software;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Target Businesses</Title>
        <Text type="secondary">Define your ideal customer profile</Text>
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

// Step 4: Pain Points
function StepPainPoints({ config, update, generating, onRegenerate, campaignId }) {
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

  // Handle adding AI-suggested keywords
  const handleAddKeywords = (keywords) => {
    // Group keywords by first word as category, or add to a general category
    const newCategories = [...config.painPointCategories];
    keywords.forEach((keyword) => {
      // Try to find an existing category to add to
      let added = false;
      for (const cat of newCategories) {
        if (!cat.keywords.includes(keyword)) {
          cat.keywords = [...cat.keywords, keyword];
          added = true;
          break;
        }
      }
      // If no category found, create a new "ai_suggested" category
      if (!added) {
        const aiCategory = newCategories.find((c) => c.category === 'ai_suggested');
        if (aiCategory) {
          aiCategory.keywords = [...aiCategory.keywords, keyword];
        } else {
          newCategories.push({ category: 'ai_suggested', keywords: [keyword] });
        }
      }
    });
    update({ painPointCategories: newCategories });
  };

  // Collect all existing keywords
  const existingKeywords = config.painPointCategories.flatMap((pp) => pp.keywords || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Pain Points</Title>
        <Text type="secondary">What problems do you solve?</Text>
      </div>

      {/* AI Keyword Suggestions */}
      {campaignId && (
        <AIKeywordSuggestions
          campaignId={campaignId}
          existingKeywords={existingKeywords}
          onAddKeywords={handleAddKeywords}
          industry={config.industry}
          productType={config.productType}
          businessTypes={config.businessTypes}
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
          Regenerate
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

// Step 5: Scoring
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

// Step 6: Data Sources
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Search Queries</label>
            <Button
              type="link"
              size="small"
              onClick={onRegenerate}
              disabled={generating}
              icon={generating ? <LoadingOutlined spin /> : <SyncOutlined />}
            >
              Regenerate
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

// Step 7: Outreach Settings
function StepOutreach({ config, update, campaignId }) {
  // Handle adding AI-suggested value propositions
  const handleAddProps = (props) => {
    const existing = new Set(config.valuePropositions);
    const newProps = props.filter((p) => !existing.has(p));
    update({ valuePropositions: [...config.valuePropositions, ...newProps] });
  };

  // Collect pain points for AI suggestions
  const painPoints = config.painPointCategories.flatMap((pp) => pp.keywords || []);

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
      {campaignId && (
        <AIValuePropSuggestions
          campaignId={campaignId}
          existingProps={config.valuePropositions}
          onAddProps={handleAddProps}
          industry={config.industry}
          productName={config.productName}
          companyName={config.companyName}
          businessTypes={config.businessTypes}
          painPoints={painPoints}
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

// Step 8: Sequences
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

export default CampaignEdit;
