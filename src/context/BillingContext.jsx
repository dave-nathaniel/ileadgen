import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { billingApi } from '../api/billing';
import { useAuth } from './AuthContext';

const BillingContext = createContext(null);

const initialState = {
  balance: null,
  pricing: null,
  isLoading: false,
  error: null,
};

const billingReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload, isLoading: false };
    case 'SET_PRICING':
      return { ...state, pricing: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export function BillingProvider({ children }) {
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchBalance = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await billingApi.getBalance();
      dispatch({ type: 'SET_BALANCE', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  }, []);

  const fetchPricing = useCallback(async () => {
    try {
      const data = await billingApi.getPricing();
      dispatch({ type: 'SET_PRICING', payload: data });
    } catch (error) {
      // Non-critical, silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchPricing();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [isAuthenticated, fetchBalance, fetchPricing]);

  const value = {
    ...state,
    fetchBalance,
    fetchPricing,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}

export default BillingContext;
