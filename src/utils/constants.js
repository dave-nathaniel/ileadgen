// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Tier Colors
export const TIER_COLORS = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#22C55E' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', hex: '#3B82F6' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', hex: '#EAB308' },
  D: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748B' },
};

// Status Colors
export const STATUS_COLORS = {
  new: { bg: 'bg-slate-100', text: 'text-slate-600' },
  enriched: { bg: 'bg-blue-100', text: 'text-blue-600' },
  scored: { bg: 'bg-purple-100', text: 'text-purple-600' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  responded: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  qualified: { bg: 'bg-teal-100', text: 'text-teal-600' },
  converted: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  lost: { bg: 'bg-red-100', text: 'text-red-600' },
};

// Campaign Status Colors
export const CAMPAIGN_STATUS_COLORS = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600' },
  collecting: { bg: 'bg-blue-100', text: 'text-blue-600' },
  enriching: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  scoring: { bg: 'bg-purple-100', text: 'text-purple-600' },
  ready: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  active: { bg: 'bg-green-100', text: 'text-green-600' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  completed: { bg: 'bg-teal-100', text: 'text-teal-600' },
  failed: { bg: 'bg-red-100', text: 'text-red-600' },
};

// Email Templates
export const EMAIL_TEMPLATES = [
  { value: 'initial_outreach', label: 'Initial Outreach' },
  { value: 'follow_up_value', label: 'Follow Up (Value)' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'soft_close', label: 'Soft Close' },
  { value: 'insight_share', label: 'Insight Share' },
  { value: 'meeting_request', label: 'Meeting Request' },
  { value: 'final_followup', label: 'Final Follow-up' },
];

// Industry Options
export const INDUSTRIES = [
  'healthcare',
  'technology',
  'finance',
  'education',
  'retail',
  'manufacturing',
  'hospitality',
  'general',
];

// Size Metrics
export const SIZE_METRICS = [
  { value: 'employees', label: 'Employees' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'bed_capacity', label: 'Bed Capacity' },
  { value: 'locations', label: 'Locations' },
  { value: 'students', label: 'Students' },
  { value: 'rooms', label: 'Rooms' },
];

// Country/Region mapping
export const COUNTRY_REGIONS = {
  'Nigeria': ['Lagos', 'FCT Abuja', 'Rivers', 'Ogun', 'Oyo', 'Kano'],
  'United States': ['California', 'Texas', 'New York', 'Florida', 'Illinois'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu'],
  'Ghana': ['Greater Accra', 'Ashanti', 'Western'],
  'India': ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah'],
};

// Default ICP Weights
export const DEFAULT_ICP_WEIGHTS = {
  firmographic: 40,
  digital_readiness: 30,
  engagement: 20,
  pain_points: 10,
};

// Default Tier Thresholds
export const DEFAULT_TIER_THRESHOLDS = {
  A: 80,
  B: 60,
  C: 40,
  D: 0,
};

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
  events: 30000, // 30 seconds
  pipelineStatus: 5000, // 5 seconds when pipeline is running
};
