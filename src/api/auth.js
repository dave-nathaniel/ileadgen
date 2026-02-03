import client from './client';

export const authApi = {
  register: async (data) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await client.post('/auth/login', data);
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  updateMe: async (data) => {
    const response = await client.patch('/auth/me', data);
    return response.data;
  },
};

export default authApi;
