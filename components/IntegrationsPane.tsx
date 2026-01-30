
import React, { useState, useMemo } from 'react';
import { INTEGRATIONS, ICONS } from '../constants';
import { Integration } from '../types';
import IntegrationConfigModal from './modals/IntegrationConfigModal';

interface IntegrationsPaneProps {
  githubToken: string | null;
  onConnectGithub: () => void;
  onDisconnectGithub: () => void;
  onDeployNetlify: () => void;
  onCollapse: () => void;
}

const IntegrationsPane: React.FC<IntegrationsPaneProps> = ({ githubToken, onConnectGithub, onDisconnectGithub, onDeployNetlify, onCollapse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<Integration | null>(null);
  const [connectedIds, setConnectedIds] = useState<{[key: string]: boolean}>({
      'github': !!githubToken, // Sync with prop
  });
  const [metaData, setMetaData] = useState<{[key: string]: string}>({
      'github': githubToken ? 'Syncing main branch' : '',
  });

  // Sync state when props change
  React.useEffect(() => {
      setConnectedIds(prev => ({...prev, 'github': !!githubToken}));
  }, [githubToken]);

  const handleConnect = (id: string, config: any) => {
      if (id === 'github') {
          // Special case to trigger the specific modal from parent if needed, 
          // or we can simulate it here. For now, let's trust the internal mock
          // unless it's github which has specific logic in CloudStudio.
          onConnectGithub(); 
      } else {
          setConnectedIds(prev => ({...prev, [id]: true}));
          
          // Set mock metadata based on ID
          let meta = 'Connected';
          if (id === 'slack') meta = 'Posting to #deployments';
          if (id === 'jira') meta = 'Syncing Project S.AI';
          if (id === 'sentry') meta = 'Monitoring active';
          
          setMetaData(prev => ({...prev, [id]: meta}));
      }
  };

  const handleDisconnect = (id: string) => {
      if (id === 'github') {
          onDisconnectGithub();
      } else {
          setConnectedIds(prev => ({...prev, [id]: false}));
          setMetaData(prev => ({...prev, [id]: ''}));
      }
  };

  const filteredIntegrations = useMemo(() => {
      if (!searchTerm) return INTEGRATIONS;
      return INTEGRATIONS.filter(i => 
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          i.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm]);

  const groups = useMemo(() => {
      const g: {[key: string]: Integration[]} = {};
      filteredIntegrations.forEach(i => {
          if (!g[i.category]) g[i.category] = [];
          g[i.category].push(i);
      });
      return g;
  }, [filteredIntegrations]);

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Integrations Hub</h2>
        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="px-2 pb-2 flex-shrink-0">
         <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
                type="text"
                placeholder="Find tools..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
        {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
                <h3 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-2 px-1 tracking-wider">{category}</h3>
                <div className="space-y-2">
                    {(items as Integration[]).map(integration => {
                        const isConnected = connectedIds[integration.id];
                        const meta = metaData[integration.id];

                        return (
                            <div key={integration.id} className={`bg-[var(--color-background-tertiary)] rounded-lg p-3 text-sm border transition-colors ${isConnected ? 'border-[var(--color-success)]/30' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg shadow-inner filter brightness-110">
                                            {integration.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-white">{integration.name}</h4>
                                                {isConnected && (
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{integration.description}</p>
                                            {isConnected && meta && (
                                                <p className="text-[10px] text-green-400 mt-1 font-mono">{meta}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        {isConnected ? (
                                            <>
                                                <button 
                                                    onClick={() => handleDisconnect(integration.id)} 
                                                    className="text-xs bg-[var(--color-background-hover)] hover:bg-red-900/30 hover:text-red-400 text-[var(--color-text-primary)] font-medium py-1 px-3 rounded-md transition-colors"
                                                >
                                                    Disconnect
                                                </button>
                                                {integration.id === 'netlify' && (
                                                    <button onClick={onDeployNetlify} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm">
                                                        Deploy
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    if (integration.id === 'github') {
                                                        onConnectGithub();
                                                    } else {
                                                        setActiveModal(integration);
                                                    }
                                                }} 
                                                className="text-xs bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-1 px-3 rounded-md shadow-sm"
                                            >
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      <IntegrationConfigModal 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        integration={activeModal}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default IntegrationsPane;
