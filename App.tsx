import React, { Suspense, useState, useEffect } from 'react';
import CloudStudio from './modules/cloud/CloudStudio';
import { DesignName } from './types';

// Lazy load standalone components for performance
const StandaloneEditor = React.lazy(() => import('./components/StandaloneEditor'));
const StandalonePreview = React.lazy(() => import('./components/StandalonePreview'));

// OAuth callback handler component
const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }
      
      if (code && state) {
        // Store the code for the main app to process
        sessionStorage.setItem('github_oauth_code', code);
        sessionStorage.setItem('github_oauth_state_received', state);
        
        // Redirect back to main app
        const redirectUrl = sessionStorage.getItem('github_oauth_redirect') || '/';
        sessionStorage.removeItem('github_oauth_redirect');
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        setStatus('error');
        setMessage('Invalid callback parameters.');
      }
    };
    
    handleCallback();
  }, []);
  
  return (
    <div className="w-screen h-screen bg-[#080a0f] flex items-center justify-center">
      <div className="text-center">
        <div className={`text-2xl mb-4 ${status === 'processing' ? 'text-cyan-400' : status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {status === 'processing' && (
            <svg className="animate-spin h-8 w-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
        <p className="text-gray-400 font-mono text-sm">{message}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [design, setDesign] = useState<DesignName>(() => {
    // Defaulting to 'neural-ink' for a more premium dark IDE aesthetic
    return (localStorage.getItem('sai_design') as DesignName) || 'neural-ink';
  });

  useEffect(() => {
    document.documentElement.className = `design-${design}`;
    localStorage.setItem('sai_design', design);
  }, [design]);
  
  // Check for OAuth callback first (path-based routing)
  const pathname = window.location.pathname;
  if (pathname === '/auth/github/callback') {
    return <OAuthCallback />;
  }
  
  // Use hash for routing to prevent 404s in sandboxed/static environments
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const isPopout = params.has('popoutKey');
  const isPreview = params.has('preview');

  if (isPopout) {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest">Initialising Editor...</div>}>
        <StandaloneEditor />
      </Suspense>
    );
  }

  if (isPreview) {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest">Initialising Preview...</div>}>
        <StandalonePreview />
      </Suspense>
    );
  }
  
  return <CloudStudio design={design} setDesign={setDesign} />;
};

export default App;