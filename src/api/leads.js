import client from './client';

export const leadsApi = {
  list: async (campaignId, params = {}) => {
    const response = await client.get(`/campaigns/${campaignId}/leads/`, { params });
    return response.data;
  },

  get: async (campaignId, leadId) => {
    const response = await client.get(`/campaigns/${campaignId}/leads/${leadId}`);
    return response.data;
  },

  create: async (campaignId, data) => {
    const response = await client.post(`/campaigns/${campaignId}/leads/`, data);
    return response.data;
  },

  update: async (campaignId, leadId, data) => {
    const response = await client.patch(`/campaigns/${campaignId}/leads/${leadId}`, data);
    return response.data;
  },

  delete: async (campaignId, leadId) => {
    await client.delete(`/campaigns/${campaignId}/leads/${leadId}`);
  },

  bulkDelete: async (campaignId, leadIds) => {
    const response = await client.post(`/campaigns/${campaignId}/leads/bulk-delete`, { lead_ids: leadIds });
    return response.data;
  },

  import: async (campaignId, leads) => {
    const response = await client.post(`/campaigns/${campaignId}/leads/import`, { leads });
    return response.data;
  },

  export: async (campaignId, params = {}) => {
    const response = await client.get(`/campaigns/${campaignId}/leads/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportSelected: async (campaignId, leadIds) => {
    const response = await client.post(
      `/campaigns/${campaignId}/leads/export`,
      { lead_ids: leadIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  getEvents: async (campaignId, leadId, params = {}) => {
    const response = await client.get(
      `/campaigns/${campaignId}/leads/${leadId}/events`,
      { params }
    );
    return response.data;
  },

  // Get total count for pagination
  count: async (campaignId, params = {}) => {
    const response = await client.get(`/campaigns/${campaignId}/leads/count`, { params });
    return response.data;
  },
};

export default leadsApi;
