import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Role → Allowed route mappings (RBAC)
 * Used after login to determine which pages the user can access.
 */
export const ROLE_ROUTES = {
  'Fleet Manager':      ['/fleet', '/maintenance', '/settings'],
  'Dispatcher':         ['/dashboard', '/trips'],
  'Safety Officer':     ['/drivers', '/compliance'],
  'Financial Analyst':  ['/fuel-expenses', '/analytics'],
};

/**
 * Role → Default landing page after login
 */
export const ROLE_DEFAULT_ROUTE = {
  'Fleet Manager':      '/fleet',
  'Dispatcher':         '/dashboard',
  'Safety Officer':     '/drivers',
  'Financial Analyst':  '/fuel-expenses',
};

const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Removed mock users

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('transitops_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = lockoutUntil - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutRemaining(0);
        setFailedAttempts(0);
      } else {
        setLockoutRemaining(remaining);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  /**
   * Login using Django REST Framework SimpleJWT endpoint
   */
  const login = useCallback(async (email, password, expectedRole) => {
    // Check lockout
    if (isLockedOut) {
      const mins = Math.ceil(lockoutRemaining / 60000);
      return {
        success: false,
        error: `Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
      };
    }

    try {
      // 1. Get Token
      const res = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_DURATION_MS;
          setLockoutUntil(until);
          return {
            success: false,
            error: `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in 10 minutes.`,
          };
        }

        return {
          success: false,
          error: `Invalid credentials. ${MAX_FAILED_ATTEMPTS - newAttempts} attempt${MAX_FAILED_ATTEMPTS - newAttempts !== 1 ? 's' : ''} remaining.`,
        };
      }

      const data = await res.json();
      const token = data.access;

      // 2. Get User Profile to verify role
      const profileRes = await fetch('http://127.0.0.1:8000/api/auth/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();

      // Role check against the role they selected on login screen
      if (profileData.role !== expectedRole && expectedRole) {
        return {
          success: false,
          error: `You do not have the ${expectedRole} role.`
        }
      }

      const userData = { ...profileData, token };
      setUser(userData);
      setFailedAttempts(0);
      setLockoutUntil(null);
      localStorage.setItem('transitops_user', JSON.stringify(userData));

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Network error connecting to the server.' };
    }
  }, [failedAttempts, isLockedOut, lockoutRemaining]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLockedOut,
    lockoutRemaining,
    failedAttempts,
    allowedRoutes: user ? ROLE_ROUTES[user.role] || [] : [],
    defaultRoute: user ? ROLE_DEFAULT_ROUTE[user.role] || '/dashboard' : '/login',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
