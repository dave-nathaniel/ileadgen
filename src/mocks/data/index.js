// Mock Users
export const users = [
  {
    id: 1,
    email: 'demo@example.com',
    full_name: 'John Doe',
    company_name: 'MedTech Solutions',
    is_active: true,
    is_verified: true,
    created_at: '2024-01-01T10:00:00Z',
  },
];

// Mock Campaigns
export const campaigns = [
  {
    id: 1,
    user_id: 1,
    name: 'Q1 Healthcare Campaign',
    description: 'Target hospitals and clinics in Lagos for our healthcare software',
    industry: 'healthcare',
    product_type: 'software',
    status: 'ready',
    target_market: {
      geography: {
        countries: ['Nigeria'],
        regions: ['Lagos', 'FCT Abuja'],
        cities: ['Lagos', 'Ikeja', 'Victoria Island'],
        urban_preference: 'urban_and_semi_urban',
      },
      business_profile: {
        types: ['hospital', 'clinic', 'medical center'],
        size_indicators: {
          metric: 'employees',
          ideal_range: [20, 500],
          minimum: 10,
        },
      },
    },
    icp_scoring: {
      weights: {
        firmographic: 0.4,
        digital_readiness: 0.3,
        engagement: 0.2,
        pain_points: 0.1,
      },
      pain_point_keywords: [
        { category: 'efficiency', keywords: ['slow', 'manual', 'paperwork'], relevance: 'high' },
        { category: 'technology', keywords: ['outdated', 'old system'], relevance: 'high' },
      ],
      tier_thresholds: { A: 80, B: 60, C: 40, D: 0 },
    },
    data_sources: {
      google_maps: { enabled: true, search_queries: ['hospital in {city}', 'clinic in {city}'] },
      csv_import: { enabled: false },
    },
    outreach_config: {
      email: {
        send_mode: 'draft',
        daily_limit: 50,
        sequences: {
          a_tier: [
            { template: 'initial_outreach', delay_days: 0 },
            { template: 'follow_up_value', delay_days: 3 },
          ],
          b_tier: [
            { template: 'initial_outreach', delay_days: 0 },
            { template: 'soft_close', delay_days: 7 },
          ],
        },
      },
    },
    personalization: {
      company_name: 'MedTech Solutions',
      product_name: 'HospitalOS',
      value_propositions: ['Reduce administrative time by 50%', 'Improve patient record accuracy'],
    },
    total_leads: 152,
    leads_contacted: 45,
    leads_responded: 12,
    leads_qualified: 8,
    leads_converted: 3,
    current_task_id: null,
    last_error: null,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: 'Tech Startups Outreach',
    description: 'Target tech startups in Nigeria',
    industry: 'technology',
    product_type: 'software',
    status: 'draft',
    target_market: {
      geography: {
        countries: ['Nigeria'],
        regions: ['Lagos'],
        cities: [],
        urban_preference: 'urban',
      },
      business_profile: {
        types: ['startup', 'software company'],
        size_indicators: { metric: 'employees', ideal_range: [10, 100], minimum: 5 },
      },
    },
    icp_scoring: {
      weights: { firmographic: 0.4, digital_readiness: 0.3, engagement: 0.2, pain_points: 0.1 },
      tier_thresholds: { A: 80, B: 60, C: 40, D: 0 },
    },
    total_leads: 0,
    leads_contacted: 0,
    leads_responded: 0,
    leads_qualified: 0,
    leads_converted: 0,
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-18T09:00:00Z',
  },
];

