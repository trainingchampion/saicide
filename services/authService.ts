import { TeamMember } from '../types';
import { MOCK_TEAM_MEMBERS } from '../constants';

// Storage keys
const USERS_KEY = 'sai_users';
const SESSION_KEY = 'sai_session';
const TOKEN_KEY = 'sai_auth_token';
const REFRESH_TOKEN_KEY = 'sai_refresh_token';
const VOUCHERS_KEY = 'sai_vouchers';
const TRIAL_KEY = 'sai_trial';

// Token expiry times (in milliseconds)
const ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const TRIAL_DURATION = 24 * 60 * 60 * 1000; // 1 day trial

// Valid voucher codes for 1-day Pro trial
const VALID_VOUCHERS: Record<string, { type: 'trial' | 'discount'; days?: number; discount?: number }> = {
  'SAIPRO24': { type: 'trial', days: 1 },
  'TRYSAI': { type: 'trial', days: 1 },
  'FREETRIAL': { type: 'trial', days: 1 },
  'WELCOME2025': { type: 'trial', days: 1 },
  'DEVPRO': { type: 'trial', days: 1 },
};

// Permission definitions by plan
export const PERMISSIONS = {
  Hobby: [
    'view:files',
    'edit:files',
    'view:search',
    'view:source-control',
    'view:extensions',
    'view:model-marketplace',
    'view:ux-studio',
    'use:terminal',
  ],
  Pro: [
    // All Hobby permissions
    'view:files',
    'edit:files',
    'view:search',
    'view:source-control',
    'view:extensions',
    'view:model-marketplace',
    'view:ux-studio',
    'use:terminal',
    // Pro-only permissions
    'use:ai-chat',
    'use:live-meeting',
    'use:whiteboard',
    'use:document-studio',
    'use:screen-recorder',
    'use:debug',
    'use:testing',
    'use:api-studio',
    'use:database',
    'use:terraform',
    'use:docker',
    'use:security',
    'use:deployment',
    'use:team',
    'use:kanban',
    'use:integrations',
    'use:personas',
    'use:ml-studio',
  ],
  Enterprise: [
    // All Pro permissions plus enterprise features
    'view:files',
    'edit:files',
    'view:search',
    'view:source-control',
    'view:extensions',
    'view:model-marketplace',
    'view:ux-studio',
    'use:terminal',
    'use:ai-chat',
    'use:live-meeting',
    'use:whiteboard',
    'use:document-studio',
    'use:screen-recorder',
    'use:debug',
    'use:testing',
    'use:api-studio',
    'use:database',
    'use:terraform',
    'use:docker',
    'use:security',
    'use:deployment',
    'use:team',
    'use:kanban',
    'use:integrations',
    'use:personas',
    'use:ml-studio',
    // Enterprise-only
    'admin:users',
    'admin:billing',
    'admin:audit-logs',
    'use:sso',
    'use:custom-models',
    'use:priority-support',
  ],
} as const;

export type Plan = keyof typeof PERMISSIONS;
export type Permission = typeof PERMISSIONS[Plan][number];

// Simple hash function for password (in production, use bcrypt on server)
const hashPassword = (password: string): string => {
  // Simple hash simulation - in production this should be bcrypt on the server
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `$sai$${Math.abs(hash).toString(16)}$${btoa(password.slice(0, 2))}`;
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  // For legacy unhashed passwords, do direct comparison
  if (!hashedPassword.startsWith('$sai$')) {
    return password === hashedPassword;
  }
  return hashPassword(password) === hashedPassword;
};

// Generate JWT-like token
const generateToken = (userId: string, type: 'access' | 'refresh'): string => {
  const expiry = type === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY;
  const payload = {
    userId,
    type,
    iat: Date.now(),
    exp: Date.now() + expiry,
  };
  return btoa(JSON.stringify(payload));
};

const decodeToken = (token: string): { userId: string; type: string; iat: number; exp: number } | null => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return Date.now() > decoded.exp;
};

