import client from './client';

export const campaignsApi = {
  list: async (params = {}) => {
    const response = await client.get('/campaigns/', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await client.get(`/campaigns/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/campaigns/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.patch(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await client.delete(`/campaigns/${id}`);
  },

  getStats: async (id) => {
    const response = await client.get(`/campaigns/${id}/stats`);
    return response.data;
  },
};

export default campaignsApi;
