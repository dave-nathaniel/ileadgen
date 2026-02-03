import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Download, Copy, MapPin, Target, Mail, Sparkles, FileText, Plus, X, Lightbulb, Sliders, Database, Upload, Play, Trash2, Clock, Code, ChevronDown, Wand2, Loader2, RefreshCw } from 'lucide-react';

const industryPresets = {
  healthcare_software: { label: 'Healthcare / MedTech', productType: 'software', industry: 'healthcare', businessTypes: ['hospital', 'clinic', 'diagnostic center', 'pharmacy'], sizeMetric: 'bed_capacity', sizeRange: [20, 200], painPoints: [{ category: 'records', keywords: ['lost records', 'paper-based', 'no backup'] }, { category: 'efficiency', keywords: ['wait times', 'long queue', 'scheduling'] }], weights: { firmographic: 40, digital_readiness: 30, engagement: 20, pain_points: 10 } },
  saas_tech: { label: 'SaaS / Technology', productType: 'software', industry: 'technology', businessTypes: ['startup', 'software company', 'tech company', 'digital agency'], sizeMetric: 'employees', sizeRange: [10, 200], painPoints: [{ category: 'efficiency', keywords: ['manual process', 'time-consuming'] }, { category: 'scale', keywords: ['growing', 'scaling'] }], weights: { firmographic: 40, digital_readiness: 30, engagement: 20, pain_points: 10 } },
  education: { label: 'Education / EdTech', productType: 'software', industry: 'education', businessTypes: ['school', 'university', 'training center'], sizeMetric: 'employees', sizeRange: [20, 500], painPoints: [{ category: 'administration', keywords: ['paperwork', 'manual registration'] }], weights: { firmographic: 35, digital_readiness: 35, engagement: 20, pain_points: 10 } },
  retail_pos: { label: 'Retail / POS', productType: 'software', industry: 'retail', businessTypes: ['retail store', 'supermarket', 'boutique'], sizeMetric: 'locations', sizeRange: [1, 50], painPoints: [{ category: 'inventory', keywords: ['out of stock', 'inventory issues'] }], weights: { firmographic: 40, digital_readiness: 25, engagement: 25, pain_points: 10 } },
  business_consulting: { label: 'Business Consulting', productType: 'consultancy', industry: 'general', businessTypes: ['manufacturing company', 'logistics company', 'trading company'], sizeMetric: 'employees', sizeRange: [20, 500], painPoints: [{ category: 'manual_processes', keywords: ['manual', 'paper', 'outdated'] }], weights: { firmographic: 35, digital_readiness: 25, engagement: 25, pain_points: 15 } },
  hospitality: { label: 'Hospitality', productType: 'software', industry: 'hospitality', businessTypes: ['hotel', 'restaurant', 'resort'], sizeMetric: 'employees', sizeRange: [10, 200], painPoints: [{ category: 'bookings', keywords: ['reservation', 'double booking'] }], weights: { firmographic: 35, digital_readiness: 30, engagement: 25, pain_points: 10 } },
};

const templateOptions = ['initial_outreach', 'follow_up_value', 'case_study', 'soft_close', 'insight_share', 'meeting_request', 'final_followup'];

const StepIndicator = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center gap-1 mb-8">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <button onClick={() => i < currentStep && onStepClick(i)} className={`flex flex-col items-center ${i < currentStep ? 'cursor-pointer' : 'cursor-default'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i < currentStep ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg' : i === currentStep ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-[10px] mt-1.5 font-medium ${i <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>{s.label}</span>
        </button>
        {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < currentStep ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gray-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const ChipSelector = ({ options, selected, onChange, allowCustom, placeholder }) => {
  const [val, setVal] = useState('');
  const toggle = (o) => onChange(selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]);
  const add = () => { if (val.trim() && !selected.includes(val.trim())) { onChange([...selected, val.trim()]); setVal(''); }};
  return (
    <div>
      <div className="flex flex-wrap gap-2">{options.map(o => (<button key={o} onClick={() => toggle(o)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selected.includes(o) ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>))}</div>
      {allowCustom && (<div className="flex gap-2 mt-3"><input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200" /><button onClick={add} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl shadow-md"><Plus className="w-4 h-4" /></button></div>)}
      {selected.filter(s => !options.includes(s)).length > 0 && (<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">{selected.filter(s => !options.includes(s)).map(c => (<span key={c} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm flex items-center gap-1.5 font-medium">{c}<button onClick={() => toggle(c)}><X className="w-3.5 h-3.5" /></button></span>))}</div>)}
    </div>
  );
};

