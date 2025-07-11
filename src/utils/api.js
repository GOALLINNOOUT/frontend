// src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function request(endpoint, { method = 'GET', data, headers = {}, ...options } = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  // Attach JWT token if present
  const token = localStorage.getItem('token');
  if (token) {
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }
  // Attach x-session-id header ONLY if it exists in localStorage
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    headers = { ...headers, 'x-session-id': sessionId };
  }
  const fetchOptions = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...options,
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  const res = await fetch(url, fetchOptions);
  // If backend returns a new x-session-id, update localStorage
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
