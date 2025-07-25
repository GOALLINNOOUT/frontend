
console.log('[WebVitals] reportWebVitals.js loaded');
// Utility to report web-vitals from the browser to the backend
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';
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
  onCLS(m => { console.log('[WebVitals] CLS:', m); sendToAnalytics(m); });
  onFID(m => { console.log('[WebVitals] FID:', m); sendToAnalytics(m); });
  onLCP(m => { console.log('[WebVitals] LCP:', m); sendToAnalytics(m); });
  onFCP(m => { console.log('[WebVitals] FCP:', m); sendToAnalytics(m); });
  onTTFB(m => { console.log('[WebVitals] TTFB:', m); sendToAnalytics(m); });
  if (typeof onINP === 'function') onINP(m => { console.log('[WebVitals] INP:', m); sendToAnalytics(m); });
}