// Storage helpers
const getStoredUsers = (): TeamMember[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    }
    // Initialize with mock data (hash their passwords)
    const usersWithHashedPasswords = MOCK_TEAM_MEMBERS.map(user => ({
      ...user,
      password: user.password ? hashPassword(user.password) : undefined,
    }));
    localStorage.setItem(USERS_KEY, JSON.stringify(usersWithHashedPasswords));
    return usersWithHashedPasswords;
  } catch (error) {
    console.error('Could not parse users from localStorage', error);
    return MOCK_TEAM_MEMBERS;
  }
};

const setStoredUsers = (users: TeamMember[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const createSession = (user: TeamMember): { user: TeamMember; accessToken: string; refreshToken: string } => {
  const accessToken = generateToken(user.id, 'access');
  const refreshToken = generateToken(user.id, 'refresh');
  
  const sessionUser = { ...user };
  delete sessionUser.password;
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  return { user: sessionUser, accessToken, refreshToken };
};

// Auth functions
const signUp = (name: string, email: string, password?: string): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!password || password.length < 6) {
        return reject(new Error('Password must be at least 6 characters long.'));
      }
      
      // Password strength validation
      if (!/[A-Z]/.test(password)) {
        return reject(new Error('Password must contain at least one uppercase letter.'));
      }
      if (!/[0-9]/.test(password)) {
        return reject(new Error('Password must contain at least one number.'));
      }
      
      const users = getStoredUsers();
      if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        return reject(new Error('An account with this email already exists.'));
      }

      const newUser: TeamMember = {
        id: `user-${Date.now()}`,
        name,
        email,
        password: hashPassword(password),
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        role: 'Developer',
        status: 'online',
        plan: 'Hobby',
      };

      users.push(newUser);
      setStoredUsers(users);
      
      const { user } = createSession(newUser);
      resolve(user);
    }, 500);
  });
};

const signIn = (email: string, password?: string): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        return reject(new Error('Email and password are required.'));
      }
      
      const users = getStoredUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return reject(new Error('No account found with this email.'));
      }
      
      if (!user.password || !verifyPassword(password, user.password)) {
        return reject(new Error('Invalid password.'));
      }

      // Update user status to online
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, status: 'online' as const } : u
      );
      setStoredUsers(updatedUsers);
      
      const { user: sessionUser } = createSession({ ...user, status: 'online' });
      resolve(sessionUser);
    }, 500);
  });
};

// Google credential response interface
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

// Decode Google JWT credential
const decodeGoogleCredential = (credential: string): { email: string; name: string; picture?: string; sub: string } | null => {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode Google credential:', error);
    return null;
  }
};

// Initialize Google Identity Services
const initializeGoogleSignIn = (clientId: string, callback: (response: GoogleCredentialResponse) => void): void => {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: callback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }
};

// Render Google Sign-In button
const renderGoogleButton = (elementId: string, options?: { theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'large' | 'medium' | 'small'; text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'; width?: number }): void => {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    const element = document.getElementById(elementId);
    if (element) {
      (window as any).google.accounts.id.renderButton(element, {
        theme: options?.theme || 'outline',
        size: options?.size || 'large',
        text: options?.text || 'continue_with',
        width: options?.width || 320,
        logo_alignment: 'center',
      });
    }
  }
};

// Trigger Google One Tap prompt
const promptGoogleOneTap = (): void => {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    (window as any).google.accounts.id.prompt();
  }
};

