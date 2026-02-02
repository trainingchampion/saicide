import React, { Suspense, useState, useEffect } from 'react';
import CloudStudio from './modules/cloud/CloudStudio';
import { DesignName } from './types';

// Lazy load standalone components for performance
const StandaloneEditor = React.lazy(() => import('./components/StandaloneEditor'));
const StandalonePreview = React.lazy(() => import('./components/StandalonePreview'));

const App: React.FC = () => {
  const [design, setDesign] = useState<DesignName>(() => {
    // Defaulting to 'neural-ink' for a more premium dark IDE aesthetic
    return (localStorage.getItem('sai_design') as DesignName) || 'neural-ink';
  });

  useEffect(() => {
    document.documentElement.className = `design-${design}`;
    localStorage.setItem('sai_design', design);
  }, [design]);
  
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