
console.log('[WebVitals] reportWebVitals.js loaded');
// Utility to report web-vitals from the browser to the backend
import { getCLS, getFID, getLCP, getFCP, getTTFB, getINP } from 'web-vitals/attribution';
import * as api from './api';

function sendToAnalytics(metric) {
  // Debug: log every metric sent
  console.log('[WebVitals] Sending metric:', metric);
  api.post('/v1/analytics/web-vitals', {
    ...metric,
    page: window.location.pathname,
    url: window.location.href,
    // Add sessionId/userId if available
  }).then(res => {
    console.log('[WebVitals] API response:', res);
  }).catch(err => {
    console.error('[WebVitals] API error:', err);
  });
}

export function reportWebVitals() {
  console.log('[WebVitals] reportWebVitals() called');
  getCLS(m => { console.log('[WebVitals] CLS:', m); sendToAnalytics(m); });
  getFID(m => { console.log('[WebVitals] FID:', m); sendToAnalytics(m); });
  getLCP(m => { console.log('[WebVitals] LCP:', m); sendToAnalytics(m); });
  getFCP(m => { console.log('[WebVitals] FCP:', m); sendToAnalytics(m); });
  getTTFB(m => { console.log('[WebVitals] TTFB:', m); sendToAnalytics(m); });
  if (typeof getINP === 'function') getINP(m => { console.log('[WebVitals] INP:', m); sendToAnalytics(m); });
}
