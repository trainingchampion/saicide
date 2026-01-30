
import React, { useState, useEffect, useRef } from 'react';

interface NetlifyDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  deployContent?: string;
}

type DeployMode = 'simulated' | 'production';

const NetlifyDeployModal: React.FC<NetlifyDeployModalProps> = ({ isOpen, onClose, projectName, deployContent }) => {
  const [mode, setMode] = useState<DeployMode>('simulated');
  const [siteName, setSiteName] = useState('');
  const [pat, setPat] = useState(''); // Personal Access Token (Visual only for simulation)
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-app';
      setSiteName(safeName + (mode === 'simulated' ? '-preview' : ''));
      setIsDeploying(false);
      setDeployLogs([]);
      setIsSuccess(false);
      setLiveUrl('');
      setShowPreview(false);
      setPat('');
    }
  }, [isOpen, projectName]);

  // Update default site name when mode switches
  useEffect(() => {
    if (!isDeploying && !isSuccess) {
       const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-app';
       if (mode === 'simulated') {
           setSiteName(`${safeName}-preview-${Math.floor(Math.random() * 1000)}`);
       } else {
           setSiteName(safeName);
       }
    }
  }, [mode, projectName, isDeploying, isSuccess]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [deployLogs]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployLogs([]);
    
    const commonLogs = [
        "Initializing deployment environment...",
        "Resolving dependencies...",
    ];
    
    const productionLogs = [
        `Authenticating with Netlify API${pat ? ' using provided token' : ''}...`,
        "Verifying site ownership...",
        `Targeting production site: ${siteName}.netlify.app`,
        "Uploading build artifacts (Release v1.0.4)...",
        "Purging CDN cache...",
        "Verifying SSL certificate...",
    ];

    const simulatedLogs = [
        "Creating ephemeral sandbox...",
        "Mounting virtual filesystem...",
        "Starting development server...",
        "Compiling assets...",
    ];

    const finalLogs = [
        "Finalizing deployment...",
        "Site is live!",
    ];

    const logsToRun = [...commonLogs, ...(mode === 'production' ? productionLogs : simulatedLogs), ...finalLogs];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logsToRun.length) {
        setDeployLogs(prev => [...prev, `> ${logsToRun[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        const url = `https://${siteName}.netlify.app`;
        setLiveUrl(url);
        setIsSuccess(true);
        setIsDeploying(false);
      }
    }, 600);
  };

  if (!isOpen) return null;

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-[#131b2c] rounded-2xl w-full max-w-5xl text-white border border-gray-700 shadow-xl flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
           {/* Browser Header */}
           <div className="flex items-center space-x-4 bg-gray-900 p-3 rounded-t-2xl border-b border-gray-700">
              <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" onClick={() => setShowPreview(false)}></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 bg-gray-800 rounded-md px-3 py-1.5 text-xs font-mono text-gray-400 flex items-center justify-between shadow-inner">
                  <span className="truncate">{liveUrl}</span>
                  <div className="flex space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 hover:text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           {/* Simulated Content */}
           <div className="flex-1 bg-white relative overflow-auto flex flex-col text-gray-900 rounded-b-2xl">
              {deployContent && deployContent.trim().startsWith('<') ? (
                  // If content looks like HTML, render it roughly
                  <div className="p-8" dangerouslySetInnerHTML={{ __html: deployContent }} />
              ) : (
                  // Default Template
                  <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-green-400 to-cyan-500 rounded-full mb-8 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">Deployment Live</h1>
                    <p className="text-xl text-gray-500 mb-8 max-w-lg text-center">
                        The application <span className="font-bold text-indigo-600">{projectName}</span> has been successfully deployed to {mode === 'production' ? 'Production' : 'the Sandbox environment'}.
                    </p>
                    
                    {deployContent && (
                        <div className="w-full max-w-2xl bg-gray-100 rounded-xl p-6 border border-gray-200 text-left">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Deployed Content Preview</h3>
                            <pre className="font-mono text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">{deployContent.slice(0, 500)}{deployContent.length > 500 && '...'}</pre>
                        </div>
                    )}
                  </div>
              )}
              
              <div className="bg-gray-100 border-t border-gray-200 p-2 text-center">
                  <p className="text-xs text-gray-400 font-mono">S.AI Internal Preview Runtime v2.4.0 • {new Date().toLocaleTimeString()}</p>
              </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-2xl text-white border border-gray-700 shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400"><path d="M12 0L0 7v10l12 7 12-7V7L12 0zm-1.5 18.5V9.458l-5.5-3.175v6.52L10.5 18.5zm7-9.042V18.5L12 22.016V12.98l7-4.022zM12 2.984l5.5 3.175-5.5 3.175-5.5-3.175L12 2.984z" /></svg>
            Deploy to Netlify
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
        </div>
        
        {!isSuccess ? (
          <>
            {/* Mode Selection */}
            <div className="bg-gray-900/50 p-1 rounded-lg flex mb-6 border border-gray-700">
                <button 
                    onClick={() => setMode('simulated')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'simulated' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                >
                    Simulated Preview
                </button>
                <button 
                    onClick={() => setMode('production')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'production' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                >
                    Production Site
                </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                      {mode === 'production' ? 'Target Netlify Site Name' : 'Preview Site Name'}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={siteName}
                      onChange={e => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className={`w-full bg-gray-900/50 border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${mode === 'production' ? 'border-green-500/50 focus:ring-green-500' : 'border-cyan-500/50 focus:ring-cyan-500'}`}
                      disabled={isDeploying}
                      placeholder="my-awesome-site"
                    />
                    <span className="bg-gray-800 border-t border-b border-r border-gray-700 px-3 py-2 text-sm text-gray-400 rounded-r-lg">.netlify.app</span>
                  </div>
                  {mode === 'production' && (
                      <p className="text-xs text-yellow-500/80 mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Ensure this site exists on Netlify. If not, the external link will result in a 404.
                      </p>
                  )}
              </div>

              {mode === 'production' && (
                  <div className="animate-fade-in">
                      <label className="text-sm font-medium text-gray-300 block mb-2">Personal Access Token (Optional)</label>
                      <input
                        type="password"
                        value={pat}
                        onChange={e => setPat(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="nep_..."
                        disabled={isDeploying}
                      />
                      <p className="text-xs text-gray-500 mt-1">Used to simulate authenticated deployment.</p>
                  </div>
              )}
            </div>

            {/* Logs Area */}
            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-gray-300 flex-1 overflow-y-auto min-h-[200px] border border-gray-800">
              {deployLogs.length === 0 && !isDeploying && (
                  <div className="h-full flex items-center justify-center text-gray-600 italic">
                      Ready to deploy to {mode === 'production' ? 'Production' : 'Sandbox'}...
                  </div>
              )}
              {deployLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))}
              {isDeploying && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>}
               <div ref={logsEndRef} />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleDeploy}
                disabled={isDeploying || !siteName.trim()}
                className={`px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors ${mode === 'production' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
              >
                {isDeploying && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isDeploying ? 'Deploying...' : (mode === 'production' ? 'Push to Production' : 'Start Simulation')}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-3xl font-bold text-white mb-2">Success!</h3>
            <p className="text-gray-400 mb-8">{mode === 'production' ? 'Deployment triggered. Verify output below.' : 'Preview environment is ready.'}</p>
            
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                {/* Primary Action: View Internal Preview (Always Works) */}
                <button 
                    onClick={() => setShowPreview(true)} 
                    className={`w-full px-6 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 ${mode === 'production' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Preview Deployed Site
                </button>

                {/* Secondary Action: External Link (May 404) */}
                {mode === 'production' && (
                    <div className="text-center mt-2">
                        <a 
                            href={liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-gray-400 hover:text-green-400 hover:underline flex items-center justify-center gap-1"
                        >
                            Open external URL ({siteName}.netlify.app)
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                        <p className="text-[10px] text-gray-600 mt-1">Only works if you own this Netlify subdomain.</p>
                    </div>
                )}
                
                <button onClick={onClose} className="mt-4 text-gray-500 hover:text-white text-sm underline">
                    Close
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetlifyDeployModal;