const ListInput = ({ label, items, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim() && !items.includes(val.trim())) { onChange([...items, val.trim()]); setVal(''); }};
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="flex gap-2"><input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" /><button onClick={add} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl shadow-md"><Plus className="w-4 h-4" /></button></div>
      {items.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{items.map((item, i) => (<span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm flex items-center gap-1.5 font-medium">{item}<button onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></span>))}</div>)}
    </div>
  );
};

const EditableList = ({ label, items, onChange, placeholder, onRegenerate, loading }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim() && !items.includes(val.trim())) { onChange([...items, val.trim()]); setVal(''); }};
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
        {onRegenerate && <button onClick={onRegenerate} disabled={loading} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700 disabled:opacity-50">{loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}Regenerate</button>}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className="flex-1 bg-transparent text-sm" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2"><input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm" /><button onClick={add} className="px-3 py-2 bg-indigo-500 text-white rounded-xl"><Plus className="w-4 h-4" /></button></div>
    </div>
  );
};

const SequenceEditor = ({ sequence, onChange, tierLabel, tierColor }) => (
  <div className={`p-4 rounded-2xl border-2 ${tierColor}`}>
    <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold">{tierLabel}</span><button onClick={() => onChange([...sequence, { template: 'follow_up_value', delay_days: 7 }])} className="text-xs text-indigo-600 font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button></div>
    <div className="space-y-2">
      {sequence.map((step, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/60 rounded-xl p-2">
          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{i + 1}</span>
          <select value={step.template} onChange={(e) => { const n = [...sequence]; n[i].template = e.target.value; onChange(n); }} className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">{templateOptions.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1"><Clock className="w-3.5 h-3.5 text-gray-400" /><input type="number" value={step.delay_days} onChange={(e) => { const n = [...sequence]; n[i].delay_days = parseInt(e.target.value) || 0; onChange(n); }} className="w-10 bg-transparent text-center text-sm font-medium" min="0" /><span className="text-xs text-gray-500">d</span></div>
          <button onClick={() => onChange(sequence.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  </div>
);

const AISuggestionBox = ({ loading, suggestions, onApply, title }) => {
  if (!suggestions?.length && !loading) return null;
  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
      <div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg"><Wand2 className="w-4 h-4 text-white" /></div><span className="text-sm font-bold text-amber-800">{title}</span>{loading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}</div>
      {!loading && suggestions?.length > 0 && (<div className="flex flex-wrap gap-2">{suggestions.map((s, i) => (<button key={i} onClick={() => onApply(s)} className="px-3 py-1.5 bg-white/80 hover:bg-white border border-amber-300 text-amber-800 rounded-full text-sm font-medium transition-all hover:shadow-md">{s}</button>))}</div>)}
    </div>
  );
};

export default function ConfigBuilder() {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const fileInputRef = useRef(null);
  
  const [config, setConfig] = useState({
    productType: '', industry: '', campaignName: '', companyName: '', productName: '',
    countries: [], regions: [], cities: [], urbanPreference: 'urban_and_semi_urban',
    businessTypes: [], sizeMetric: 'employees', sizeRange: [10, 200], sizeMetrics: [],
    painPointCategories: [],
    weights: { firmographic: 40, digital_readiness: 30, engagement: 20, pain_points: 10 },
    tierThresholds: { A: 80, B: 60, C: 40 },
    gmapsEnabled: true, gmapsQueries: [], csvEnabled: true,
    senderName: '', senderEmail: '', sendMode: 'draft', dailyLimit: 50,
    valuePropositions: [],
    sequences: { a_tier: [{ template: 'initial_outreach', delay_days: 0 }, { template: 'follow_up_value', delay_days: 3 }, { template: 'case_study', delay_days: 7 }, { template: 'soft_close', delay_days: 14 }], b_tier: [{ template: 'initial_outreach', delay_days: 0 }, { template: 'follow_up_value', delay_days: 5 }, { template: 'soft_close', delay_days: 14 }] },
  });

  const update = (u) => setConfig(p => ({ ...p, ...u }));

  const generateLocalSuggestions = (type) => {
    const painPointsMap = {
      healthcare: [
        { category: 'patient_records', keywords: ['lost records', 'missing files', 'paper-based', 'no backup', 'data entry errors'] },
        { category: 'wait_times', keywords: ['long queue', 'delayed appointments', 'scheduling issues', 'overbooking'] },
        { category: 'billing', keywords: ['billing errors', 'insurance claims', 'overcharged', 'payment confusion'] },
        { category: 'communication', keywords: ['no updates', 'hard to reach', 'poor follow-up', 'missed calls'] },
      ],
      technology: [
        { category: 'efficiency', keywords: ['manual process', 'time-consuming', 'repetitive tasks', 'slow workflows'] },
        { category: 'integration', keywords: ['disconnected systems', 'data silos', 'no API', 'manual data transfer'] },
        { category: 'scalability', keywords: ['cant scale', 'performance issues', 'growing pains', 'capacity limits'] },
        { category: 'support', keywords: ['slow support', 'unresponsive', 'no documentation', 'long resolution'] },
      ],
      retail: [
        { category: 'inventory', keywords: ['out of stock', 'overstocking', 'inventory errors', 'stock discrepancies'] },
        { category: 'checkout', keywords: ['slow checkout', 'payment failures', 'long lines', 'system crashes'] },
        { category: 'customer_service', keywords: ['rude staff', 'no help', 'returns issues', 'complaint handling'] },
        { category: 'pricing', keywords: ['wrong prices', 'hidden fees', 'price discrepancies', 'no receipts'] },
      ],
      general: [
        { category: 'manual_processes', keywords: ['manual', 'paper-based', 'outdated systems', 'no automation'] },
        { category: 'disorganization', keywords: ['disorganized', 'lost information', 'mistakes', 'confusion'] },
        { category: 'slow_service', keywords: ['slow', 'delays', 'waiting', 'unresponsive'] },
        { category: 'communication', keywords: ['poor communication', 'no updates', 'hard to contact'] },
      ],
    };
    
    const sizeMetricsMap = {
      hospital: [{ metric: 'bed_capacity', label: 'Bed Capacity', min: 20, max: 300 }, { metric: 'daily_patients', label: 'Daily Patients', min: 50, max: 500 }],
      clinic: [{ metric: 'doctors', label: 'Doctors', min: 2, max: 20 }, { metric: 'daily_patients', label: 'Daily Patients', min: 20, max: 200 }],
      hotel: [{ metric: 'rooms', label: 'Rooms', min: 20, max: 500 }, { metric: 'employees', label: 'Employees', min: 10, max: 200 }],
      restaurant: [{ metric: 'seats', label: 'Seating Capacity', min: 20, max: 200 }, { metric: 'employees', label: 'Employees', min: 5, max: 50 }],
      school: [{ metric: 'students', label: 'Students', min: 100, max: 2000 }, { metric: 'teachers', label: 'Teachers', min: 10, max: 100 }],
      default: [{ metric: 'employees', label: 'Employees', min: 10, max: 500 }, { metric: 'revenue', label: 'Revenue ($K)', min: 100, max: 10000 }, { metric: 'locations', label: 'Locations', min: 1, max: 50 }],
    };

    if (type === 'painPoints') {
      const industry = config.industry || 'general';
      return painPointsMap[industry] || painPointsMap.general;
    }
    
    if (type === 'sizeMetrics') {
      const firstType = (config.businessTypes[0] || '').toLowerCase();
      for (const [key, metrics] of Object.entries(sizeMetricsMap)) {
        if (firstType.includes(key)) return [...metrics, ...sizeMetricsMap.default.slice(0, 2)];
      }
      return sizeMetricsMap.default;
    }
    
    if (type === 'queries') {
      const types = config.businessTypes.slice(0, 3);
      const regions = config.regions.length ? config.regions : ['{region}'];
      const queries = [];
      types.forEach(t => {
        queries.push(`${t} in {region}`);
        queries.push(`best ${t} near {city}`);
      });
      if (config.industry) queries.push(`${config.industry} services in {region}`);
      return queries.slice(0, 5);
    }
    
    return [];
  };

  const generateSuggestions = (type, force = false) => {
    if (aiLoading[type]) return;
    setAiLoading(p => ({ ...p, [type]: true }));
    setTimeout(() => {
      const result = generateLocalSuggestions(type);
      setAiSuggestions(p => ({ ...p, [type]: result }));
      if (type === 'painPoints' && result.length) update({ painPointCategories: result });
      if (type === 'sizeMetrics' && result.length) update({ sizeMetrics: result, sizeMetric: result[0]?.metric, sizeRange: [result[0]?.min || 10, result[0]?.max || 200] });
      if (type === 'queries' && result.length) update({ gmapsQueries: result });
      setAiLoading(p => ({ ...p, [type]: false }));
    }, 600);
  };

  const generateQueries = async (force = false) => {
    const regions = config.regions.length ? config.regions.slice(0, 2).join(', ') : config.countries[0] || 'the area';
    const types = config.businessTypes.slice(0, 3).join(', ') || 'businesses';
    const prompt = `Generate 5 Google Maps search queries to find ${types} in ${regions} for a ${config.industry || 'general'} ${config.productType || 'software'} company. Use {region} or {city} as placeholders. Return ONLY a JSON array of strings, no explanation.`;
    const result = await fetchAI('queries', prompt, force);
    if (result?.length) update({ gmapsQueries: result });
  };

  const generatePainPoints = async (force = false) => {
    const types = config.businessTypes.slice(0, 3).join(', ') || 'businesses';
    const prompt = `For ${types} in the ${config.industry || 'general'} industry, list 5 pain point categories with keywords that customers mention in negative reviews. Return ONLY a JSON array like: [{"category": "name", "keywords": ["word1", "word2"]}]`;
    const result = await fetchAI('painPoints', prompt, force);
    if (result?.length) update({ painPointCategories: result });
  };

  const generateSizeMetrics = async (force = false) => {
    const types = config.businessTypes.slice(0, 3).join(', ') || 'businesses';
    const prompt = `For ${types} in ${config.industry || 'general'} industry, suggest 4 relevant size metrics with ideal ranges. Return ONLY JSON: [{"metric": "name", "label": "Display Name", "min": 10, "max": 200}]`;
    const result = await fetchAI('sizeMetrics', prompt, force);
    if (result?.length) {
      update({ sizeMetrics: result, sizeMetric: result[0]?.metric || 'employees', sizeRange: [result[0]?.min || 10, result[0]?.max || 200] });
    }
  };

  useEffect(() => { if (step === 3 && config.businessTypes.length > 0 && !config.sizeMetrics?.length) generateSuggestions('sizeMetrics'); }, [step, config.businessTypes.length]);
  useEffect(() => { if (step === 4 && config.businessTypes.length > 0 && !config.painPointCategories?.length) generateSuggestions('painPoints'); }, [step, config.businessTypes.length]);
  useEffect(() => { if (step === 6 && config.gmapsEnabled && !config.gmapsQueries?.length && config.businessTypes.length > 0) generateSuggestions('queries'); }, [step, config.gmapsEnabled, config.businessTypes.length]);

  const applyPreset = (key) => {
    const p = industryPresets[key];
    update({ productType: p.productType, industry: p.industry, businessTypes: p.businessTypes, sizeMetric: p.sizeMetric, sizeRange: p.sizeRange, painPointCategories: p.painPoints, weights: p.weights });
    setAiSuggestions({});
  };

  const parseYaml = (text) => {
    try {
      const get = (k) => { const m = text.match(new RegExp(`${k}:\\s*"?([^"\\n]+)"?`)); return m ? m[1].trim() : ''; };
      const getArr = (k) => { const m = text.match(new RegExp(`${k}:\\s*\\[([^\\]]+)\\]`)); return m ? m[1].split(',').map(s => s.trim().replace(/"/g, '')) : []; };
      const getNum = (k) => { const m = text.match(new RegExp(`${k}:\\s*(\\d+)`)); return m ? parseInt(m[1]) : 0; };
      update({ campaignName: get('name'), industry: get('industry'), productType: get('product_type'), countries: getArr('countries'), regions: getArr('regions'), sizeMetric: get('metric') || 'employees', sizeRange: getArr('ideal_range').map(Number), senderName: get('sender_name'), senderEmail: get('sender_email'), companyName: get('company_name'), productName: get('product_name') });
      setStep(1);
    } catch (e) { alert('Error parsing YAML'); }
  };

  const steps = [{ label: 'Type' }, { label: 'Campaign' }, { label: 'Location' }, { label: 'Targets' }, { label: 'Pain Pts' }, { label: 'Scoring' }, { label: 'Sources' }, { label: 'Outreach' }, { label: 'Sequences' }];
  const countryRegions = { 'Nigeria': ['Lagos', 'FCT Abuja', 'Rivers', 'Ogun', 'Oyo'], 'United States': ['California', 'Texas', 'New York', 'Florida'], 'United Kingdom': ['London', 'Manchester', 'Birmingham'], 'South Africa': ['Gauteng', 'Western Cape'], 'Kenya': ['Nairobi', 'Mombasa'], 'Ghana': ['Greater Accra', 'Ashanti'], 'India': ['Maharashtra', 'Karnataka', 'Delhi'], 'UAE': ['Dubai', 'Abu Dhabi'] };
  const businessTypeOpts = { software: ['hospital', 'clinic', 'startup', 'software company', 'tech company', 'pharmacy', 'school'], consultancy: ['manufacturing company', 'logistics company', 'retail store', 'real estate agency', 'law firm', 'hotel', 'trading company'] };
  const defaultSizeMetrics = [{ metric: 'employees', label: 'Employees', min: 10, max: 500 }, { metric: 'bed_capacity', label: 'Bed Capacity', min: 10, max: 200 }, { metric: 'revenue', label: 'Revenue ($K)', min: 100, max: 10000 }, { metric: 'locations', label: 'Locations', min: 1, max: 50 }];

  const yaml = useMemo(() => {
    const w = config.weights; const total = w.firmographic + w.digital_readiness + w.engagement + w.pain_points || 100;
    const norm = (v) => ((v / total) || 0).toFixed(2);
    const pps = config.painPointCategories.length > 0 ? config.painPointCategories : [];
    const queries = config.gmapsQueries.length > 0 ? config.gmapsQueries : config.businessTypes.slice(0, 3).map(t => `${t}s in {region}`);
    return `# Lead Generation Campaign Configuration\n\ncampaign:\n  name: "${config.campaignName || 'My Campaign'}"\n  industry: "${config.industry || 'general'}"\n  product_type: "${config.productType || 'software'}"\n\ntarget_market:\n  geography:\n    countries: [${config.countries.map(c => `"${c}"`).join(', ')}]\n    regions: [${config.regions.map(r => `"${r}"`).join(', ')}]\n    cities: [${config.cities.map(c => `"${c}"`).join(', ')}]\n    urban_preference: "${config.urbanPreference}"\n  \n  business_profile:\n    types:\n${config.businessTypes.map(t => `      - "${t}"`).join('\n') || '      - "business"'}\n    size_indicators:\n      metric: "${config.sizeMetric}"\n      ideal_range: [${config.sizeRange[0]}, ${config.sizeRange[1]}]\n      minimum: ${Math.max(1, config.sizeRange[0] - 5)}\n\nicp_scoring:\n  weights:\n    firmographic: ${norm(w.firmographic)}\n    digital_readiness: ${norm(w.digital_readiness)}\n    engagement: ${norm(w.engagement)}\n    pain_points: ${norm(w.pain_points)}\n  \n  pain_point_keywords:\n${pps.map(pp => `    - category: "${pp.category}"\n      keywords: [${(pp.keywords || []).map(k => `"${k}"`).join(', ')}]`).join('\n') || '    []'}\n\ntier_thresholds:\n  A: ${config.tierThresholds.A}\n  B: ${config.tierThresholds.B}\n  C: ${config.tierThresholds.C}\n  D: 0\n\ndata_sources:\n  google_maps:\n    enabled: ${config.gmapsEnabled}\n    search_queries:\n${queries.map(q => `      - "${q}"`).join('\n')}\n  csv_import:\n    enabled: ${config.csvEnabled}\n\noutreach:\n  email:\n    sender_name: "${config.senderName || 'Your Name'}"\n    sender_email: "${config.senderEmail || 'you@company.com'}"\n    send_mode: "${config.sendMode}"\n    daily_limit: ${config.dailyLimit}\n    sequences:\n      a_tier:\n${config.sequences.a_tier.map(s => `        - template: "${s.template}"\n          delay_days: ${s.delay_days}`).join('\n')}\n      b_tier:\n${config.sequences.b_tier.map(s => `        - template: "${s.template}"\n          delay_days: ${s.delay_days}`).join('\n')}\n\npersonalization:\n  company_name: "${config.companyName || 'Your Company'}"\n  product_name: "${config.productName || 'Your Product'}"\n  value_propositions:\n${config.valuePropositions.length > 0 ? config.valuePropositions.map(v => `    - "${v}"`).join('\n') : '    - "Improve efficiency"'}\n`;
  }, [config]);

  const copyYaml = async () => { await navigator.clipboard.writeText(yaml); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const canProceed = () => { switch(step) { case 0: return !!config.productType; case 1: return !!config.campaignName; case 2: return config.countries.length > 0; case 3: return config.businessTypes.length > 0; default: return true; }};

  const sizeMetricOptions = config.sizeMetrics?.length > 0 ? config.sizeMetrics : defaultSizeMetrics;
  const currentSizeMetric = sizeMetricOptions.find(m => m.metric === config.sizeMetric) || sizeMetricOptions[0];

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div><h2 className="text-2xl font-bold text-gray-800">What are you selling?</h2><p className="text-gray-500 mt-1">Choose your product type</p></div>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium"><Upload className="w-4 h-4" />Import</button>
            <input ref={fileInputRef} type="file" accept=".yaml,.yml" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => parseYaml(ev.target?.result); r.readAsText(f); }}} className="hidden" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'software', icon: Sparkles, title: 'Software / SaaS', desc: 'Apps, platforms, digital tools', gradient: 'from-blue-500 to-indigo-600' }, { key: 'consultancy', icon: Lightbulb, title: 'Consultancy', desc: 'Services, advisory', gradient: 'from-amber-500 to-orange-600' }].map(opt => (
              <button key={opt.key} onClick={() => update({ productType: opt.key })} className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${config.productType === opt.key ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg' : 'border-gray-200 hover:border-indigo-300 bg-white'}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-3 shadow-lg`}><opt.icon className="w-6 h-6 text-white" /></div>
                <div className="font-bold text-gray-800">{opt.title}</div>
                <div className="text-sm text-gray-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
            <div className="text-sm font-bold text-gray-700 mb-3">Quick Start Presets</div>
            <div className="grid grid-cols-2 gap-2">{Object.entries(industryPresets).map(([key, p]) => (<button key={key} onClick={() => applyPreset(key)} className="px-4 py-2.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-sm font-medium text-left">{p.label}</button>))}</div>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Campaign Details</h2><p className="text-gray-500 mt-1">Tell us about your campaign</p></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name *</label><input value={config.campaignName} onChange={(e) => update({ campaignName: e.target.value })} placeholder="e.g., Q1 Hospital Outreach" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Company</label><input value={config.companyName} onChange={(e) => update({ companyName: e.target.value })} placeholder="Acme Inc" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Product</label><input value={config.productName} onChange={(e) => update({ productName: e.target.value })} placeholder="EHR Platform" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Target Industry</label><div className="flex flex-wrap gap-2">{['healthcare', 'technology', 'finance', 'education', 'retail', 'manufacturing', 'general'].map(ind => (<button key={ind} onClick={() => update({ industry: ind })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${config.industry === ind ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{ind}</button>))}</div></div>
        </div>
      );
      case 2: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Target Geography</h2><p className="text-gray-500 mt-1">Where are your ideal customers?</p></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Countries *</label><ChipSelector options={Object.keys(countryRegions)} selected={config.countries} onChange={(v) => update({ countries: v, regions: [] })} allowCustom placeholder="Add country..." /></div>
          {config.countries.length > 0 && <div><label className="block text-sm font-semibold text-gray-700 mb-2">Regions</label><ChipSelector options={config.countries.flatMap(c => countryRegions[c] || [])} selected={config.regions} onChange={(v) => update({ regions: v })} allowCustom placeholder="Add region..." /></div>}
          <ListInput label="Cities (optional)" items={config.cities} onChange={(v) => update({ cities: v })} placeholder="Add city..." />
        </div>
      );
      case 3: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Target Businesses</h2><p className="text-gray-500 mt-1">Define your ideal customer profile</p></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Business Types *</label><ChipSelector options={businessTypeOpts[config.productType] || businessTypeOpts.software} selected={config.businessTypes} onChange={(v) => { update({ businessTypes: v }); if (v.length > 0) setTimeout(() => generateSuggestions('sizeMetrics', true), 100); }} allowCustom placeholder="Add type..." /></div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Size Metric</label>
              {aiLoading.sizeMetrics && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeMetricOptions.map(m => (
                <button key={m.metric} onClick={() => update({ sizeMetric: m.metric, sizeRange: [m.min, m.max] })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${config.sizeMetric === m.metric ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{m.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal {currentSizeMetric?.label || 'Size'} Range</label>
            <div className="flex items-center gap-3">
              <input type="number" value={config.sizeRange[0]} onChange={(e) => update({ sizeRange: [parseInt(e.target.value) || 0, config.sizeRange[1]] })} className="w-24 px-3 py-2 bg-gray-50 border rounded-xl text-center" />
              <span className="text-gray-400">to</span>
              <input type="number" value={config.sizeRange[1]} onChange={(e) => update({ sizeRange: [config.sizeRange[0], parseInt(e.target.value) || 0] })} className="w-24 px-3 py-2 bg-gray-50 border rounded-xl text-center" />
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Pain Points</h2><p className="text-gray-500 mt-1">What problems do you solve?</p></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">AI-Generated Pain Points</span>
            <button onClick={() => generateSuggestions('painPoints', true)} disabled={aiLoading.painPoints} className="text-xs text-indigo-600 font-medium flex items-center gap-1 disabled:opacity-50">{aiLoading.painPoints ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}Regenerate</button>
          </div>
          {aiLoading.painPoints && <div className="text-center py-8 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Generating pain points...</div>}
          <div className="space-y-3">
            {config.painPointCategories.map((pp, i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <input value={pp.category} onChange={(e) => { const n = [...config.painPointCategories]; n[i] = { ...n[i], category: e.target.value }; update({ painPointCategories: n }); }} className="font-bold text-gray-800 bg-transparent capitalize flex-1" placeholder="Category name" />
                  <button onClick={() => update({ painPointCategories: config.painPointCategories.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
                <input value={(pp.keywords || []).join(', ')} onChange={(e) => { const n = [...config.painPointCategories]; n[i] = { ...n[i], keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }; update({ painPointCategories: n }); }} className="w-full text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2" placeholder="keyword1, keyword2, keyword3" />
              </div>
            ))}
          </div>
          <button onClick={() => update({ painPointCategories: [...config.painPointCategories, { category: '', keywords: [] }] })} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-600"><Plus className="w-4 h-4" />Add Pain Point Category</button>
        </div>
      );
      case 5: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Scoring Weights</h2><p className="text-gray-500 mt-1">How should leads be prioritized?</p></div>
          <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl space-y-4">
            {[{ key: 'firmographic', label: 'Firmographic' }, { key: 'digital_readiness', label: 'Digital Readiness' }, { key: 'engagement', label: 'Engagement' }, { key: 'pain_points', label: 'Pain Points' }].map(item => (
              <div key={item.key} className="flex items-center gap-4">
                <span className="w-32 text-sm font-semibold text-gray-700">{item.label}</span>
                <input type="range" min="0" max="100" value={config.weights[item.key]} onChange={(e) => update({ weights: { ...config.weights, [item.key]: parseInt(e.target.value) }})} className="flex-1 h-2 accent-indigo-500" />
                <span className="w-12 text-right text-sm font-bold text-indigo-600">{config.weights[item.key]}%</span>
              </div>
            ))}
            <div className={`text-sm font-bold pt-3 border-t ${Object.values(config.weights).reduce((a, b) => a + b, 0) === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>Total: {Object.values(config.weights).reduce((a, b) => a + b, 0)}%</div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-3">Tier Thresholds</label><div className="grid grid-cols-3 gap-3">{[{ t: 'A', label: 'Hot' }, { t: 'B', label: 'Warm' }, { t: 'C', label: 'Nurture' }].map(({ t, label }) => (<div key={t} className="text-center p-4 bg-gray-50 rounded-2xl border"><div className="text-2xl font-black text-indigo-600">{t}</div><div className="text-xs text-gray-500 mb-2">{label}</div><input type="number" value={config.tierThresholds[t]} onChange={(e) => update({ tierThresholds: { ...config.tierThresholds, [t]: parseInt(e.target.value) || 0 }})} className="w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold" /></div>))}</div></div>
        </div>
      );
      case 6: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Data Sources</h2><p className="text-gray-500 mt-1">Where should we find leads?</p></div>
          <label className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 cursor-pointer">
            <input type="checkbox" checked={config.gmapsEnabled} onChange={(e) => update({ gmapsEnabled: e.target.checked })} className="w-5 h-5 accent-indigo-500" />
            <div className="flex-1"><div className="font-bold text-gray-800">Google Maps Scraping</div><div className="text-sm text-gray-500">Discover leads via Maps</div></div>
            <MapPin className="w-6 h-6 text-indigo-500" />
          </label>
          {config.gmapsEnabled && (
            <div className="ml-4 pl-4 border-l-2 border-indigo-200">
              <EditableList label="Search Queries" items={config.gmapsQueries} onChange={(v) => update({ gmapsQueries: v })} placeholder="e.g., hospitals in {region}" onRegenerate={() => generateSuggestions('queries', true)} loading={aiLoading.queries} />
              <p className="text-xs text-gray-500 mt-2">Use {'{region}'}, {'{city}'}, {'{business_type}'}</p>
            </div>
          )}
          <label className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 cursor-pointer">
            <input type="checkbox" checked={config.csvEnabled} onChange={(e) => update({ csvEnabled: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
            <div className="flex-1"><div className="font-bold text-gray-800">CSV Import</div><div className="text-sm text-gray-500">Import existing lists</div></div>
            <Database className="w-6 h-6 text-emerald-500" />
          </label>
        </div>
      );
      case 7: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Outreach Settings</h2><p className="text-gray-500 mt-1">Configure email sending</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label><input value={config.senderName} onChange={(e) => update({ senderName: e.target.value })} placeholder="John Smith" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input value={config.senderEmail} onChange={(e) => update({ senderEmail: e.target.value })} placeholder="john@company.com" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Send Mode</label><div className="grid grid-cols-3 gap-3">{[{ value: 'draft', label: 'Draft', icon: FileText }, { value: 'semi_auto', label: 'Semi-Auto', icon: Sliders }, { value: 'full_auto', label: 'Full Auto', icon: Play }].map(m => (<button key={m.value} onClick={() => update({ sendMode: m.value })} className={`p-4 rounded-2xl text-center transition-all ${config.sendMode === m.value ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><m.icon className={`w-6 h-6 mx-auto mb-2 ${config.sendMode === m.value ? 'text-white' : 'text-gray-500'}`} /><div className="font-bold text-sm">{m.label}</div></button>))}</div></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Daily Limit</label><input type="number" value={config.dailyLimit} onChange={(e) => update({ dailyLimit: parseInt(e.target.value) || 50 })} className="w-24 px-4 py-3 bg-gray-50 border rounded-xl" /></div>
          <ListInput label="Value Propositions" items={config.valuePropositions} onChange={(v) => update({ valuePropositions: v })} placeholder="e.g., Reduce costs by 30%" />
        </div>
      );
      case 8: return (
        <div className="space-y-5">
          <div><h2 className="text-2xl font-bold text-gray-800">Email Sequences</h2><p className="text-gray-500 mt-1">Customize follow-up timing</p></div>
          <SequenceEditor sequence={config.sequences.a_tier} onChange={(s) => update({ sequences: { ...config.sequences, a_tier: s } })} tierLabel="A-Tier (Hot Leads)" tierColor="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50" />
          <SequenceEditor sequence={config.sequences.b_tier} onChange={(s) => update({ sequences: { ...config.sequences, b_tier: s } })} tierLabel="B-Tier (Warm Leads)" tierColor="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50" />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Lead Gen Config Builder</h1>
          <p className="text-gray-500 mt-2">Create powerful lead generation campaigns</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          <StepIndicator steps={steps} currentStep={step} onStepClick={setStep} />
          <div className="min-h-[420px]">{renderStep()}</div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${step === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border shadow-sm'}`}><ChevronLeft className="w-5 h-5" />Back</button>
            <button onClick={() => setShowConfig(!showConfig)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-2"><Code className="w-4 h-4" />{showConfig ? 'Hide' : 'View'} Config<ChevronDown className={`w-4 h-4 transition-transform ${showConfig ? 'rotate-180' : ''}`} /></button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${canProceed() ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-xl' : 'bg-gray-200 text-gray-400'}`}>Next<ChevronRight className="w-5 h-5" /></button>
            ) : (
              <button onClick={() => setShowRunModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"><Check className="w-5 h-5" />Complete</button>
            )}
          </div>
        </div>

        {showConfig && (
          <div className="mt-6 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 flex justify-between items-center">
              <span className="font-semibold text-gray-300 flex items-center gap-2"><FileText className="w-4 h-4" />Generated YAML</span>
              <button onClick={copyYaml} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-auto max-h-80 text-gray-300 leading-relaxed">{yaml}</pre>
          </div>
        )}
      </div>

      {showRunModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Check className="w-8 h-8 text-white" /></div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Configuration Complete!</h3>
            <p className="text-center text-gray-500 mb-6">Your <strong>{config.campaignName || 'campaign'}</strong> config is ready</p>
            <div className="space-y-3">
              <button onClick={() => { copyYaml(); setShowRunModal(false); }} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold flex items-center justify-center gap-2"><Copy className="w-5 h-5" />Copy Config to Clipboard</button>
              <button onClick={() => { navigator.clipboard.writeText(`Run the lead-generation skill with this config:\n\n${yaml}`); setShowRunModal(false); }} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"><Play className="w-5 h-5" />Copy & Run Lead Generation</button>
            </div>
            <button onClick={() => setShowRunModal(false)} className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
