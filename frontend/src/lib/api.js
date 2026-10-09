/**
 * FEMCARE API Base URL + safe fetch wrapper
 *
 * Local development defaults to the FastAPI service started on port 5000.
 */
const localApiHost = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
export const API_BASE = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim() !== '')
  ? String(import.meta.env.VITE_API_URL).trim()
  : `http://${localApiHost}:5000`;

export const formatApiError = (data, status) => {
  if (!data) {
    return status ? `Request failed (${status}). Please try again.` : 'Network error. Please check your connection.';
  }
  if (typeof data === 'string') return data;

  const detail = data.detail !== undefined ? data.detail : (data.error || data.message);
  if (!detail) {
    if (status === 401) return 'Please sign in to continue.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return 'An account with this email already exists.';
    if (status === 422) return 'Invalid request data. Please check your input.';
    return status ? `Request failed (${status}). Please try again.` : 'Request failed.';
  }

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map((err) => {
      if (typeof err === 'string') return err;
      if (err && typeof err === 'object') {
        const fieldLoc = Array.isArray(err.loc)
          ? err.loc.filter((l) => l !== 'body').join(' ')
          : '';
        const fieldName = fieldLoc ? fieldLoc.charAt(0).toUpperCase() + fieldLoc.slice(1) : '';
        const msg = err.msg || 'Invalid value';
        return fieldName ? `${fieldName}: ${msg}` : msg;
      }
      return String(err);
    }).filter(Boolean);

    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  if (typeof detail === 'object') {
    if (typeof detail.msg === 'string') return detail.msg;
    if (typeof detail.message === 'string') return detail.message;
    if (typeof detail.error === 'string') return detail.error;
    try {
      return JSON.stringify(detail);
    } catch {
      return 'Request failed.';
    }
  }

  return String(detail);
};

/**
 * Safe fetch — always returns { data, error }.
 * Never throws. Never crashes on non-JSON responses.
 * Never shows "Unexpected token" errors.
 */
export const apiFetch = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    // Check content-type before trying to parse JSON
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      if (isJson) {
        try {
          const errBody = await res.json();
          errorMsg = formatApiError(errBody, res.status) || errorMsg;
        } catch {
          // ignore parse error
        }
      }
      return { data: null, error: errorMsg, status: res.status };
    }

    if (!isJson) {
      return { data: null, error: 'Server returned an unexpected response. Please try again later.', status: res.status };
    }

    const data = await res.json();
    return { data, error: null, status: res.status };

  } catch (err) {
    // Network error — backend is likely down
    const msg = err.message?.includes('fetch')
      ? 'Cannot connect to the FEMCARE server. Please check your connection or try again later.'
      : err.message || 'Unknown error';
    return { data: null, error: msg, status: 0 };
  }
};
