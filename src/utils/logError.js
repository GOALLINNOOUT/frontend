// src/utils/logError.js
import { post } from './api';

export function logErrorToServer(error, errorInfo) {
  try {
    post('/v1/analytics/log-error', {
      message: error?.toString(),
      stack: errorInfo?.componentStack,
      url: window.location.href,
      user: localStorage.getItem('userId') || null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // fallback: log to console if network fails
    console.error('Failed to log error to server', e);
  }
}
