import { useState, useEffect, useCallback, useRef } from 'react';
import { eventsApi } from '../api';

/**
 * Custom hook for managing browser notifications
 * Handles permission requests, notification display, and preferences
 */
export function useBrowserNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [preferences, setPreferences] = useState({
    notify_campaign_completed: true,
    notify_campaign_failed: true,
    notify_lead_responded: true,
    notify_lead_converted: true,
    notify_task_failed: true,
    sound_enabled: true,
    desktop_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  // Load preferences from API on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await eventsApi.getNotificationPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      console.warn('Browser notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }

    return Notification.permission;
  }, []);

  // Update preferences via API
  const updatePreferences = useCallback(async (newPrefs) => {
    try {
      const updated = await eventsApi.updateNotificationPreferences(newPrefs);
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (preferences.sound_enabled) {
      try {
        // Create audio element if not exists
        if (!audioRef.current) {
          audioRef.current = new Audio();
          // Use a simple notification sound (base64 encoded short beep)
          audioRef.current.src =
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleUUGJoXKYH1i';
        }
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      } catch (e) {
        // Ignore audio errors
      }
    }
  }, [preferences.sound_enabled]);

  // Show browser notification
  const showNotification = useCallback(
    (event) => {
      // Check if desktop notifications are enabled
      if (!preferences.desktop_enabled) {
        return null;
      }

      // Check if browser notifications are supported and permitted
      if (typeof Notification === 'undefined' || permission !== 'granted') {
        return null;
      }

      // Check event-specific preferences
      const eventType = event.event_type;
      const shouldNotify =
        (eventType === 'campaign_completed' && preferences.notify_campaign_completed) ||
        (eventType === 'campaign_failed' && preferences.notify_campaign_failed) ||
        (eventType === 'lead_responded' && preferences.notify_lead_responded) ||
        (eventType === 'lead_converted' && preferences.notify_lead_converted) ||
        (eventType === 'task_failed' && preferences.notify_task_failed) ||
        event.should_notify; // Server-side flag

      if (!shouldNotify) {
        return null;
      }

      // Play sound
      playSound();

      // Create notification
      try {
        const notification = new Notification(event.title, {
          body: event.message,
          icon: '/favicon.ico', // Use app icon
          tag: `event-${event.id}`, // Prevent duplicate notifications
          requireInteraction: event.priority === 'critical',
          data: {
            eventId: event.id,
            campaignId: event.campaign_id,
            leadId: event.lead_id,
            eventType: event.event_type,
          },
        });

        // Handle notification click
        notification.onclick = (e) => {
          e.preventDefault();
          window.focus();

          // Navigate based on event type
          const data = notification.data;
          if (data.leadId && data.campaignId) {
            window.location.href = `/campaigns/${data.campaignId}/leads/${data.leadId}`;
          } else if (data.campaignId) {
            window.location.href = `/campaigns/${data.campaignId}`;
          }

          notification.close();
        };

        return notification;
      } catch (error) {
        console.error('Failed to show notification:', error);
        return null;
      }
    },
    [permission, preferences, playSound]
  );

  // Process incoming event and show notification if appropriate
  const processEvent = useCallback(
    (event) => {
      // Only show notifications for high/critical priority events
      if (event.should_notify || ['high', 'critical'].includes(event.priority)) {
        return showNotification(event);
      }
      return null;
    },
    [showNotification]
  );

  return {
    permission,
    preferences,
    loading,
    requestPermission,
    updatePreferences,
    showNotification,
    processEvent,
    isSupported: typeof Notification !== 'undefined',
    isEnabled: permission === 'granted' && preferences.desktop_enabled,
  };
}

export default useBrowserNotifications;
