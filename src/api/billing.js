import client from './client';

export const billingApi = {
  getBalance: async () => {
    const response = await client.get('/billing/balance');
    return response.data;
  },

  getTransactions: async ({ page = 1, pageSize = 20, type } = {}) => {
    const params = { page, page_size: pageSize };
    if (type) params.type = type;
    const response = await client.get('/billing/transactions', { params });
    return response.data;
  },

  getPricing: async () => {
    const response = await client.get('/billing/pricing');
    return response.data;
  },

  createCheckoutSession: async (packageIndex, successUrl, cancelUrl) => {
    const response = await client.post('/billing/checkout', {
      package_index: packageIndex,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },
};

export default billingApi;
