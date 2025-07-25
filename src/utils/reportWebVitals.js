// Utility to report web-vitals from the browser to the backend
import * as webVitals from 'web-vitals';

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
  if (webVitals.getCLS) webVitals.getCLS(sendToAnalytics);
  if (webVitals.getFID) webVitals.getFID(sendToAnalytics);
  if (webVitals.getLCP) webVitals.getLCP(sendToAnalytics);
  if (webVitals.getFCP) webVitals.getFCP(sendToAnalytics);
  if (webVitals.getTTFB) webVitals.getTTFB(sendToAnalytics);
  if (webVitals.getINP) webVitals.getINP(sendToAnalytics);
}
