
import React, { useState, useEffect } from 'react';
import { 
    Check, 
    ChevronRight, 
    ChevronLeft, 
    Zap, 
    Sparkles, 
    Code2, 
    Terminal, 
    Bot, 
    ShieldCheck, 
    Activity,
    Keyboard,
    Palette,
    Radio,
    Users,
    Compass,
    MessageSquarePlus,
    UserPlus,
    Minimize2,
    Layout,
    GripHorizontal,
    LayoutGrid,
    RefreshCw,
    Cpu,
    Globe,
    GitCommit,
    Rocket
} from 'lucide-react';
import { THEMES } from '../../themes';
import { DesignName } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (workspaceName: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  design: DesignName;
  onDesignChange: (design: DesignName) => void;
  keymap: string;
  onKeymapChange: (keymap: string) => void;
  vimMode: boolean;
  onToggleVimMode: () => void;
  isMac?: boolean;
}

const ModalDoodles = () => (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30">
        {/* Animated squiggles and dots */}
        <svg className="absolute top-[-10%] right-[-5%] w-64 h-64 text-blue-400/20 animate-subtle-rotate" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute bottom-[5%] left-[-10%] w-80 h-80 text-purple-400/20 animate-breathe" viewBox="0 0 100 100">
            <path d="M10,50 Q30,20 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="animate-flow-dashes" />
        </svg>
        <div className="absolute top-[20%] left-[10%] w-4 h-4 rounded-full bg-cyan-400/20 animate-pulse" />
        <div className="absolute top-[60%] right-[15%] w-6 h-6 rounded-full bg-rose-400/10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
);

const NeuralCore = () => (
    <div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-4">
        <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 border border-slate-200 rounded-full animate-subtle-rotate"></div>
        <div className="relative z-10 w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/30 transform rotate-6 transition-transform hover:rotate-0 duration-500">
            <Sparkles size={20} className="animate-breathe" />
        </div>
    </div>
);

const GuideCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <div className="group relative bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
            {icon}
        </div>
        <div className="min-w-0">
            <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-wider mb-0.5">{title}</h4>
            <p className="text-[9px] text-slate-500 font-medium leading-tight truncate">{description}</p>
        </div>
    </div>
);

const SaiLogo = ({ width = 140, height = 32, fontSize = 22 }: { width?: number; height?: number; fontSize?: number }) => (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
        </defs>
        <text 
            x="50%" 
            y="50%" 
            dominantBaseline="central" 
            textAnchor="middle" 
            fontFamily="Michroma, sans-serif" 
            fontSize={fontSize} 
            fontWeight="400" 
            fill="url(#logoGradient)"
        >
            SAI
        </text>
    </svg>
);

