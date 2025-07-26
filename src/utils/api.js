// src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function request(endpoint, { method = 'GET', data, headers = {}, ...options } = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  // No need to manually attach JWT token; sent automatically via HTTP-only cookie
  // Attach x-session-id header ONLY if it exists in localStorage
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    headers = { ...headers, 'x-session-id': sessionId };
  }
  const fetchOptions = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    ...options,
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  // Helper to actually make the fetch and parse response
  async function doFetch() {
    const res = await fetch(url, fetchOptions);
    const newSessionId = res.headers.get('x-session-id');
    if (newSessionId) {
      localStorage.setItem('sessionId', newSessionId);
    }
    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, data: json };
  }

  let response = await doFetch();
  // Update lastActivity in localStorage after every backend request
  localStorage.setItem('lastActivity', Date.now().toString());
  // Check for session expiration and renew globally
  if (
    response.status === 440 ||
    response.status === 401 ||
    (response.data && response.data.error && response.data.error.toLowerCase().includes('session expired'))
  ) {
    // Remove old sessionId
    localStorage.removeItem('sessionId');
    // Request a new session from the backend
    try {
      const res = await fetch(`${API_BASE_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data && data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
    } catch {}
    // Retry the original request with new session
    response = await doFetch();
    response.sessionRenewed = true;
  }
  return response;
}

export const get = (endpoint, options) => request(endpoint, { ...options, method: 'GET' });
export const post = (endpoint, data, options) => request(endpoint, { ...options, method: 'POST', data });
export const put = (endpoint, data, options) => request(endpoint, { ...options, method: 'PUT', data });
export const del = (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' });
export const patch = (endpoint, data, options) => request(endpoint, { ...options, method: 'PATCH', data });
export const getPaginatedDesigns = async (page = 1, limit = 6) => {
  return get(`/designs/paginated?page=${page}&limit=${limit}`);
};
export const getDesignSuggestions = (query) => get(`/designs/suggestions?query=${encodeURIComponent(query)}`);
export const requestCustomLook = (data) => post('/custom-look-request', data);
export const getCustomLookRequests = () => get('/custom-look-request');
