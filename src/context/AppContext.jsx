import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { campaignsApi, eventsApi } from '../api';
import { useAuth } from './AuthContext';
import { POLLING_INTERVALS } from '../utils/constants';

const AppContext = createContext(null);

const initialState = {
  campaigns: [],
  campaignsLoading: false,
  recentEvents: [],
  eventsLoading: false,
  stats: {
    totalLeads: 0,
    contacted: 0,
    responded: 0,
    converted: 0,
  },
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CAMPAIGNS_LOADING':
      return { ...state, campaignsLoading: action.payload };
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload, campaignsLoading: false };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case 'REMOVE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter((c) => c.id !== action.payload),
      };
    case 'SET_EVENTS_LOADING':
      return { ...state, eventsLoading: action.payload };
    case 'SET_EVENTS':
      return { ...state, recentEvents: action.payload, eventsLoading: false };
    case 'ADD_EVENT':
      return {
        ...state,
        recentEvents: [action.payload, ...state.recentEvents].slice(0, 50),
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();
  const pollingRef = useRef(null);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    dispatch({ type: 'SET_CAMPAIGNS_LOADING', payload: true });
    try {
      const campaigns = await campaignsApi.list();
      dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });

      // Calculate stats
      const stats = campaigns.reduce(
        (acc, c) => ({
          totalLeads: acc.totalLeads + (c.total_leads || 0),
          contacted: acc.contacted + (c.leads_contacted || 0),
          responded: acc.responded + (c.leads_responded || 0),
          converted: acc.converted + (c.leads_converted || 0),
        }),
        { totalLeads: 0, contacted: 0, responded: 0, converted: 0 }
      );
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      dispatch({ type: 'SET_CAMPAIGNS_LOADING', payload: false });
    }
  }, []);

  // Fetch recent events
  const fetchEvents = useCallback(async (campaignId = null) => {
    dispatch({ type: 'SET_EVENTS_LOADING', payload: true });
    try {
      const params = { limit: 20 };
      if (campaignId) params.campaign_id = campaignId;
      const events = await eventsApi.getRecent(params);
      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      dispatch({ type: 'SET_EVENTS_LOADING', payload: false });
    }
  }, []);

  // Start polling for events
  const startPolling = useCallback((campaignId = null) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    pollingRef.current = setInterval(() => {
      fetchEvents(campaignId);
    }, POLLING_INTERVALS.events);
  }, [fetchEvents]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
      fetchEvents();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isAuthenticated, fetchCampaigns, fetchEvents, startPolling, stopPolling]);

  // Campaign actions
  const addCampaign = (campaign) => {
    dispatch({ type: 'ADD_CAMPAIGN', payload: campaign });
  };

  const updateCampaign = (campaign) => {
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: campaign });
  };

  const removeCampaign = (id) => {
    dispatch({ type: 'REMOVE_CAMPAIGN', payload: id });
  };

  // Event actions
  const addEvent = (event) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  };

  const value = {
    ...state,
    fetchCampaigns,
    fetchEvents,
    addCampaign,
    updateCampaign,
    removeCampaign,
    addEvent,
    startPolling,
    stopPolling,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