const ThemeCard: React.FC<{ theme: any; isActive: boolean; onClick: () => void }> = ({ theme, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`group relative flex flex-col items-start p-2.5 rounded-2xl border-2 transition-all duration-300 w-full text-left ${
            isActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'
        }`}
    >
        <div className={`w-full h-20 rounded-xl mb-2.5 overflow-hidden border shadow-inner transition-transform group-hover:scale-[0.98] ${isActive ? 'border-blue-500/30' : 'border-slate-200'}`} style={{ backgroundColor: theme.colors['--color-background'] }}>
            <div className="flex h-full">
                <div className="w-1/3 h-full border-r" style={{ backgroundColor: theme.colors['--color-background-secondary'], borderColor: theme.colors['--color-border'] }}>
                    <div className="p-2 space-y-1.5">
                        <div className="w-full h-1 rounded-full opacity-40" style={{ backgroundColor: theme.colors['--color-text-secondary'] }}></div>
                        <div className="w-2/3 h-1 rounded-full opacity-40" style={{ backgroundColor: theme.colors['--color-text-secondary'] }}></div>
                        <div className="w-1/2 h-1 rounded-full opacity-40" style={{ backgroundColor: theme.colors['--color-text-secondary'] }}></div>
                    </div>
                </div>
                <div className="flex-1 p-2 space-y-1.5">
                    <div className="w-1/2 h-1.5 rounded-full" style={{ backgroundColor: theme.colors['--color-accent'] }}></div>
                    <div className="space-y-1">
                        <div className="w-full h-1 rounded-full opacity-20" style={{ backgroundColor: theme.colors['--color-text-primary'] }}></div>
                        <div className="w-full h-1 rounded-full opacity-20" style={{ backgroundColor: theme.colors['--color-text-primary'] }}></div>
                        <div className="w-4/5 h-1 rounded-full opacity-20" style={{ backgroundColor: theme.colors['--color-text-primary'] }}></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between w-full px-1">
            <span className={`text-[8px] font-black uppercase tracking-widest truncate max-w-[85%] ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                {theme.name}
            </span>
            {isActive && <Check size={10} className="text-blue-600 shrink-0" />}
        </div>
    </button>
);

const MOCK_LIVE_EVENTS = [
    { text: "Sarah pushed to main", icon: <GitCommit size={10} />, color: "text-blue-500" },
    { text: "Deployment successful", icon: <Rocket size={10} />, color: "text-green-500" },
    { text: "System Audit complete", icon: <ShieldCheck size={10} />, color: "text-purple-500" },
    { text: "New invite active", icon: <UserPlus size={10} />, color: "text-orange-500" },
];

const BOOT_SEQUENCE = [
    "Initializing Neural Core...",
    "Allocating Sandbox Memory...",
    "Connecting to Satellite...",
    "Sai Environment Ready."
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
    isOpen, onClose, currentTheme, onThemeChange, design, onDesignChange, keymap, onKeymapChange, vimMode, onToggleVimMode, isMac 
}) => {
    const [step, setStep] = useState(1);
    const [workspaceName, setWorkspaceName] = useState('My Sai Project');
    const [bootStep, setBootStep] = useState(0);
    const [bootComplete, setBootComplete] = useState(false);

    useEffect(() => {
        if (isOpen && step === 1 && !bootComplete) {
            const interval = setInterval(() => {
                setBootStep(prev => {
                    if (prev >= BOOT_SEQUENCE.length - 1) {
                        clearInterval(interval);
                        setTimeout(() => setBootComplete(true), 500);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 600);
            return () => clearInterval(interval);
        }
    }, [isOpen, step, bootComplete]);

    if (!isOpen) return null;

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleFinish = () => {
        onClose(workspaceName);
    };

    const generateRandomName = () => {
        const prefixes = ["Quantum", "Neural", "Hyper", "Cyber", "Aether", "Void", "Solar", "Flux"];
        const suffixes = ["Core", "Engine", "Nexus", "Matrix", "System", "Grid", "Pulse", "Synthesizer"];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomNum = Math.floor(Math.random() * 999);
        setWorkspaceName(`${randomPrefix}-${randomSuffix}-${randomNum}`);
    };

    const STEPS = [
      { id: 1, title: "Welcome to Sai", desc: "AI-native logic sequence active." },
      { id: 2, title: "Choose Team Hub", desc: "Master the Sai project architecture." },
      { id: 3, title: "Design System", desc: "Choose your core interface aesthetic." },
      { id: 4, title: "Visual Identity", desc: "Select a theme that matches your energy." },
      { id: 5, title: "Ergonomics", desc: "Configure your editor preferences." },
      { id: 6, title: "Neural Origin", desc: "Initialize your project identity." },
    ];
    
    const currentStepInfo = STEPS[step - 1];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[300] animate-fade-in p-4 overflow-hidden">
            <div 
                className="bg-white rounded-[3rem] w-full max-w-2xl border border-slate-200 shadow-[0_32px_128px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col relative max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Background Doodles */}
                <ModalDoodles />

                {/* Progress Dots */}
                <div className="absolute top-10 left-0 right-0 flex justify-center gap-2 z-20">
                    {STEPS.map(s => (
                        <div 
                            key={s.id} 
                            className={`h-1 rounded-full transition-all duration-500 ${s.id === step ? 'w-8 bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'w-1.5 bg-slate-200'}`} 
                        />
                    ))}
                </div>

                {/* Header */}
                <div className="pt-20 pb-4 px-12 text-center relative flex-shrink-0 z-10">
                    <div className="flex justify-center mb-4">
                        <SaiLogo />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
                        {currentStepInfo.title}
                    </h2>
                    <p className="text-slate-500 text-[8px] mt-1 font-black uppercase tracking-[0.3em] opacity-60">
                        {currentStepInfo.desc}
                    </p>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-6 pt-2 z-10">
                    {step === 1 && (
                        !bootComplete ? (
                            <div className="h-full flex flex-col items-center justify-center pb-20 space-y-6">
                                <div className="relative">
                                    <Cpu size={48} className="text-blue-500 animate-pulse" />
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-slate-800 animate-pulse">{BOOT_SEQUENCE[bootStep]}</p>
                                    <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-300" 
                                            style={{ width: `${((bootStep + 1) / BOOT_SEQUENCE.length) * 100}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                          <div className="space-y-8 animate-fade-in pb-4">
                              <NeuralCore />
                              
                              <p className="text-center text-xs text-slate-500 font-medium px-8 leading-relaxed">
                                  Your creative space is architected. Preview your <span className="text-slate-900 font-bold">Sai toolkit.</span>
                              </p>
    
                              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                                  <GuideCard
                                      icon={<Code2 size={14} />}
                                      title="Logic Forge"
                                      description="Code refactoring."
                                      color="bg-blue-500"
                                  />
                                  <GuideCard
                                      icon={<Bot size={14} />}
                                      title="App Engine"
                                      description="App synthesis."
                                      color="bg-purple-500"
                                  />
                                  <GuideCard
                                      icon={<Terminal size={14} />}
                                      title="Shell Link"
                                      description="Sandboxed terminal."
                                      color="bg-emerald-500"
                                  />
                                  <GuideCard
                                      icon={<LayoutGrid size={14} />}
                                      title="Team Hub"
                                      description="Project dashboard."
                                      color="bg-rose-500"
                                  />
                              </div>
    
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group max-w-sm mx-auto mt-4">
                                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-500/10">
                                      <Zap size={18} fill="currentColor" />
                                  </div>
                                  <div>
                                      <h4 className="font-black text-[10px] text-blue-600 uppercase tracking-[0.2em] mb-0.5">Quick Tip</h4>
                                      <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                          Type <code className="bg-slate-200 px-1.5 py-0.5 rounded text-blue-600 font-mono text-[10px]">sai synth &lt;intent&gt;</code> to build.
                                      </p>
                                  </div>
                              </div>
                          </div>
                        )
                    )}

                    {step === 2 && (
                      <div className="space-y-8 animate-fade-in pb-4 flex flex-col justify-center h-full">
                          <div className="relative mx-auto w-full max-w-sm h-32 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
                             <div className="bg-slate-100/50 p-2 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-400">Live Activity Feed</span>
                                <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div></div>
                             </div>
                             <div className="p-3 space-y-2 relative overflow-hidden">
                                {MOCK_LIVE_EVENTS.map((evt, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] animate-fade-in" style={{ animationDelay: `${i * 0.5}s` }}>
                                        <span className={evt.color}>{evt.icon}</span>
                                        <span className="text-slate-600">{evt.text}</span>
                                    </div>
                                ))}
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                             </div>
                          </div>

                          <p className="text-center text-xs text-slate-500 font-medium px-8 leading-relaxed mb-4">
                              Sai is built for <span className="text-slate-900 font-bold">collective intelligence.</span> Manage your blueprints from the Hub.
                          </p>

                          <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-4 hover:border-blue-200 transition-colors cursor-pointer group">
                                  <div className="p-2 bg-blue-500 rounded-xl text-white shrink-0 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                      <LayoutGrid size={16} />
                                  </div>
                                  <div>
                                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-1">Centralized Hub</h4>
                                      <p className="text-[10px] text-slate-500 leading-tight">Access all your projects and team activity from the primary dashboard.</p>
                                  </div>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
                                  <div className="p-2 bg-emerald-500 rounded-xl text-white shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                      <Activity size={16} />
                                  </div>
                                  <div>
                                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-1">Team Pulse</h4>
                                      <p className="text-[10px] text-slate-500 leading-tight">Monitor real-time updates and synthesis events from across your organization.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                    )}
                    
                    {step === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in pb-4 h-full items-center">
                        <button onClick={() => onDesignChange('neural-ink')} className={`group relative p-4 rounded-[2rem] border-2 transition-all duration-500 ${design === 'neural-ink' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'}`}>
                          <div className="h-32 w-full bg-[#080a0f] rounded-2xl flex flex-col p-4 justify-between border border-gray-800 shadow-xl overflow-hidden relative">
                            <span className="text-[8px] font-black text-[#67e8f9] uppercase tracking-[0.3em]">Sai Ink</span>
                            <div className="space-y-2">
                              <div className="h-1 w-full bg-white/5 rounded-full" />
                              <div className="h-1 w-3/4 bg-white/5 rounded-full" />
                            </div>
                          </div>
                          <p className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-slate-900 transition-colors">Precision Dark</p>
                        </button>
                        
                        <button onClick={() => onDesignChange('doodle')} className={`group relative p-4 rounded-[2rem] border-2 transition-all duration-500 ${design === 'doodle' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'}`}>
                          <div className="h-32 w-full bg-[#fdfcf8] rounded-2xl flex flex-col p-4 justify-between border-2 border-slate-900 shadow-xl relative overflow-hidden">
                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em]">Organic</span>
                            <div className="space-y-2">
                              <div className="h-1 w-full bg-slate-900/10 rounded-full" />
                              <div className="h-1 w-3/4 bg-slate-900/10 rounded-full" />
                            </div>
                          </div>
                          <p className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-slate-900 transition-colors">Tactile Light</p>
                        </button>

                        <button onClick={() => onDesignChange('blueprint')} className={`group relative p-4 rounded-[2rem] border-2 transition-all duration-500 ${design === 'blueprint' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'}`}>
                            <div className="h-32 w-full bg-[#002b55] rounded-2xl flex flex-col p-4 justify-between border border-cyan-400/30 shadow-xl relative overflow-hidden">
                                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em]">Blueprint</span>
                                <div className="space-y-2">
                                <div className="h-1 w-full bg-cyan-400/20 rounded-full" />
                                <div className="h-1 w-1/2 bg-cyan-400/20 rounded-full" />
                                </div>
                            </div>
                            <p className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-slate-900 transition-colors">Architectural</p>
                        </button>
                      </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between px-2 sticky top-0 bg-white/80 backdrop-blur-md py-3 z-10 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Palette size={16} className="text-blue-600" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment Themes</h3>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{THEMES.length} Options</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-8">
                                {THEMES.map(theme => (
                                    <ThemeCard 
                                        key={theme.name} 
                                        theme={theme}
                                        isActive={currentTheme === theme.name}
                                        onClick={() => onThemeChange(theme.name)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-fade-in pb-4 max-w-sm mx-auto pt-6">
                            <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center opacity-60">Global Input Map</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['vscode', 'jetbrains', 'sublime', 'cursor'].map(id => (
                                        <button
                                            key={id}
                                            onClick={() => onKeymapChange(id)}
                                            className={`p-3 rounded-xl text-[10px] font-bold border-2 transition-all duration-300 ${
                                                keymap === id 
                                                ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                                : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {id.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                            <Keyboard size={16} />
                                        </div>
                                        <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Legacy Vim</span>
                                    </div>
                                    <button 
                                        onClick={onToggleVimMode}
                                        className={`w-10 h-5 rounded-full p-1 transition-all duration-500 ${vimMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-500 ${vimMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/10 flex items-center justify-center text-blue-600 mb-4 shadow-xl">
                                <Globe size={24} strokeWidth={1.5} className="animate-pulse" />
                            </div>
                            <div className="w-full max-w-xs space-y-4">
                                <label className="block text-[8px] font-black text-center text-slate-400 uppercase tracking-[0.5em] opacity-60">Sai Project ID</label>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                        className="w-full bg-slate-50 border-b-2 border-slate-200 text-center py-3 text-xl font-black text-slate-900 focus:outline-none focus:border-blue-600 transition-all duration-700"
                                        placeholder="Project ID..."
                                    />
                                    <button 
                                        onClick={generateRandomName}
                                        className="absolute right-0 top-3 text-slate-400 hover:text-blue-500 transition-colors"
                                        title="Generate Codename"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex justify-between items-center flex-shrink-0 z-10">
                    <button 
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        <ChevronLeft size={14} /> Backward
                    </button>

                    <div className="flex gap-3">
                        {step < 6 ? (
                            <button 
                                onClick={nextStep}
                                disabled={step === 1 && !bootComplete}
                                className="bg-slate-900 hover:bg-black text-white font-black py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 group text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Advance <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleFinish}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-[10px] uppercase tracking-widest"
                            >
                                <Sparkles size={16} fill="currentColor" /> Finalize
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .animate-subtle-rotate { animation: subtle-rotate 30s linear infinite; }
                @keyframes subtle-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
