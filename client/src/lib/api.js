/**
 * Frontend API client for ReleaseReady AI.
 * Supports dynamic remote backend URLs (e.g. Vercel -> Render), local fallback, and JWT authentication.
 */
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export const AUTH_TOKEN_KEY = 'releaseready_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    // Ignore storage errors
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg = data?.error?.message || (typeof data === 'string' ? data : `Request failed with status ${res.status}`);
      const err = new Error(errorMsg);
      err.status = res.status;
      err.details = data?.error?.details || null;
      err.code = data?.error?.code || 'API_ERROR';
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to ReleaseReady backend server. Please verify the backend is running.');
    }
    throw err;
  }
}

export const api = {
  // Authentication (Passport.js)
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  demoLogin: (role = 'engineer') => request('/auth/demo', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => request('/auth/me'),

  // Health
  getHealth: () => request('/health'),

  // Releases
  getReleases: () => request('/releases'),
  getRelease: (id) => request(`/releases/${id}`),
  createRelease: (data) => request('/releases', { method: 'POST', body: JSON.stringify(data) }),
  updateRelease: (id, data) => request(`/releases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRelease: (id) => request(`/releases/${id}`, { method: 'DELETE' }),
  validateRelease: (id) => request(`/releases/${id}/validate`, { method: 'POST' }),

  // AI Analysis
  triggerAnalysis: (id) => request(`/releases/${id}/analyze`, { method: 'POST' }),
  getAiStatus: (id) => request(`/releases/${id}/status`),

  // Version Snapshots
  getSnapshots: (releaseId) => request(`/releases/${releaseId}/versions`),
  createSnapshot: (releaseId, data) => request(`/releases/${releaseId}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  getSnapshot: (releaseId, versionId) => request(`/releases/${releaseId}/versions/${versionId}`),
  compareVersions: (releaseId, baseVersionId, targetVersionId) => 
    request(`/releases/${releaseId}/versions/compare`, {
      method: 'POST',
      body: JSON.stringify({ baseVersionId, targetVersionId })
    }),

  // Review Statements
  getStatements: (releaseId) => request(`/releases/${releaseId}/review`),
  updateStatementReview: (statementId, data) => 
    request(`/statements/${statementId}/review`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Final Release Brief
  getBrief: (releaseId, versionId = null) => 
    request(`/releases/${releaseId}/brief${versionId ? `?versionId=${encodeURIComponent(versionId)}` : ''}`)
};
