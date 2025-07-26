// useSession.js - React hook to handle session expiration and renewal
import { useCallback } from 'react';
import * as api from '../utils/api';


export function useSession() {
  // Checks if the session is ended (by inspecting API response)
  const handleSessionResponse = useCallback(async (response) => {
    if (!response) return response;
    // If backend signals session expired (customize as needed)
    if (
      response.status === 440 ||
      response.status === 401 ||
      (response.data && response.data.error && response.data.error.toLowerCase().includes('session expired'))
    ) {
      // Remove old sessionId
      localStorage.removeItem('sessionId');
      // Request a new session from the backend
      try {
        const res = await api.post('/session/start');
        if (res.data && res.data.sessionId) {
          localStorage.setItem('sessionId', res.data.sessionId);
        }
      } catch (e) {
        // Optionally handle error
      }
      return { ...response, sessionRenewed: true };
    }
    return response;
  }, []);

  return { handleSessionResponse };
}
