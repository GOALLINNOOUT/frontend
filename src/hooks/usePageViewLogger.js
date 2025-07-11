import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView } from '../utils/pageViewLogger';

/**
 * React hook to log page views on route change.
 * Only logs if a sessionId exists (session is started on login/app start).
 * Handles session expiration (30 min inactivity) and cleanup.
 */
const SESSION_TIMEOUT_MINUTES = 30;

const usePageViewLogger = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const page = window.location.pathname + window.location.search;
    const referrer = document.referrer;
    let sessionId = localStorage.getItem('sessionId');
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();

    // If no sessionId, request from backend
    if (!sessionId) {
      fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.sessionId) {
            localStorage.setItem('sessionId', data.sessionId);
            // After receiving, log the page view
            localStorage.setItem('lastActivity', now.toString());
            logPageView({ page, referrer, sessionId: data.sessionId, timestamp: new Date().toISOString() });
          }
        });
      return;
    }

    // Helper to end session
    const endSession = async sessionId => {
      try {
        await fetch('/api/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch {
        // Optionally log error
      }
      localStorage.removeItem('sessionId');
      localStorage.removeItem('lastActivity');
    };

    // If no sessionId, do nothing (session must be started on login/app start)
    if (!sessionId) return;

    // Check for session expiration
    if (lastActivity) {
      const diffMinutes = (now - parseInt(lastActivity, 10)) / 60000;
      if (diffMinutes >= SESSION_TIMEOUT_MINUTES) {
        endSession(sessionId);
        return;
      }
    }

    // Log page view and update lastActivity
    localStorage.setItem('lastActivity', now.toString());
    logPageView({ page, referrer, sessionId, timestamp: new Date().toISOString() });
    // eslint-disable-next-line
  }, [location]);
};

export default usePageViewLogger;
