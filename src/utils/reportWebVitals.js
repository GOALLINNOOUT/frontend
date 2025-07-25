console.log('[WebVitals] reportWebVitals.js loaded');

// Debug the import first
import * as webVitals from 'web-vitals/attribution';
import * as api from './api';

console.log('[WebVitals] webVitals object:', webVitals);
console.log('[WebVitals] Available functions:', Object.keys(webVitals));

function sendToAnalytics(metric) {
  console.log('[WebVitals] Sending metric:', metric);
  api.post('/v1/analytics/web-vitals', {
    ...metric,
    page: window.location.pathname,
    url: window.location.href,
  }).then(res => {
    console.log('[WebVitals] API response:', res);
  }).catch(err => {
    console.error('[WebVitals] API error:', err);
  });
}

export function reportWebVitals() {
  console.log('[WebVitals] reportWebVitals() called');
  console.log('[WebVitals] webVitals functions available:');
  console.log('- getCLS:', typeof webVitals.getCLS);
  console.log('- getFID:', typeof webVitals.getFID);
  console.log('- getLCP:', typeof webVitals.getLCP);
  console.log('- getFCP:', typeof webVitals.getFCP);
  console.log('- getTTFB:', typeof webVitals.getTTFB);
  console.log('- getINP:', typeof webVitals.getINP);

  // Try calling them with more error handling
  try {
    if (typeof webVitals.getCLS === 'function') {
      console.log('[WebVitals] Calling getCLS...');
      webVitals.getCLS(m => { 
        console.log('[WebVitals] CLS callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getCLS not available');
    }

    if (typeof webVitals.getFID === 'function') {
      console.log('[WebVitals] Calling getFID...');
      webVitals.getFID(m => { 
        console.log('[WebVitals] FID callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getFID not available');
    }

    if (typeof webVitals.getLCP === 'function') {
      console.log('[WebVitals] Calling getLCP...');
      webVitals.getLCP(m => { 
        console.log('[WebVitals] LCP callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getLCP not available');
    }

    if (typeof webVitals.getFCP === 'function') {
      console.log('[WebVitals] Calling getFCP...');
      webVitals.getFCP(m => { 
        console.log('[WebVitals] FCP callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getFCP not available');
    }

    if (typeof webVitals.getTTFB === 'function') {
      console.log('[WebVitals] Calling getTTFB...');
      webVitals.getTTFB(m => { 
        console.log('[WebVitals] TTFB callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getTTFB not available');
    }

    if (typeof webVitals.getINP === 'function') {
      console.log('[WebVitals] Calling getINP...');
      webVitals.getINP(m => { 
        console.log('[WebVitals] INP callback fired:', m); 
        sendToAnalytics(m); 
      });
    } else {
      console.log('[WebVitals] getINP not available');
    }
  } catch (error) {
    console.error('[WebVitals] Error calling web vitals functions:', error);
  }
}

// Also try the alternative import path
setTimeout(() => {
  console.log('[WebVitals] Trying alternative import after delay...');
  try {
    import('web-vitals').then(webVitalsDefault => {
      console.log('[WebVitals] Default import:', webVitalsDefault);
      console.log('[WebVitals] Default import keys:', Object.keys(webVitalsDefault));
    });
  } catch (e) {
    console.error('[WebVitals] Alternative import failed:', e);
  }
}, 1000);