// Mock Leads
export const leads = [
  {
    id: 1,
    campaign_id: 1,
    source: 'google_maps',
    business_name: 'Lagos General Hospital',
    business_type: 'hospital',
    industry: 'healthcare',
    address: '45 Herbert Macaulay Way, Yaba',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    postal_code: '100001',
    latitude: 6.5158,
    longitude: 3.3849,
    size_metric: 'employees',
    size_value: 200,
    contact_info: {
      primary_email: 'info@lagosgeneral.com',
      secondary_emails: ['admin@lagosgeneral.com'],
      primary_phone: '+234801234567',
      contact_name: 'Dr. Adebayo',
      contact_title: 'Medical Director',
      linkedin_url: 'https://linkedin.com/in/dradebayo',
    },
    digital_signals: {
      has_website: true,
      website_url: 'https://lagosgeneral.com',
      has_social_media: true,
      social_media_urls: {
        facebook: 'https://facebook.com/lagosgeneral',
        linkedin: 'https://linkedin.com/company/lagosgeneral',
      },
      has_online_booking: true,
      has_digital_payments: false,
      technology_mentions: ['wordpress'],
    },
    engagement_signals: {
      review_count: 156,
      average_rating: 4.3,
      recent_review_count: 12,
      growth_indicators: ['expanding'],
    },
    pain_points: {
      categories: { efficiency: ['long wait times', 'manual paperwork'] },
      keywords_found: ['slow', 'manual', 'paperwork'],
      raw_complaints: ['The registration process takes too long'],
      relevance_score: 65.0,
    },
    icp_score: {
      total_score: 78.5,
      firmographic_score: 32.0,
      digital_readiness_score: 21.0,
      engagement_score: 18.0,
      pain_point_score: 7.5,
      tier: 'B',
      scoring_rationale: 'Strong firmographic fit, digitally mature, active customer base.',
      scored_at: '2024-01-15T11:00:00Z',
    },
    total_score: 78.5,
    tier: 'B',
    status: 'scored',
    outreach_history: [],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 2,
    campaign_id: 1,
    source: 'google_maps',
    business_name: 'St. Mary\'s Clinic',
    business_type: 'clinic',
    industry: 'healthcare',
    city: 'Ikeja',
    state: 'Lagos',
    country: 'Nigeria',
    size_metric: 'employees',
    size_value: 35,
    contact_info: {
      primary_email: 'info@stmarysclinic.ng',
      primary_phone: '+234809876543',
      contact_name: 'Dr. Olu',
      contact_title: 'Chief Doctor',
    },
    digital_signals: {
      has_website: true,
      website_url: 'https://stmarysclinic.ng',
      has_social_media: true,
      has_online_booking: false,
      has_digital_payments: true,
    },
    engagement_signals: {
      review_count: 89,
      average_rating: 4.6,
      recent_review_count: 8,
    },
    icp_score: {
      total_score: 85.2,
      firmographic_score: 35.0,
      digital_readiness_score: 24.0,
      engagement_score: 18.2,
      pain_point_score: 8.0,
      tier: 'A',
      scoring_rationale: 'Excellent fit with high digital readiness and engagement.',
    },
    total_score: 85.2,
    tier: 'A',
    status: 'contacted',
    created_at: '2024-01-15T10:35:00Z',
    updated_at: '2024-01-16T09:00:00Z',
  },
  {
    id: 3,
    campaign_id: 1,
    source: 'google_maps',
    business_name: 'Sunshine Medical Center',
    business_type: 'medical center',
    city: 'Victoria Island',
    state: 'Lagos',
    country: 'Nigeria',
    contact_info: {
      primary_email: 'contact@sunshinemedical.com',
    },
    digital_signals: {
      has_website: false,
      has_social_media: false,
    },
    engagement_signals: {
      review_count: 23,
      average_rating: 3.8,
    },
    icp_score: {
      total_score: 45.0,
      tier: 'C',
    },
    total_score: 45.0,
    tier: 'C',
    status: 'scored',
    created_at: '2024-01-15T10:40:00Z',
  },
];

// Mock Events
export const events = [
  {
    id: 1,
    lead_id: 2,
    event_type: 'email_sent',
    channel: 'email',
    event_data: { template: 'initial_outreach', subject: 'Quick question about St. Mary\'s Clinic' },
    created_at: '2024-01-16T09:00:00Z',
  },
  {
    id: 2,
    lead_id: 2,
    event_type: 'email_opened',
    channel: 'email',
    event_data: { message_id: 'sg-abc123' },
    created_at: '2024-01-16T10:30:00Z',
  },
  {
    id: 3,
    lead_id: 1,
    event_type: 'email_sent',
    channel: 'email',
    event_data: { template: 'initial_outreach' },
    created_at: '2024-01-16T11:00:00Z',
  },
];

// Email Templates
export const emailTemplates = [
  {
    name: 'initial_outreach',
    subject: 'Quick question about {business_name}',
    body_preview: 'Hi {contact_name},\n\nI noticed {business_name} and wanted to reach out...',
  },
  {
    name: 'follow_up_value',
    subject: 'Following up - {business_name}',
    body_preview: 'Hi {contact_name},\n\nI wanted to follow up on my previous message...',
  },
  {
    name: 'case_study',
    subject: 'How similar healthcare providers achieved results',
    body_preview: 'Hi {contact_name},\n\nI thought you might find this interesting...',
  },
  {
    name: 'soft_close',
    subject: 'Last check-in - {business_name}',
    body_preview: 'Hi {contact_name},\n\nI wanted to send one final note...',
  },
];
