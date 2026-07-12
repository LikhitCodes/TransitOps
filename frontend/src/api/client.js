const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Gets the current auth token from local storage
 */
const getToken = () => {
  const userStr = localStorage.getItem('transitops_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.token;
  } catch {
    return null;
  }
};

/**
 * Core fetch wrapper that automatically adds auth headers
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  // Handle 401 Unauthorized (could trigger token refresh here in the future)
  if (response.status === 401) {
    // For now, if 401, clear token and let AuthContext handle redirect
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    window.dispatchEvent(new Event('auth-unauthorized'));
  }

  // Parse JSON if possible
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let errorMessage = data?.detail || response.statusText || 'An error occurred';
    
    // If it's a DRF validation error object like {"email": ["Error message"]}
    if (data && typeof data === 'object' && !data.detail) {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        errorMessage = `${firstKey}: ${data[firstKey][0]}`;
      } else if (firstKey && typeof data[firstKey] === 'string') {
        errorMessage = `${firstKey}: ${data[firstKey]}`;
      }
    }

    throw new APIError(
      errorMessage,
      response.status,
      data
    );
  }

  return data;
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
