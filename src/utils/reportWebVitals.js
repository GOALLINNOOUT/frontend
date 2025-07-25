// Utility to report web-vitals from the browser to the backend
import { getCLS, getFID, getLCP, getFCP, getTTFB, getINP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Optionally add more context (page, session, user, etc.)
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...metric,
      page: window.location.pathname,
      url: window.location.href,
      // Add sessionId/userId if available
    }),
    keepalive: true, // for page unload
  });
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  if (getFCP) getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  if (getINP) getINP(sendToAnalytics);
}