// Process Google credential and sign in/up user
const signInWithGoogleCredential = (credential: string): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    const decoded = decodeGoogleCredential(credential);
    
    if (!decoded || !decoded.email) {
      return reject(new Error('Failed to decode Google credential.'));
    }
    
    const users = getStoredUsers();
    let user = users.find(u => u.email.toLowerCase() === decoded.email.toLowerCase());
    
    if (user) {
      // Existing user - update their info and sign in
      const updatedUser = {
        ...user,
        name: decoded.name || user.name,
        avatar: decoded.picture || user.avatar,
        status: 'online' as const,
      };
      
      const updatedUsers = users.map(u => 
        u.id === user!.id ? updatedUser : u
      );
      setStoredUsers(updatedUsers);
      
      const { user: sessionUser } = createSession(updatedUser);
      resolve(sessionUser);
    } else {
      // New user - create account
      const initials = decoded.name
        ? decoded.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : decoded.email.slice(0, 2).toUpperCase();
      
      const newUser: TeamMember = {
        id: `user-google-${decoded.sub || Date.now()}`,
        name: decoded.name || 'Google User',
        email: decoded.email,
        initials,
        avatar: decoded.picture,
        role: 'Developer',
        status: 'online',
        plan: 'Hobby',
        authProvider: 'google',
        // No password for OAuth users
      };
      
      users.push(newUser);
      setStoredUsers(users);
      
      const { user: sessionUser } = createSession(newUser);
      resolve(sessionUser);
    }
  });
};

// Legacy function - kept for backward compatibility
const signInWithGoogle = (): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    // Check if Google Identity Services is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      // This will trigger the prompt; actual handling is done via callback
      promptGoogleOneTap();
      // Note: The promise won't resolve here - it will be handled by the callback
      // This is mainly for triggering the prompt
      reject(new Error('Google Sign-In prompt triggered. Handle response via callback.'));
    } else {
      reject(new Error('Google Sign-In is not available. Please try again later.'));
    }
  });
};

// ==================== GitHub OAuth ====================

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;

// GitHub OAuth state for CSRF protection
const generateOAuthState = (): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('github_oauth_state', state);
  return state;
};

const verifyOAuthState = (state: string): boolean => {
  const storedState = sessionStorage.getItem('github_oauth_state');
  sessionStorage.removeItem('github_oauth_state');
  return storedState === state;
};

// Initiate GitHub OAuth flow
const initiateGitHubOAuth = (): void => {
  if (!GITHUB_CLIENT_ID) {
    console.error('GitHub Client ID not configured');
    return;
  }
  
  const state = generateOAuthState();
  const scope = 'read:user user:email';
  
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  
  // Store the current URL to redirect back after auth
  sessionStorage.setItem('github_oauth_redirect', window.location.href);
  
  window.location.href = authUrl.toString();
};

// Handle GitHub OAuth callback (exchange code for user data)
// Note: In a real app, the code exchange should happen on a backend server
// This simulates the flow for demo purposes
const handleGitHubCallback = async (code: string, state: string): Promise<TeamMember> => {
  if (!verifyOAuthState(state)) {
    throw new Error('Invalid OAuth state. Please try again.');
  }
  
  // In a real implementation, you would:
  // 1. Send the code to your backend
  // 2. Backend exchanges code for access token with GitHub
  // 3. Backend fetches user info and returns it
  
  // For demo purposes, we'll simulate getting user data
  // In production, replace this with actual API call to your backend
  throw new Error('GitHub OAuth requires a backend server to exchange the authorization code. Please configure your backend endpoint.');
};

