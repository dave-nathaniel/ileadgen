import client from './client';

export const outreachApi = {
  getTemplates: async (campaignId) => {
    const response = await client.get(`/campaigns/${campaignId}/outreach/templates`);
    return response.data;
  },

  getSequences: async (campaignId) => {
    const response = await client.get(`/campaigns/${campaignId}/outreach/sequences`);
    return response.data;
  },

  preview: async (campaignId, data) => {
    const response = await client.post(`/campaigns/${campaignId}/outreach/preview`, data);
    return response.data;
  },

  send: async (campaignId, data) => {
    const response = await client.post(`/campaigns/${campaignId}/outreach/send`, data);
    return response.data;
  },

  runSequence: async (campaignId, data) => {
    const response = await client.post(`/campaigns/${campaignId}/outreach/run-sequence`, data);
    return response.data;
  },

  getStats: async (campaignId) => {
    const response = await client.get(`/campaigns/${campaignId}/outreach/stats`);
    return response.data;
  },
};

export default outreachApi;
