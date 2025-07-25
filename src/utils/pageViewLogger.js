// Utility to log page views to backend
import { post } from './api';
import { handleInvalidSession } from '../App';

/**
 * Logs a page view to the backend analytics endpoint.
 * @param {Object} params
 * @param {string} params.page - The current page path (e.g. window.location.pathname)
 * @param {string} [params.referrer] - The referrer URL (e.g. document.referrer)
 * @param {string} [params.sessionId] - Optional session ID
 * @param {string} [params.timestamp] - Optional ISO timestamp
 */
export async function logPageView({ page, referrer, sessionId, timestamp }) {
  try {
    await post(
      '/v1/page-views',
      {
        page,
        referrer,
        sessionId,
        timestamp
      },
      {
        credentials: 'include',
      }
    );
  } catch (err) {
    handleInvalidSession(err);
    if (typeof window !== 'undefined' && window?.location?.hostname === 'localhost') {
      // eslint-disable-next-line no-console
      console.error('Failed to log page view', err);
    }
  }
}
