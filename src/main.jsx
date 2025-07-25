import { reportWebVitals } from './utils/reportWebVitals';
// Listen for pushResubscribe messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'pushResubscribe' && event.data.subscription) {
      // Send new subscription to backend
      fetch('https://jcserver.onrender.com/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.data.subscription)
      })
        .then(() => {
          console.log('Push subscription updated on backend after change.');
        })
        .catch(err => {
          console.error('Failed to update push subscription after change:', err);
        });
    }
  });
}
// Helper: subscribe user to push notifications and send to backend
async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BAnXpkSuLZLZcgOO0ibI-Z3grRNhkuszV8R7ZyGsRuPMUaAFnIhEtVyvdi8aqGxGVr5PCeG57DPnTt7iOgFgfdU')
      });
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      // Send subscription to backend with Authorization header if token exists
      await fetch('https://jcserver.onrender.com/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(subscription)
      });
      console.log('Push subscription sent to backend:', subscription);
    } catch (err) {
      console.error('Push subscription error:', err);
    }
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
import { StrictMode } from 'react'
import ErrorBoundary from './components/ErrorBoundary';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './components/AuthContext';
import { HelmetProvider } from 'react-helmet-async';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </HelmetProvider>
    </AuthProvider>
  </StrictMode>,
);

// Start reporting web vitals after app is mounted
reportWebVitals();

// Register service worker only (notification logic moved to OrderConfirmation)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered:', reg);
    });
  });
}
