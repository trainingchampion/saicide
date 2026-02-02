import React, { useState, useEffect } from 'react';
import { ICONS, EXTERNAL_AGENTS, LLM_PROVIDERS } from '../constants';
import { THEMES } from '../themes';
import { Check, Plus, ChevronDown, ChevronRight, Bot, Server, Zap, ShoppingBag, Key, Save, X, Trash2, Power, BrainCircuit, Code2, CreditCard, Star, Info, Gift, Clock, Sparkles } from 'lucide-react';
import { ExternalAgent, MCPServer, LLMProviderConfig, DesignName } from '../types';
import authService from '../services/authService';

interface SettingsPaneProps {
  onCollapse: () => void;
  design: DesignName;
  onDesignChange: (design: DesignName) => void;
  themeName: string;
  onThemeChange: (name: string) => void;
  keymap?: string;
  onKeymapChange?: (keymap: string) => void;
  vimMode?: boolean;
  onToggleVimMode?: () => void;
  fontSize?: string;
  onFontSizeChange?: (size: string) => void;
  wordWrap?: string;
  onWordWrapChange?: (wrap: string) => void;
  onOpenModelMarketplace?: () => void;
  apiKeys: Record<string, string>;
  onSaveApiKey: (providerId: string, key: string) => void;
  mcpServers: MCPServer[];
  onToggleMcp: (serverId: string) => void;
  onOpenBilling?: () => void;
  currentPlan?: string;
}