// Sign in with GitHub access token (used after backend code exchange)
const signInWithGitHubToken = async (accessToken: string): Promise<TeamMember> => {
  try {
    // Fetch user data from GitHub
    const [userResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }),
    ]);
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user data');
    }
    
    const userData = await userResponse.json();
    const emailsData = await emailsResponse.json();
    
    // Get primary email
    const primaryEmail = emailsData.find((e: any) => e.primary)?.email || userData.email || `${userData.login}@github.local`;
    
    const users = getStoredUsers();
    let user = users.find(u => u.email.toLowerCase() === primaryEmail.toLowerCase());
    
    if (user) {
      // Existing user - update their info
      const updatedUser: TeamMember = {
        ...user,
        name: userData.name || userData.login || user.name,
        avatar: userData.avatar_url || user.avatar,
        status: 'online',
      };
      
      const updatedUsers = users.map(u => 
        u.id === user!.id ? updatedUser : u
      );
      setStoredUsers(updatedUsers);
      
      // Store GitHub token for API calls
      localStorage.setItem('github_access_token', accessToken);
      
      const { user: sessionUser } = createSession(updatedUser);
      return sessionUser;
    } else {
      // New user - create account
      const name = userData.name || userData.login || 'GitHub User';
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      
      const newUser: TeamMember = {
        id: `user-github-${userData.id}`,
        name,
        email: primaryEmail,
        initials,
        avatar: userData.avatar_url,
        role: 'Developer',
        status: 'online',
        plan: 'Hobby',
        authProvider: 'github',
      };
      
      users.push(newUser);
      setStoredUsers(users);
      
      // Store GitHub token for API calls
      localStorage.setItem('github_access_token', accessToken);
      
      const { user: sessionUser } = createSession(newUser);
      return sessionUser;
    }
  } catch (error: any) {
    throw new Error(`GitHub sign-in failed: ${error.message}`);
  }
};

// Check if GitHub OAuth is configured
const isGitHubOAuthConfigured = (): boolean => {
  return !!GITHUB_CLIENT_ID;
};

// Get stored GitHub access token
const getGitHubToken = (): string | null => {
  return localStorage.getItem('github_access_token');
};

const signOut = (): Promise<void> => {
  return new Promise((resolve) => {
    // Update user status to offline
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = getStoredUsers();
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? { ...u, status: 'away' as const } : u
      );
      setStoredUsers(updatedUsers);
    }
    
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('sai_onboarded');
    resolve();
  });
};

const refreshSession = (): boolean => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken || isTokenExpired(refreshToken)) {
      // Refresh token expired, need to re-authenticate
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return false;
    }
    
    const decoded = decodeToken(refreshToken);
    if (!decoded) return false;
    
    // Generate new access token
    const newAccessToken = generateToken(decoded.userId, 'access');
    localStorage.setItem(TOKEN_KEY, newAccessToken);
    return true;
  } catch {
    return false;
  }
};

const getCurrentUser = (): TeamMember | null => {
  try {
    // Check if access token is valid
    const accessToken = localStorage.getItem(TOKEN_KEY);
    if (!accessToken || isTokenExpired(accessToken)) {
      // Try to refresh
      const refreshed = refreshSession();
      if (!refreshed) {
        return null;
      }
    }
    
    const sessionJson = localStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Could not parse session from localStorage', error);
    return null;
  }
};

const verifyPaystackTransaction = async (reference: string): Promise<any> => {
  try {
    const response = await fetch('/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    
    if (!response.ok) {
      console.warn("Paystack backend verification unavailable. Simulating verification...");
      return { status: true, data: { status: 'success' } };
    }
    
    return await response.json();
  } catch (e) {
    console.warn("Verification request failed. Simulating local success for demo.");
    return { status: true, data: { status: 'success' } };
  }
};

const createProUser = async (name: string, email: string, password?: string): Promise<TeamMember> => {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  
  const users = getStoredUsers();
  let userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  
  let newUser: TeamMember;
  if (userIndex !== -1) {
    newUser = {
      ...users[userIndex],
      plan: 'Pro',
      role: 'Pro Developer',
    };
    users[userIndex] = newUser;
  } else {
    newUser = {
      id: `user-pro-${Date.now()}`,
      name,
      email,
      password: hashPassword(password),
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      role: 'Pro Developer',
      status: 'online',
      plan: 'Pro',
    };
    users.push(newUser);
  }

  setStoredUsers(users);
  const { user } = createSession(newUser);
  return user;
};

const upgradeToPro = async (): Promise<TeamMember> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const upgradedUser: TeamMember = {
    ...users[userIndex],
    plan: 'Pro',
    role: 'Pro Developer',
  };
  
  users[userIndex] = upgradedUser;
  setStoredUsers(users);
  
  const sessionUser = { ...upgradedUser };
  delete sessionUser.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  
  return sessionUser;
};

