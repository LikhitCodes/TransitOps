import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Role → Allowed route mappings (RBAC)
 * Used after login to determine which pages the user can access.
 */
export const ROLE_ROUTES = {
  'Fleet Manager':      ['/fleet', '/maintenance'],
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

// Mock credentials for frontend-only testing (one for each role)
export const MOCK_USERS = {
  'Fleet Manager':     { email: 'fleet@transitops.in', password: 'password123' },
  'Dispatcher':        { email: 'dispatcher@transitops.in', password: 'password123' },
  'Safety Officer':    { email: 'safety@transitops.in', password: 'password123' },
  'Financial Analyst': { email: 'finance@transitops.in', password: 'password123' },
};

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
   * Mock login — validates against hardcoded credentials.
   * Returns { success, error } for the UI to handle.
   * When backend is ready, replace the validation block with an API call.
   */
  const login = useCallback((email, password, role) => {
    // Check lockout
    if (isLockedOut) {
      const mins = Math.ceil(lockoutRemaining / 60000);
      return {
        success: false,
        error: `Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
      };
    }

    // Simulate authentication
    const mockUser = MOCK_USERS[role];
    const isValid = mockUser &&
      email.toLowerCase() === mockUser.email &&
      password === mockUser.password;

    if (!isValid) {
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

    // Success
    const userData = { email, role };
    setUser(userData);
    setFailedAttempts(0);
    setLockoutUntil(null);
    localStorage.setItem('transitops_user', JSON.stringify(userData));

    return { success: true, error: null };
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
