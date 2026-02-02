
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AIModel, TeamMember, RemoteUserState, MenuCategory, MCPServer, Panel } from '../types';
import { 
  PanelLeft, 
  PanelRight, 
  ChevronDown,
  LogOut, 
  User, 
  CreditCard, 
  Shield,
  Rocket,
  UserPlus,
  Check,
  Globe,
  Link as LinkIcon,
  Mic,
  Search,
  Radio,
  Terminal,
  Play,
  Hammer,
  Eye,
  ShieldCheck,
  Menu,
  X,
  BookOpen,
  LayoutGrid,
  Zap,
  Code2,
  Activity,
  Cpu,
  Compass,
  Layers,
  Users,
  Undo2,
  Redo2,
  Palette,
  MicOff,
  Minimize2,
  Maximize2,
  Settings,
  Lock
} from 'lucide-react';

interface HeaderProps {
  models: AIModel[];
  activeModelId: string;
  onModelChange: (modelId: string) => void;
  teamMembers: TeamMember[];
  currentUser: TeamMember | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onInvite: () => void;
  isLanding?: boolean;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  isSidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  isLive?: boolean;
  collaborationState?: Record<string, RemoteUserState>;
  menuCategories?: MenuCategory[];
  onOpenProfile?: () => void;
  onOpenBilling?: () => void;
  onOpenPrivacy?: () => void;
  onUpgradeClick?: () => void;
  inviteDockLocation?: 'header' | 'sidebar';
  onMoveInvite?: () => void;
  mcpServers: MCPServer[];
  onToggleMcp?: (id: string) => void;
  onStatusChange?: (status: 'online' | 'away' | 'busy') => void;
  onOpenVoiceCommand?: () => void;
  activePanel: Panel | null;
  onPanelChange: (panel: Panel) => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  onRun: () => void;
  onBuild: () => void;
  isCallMinimized?: boolean;
  onToggleCallMinimize?: () => void;
  isMicOn?: boolean;
  onToggleMic?: () => void;
}

const NAV_TABS = [
    { id: Panel.FILES, label: 'Editor', icon: <Code2 size={14} />, minPlan: 'Hobby' },
    { id: Panel.TERRAFORM, label: 'Infrastructure', icon: <Cpu size={14} />, minPlan: 'Pro' },
    { id: Panel.SECURITY, label: 'Sentinel', icon: <ShieldCheck size={14} />, minPlan: 'Hobby' },
    { id: Panel.STITCH_STUDIO, label: 'UX Studio', icon: <Palette size={14} />, minPlan: 'Hobby' },
];

const LANDING_NAV_TABS = [
    { id: 'the-blueprint', label: 'Blueprint', icon: <LayoutGrid size={14} /> },
    { id: 'model-library', label: 'Registry', icon: <Cpu size={14} /> },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard size={14} /> },
    { id: 'documentation', label: 'Manual', icon: <BookOpen size={14} /> },
    { id: 'community', label: 'Hub', icon: <Users size={14} /> },
];

