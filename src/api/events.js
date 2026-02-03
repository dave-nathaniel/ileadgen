import client from './client';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

export const eventsApi = {
  /**
   * Get recent system events
   * @param {Object} params - Query parameters
   * @param {number} params.campaign_id - Filter by campaign ID
   * @param {number} params.limit - Max events to return
   * @param {boolean} params.include_read - Include read events
   * @returns {Promise<Array>}
   */
  getRecent: async (params = {}) => {
    const response = await client.get('/events/recent', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<{unread_count: number, high_priority_count: number}>}
   */
  getUnreadCount: async () => {
    const response = await client.get('/events/notifications/unread');
    return response.data;
  },

  /**
   * Mark notifications as read
   * @param {Object} params - Mark read parameters
   * @param {Array<number>} params.event_ids - Event IDs to mark as read
   * @param {boolean} params.mark_all - Mark all as read
   * @returns {Promise<{status: string, marked_read: number|string}>}
   */
  markRead: async (params) => {
    const response = await client.post('/events/notifications/mark-read', params);
    return response.data;
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>}
   */
  getNotificationPreferences: async () => {
    const response = await client.get('/events/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>}
   */
  updateNotificationPreferences: async (preferences) => {
    const response = await client.post('/events/notifications/preferences', preferences);
    return response.data;
  },

  /**
   * Create SSE connection for real-time events
   * @param {Object} options - SSE options
   * @param {number} options.campaignId - Filter by campaign ID
   * @param {boolean} options.includeLowPriority - Include low priority events
   * @returns {Object} Event source wrapper
   */
  createEventSource: (options = {}) => {
    const { campaignId = null, includeLowPriority = true } = options;
    const token = storage.getToken();

    // Build URL with query params
    const params = new URLSearchParams();
    if (campaignId) {
      params.append('campaign_id', campaignId);
    }
    if (!includeLowPriority) {
      params.append('include_low_priority', 'false');
    }
    // Note: For auth, we'd need server-side support for token-in-query
    // or use a different approach like fetch with EventSource polyfill

    const queryString = params.toString();
    const url = `${API_BASE_URL}/events/stream${queryString ? `?${queryString}` : ''}`;

    const eventSource = new EventSource(url);

    return {
      eventSource,

      onMessage: (callback) => {
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (e) {
            console.error('Error parsing SSE message:', e);
          }
        };
      },

      onEvent: (eventType, callback) => {
        eventSource.addEventListener(eventType, (event) => {
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (e) {
            console.error(`Error parsing SSE event ${eventType}:`, e);
          }
        });
      },

      onError: (callback) => {
        eventSource.onerror = callback;
      },

      close: () => {
        eventSource.close();
      },
    };
  },

  /**
   * Legacy endpoint for lead events
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>}
   */
  getLeadEvents: async (params = {}) => {
    const response = await client.get('/events/lead-events', { params });
    return response.data;
  },
};

export default eventsApi;
