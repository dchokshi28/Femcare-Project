import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../lib/api';

const AuthContext = createContext(null);
const trimEmail = (email) => (typeof email === 'string' ? email.trim() : '');

export function formatApiError(data, status) {
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
    return status ? `Request failed (${status}). Please try again.` : 'Authentication request failed.';
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
      return 'Authentication request failed.';
    }
  }

  return String(detail);
}

async function authRequest(path, body, method = 'POST') {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (networkError) {
    const error = new Error('Cannot connect to the FEMCARE server. Please verify the backend is running.');
    error.status = 0;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(formatApiError(data, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function userWithSubscription(currentUser) {
  if (!currentUser) return null;
  try {
    const data = await authRequest('/api/subscriptions/me', undefined, 'GET');
    const entitlement = data?.entitlement;
    const latestSub = data?.latest_subscription;

    // Strict verification: subscription must be active and paid with a future expiration date
    const isActivePremium = Boolean(
      entitlement &&
      entitlement.subscription_status === 'active' &&
      entitlement.payment_status === 'paid' &&
      entitlement.expires_at &&
      new Date(entitlement.expires_at).getTime() > Date.now()
    );

    return {
      ...currentUser,
      subscription: isActivePremium ? (entitlement.plan_type || 'premium') : null,
      subscriptionPlan: isActivePremium ? entitlement.plan_type : null,
      subscriptionExpiresAt: isActivePremium ? entitlement.expires_at : (latestSub?.expires_at || null),
      subscriptionStatus: isActivePremium ? 'active' : (latestSub?.subscription_status || 'none'),
      paymentStatus: isActivePremium ? 'paid' : (latestSub?.payment_status || 'none'),
      is_premium: isActivePremium,
    };
  } catch {
    return {
      ...currentUser,
      subscription: null,
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
      subscriptionStatus: 'none',
      paymentStatus: 'none',
      is_premium: false,
    };
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const signupInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    authRequest('/api/auth/me', undefined, 'GET')
      .then(async (result) => {
        const currentUser = result?.user || null;
        const hydratedUser = await userWithSubscription(currentUser);
        if (active) {
          setSession(currentUser ? { authenticated: true } : null);
          setUser(hydratedUser);
        }
      })
      .catch(() => {
        if (active) { setUser(null); setSession(null); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refreshSubscription = async () => {
    if (!user) return null;
    try {
      const data = await authRequest('/api/subscriptions/me', undefined, 'GET');
      const entitlement = data?.entitlement;
      const latestSub = data?.latest_subscription;

      const isActivePremium = Boolean(
        entitlement &&
        entitlement.subscription_status === 'active' &&
        entitlement.payment_status === 'paid' &&
        entitlement.expires_at &&
        new Date(entitlement.expires_at).getTime() > Date.now()
      );

      const updated = {
        subscription: isActivePremium ? (entitlement.plan_type || 'premium') : null,
        subscriptionPlan: isActivePremium ? entitlement.plan_type : null,
        subscriptionExpiresAt: isActivePremium ? entitlement.expires_at : (latestSub?.expires_at || null),
        subscriptionStatus: isActivePremium ? 'active' : (latestSub?.subscription_status || 'none'),
        paymentStatus: isActivePremium ? 'paid' : (latestSub?.payment_status || 'none'),
        is_premium: isActivePremium,
      };

      setUser(current => current ? { ...current, ...updated } : current);
      return isActivePremium ? entitlement : null;
    } catch {
      setUser(current => current ? {
        ...current,
        subscription: null,
        subscriptionPlan: null,
        subscriptionExpiresAt: null,
        subscriptionStatus: 'none',
        paymentStatus: 'none',
        is_premium: false,
      } : current);
      return null;
    }
  };

  const signup = async (email, password, profileData = {}) => {
    if (signupInFlight.current) return { success: false, error: 'Signup is already in progress. Please wait.' };
    signupInFlight.current = true;
    try {
      const trimmedEmail = trimEmail(email);
      const parsedAge = typeof profileData.age === 'number' && !isNaN(profileData.age)
        ? profileData.age
        : (profileData.age ? parseInt(profileData.age, 10) : 25);
      const parsedCycle = typeof profileData.cycleLength === 'number' && !isNaN(profileData.cycleLength)
        ? profileData.cycleLength
        : (profileData.cycleLength ? parseInt(profileData.cycleLength, 10) : 28);

      const { user: rawCreatedUser } = await authRequest('/api/auth/signup', {
        email: trimmedEmail,
        password,
        name: typeof profileData.name === 'string' ? profileData.name.trim() : '',
        age: !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : 25,
        cycleLength: !isNaN(parsedCycle) && parsedCycle > 0 ? parsedCycle : 28,
        lastPeriodDate: profileData.lastPeriodDate || null,
      });
      const createdUser = await userWithSubscription(rawCreatedUser);
      setUser(createdUser);
      setSession({ authenticated: true });
      return { success: true, requiresEmailConfirmation: false };
    } catch (error) {
      const errorMessage = error?.message || 'Signup failed. Please try again.';
      console.error('Signup error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      signupInFlight.current = false;
    }
  };

  const login = async (email, password) => {
    try {
      const { user: rawLoggedInUser } = await authRequest('/api/auth/login', {
        email: trimEmail(email),
        password,
      });
      const loggedInUser = await userWithSubscription(rawLoggedInUser);
      setUser(loggedInUser);
      setSession({ authenticated: true });
      return { success: true };
    } catch (error) {
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      console.error('Login error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (newUserData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    try {
      const { user: updatedUser } = await authRequest('/api/auth/me', newUserData, 'PATCH');
      setUser(current => current ? {
        ...updatedUser,
        subscription: current.subscription,
        subscriptionPlan: current.subscriptionPlan,
        subscriptionExpiresAt: current.subscriptionExpiresAt,
        subscriptionStatus: current.subscriptionStatus,
        paymentStatus: current.paymentStatus,
        is_premium: current.is_premium,
      } : updatedUser);
      return { success: true };
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update profile.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try { await authRequest('/api/auth/logout'); }
    finally { setUser(null); setSession(null); }
  };

  // Sessions are HttpOnly cookies; frontend code intentionally cannot read a JWT.
  const getAccessToken = () => null;

  return (
    <AuthContext.Provider value={{ user, session, signup, login, logout, updateUser, refreshSubscription, loading, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
