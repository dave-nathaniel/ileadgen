import { useState, useEffect, useCallback, useRef } from 'react';
import { pipelineApi } from '../api';
import { POLLING_INTERVALS } from '../utils/constants';

/**
 * Custom hook for monitoring pipeline status with auto-polling
 * @param {string} campaignId - Campaign ID to monitor
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable polling
 * @param {boolean} options.pollWhenRunning - Poll when pipeline is running (default: true)
 * @param {number} options.pollInterval - Polling interval in ms (default: from constants)
 * @param {function} options.onStatusChange - Callback when status changes
 * @param {function} options.onComplete - Callback when pipeline completes
 * @param {function} options.onError - Callback on errors
 */
export function usePipelineStatus(campaignId, options = {}) {
  const {
    enabled = true,
    pollWhenRunning = true,
    pollInterval = POLLING_INTERVALS.pipelineStatus,
    onStatusChange,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const previousStatusRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!campaignId || !enabled) return null;

    try {
      setLoading(true);
      const data = await pipelineApi.getStatus(campaignId);
      setStatus(data);
      setError(null);

      // Check if running
      const running = data?.status === 'PENDING' || data?.status === 'STARTED';
      setIsRunning(running);

      // Trigger callbacks on status change
      if (previousStatusRef.current?.status !== data?.status) {
        onStatusChange?.(data);

        // Check for completion
        if (
          previousStatusRef.current?.status &&
          (previousStatusRef.current.status === 'PENDING' || previousStatusRef.current.status === 'STARTED') &&
          (data?.status === 'SUCCESS' || data?.status === 'FAILURE')
        ) {
          onComplete?.(data);
        }
      }

      previousStatusRef.current = data;
      return data;
    } catch (err) {
      setError(err);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [campaignId, enabled, onComplete, onError, onStatusChange]);

  // Start pipeline
  const runPipeline = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      await pipelineApi.run(campaignId);
      setIsRunning(true);
      // Fetch updated status
      await fetchStatus();
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaignId, fetchStatus, onError]);

  // Poll when running
  useEffect(() => {
    if (!pollWhenRunning || !isRunning || !enabled) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(() => {
      fetchStatus();
    }, pollInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isRunning, pollWhenRunning, enabled, pollInterval, fetchStatus]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    isRunning,
    refetch: fetchStatus,
    runPipeline,
  };
}

export default usePipelineStatus;