const updateUser = async (updates: Partial<TeamMember>): Promise<TeamMember> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Don't allow updating sensitive fields directly
  const { id, password, plan, ...safeUpdates } = updates;
  
  const updatedUser: TeamMember = {
    ...users[userIndex],
    ...safeUpdates,
  };
  
  users[userIndex] = updatedUser;
  setStoredUsers(users);
  
  const sessionUser = { ...updatedUser };
  delete sessionUser.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  
  return sessionUser;
};

const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new Error('New password must contain at least one uppercase letter.');
  }
  if (!/[0-9]/.test(newPassword)) {
    throw new Error('New password must contain at least one number.');
  }
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const user = users[userIndex];
  if (user.password && !verifyPassword(currentPassword, user.password)) {
    throw new Error('Current password is incorrect');
  }
  
  users[userIndex] = {
    ...user,
    password: hashPassword(newPassword),
  };
  
  setStoredUsers(users);
};

// Authorization functions
const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userPermissions = PERMISSIONS[user.plan as Plan] || PERMISSIONS.Hobby;
  return (userPermissions as readonly string[]).includes(permission);
};

const canAccessFeature = (feature: string): boolean => {
  const featurePermissionMap: Record<string, string> = {
    'ai-chat': 'use:ai-chat',
    'live-meeting': 'use:live-meeting',
    'whiteboard': 'use:whiteboard',
    'document-studio': 'use:document-studio',
    'screen-recorder': 'use:screen-recorder',
    'debug': 'use:debug',
    'testing': 'use:testing',
    'api-studio': 'use:api-studio',
    'database': 'use:database',
    'terraform': 'use:terraform',
    'docker': 'use:docker',
    'security': 'use:security',
    'deployment': 'use:deployment',
    'team': 'use:team',
    'kanban': 'use:kanban',
    'integrations': 'use:integrations',
    'personas': 'use:personas',
    'ml-studio': 'use:ml-studio',
  };
  
  const permission = featurePermissionMap[feature];
  if (!permission) return true; // Feature not restricted
  
  return hasPermission(permission);
};

const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    refreshSession();
    return localStorage.getItem(TOKEN_KEY);
  }
  return token;
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    return refreshSession();
  }
  
  return true;
};

// ==================== Voucher/Trial System ====================

interface TrialInfo {
  userId: string;
  startTime: number;
  endTime: number;
  voucherCode: string;
  originalPlan: 'Hobby' | 'Pro' | 'Enterprise';
}

interface RedeemedVoucher {
  code: string;
  userId: string;
  redeemedAt: number;
}