const LiveSessionWidget: React.FC<{
  isMicOn: boolean;
  onToggleMic: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}> = ({ isMicOn, onToggleMic, isMinimized, onToggleMinimize }) => {
  return (
    <div className="flex items-center gap-3 bg-[#2d333b] text-white rounded-full h-10 px-4 shadow-lg border border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        <span className="text-sm font-semibold">Live Session</span>
      </div>
      <div className="w-px h-5 bg-white/20" />
      <button onClick={onToggleMic} className="p-1 hover:bg-white/10 rounded-full transition-colors" title="Toggle Microphone">
        {isMicOn ? <Mic size={16} /> : <MicOff size={16} className="text-red-400" />}
      </button>
      <button onClick={onToggleMinimize} className="p-1 hover:bg-white/10 rounded-full transition-colors" title={isMinimized ? 'Show Call' : 'Minimize Call'}>
        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
      </button>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ 
    models = [], activeModelId, onModelChange, teamMembers = [], currentUser, 
    onSignIn, onSignOut, onInvite, isLanding = false,
    isChatOpen, onToggleChat, isSidebarVisible, onToggleSidebar, isLive = false,
    menuCategories = [], onOpenProfile, onOpenBilling, onOpenPrivacy, onUpgradeClick,
    inviteDockLocation = 'header', mcpServers = [], onStatusChange, onOpenVoiceCommand,
    activePanel, onPanelChange, onToggleTerminal, isTerminalOpen, onRun, onBuild,
    isCallMinimized,
    onToggleCallMinimize,
    isMicOn,
    onToggleMic
}) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
              setActiveMenuIndex(null);
              setIsUserMenuOpen(false);
              setIsModelSelectorOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLanding) return;
    const options = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    LANDING_NAV_TABS.forEach(tab => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLanding]);

  const isHobby = currentUser?.plan === 'Hobby';

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'online': return 'bg-green-500';
          case 'away': return 'bg-yellow-500';
          case 'busy': return 'bg-red-500';
          default: return 'bg-gray-500';
      }
  };

  const handleTabClick = (id: string) => {
    if (isLanding) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
        onPanelChange(id as Panel);
    }
  };

  const handleUndo = () => {
    const editMenu = menuCategories.find(c => c.label === 'Edit');
    const undoAction = editMenu?.items.find(i => i.label === 'Undo')?.action;
    undoAction?.();
  };

  const handleRedo = () => {
    const editMenu = menuCategories.find(c => c.label === 'Edit');
    const redoAction = editMenu?.items.find(i => i.label === 'Redo')?.action;
    redoAction?.();
  };

  const getProviderIcon = (provider: string) => {
    switch(provider.toLowerCase()) {
        case 'google': return <Cpu size={14} className="text-emerald-400" />;
        case 'anthropic': return <Cpu size={14} className="text-orange-400" />;
        case 'openai': return <Cpu size={14} className="text-cyan-400" />;
        default: return <Cpu size={14} className="text-gray-500" />;
    }
  };

  const activeModel = useMemo(() => models.find(m => m.id === activeModelId), [models, activeModelId]);

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 h-14 bg-[var(--color-background-nav)] border-b border-[var(--color-border)] px-3 transition-all duration-500 z-[150] select-none header-glow`}
    >
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between gap-1 md:gap-2">
        {/* Logo & Menu Section */}
        <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center group cursor-pointer mr-1 md:mr-2" onClick={() => isLanding ? window.scrollTo({top: 0, behavior: 'smooth'}) : null}>
                <div className={`flex items-center justify-center rounded-xl transition-all duration-300 px-2 md:px-3 h-8 bg-black/20 border border-white/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black shadow-[0_0_15px_rgba(103,232,249,0.2)]`}>
                    <span className={`font-michroma font-bold text-[9px] md:text-[10px] tracking-widest`}>SAI</span>
                </div>
            </div>

            {!isLanding && (
                <button 
                    onClick={onToggleSidebar} 
                    className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${isSidebarVisible ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title="Toggle Sidebar (Ctrl+B)"
                >
                    <PanelLeft size={18} />
                </button>
            )}

            {/* Menu Bar for Workspace */}
            {!isLanding && (
                <nav className="hidden xl:flex items-center gap-0.5 ml-1">
                    {menuCategories.map((category, idx) => (
                        <div key={category.label} className="relative">
                            <button 
                                onClick={() => setActiveMenuIndex(activeMenuIndex === idx ? null : idx)}
                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeMenuIndex === idx ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >
                                {category.label}
                            </button>
                            {activeMenuIndex === idx && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-[200] p-1 animate-fade-in origin-top-left backdrop-blur-xl">
                                    {category.items.map((item, i) => (
                                        item.divider ? (
                                            <div key={`div-${i}`} className="h-px bg-white/5 my-1 mx-1" />
                                        ) : (
                                            <button 
                                                key={item.label}
                                                onClick={() => { item.action?.(); setActiveMenuIndex(null); }}
                                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon && <span className="text-gray-500 group-hover:text-cyan-400">{item.icon}</span>}
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.shortcut && <span className="text-[9px] font-mono text-gray-600 group-hover:text-gray-500">{item.shortcut}</span>}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            )}
        </div>

        {/* Center Section: Navigation Tabs - Scrollable on mobile */}
        <div className="flex-1 flex justify-center items-center h-full px-2 gap-4 overflow-x-auto no-scrollbar relative">
             {isLive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <LiveSessionWidget 
                        isMicOn={isMicOn ?? true}
                        onToggleMic={onToggleMic ?? (() => {})}
                        isMinimized={isCallMinimized ?? false}
                        onToggleMinimize={onToggleCallMinimize ?? (() => {})}
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center h-full gap-0.5">
                        {(isLanding ? LANDING_NAV_TABS : NAV_TABS).map((tab) => {
                            const isActive = isLanding ? activeSection === tab.id : activePanel === tab.id;
                            const restricted = !isLanding && isHobby && 'minPlan' in tab && (tab as any).minPlan === 'Pro';
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (restricted) {
                                            onUpgradeClick?.();
                                        } else {
                                            handleTabClick(tab.id);
                                        }
                                    }}
                                    className={`h-10 px-2 md:px-4 rounded-xl flex items-center gap-2 transition-all duration-300 relative group flex-shrink-0
                                        ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                                        ${restricted ? 'opacity-60 cursor-pointer hover:bg-white/5' : ''}
                                    `}
                                    title={restricted ? 'Premium Feature (Upgrade to Access)' : tab.label}
                                >
                                    <span className={`${isActive ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}`}>{tab.icon}</span>
                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{tab.label}</span>
                                    
                                    {restricted && (
                                        <div className="ml-1 bg-yellow-500/10 p-0.5 rounded border border-yellow-500/20 text-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.2)]">
                                            <Lock size={8} />
                                        </div>
                                    )}
                                    
                                    {isActive && (<div className="absolute -bottom-[1px] left-0 right-0 h-1 bg-cyan-500/80 rounded-t-full shadow-[0_0_15px_var(--color-accent)]" />)}
                                </button>
                            );
                        })}
                    </div>
                    {!isLanding && (
                        <div className="relative">
                            <button
                                onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all h-8"
                            >
                                {activeModel && getProviderIcon(activeModel.provider)}
                                <span className="hidden lg:inline">{activeModel?.name || 'Select Model'}</span>
                                <ChevronDown size={14} />
                            </button>
                            {isModelSelectorOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-[200] p-1.5 animate-fade-in origin-top backdrop-blur-xl">
                                    {models.map(model => (
                                        <button 
                                            key={model.id}
                                            onClick={() => { onModelChange(model.id); setIsModelSelectorOpen(false); }}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getProviderIcon(model.provider)}
                                                <span>{model.name}</span>
                                            </div>
                                            {model.id === activeModelId && <Check size={14} className="text-cyan-400" />}
                                        </button>
                                    ))}
                                    <div className="border-t border-white/10 mt-1.5 pt-1.5">
                                        <button 
                                            onClick={() => { onPanelChange(Panel.AI_MARKETPLACE); setIsModelSelectorOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group"
                                        >
                                            <Settings size={14} className="text-gray-500 group-hover:text-cyan-400" />
                                            Manage Models & Keys
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
            {!isLanding ? (
                <>
                    <div className="hidden lg:flex items-center h-8 px-2 border-x border-white/5 mx-1 gap-1 bg-white/[0.02] rounded-xl">
                        <button onClick={handleUndo} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5" title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
                        <button onClick={handleRedo} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5" title="Redo (Ctrl+Y)"><Redo2 size={14} /></button>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        
                        <button 
                            onClick={onToggleTerminal} 
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${isTerminalOpen ? 'text-cyan-400 bg-cyan-500/10 shadow-inner border border-cyan-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title="Toggle Terminal (Ctrl+J)"
                        >
                            <Terminal size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden xl:inline">Terminal</span>
                        </button>

                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <button onClick={onRun} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Run Active File"><Play size={14} fill="currentColor" /></button>
                    </div>

                    <div className="flex items-center gap-0.5 md:gap-1 bg-white/[0.03] rounded-xl p-0.5 border border-white/5 h-9">
                        <button onClick={onOpenVoiceCommand} className="hidden sm:flex p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"><Mic size={16} /></button>
                        <button 
                            onClick={onToggleChat} 
                            className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-all ${isChatOpen ? 'text-cyan-400 bg-cyan-500/10 shadow-inner border border-cyan-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title="AI Co-pilot (Ctrl+I)"
                        >
                            <PanelRight size={18} />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Chat</span>
                        </button>
                    </div>

                    {currentUser && (
                        <div className="relative ml-1">
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-white relative group transition-transform active:scale-95"
                            >
                                {currentUser.initials}
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-[#0b0e14] ${getStatusColor(currentUser.status)}`} />
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-[200] p-1.5 animate-fade-in origin-top-right backdrop-blur-xl">
                                    <div className="px-4 py-3 border-b border-white/5 mb-1.5">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Authenticated Identity</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-white">{currentUser.name}</p>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isHobby ? 'bg-white/5 text-gray-400' : 'bg-cyan-500 text-black shadow-lg'}`}>{currentUser.plan}</span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 space-y-1">
                                        <HeaderMenuItem icon={<User size={14}/>} label="Identity Profile" onClick={() => { onOpenProfile?.(); setIsUserMenuOpen(false); }} />
                                        <HeaderMenuItem icon={<CreditCard size={14}/>} label="Billing Registry" onClick={() => { onOpenBilling?.(); setIsUserMenuOpen(false); }} />
                                        <HeaderMenuItem icon={<Shield size={14}/>} label="Security Shield" onClick={() => { onOpenPrivacy?.(); setIsUserMenuOpen(false); }} />
                                        <div className="h-px bg-white/5 my-2 mx-1" />
                                        <button onClick={() => { onSignOut(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><LogOut size={14} /> Terminate Session</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-3">
                    <button onClick={onSignIn} className="hidden md:block text-xs font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">Sign In</button>
                    <button 
                        onClick={onSignIn} 
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-2 active:scale-95 border border-white/10"
                    >
                        <Rocket size={14} fill="currentColor" /> <span className="hidden sm:inline">Launch Beta</span><span className="sm:hidden">Beta</span>
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5">
                        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isLanding && isMobileMenuOpen && (
          <div className="fixed inset-0 bg-[#0b0e14]/95 backdrop-blur-xl z-[200] lg:hidden animate-fade-in flex flex-col p-10 pt-20">
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5">
                  <X size={24} />
              </button>
              
              <nav className="flex flex-col gap-6">
                  {LANDING_NAV_TABS.map((tab) => (
                      <button 
                        key={tab.id} 
                        onClick={() => { handleTabClick(tab.id); setIsMobileMenuOpen(false); }}
                        className="text-left flex items-center gap-4 group"
                      >
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-all border border-white/5">
                              {tab.icon}
                          </div>
                          <span className="text-2xl font-black text-gray-400 group-hover:text-white tracking-widest doodle-text uppercase">{tab.label}</span>
                      </button>
                  ))}
              </nav>
              
              <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-4">
                  <button onClick={onSignIn} className="w-full py-4 text-sm font-black text-gray-400 uppercase tracking-widest">Sign In</button>
                  <button onClick={onSignIn} className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20">Launch Beta</button>
              </div>
          </div>
      )}
    </header>
  );
};

const HeaderMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; className?: string }> = ({ icon, label, onClick, className }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-md transition-all group ${className}`}
    >
        <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">{icon}</span>
        <span className="tracking-tight">{label}</span>
    </button>
);

export default Header;
