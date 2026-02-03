import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Custom hook for Server-Sent Events (SSE) connection
 * @param {string} campaignId - Optional campaign ID to filter events
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the connection
 * @param {function} options.onEvent - Callback for each event
 * @param {function} options.onError - Callback for errors
 * @param {function} options.onConnect - Callback when connected
 * @param {function} options.onDisconnect - Callback when disconnected
 */
export function useEventSource(campaignId = null, options = {}) {
  const {
    enabled = true,
    onEvent,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!enabled || !isAuthenticated) return;

    // Build URL with auth token (EventSource doesn't support headers)
    const token = storage.getToken();
    let url = `${API_BASE_URL}/events/stream?token=${encodeURIComponent(token)}`;
    if (campaignId) {
      url += `&campaign_id=${campaignId}`;
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          onEvent?.(data);
        } catch (e) {
          console.error('Error parsing SSE message:', e);
        }
      };

      // Listen for specific event types
      ['lead_created', 'lead_updated', 'email_sent', 'email_opened', 'email_replied', 'pipeline_status'].forEach(
        (eventType) => {
          eventSource.addEventListener(eventType, (event) => {
            try {
              const data = JSON.parse(event.data);
              setLastEvent({ type: eventType, ...data });
              onEvent?.({ type: eventType, ...data });
            } catch (e) {
              console.error(`Error parsing SSE event ${eventType}:`, e);
            }
          });
        }
      );

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        setError(err);
        setIsConnected(false);
        onError?.(err);

        // Close and attempt reconnect
        eventSource.close();
        eventSourceRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY * reconnectAttemptsRef.current);
        }
      };
    } catch (err) {
      setError(err);
      onError?.(err);
    }
  }, [campaignId, enabled, isAuthenticated, onConnect, onError, onEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnect?.();
    }
  }, [onDisconnect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Reconnect when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
    }
  }, [isAuthenticated, disconnect]);

  return {
    isConnected,
    lastEvent,
    error,
    reconnect: connect,
    disconnect,
  };
}

export default useEventSource;
