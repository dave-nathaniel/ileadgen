import client from './client';

export const aiApi = {
  /**
   * Get AI service status
   * @returns {Promise<{enabled: boolean, provider: string, available: boolean, model: string, error: string|null}>}
   */
  getStatus: async () => {
    const response = await client.get('/ai/status');
    return response.data;
  },

  /**
   * Get AI-suggested pain point keywords for a campaign
   * @param {number} campaignId - Campaign ID
   * @param {Object} params - Optional parameters to override campaign config
   * @returns {Promise<{keywords: Array, total_count: number, industry_specific_count: number}>}
   */
  suggestKeywords: async (campaignId, params = null) => {
    const response = await client.post(
      `/ai/campaigns/${campaignId}/suggest-keywords`,
      params
    );
    return response.data;
  },

  /**
   * Get AI-suggested value propositions for a campaign
   * @param {number} campaignId - Campaign ID
   * @param {Object} params - Optional parameters to override campaign config
   * @returns {Promise<{value_propositions: Array, recommended_for_initial_outreach: number, recommended_for_follow_up: number}>}
   */
  suggestValueProps: async (campaignId, params = null) => {
    const response = await client.post(
      `/ai/campaigns/${campaignId}/suggest-value-props`,
      params
    );
    return response.data;
  },

  /**
   * Preview AI-generated or AI-enhanced email for a lead
   * @param {number} campaignId - Campaign ID
   * @param {Object} params - Email preview parameters
   * @param {number} params.lead_id - Lead ID
   * @param {string} params.template_type - Template type (initial_outreach, follow_up_value, etc.)
   * @param {string} params.ai_mode - AI mode ('enhance' or 'generate')
   * @param {number} params.sequence_step - Current step in sequence
   * @param {number} params.total_steps - Total steps in sequence
   * @returns {Promise<{subject: string, body: string, cta: string|null, ai_mode: string, changes_made: Array}>}
   */
  previewEmail: async (campaignId, params) => {
    const response = await client.post(
      `/ai/campaigns/${campaignId}/preview-email`,
      params
    );
    return response.data;
  },

  /**
   * Get AI analysis of a specific lead
   * @param {number} campaignId - Campaign ID
   * @param {number} leadId - Lead ID
   * @param {Object} params - Analysis parameters
   * @param {boolean} params.include_pain_points - Include pain point analysis
   * @param {boolean} params.include_rationale - Include scoring rationale
   * @returns {Promise<{lead_id: number, business_name: string, pain_point_analysis?: Object, scoring_rationale?: string}>}
   */
  analyzeLead: async (campaignId, leadId, params = {}) => {
    const response = await client.post(
      `/ai/campaigns/${campaignId}/analyze-lead/${leadId}`,
      params
    );
    return response.data;
  },

  // ============================================================================
  // Wizard-mode endpoints (no campaign_id required)
  // ============================================================================

  /**
   * Get AI-suggested target profile for a new campaign (wizard mode)
   * @param {Object} params - Campaign details
   * @param {string} params.name - Campaign name
   * @param {string} params.description - Campaign description
   * @param {string} params.product_type - Product type
   * @param {string} params.company_name - Company name
   * @param {string} params.product_name - Product name
   * @returns {Promise<{industries: Array, business_types: Array, size_metric: Object, size_range: Object}>}
   */
  suggestTargetProfile: async (params) => {
    const response = await client.post('/ai/wizard/suggest-target-profile', params);
    return response.data;
  },

  /**
   * Get AI-suggested pain point keywords for a new campaign (wizard mode)
   * @param {Object} context - Draft campaign context
   * @param {Array} existingKeywords - Already configured keywords
   * @returns {Promise<{keywords: Array, total_count: number, industry_specific_count: number}>}
   */
  suggestDraftKeywords: async (context, existingKeywords = []) => {
    const response = await client.post('/ai/wizard/suggest-keywords', {
      context,
      existing_keywords: existingKeywords,
    });
    return response.data;
  },

  /**
   * Get AI-suggested Google Maps search queries for a new campaign (wizard mode)
   * @param {Object} context - Draft campaign context
   * @returns {Promise<{queries: Array}>}
   */
  suggestSearchQueries: async (context) => {
    const response = await client.post('/ai/wizard/suggest-queries', {
      context,
    });
    return response.data;
  },

  /**
   * Get AI-suggested value propositions for a new campaign (wizard mode)
   * @param {Object} context - Draft campaign context
   * @param {Array} painPoints - Pain points from the campaign
   * @returns {Promise<{value_propositions: Array, recommended_for_initial_outreach: number, recommended_for_follow_up: number}>}
   */
  suggestDraftValueProps: async (context, painPoints = []) => {
    const response = await client.post('/ai/wizard/suggest-value-props', {
      context,
      pain_points: painPoints,
    });
    return response.data;
  },
};

export default aiApi;