const SettingsPane: React.FC<SettingsPaneProps> = ({ 
    onCollapse, 
    design,
    onDesignChange,
    themeName, 
    onThemeChange, 
    keymap, 
    onKeymapChange, 
    vimMode, 
    onToggleVimMode,
    fontSize: propFontSize,
    onFontSizeChange,
    wordWrap: propWordWrap,
    onWordWrapChange,
    onOpenModelMarketplace,
    apiKeys,
    onSaveApiKey,
    mcpServers,
    onToggleMcp,
    onOpenBilling,
    currentPlan = 'Hobby'
}) => {
  const [marketplaceUrl, setMarketplaceUrl] = useState('https://open-vsx.org/api');
  const [notifications, setNotifications] = useState(true);

  // Local state fallbacks
  const [localFontSize, setLocalFontSize] = useState('14');
  const [localWordWrap, setLocalWordWrap] = useState('off');

  // AI Configuration State - persisted to localStorage
  const [agents, setAgents] = useState<ExternalAgent[]>(() => {
      const saved = localStorage.getItem('sai-external-agents');
      return saved ? JSON.parse(saved) : EXTERNAL_AGENTS;
  });
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);
  
  // Local input state for keys
  const [editingKey, setEditingKey] = useState('');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [trialRemaining, setTrialRemaining] = useState(authService.formatTrialTimeRemaining());
  const hasTrialActive = authService.hasActiveTrial();

  // Check trial expiry on mount
  useEffect(() => {
    authService.checkTrialExpiry();
  }, []);

  // Update trial countdown
  useEffect(() => {
    if (!hasTrialActive) return;
    
    const interval = setInterval(() => {
      setTrialRemaining(authService.formatTrialTimeRemaining());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [hasTrialActive]);

  // Persist agents to localStorage
  useEffect(() => {
      localStorage.setItem('sai-external-agents', JSON.stringify(agents));
  }, [agents]);

  // Build providers list from constants with current configuration status
  const providers: LLMProviderConfig[] = LLM_PROVIDERS.map(p => ({
      ...p,
      isConfigured: !!apiKeys[p.id]
  }));

  const currentFontSize = propFontSize || localFontSize;
  const currentWordWrap = propWordWrap || localWordWrap;

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (onFontSizeChange) onFontSizeChange(val);
      else setLocalFontSize(val);
  };

  const handleWordWrapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (onWordWrapChange) onWordWrapChange(val);
      else setLocalWordWrap(val);
  };

  const handleAddAgent = () => {
      const name = prompt("Enter agent name (e.g., 'Super Coder'):");
      if (name) {
          setAgents(prev => [...prev, { id: `agent-${Date.now()}`, name, isEnabled: true }]);
      }
  };

  const handleToggleServer = (id: string) => {
      onToggleMcp(id);
  };

  const toggleAgent = (id: string) => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  };

  const toggleProviderExpand = (id: string) => {
      if (expandedProviderId === id) {
          setExpandedProviderId(null);
          setEditingKey('');
      } else {
          setExpandedProviderId(id);
          setEditingKey(apiKeys[id] || '');
      }
  };

  const handleSaveKey = (id: string) => {
      onSaveApiKey(id, editingKey);
      setExpandedProviderId(null);
      setEditingKey('');
  };

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Settings</h2>
        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
          {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        
        {/* Subscription Section */}
        <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1 flex items-center gap-2">
                <CreditCard size={14} className="text-blue-400" />
                Subscription
            </h3>
            <div className="p-4 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Current Plan</p>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter">{currentPlan}</h4>
                    </div>
                    {currentPlan !== 'Enterprise' && (
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                            <Star size={16} fill="currentColor" />
                        </div>
                    )}
                </div>
                <button 
                    onClick={onOpenBilling}
                    className="w-full py-2.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Zap size={12} fill="currentColor" />
                    Manage Subscription
                </button>
            </div>

            {/* Active Trial Banner */}
            {hasTrialActive && (
                <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Pro Trial Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-300">
                        <Clock size={12} className="text-gray-500" />
                        <span>{trialRemaining}</span>
                    </div>
                </div>
            )}

            {/* Redeem Voucher */}
            <div className="p-4 bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                    <Gift size={14} className="text-purple-400" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">Redeem Voucher</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">Have a voucher code? Enter it below to unlock a free trial.</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => {
                            setVoucherCode(e.target.value.toUpperCase());
                            setVoucherMessage(null);
                        }}
                        placeholder="Enter voucher code"
                        className="flex-1 px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                        onClick={async () => {
                            if (!voucherCode.trim()) return;
                            setVoucherLoading(true);
                            setVoucherMessage(null);
                            try {
                                const result = await authService.redeemVoucher(voucherCode);
                                setVoucherMessage({
                                    type: result.success ? 'success' : 'error',
                                    text: result.message,
                                });
                                if (result.success) {
                                    setVoucherCode('');
                                    setTrialRemaining(authService.formatTrialTimeRemaining());
                                    // Reload to reflect new plan
                                    setTimeout(() => window.location.reload(), 1500);
                                }
                            } catch (err: any) {
                                setVoucherMessage({ type: 'error', text: err.message || 'Failed to redeem voucher.' });
                            } finally {
                                setVoucherLoading(false);
                            }
                        }}
                        disabled={voucherLoading || !voucherCode.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1"
                    >
                        {voucherLoading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                <Gift size={12} />
                                Redeem
                            </>
                        )}
                    </button>
                </div>
                {voucherMessage && (
                    <div className={`mt-2 text-[11px] px-2 py-1.5 rounded-lg ${
                        voucherMessage.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {voucherMessage.text}
                    </div>
                )}
            </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1">Appearance</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Design System</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onDesignChange('neural-ink')} className={`p-3 rounded-lg border-2 ${design === 'neural-ink' ? 'border-[var(--color-accent)]' : 'border-transparent'}`}>
                            <div className="h-10 w-full bg-[#080a0f] rounded mb-2 flex items-center justify-center text-xs font-bold text-[#67e8f9] doodle-text">Neural Ink</div>
                        </button>
                        <button onClick={() => onDesignChange('doodle')} className={`p-3 rounded-lg border-2 ${design === 'doodle' ? 'border-[#2563eb]' : 'border-transparent'}`}>
                            <div className="h-10 w-full bg-[#fdfcf8] rounded mb-2 flex items-center justify-center text-xs font-bold text-[#1e293b] doodle-text sketch-border">Doodle</div>
                        </button>
                         <button onClick={() => onDesignChange('blueprint')} className={`p-3 rounded-lg border-2 ${design === 'blueprint' ? 'border-[var(--color-accent)]' : 'border-transparent'}`}>
                            <div className="h-10 w-full bg-[#002b55] rounded mb-2 flex items-center justify-center text-xs font-bold text-cyan-400 doodle-text sketch-border">Blueprint</div>
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Color Theme</label>
                    <select 
                        value={themeName}
                        onChange={(e) => onThemeChange(e.target.value)}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                        {THEMES.map(theme => <option key={theme.name} value={theme.name}>{theme.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Editor Font Size</label>
                    <select 
                        value={currentFontSize}
                        onChange={handleFontSizeChange}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Word Wrap</label>
                    <select 
                        value={currentWordWrap}
                        onChange={handleWordWrapChange}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                        <option value="off">Off</option>
                        <option value="on">On</option>
                        <option value="bounded">Bounded</option>
                    </select>
                </div>
            </div>
        </section>

        {/* Editor Config Section */}
        <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1">Editor</h3>
            <div className="space-y-3">
                {onKeymapChange && (
                    <div>
                        <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Keymap</label>
                        <select 
                            value={keymap}
                            onChange={(e) => onKeymapChange(e.target.value)}
                            className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                        >
                            <option value="vscode">VS Code</option>
                            <option value="jetbrains">JetBrains</option>
                            <option value="sublime">Sublime Text</option>
                            <option value="atom">Atom</option>
                            <option value="emacs">Emacs</option>
                            <option value="cursor">Cursor</option>
                        </select>
                    </div>
                )}
                {onToggleVimMode && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-primary)]">Vim Mode</span>
                        <button 
                            onClick={onToggleVimMode}
                            className={`w-10 h-5 rounded-full flex items-center transition-colors ${vimMode ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-background-tertiary)]'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${vimMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                )}
            </div>
        </section>

        {/* AI & Agents Section */}
        <section className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1">AI Configuration</h3>
            
            {/* External Agents */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">External Agents</h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">All agents connected through the Agent Client Protocol.</p>
                    </div>
                    <button 
                        onClick={handleAddAgent}
                        className="text-xs bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] border border-[var(--color-border)] px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add Agent
                    </button>
                </div>
                <div className="bg-[var(--color-background-tertiary)]/30 border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)]">
                    {agents.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-[var(--color-background-tertiary)]/50 group" onClick={() => toggleAgent(agent.id)}>
                            <div className="flex items-center gap-2 min-w-0">
                                <Bot className={`w-4 h-4 shrink-0 ${agent.isEnabled ? 'text-emerald-400' : 'text-gray-600'}`} />
                                <div className="min-w-0">
                                    <span className={`text-sm block ${agent.isEnabled ? 'text-gray-200' : 'text-gray-500'}`}>{agent.name}</span>
                                    {(agent as any).description && (
                                        <span className="text-[9px] text-gray-600 block truncate">{(agent as any).description}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {agent.isEnabled && <span className="text-[9px] text-emerald-400 font-bold uppercase">Active</span>}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setAgents(prev => prev.filter(a => a.id !== agent.id)); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all text-gray-600"
                                    title="Remove agent"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MCP Servers */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Context Servers (MCP)</h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">Bridge your LLM with external logic and real-world tools.</p>
                    </div>
                </div>
                
                <div className="bg-[var(--color-background-tertiary)]/30 border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)]">
                    {mcpServers.map(server => (
                        <div key={server.id} className="flex items-center justify-between p-2.5 group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                                <Server className={`w-4 h-4 ${server.status === 'connected' ? 'text-emerald-400' : 'text-gray-600'}`} />
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${server.status === 'connected' ? 'text-gray-200' : 'text-gray-500'}`}>{server.name}</span>
                                    {server.status !== 'connected' && <span className="text-[9px] text-gray-600 font-bold uppercase">Disconnected</span>}
                                    {server.status === 'error' && <span className="text-[9px] text-red-400 font-bold uppercase">Error</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {server.status === 'connected' ? (
                                    <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded-full font-bold">Connected</span>
                                ) : (
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">Marketplace</span>
                                )}
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleToggleServer(server.id)}
                                        className={`p-1.5 rounded-md transition-all ${server.status === 'connected' ? 'text-gray-500 hover:text-white' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                                        title={server.status === 'connected' ? 'Disconnect' : 'Connect'}
                                    >
                                        <Power size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <p className="text-[10px] text-gray-600 mt-2 px-1 flex items-center gap-2 italic">
                    <Check size={10} className="text-emerald-500" />
                    Available MCP servers are powered by their respective NPM packages.
                </p>
            </div>

            {/* LLM Providers */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">LLM Providers</h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">Manage credentials for your intelligence engines.</p>
                    </div>
                    {onOpenModelMarketplace && (
                        <button 
                            onClick={onOpenModelMarketplace}
                            className="text-xs bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white border border-transparent px-3 py-1 rounded flex items-center gap-1 transition-colors shadow-sm"
                        >
                            <ShoppingBag className="w-3 h-3" /> Marketplace
                        </button>
                    )}
                </div>
                <div className="bg-[var(--color-background-tertiary)]/30 border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)]">
                    {providers.map(provider => {
                        const isExpanded = expandedProviderId === provider.id;
                        return (
                            <div key={provider.id}>
                                <div 
                                    className="flex items-center justify-between p-2.5 hover:bg-[var(--color-background-tertiary)]/50 cursor-pointer group"
                                    onClick={() => toggleProviderExpand(provider.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap className={`w-4 h-4 ${provider.isConfigured ? 'text-yellow-400' : 'text-[var(--color-text-secondary)]'}`} />
                                        <span className="text-sm text-gray-200">{provider.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {provider.isConfigured && <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Configured</span>}
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-white" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-3 bg-black/20 text-xs text-gray-400 border-t border-[var(--color-border)]/50 space-y-3 animate-fade-in">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">API Key</label>
                                            <div className="relative">
                                                <Key className="absolute left-2 top-1.5 text-gray-600" size={12} />
                                                <input 
                                                    type="password"
                                                    value={editingKey}
                                                    onChange={(e) => setEditingKey(e.target.value)}
                                                    placeholder={`Enter ${provider.name} Key...`}
                                                    className="w-full bg-[#0d1117] border border-gray-800 rounded px-7 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleSaveKey(provider.id)}
                                                className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-1.5 rounded flex items-center justify-center gap-1"
                                            >
                                                <Save size={12} /> Save
                                            </button>
                                            <button 
                                                onClick={() => setExpandedProviderId(null)}
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 py-1.5 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Extensions Section */}
        <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1">Extensions</h3>
            <div>
                <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Marketplace Registry URL</label>
                <input 
                    type="text" 
                    value={marketplaceUrl}
                    onChange={(e) => setMarketplaceUrl(e.target.value)}
                    className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <p className="text-[10px] text-gray-500 mt-1">Default: https://open-vsx.org/api</p>
            </div>
        </section>

        {/* General Section */}
        <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-[var(--color-border)] pb-1">General</h3>
            <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-primary)]">Enable Notifications</span>
                <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${notifications ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-background-tertiary)]'}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </section>

        {/* About Section */}
        <section className="pt-4 border-t border-[var(--color-border)] text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
               <span className="font-michroma text-lg font-semibold text-[var(--color-success)]">S.AI</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">Version 0.1.0 (Beta)</p>
            <p className="text-[10px] text-gray-600 mt-1">© 2025 S.AI Inc.</p>
        </section>

      </div>
    </div>
  );
};

export default SettingsPane;