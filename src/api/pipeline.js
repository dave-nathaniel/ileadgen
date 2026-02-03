import client from './client';

export const pipelineApi = {
  collect: async (campaignId) => {
    const response = await client.post(`/campaigns/${campaignId}/pipeline/collect`);
    return response.data;
  },

  enrich: async (campaignId) => {
    const response = await client.post(`/campaigns/${campaignId}/pipeline/enrich`);
    return response.data;
  },

  score: async (campaignId) => {
    const response = await client.post(`/campaigns/${campaignId}/pipeline/score`);
    return response.data;
  },

  run: async (campaignId) => {
    const response = await client.post(`/campaigns/${campaignId}/pipeline/run`);
    return response.data;
  },

  getStatus: async (campaignId) => {
    const response = await client.get(`/campaigns/${campaignId}/pipeline/status`);
    return response.data;
  },

  getTaskStatus: async (campaignId, taskId) => {
    const response = await client.get(`/campaigns/${campaignId}/pipeline/task/${taskId}`);
    return response.data;
  },
};

export default pipelineApi;
