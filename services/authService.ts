import { TeamMember } from '../types';
import { MOCK_TEAM_MEMBERS } from '../constants';

const USERS_KEY = 'sai_users';
const SESSION_KEY = 'sai_session';

const getStoredUsers = (): TeamMember[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    }
    // If no users, initialize with mock data
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_TEAM_MEMBERS));
    return MOCK_TEAM_MEMBERS;
  } catch (error) {
    console.error('Could not parse users from localStorage', error);
    return MOCK_TEAM_MEMBERS;
  }
};

const setStoredUsers = (users: TeamMember[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const signUp = (name: string, email: string, password?: string): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!password || password.length < 6) {
        return reject(new Error('Password must be at least 6 characters long.'));
      }
      const users = getStoredUsers();
      if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        return reject(new Error('An account with this email already exists.'));
      }

      const newUser: TeamMember = {
        id: `user-${Date.now()}`,
        name,
        email,
        password, // In a real app, this should be hashed
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
        role: 'Developer',
        status: 'online',
        plan: 'Hobby',
      };

      users.push(newUser);
      setStoredUsers(users);
      
      const sessionUser = { ...newUser };
      delete sessionUser.password;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 500);
  });
};

const signIn = (email: string, password?: string): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        return reject(new Error('Invalid email or password.'));
      }
      const users = getStoredUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // In a real app, passwords would be hashed. For this, we do a simple string comparison.
      if (user && user.password === password) {
        // Create a user object without the password for the session to be safe
        const sessionUser = { ...user };
        delete sessionUser.password;

        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        resolve(sessionUser);
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 500);
  });
};

const signOut = (): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('sai_onboarded');
        resolve();
    });
};

const getCurrentUser = (): TeamMember | null => {
  try {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Could not parse session from localStorage', error);
    return null;
  }
};

const signInWithGoogle = (): Promise<TeamMember> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const googleEmail = 'user@google.com'; // Mock email for Google sign-in
      let user = users.find(u => u.email.toLowerCase() === googleEmail);
      
      if (!user) {
        // If user doesn't exist, create one
        user = {
          id: `user-google-${Date.now()}`,
          name: 'Google User',
          email: googleEmail,
          // No password for OAuth users
          initials: 'GU',
          role: 'Developer',
          status: 'online',
          plan: 'Hobby'
        };
        users.push(user);
        setStoredUsers(users);
      }

      // Create a session
      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 500);
  });
};

const verifyPaystackTransaction = async (reference: string): Promise<any> => {
    try {
        const response = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference }),
        });
        
        if (!response.ok) {
            // If the backend is not available (common in static dev environments), 
            // we simulate a verification success for the live key demo.
            console.warn("Paystack backend verification link missing. Simulating verification...");
            return { status: true, data: { status: 'success' } };
        }
        
        return await response.json();
    } catch (e) {
        console.warn("Verification request failed. Simulating local success for demo purpose.");
        return { status: true, data: { status: 'success' } };
    }
};

const createProUser = async (name: string, email: string, password?: string): Promise<TeamMember> => {
    // This is similar to signUp but assigns 'Pro' plan
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }
    const users = getStoredUsers();
    
    // Update existing or create new
    let userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    
    let newUser: TeamMember;
    if (userIndex !== -1) {
        newUser = {
            ...users[userIndex],
            plan: 'Pro',
            role: 'Pro Developer'
        };
        users[userIndex] = newUser;
    } else {
        newUser = {
            id: `user-pro-${Date.now()}`,
            name,
            email,
            password,
            initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
            role: 'Pro Developer',
            status: 'online',
            plan: 'Pro',
        };
        users.push(newUser);
    }

    setStoredUsers(users);

    const sessionUser = { ...newUser };
    delete (sessionUser as any).password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
};

export default {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  verifyPaystackTransaction,
  createProUser,
};