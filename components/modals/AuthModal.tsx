
import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { TeamMember } from '../../types';
import { ICONS } from '../../constants';
import { Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: TeamMember) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setMode('signin');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setName('');
        setError('');
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (mode === 'signup') {
        if (!name.trim()) throw new Error("Name is required.");
        user = await authService.signUp(name, email, password);
      } else {
        user = await authService.signIn(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-md text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-auto px-4 h-12 bg-[var(--color-background)] rounded-lg mb-4 border border-[var(--color-border)] whitespace-nowrap">
           <span className="font-michroma text-2xl font-semibold text-[var(--color-success)] tracking-tighter">Sai IDE</span>
          </div>
          <h2 className="text-2xl font-bold">{mode === 'signin' ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'signin' ? 'Sign in to access your Sai projects.' : 'Code, collaborate, and create faster with AI.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-gray-900 text-sm font-bold disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center"
          >
             {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-700" />
            <span className="px-4 text-xs text-gray-500">OR</span>
            <hr className="flex-1 border-gray-700" />
        </div>

        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:bg-gray-700/50 text-sm font-medium disabled:opacity-50"
        >
            {ICONS.GOOGLE}
            Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} className="font-semibold text-green-400 hover:underline ml-2">
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