// Get redeemed vouchers from storage
const getRedeemedVouchers = (): RedeemedVoucher[] => {
  try {
    const data = localStorage.getItem(VOUCHERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Get active trial info
const getTrialInfo = (): TrialInfo | null => {
  try {
    const data = localStorage.getItem(TRIAL_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Check if user has an active trial
const hasActiveTrial = (): boolean => {
  const trial = getTrialInfo();
  if (!trial) return false;
  
  const currentUser = getCurrentUser();
  if (!currentUser || trial.userId !== currentUser.id) return false;
  
  return Date.now() < trial.endTime;
};

// Get remaining trial time in milliseconds
const getTrialTimeRemaining = (): number => {
  const trial = getTrialInfo();
  if (!trial) return 0;
  
  const currentUser = getCurrentUser();
  if (!currentUser || trial.userId !== currentUser.id) return 0;
  
  const remaining = trial.endTime - Date.now();
  return remaining > 0 ? remaining : 0;
};

// Format remaining time as human-readable string
const formatTrialTimeRemaining = (): string => {
  const remaining = getTrialTimeRemaining();
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};

// Validate voucher code
const validateVoucher = (code: string): { valid: boolean; error?: string; days?: number } => {
  const normalizedCode = code.trim().toUpperCase();
  
  if (!normalizedCode) {
    return { valid: false, error: 'Please enter a voucher code.' };
  }
  
  const voucher = VALID_VOUCHERS[normalizedCode];
  if (!voucher) {
    return { valid: false, error: 'Invalid voucher code.' };
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { valid: false, error: 'Please sign in to redeem a voucher.' };
  }
  
  // Check if user already redeemed this voucher
  const redeemed = getRedeemedVouchers();
  const alreadyRedeemed = redeemed.some(
    v => v.code === normalizedCode && v.userId === currentUser.id
  );
  
  if (alreadyRedeemed) {
    return { valid: false, error: 'You have already redeemed this voucher.' };
  }
  
  // Check if user is already Pro or Enterprise
  if (currentUser.plan === 'Pro' || currentUser.plan === 'Enterprise') {
    // Check if it's an active trial
    if (!hasActiveTrial()) {
      return { valid: false, error: 'You already have an active subscription.' };
    }
  }
  
  return { valid: true, days: voucher.days || 1 };
};

// Redeem voucher code for trial
const redeemVoucher = async (code: string): Promise<{ success: boolean; message: string; trialEndsAt?: Date }> => {
  const validation = validateVoucher(code);
  
  if (!validation.valid) {
    return { success: false, message: validation.error || 'Invalid voucher.' };
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'Please sign in to redeem a voucher.' };
  }
  
  const normalizedCode = code.trim().toUpperCase();
  const trialDays = validation.days || 1;
  const trialDuration = trialDays * 24 * 60 * 60 * 1000;
  
  // Save trial info
  const trialInfo: TrialInfo = {
    userId: currentUser.id,
    startTime: Date.now(),
    endTime: Date.now() + trialDuration,
    voucherCode: normalizedCode,
    originalPlan: currentUser.plan as 'Hobby' | 'Pro' | 'Enterprise',
  };
  localStorage.setItem(TRIAL_KEY, JSON.stringify(trialInfo));
  
  // Mark voucher as redeemed
  const redeemed = getRedeemedVouchers();
  redeemed.push({
    code: normalizedCode,
    userId: currentUser.id,
    redeemedAt: Date.now(),
  });
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(redeemed));
  
  // Upgrade user to Pro for trial period
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], plan: 'Pro' };
    setStoredUsers(users);
    
    // Update session
    const sessionUser = { ...users[userIndex] };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  }
  
  return {
    success: true,
    message: `🎉 Success! You now have ${trialDays}-day Pro trial access.`,
    trialEndsAt: new Date(trialInfo.endTime),
  };
};

// Check and expire trial if needed (call on app load)
const checkTrialExpiry = (): void => {
  const trial = getTrialInfo();
  if (!trial) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser || trial.userId !== currentUser.id) return;
  
  // Trial expired
  if (Date.now() >= trial.endTime) {
    // Revert to original plan
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], plan: trial.originalPlan };
      setStoredUsers(users);
      
      // Update session
      const sessionUser = { ...users[userIndex] };
      delete sessionUser.password;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    }
    
    // Clear trial info
    localStorage.removeItem(TRIAL_KEY);
  }
};

export default {
  signUp,
  signIn,
  signInWithGoogle,
  signInWithGoogleCredential,
  initializeGoogleSignIn,
  renderGoogleButton,
  promptGoogleOneTap,
  // GitHub OAuth
  initiateGitHubOAuth,
  handleGitHubCallback,
  signInWithGitHubToken,
  isGitHubOAuthConfigured,
  getGitHubToken,
  // Session management
  signOut,
  getCurrentUser,
  refreshSession,
  verifyPaystackTransaction,
  createProUser,
  upgradeToPro,
  updateUser,
  changePassword,
  hasPermission,
  canAccessFeature,
  getAccessToken,
  isAuthenticated,
  PERMISSIONS,
  // Voucher/Trial System
  validateVoucher,
  redeemVoucher,
  hasActiveTrial,
  getTrialTimeRemaining,
  formatTrialTimeRemaining,
  checkTrialExpiry,
};
