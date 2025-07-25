console.log('[WebVitals] reportWebVitals.js loaded');
// Utility to report web-vitals from the browser to the backend
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals/attribution';
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
  
  // Use the correct function names: onCLS, onFCP, etc.
  onCLS(m => { 
    console.log('[WebVitals] CLS:', m); 
    sendToAnalytics(m); 
  });
  
  onFCP(m => { 
    console.log('[WebVitals] FCP:', m); 
    sendToAnalytics(m); 
  });
  
  onLCP(m => { 
    console.log('[WebVitals] LCP:', m); 
    sendToAnalytics(m); 
  });
  
  onTTFB(m => { 
    console.log('[WebVitals] TTFB:', m); 
    sendToAnalytics(m); 
  });
  
  // INP replaces FID (FID is deprecated)
  onINP(m => { 
    console.log('[WebVitals] INP:', m); 
    sendToAnalytics(m); 
  });
}