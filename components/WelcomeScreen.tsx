import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Plus, 
    ArrowRight, 
    Settings, 
    Sparkles, 
    Terminal,
    Users,
    Bot,
    CircleDot,
    FileText,
    Compass,
    Network,
    Lock
} from 'lucide-react';
import { RecentItem, Panel } from '../types';

const BackgroundDoodles = () => (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-20 text-[var(--color-text-secondary)]">
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-subtle-rotate opacity-30" style={{ animationDuration: '240s' }} viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8, 8" />
            <path d="M50,200 A150,150 0 0,1 350,200" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M200,50 A150,150 0 0,1 200,350" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M100,100 L300,300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,4" className="animate-flow-dashes" style={{ animationDuration: '5s' }}/>
            <path d="M100,300 L300,100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4,4" className="animate-flow-dashes" style={{ animationDuration: '5s', animationDirection: 'reverse' }}/>
        </svg>
        <div className="absolute top-[10%] left-[15%] animate-doodle-float" style={{ animationDuration: '12s' }}>
            <span className="font-mono text-5xl opacity-50">{"{ }"}</span>
        </div>
        <svg className="absolute bottom-[15%] right-[10%] w-48 h-32 animate-doodle-float" style={{ animationDuration: '10s', animationDelay: '2s' }} viewBox="0 0 100 100">
            <path d="M10 90 Q 50 10, 90 90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="10" cy="90" r="3" fill="currentColor" />
            <circle cx="90" cy="90" r="3" fill="currentColor" />
        </svg>
        <svg className="absolute top-[20%] right-[20%] w-24 h-24 animate-doodle-float" style={{ animationDuration: '15s', animationDelay: '1s' }}>
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" className="rotate-12" />
        </svg>
        <div className="absolute bottom-[25%] left-[20%] animate-doodle-float" style={{ animationDuration: '13s', animationDelay: '3s' }}>
            <span className="font-mono text-3xl opacity-40">fn()</span>
        </div>
        <svg className="absolute top-[60%] right-[30%] w-32 h-20 animate-doodle-float opacity-60" style={{ animationDuration: '11s', animationDelay: '0.5s' }}>
            <path d="M20 50 A20 20 0 1 1 60 50 A15 15 0 1 1 90 50 A10 10 0 1 1 80 30 A25 25 0 1 1 20 50 Z" fill="currentColor" opacity="0.1" />
        </svg>
    </div>
);

interface WelcomeScreenProps {
    onNewFile: () => void;
    onCloneRepo?: () => void;
    onOpenCommandPalette: () => void;
    onOpenSettings: () => void;
    isMac?: boolean;
    onClose?: () => void;
    userName?: string;
    // Standardized to activeModelId for naming consistency across the app
    activeModelId?: string;
    onAIAppGen?: (prompt: string, mode?: 'chat' | 'app') => void;
    onOpenDocs?: () => void;
    onOpenRecorder?: () => void;
    recents?: RecentItem[];
    onOpenCollaboration?: () => void;
    onOpenWhiteboard?: () => void;
    onChangePanel?: (panel: Panel) => void;
    userPlan?: 'Hobby' | 'Pro' | 'Enterprise';
    onRestrictedClick?: (featureName: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onNewFile, 
    onOpenCommandPalette, 
    onOpenSettings, 
    onAIAppGen,
    onOpenDocs,
    onOpenRecorder,
    onOpenCollaboration,
    onOpenWhiteboard,
    onChangePanel,
    userName = "Designer",
    // Standardized to activeModelId
    activeModelId,
    recents = [],
    userPlan = 'Hobby',
    onRestrictedClick,
}) => {
    const isHobby = userPlan === 'Hobby';
    const [prompt, setPrompt] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const blueprintsRef = useRef<HTMLDivElement>(null);
    const footerActionsRef = useRef<HTMLDivElement>(null);

    const handleAIPromptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && onAIAppGen) {
            onAIAppGen(prompt, 'app');
        }
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;
        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            if (headerRef.current) headerRef.current.style.transform = `translateY(${scrollTop * 0.4}px)`;
            if (searchRef.current) searchRef.current.style.transform = `translateY(${scrollTop * 0.2}px)`;
            if (blueprintsRef.current) blueprintsRef.current.style.transform = `translateY(${scrollTop * 0.1}px)`;
            if (footerActionsRef.current) footerActionsRef.current.style.transform = `translateY(${scrollTop * 0.05}px)`;
        };
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);
    
    const BLUEPRINTS = [
        { 
            id: 'live-meeting', 
            title: 'Live Meeting', 
            description: 'Doodle together. Real-time sync for teams.', 
            icon: <Users size={20} />, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-100',
            action: isHobby ? () => onRestrictedClick?.('Live Meeting') : onOpenCollaboration,
            locked: isHobby
        },
        { 
            id: 'whiteboard', 
            title: 'Whiteboard', 
            description: 'Freeform canvas for architectural design.', 
            icon: <Network size={20} />, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100',
            action: isHobby ? () => onRestrictedClick?.('Whiteboard') : onOpenWhiteboard,
            locked: isHobby
        },
        { 
            id: 'docs', 
            title: 'Sketchpad', 
            description: 'Docs and technical specs as a canvas.', 
            icon: <FileText size={20} />, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-100',
            action: isHobby ? () => onRestrictedClick?.('Sketchpad') : onOpenDocs,
            locked: isHobby
        },
        { 
            id: 'recorder', 
            title: 'Demo Catcher', 
            description: 'Record screen and camera instantly.', 
            icon: <CircleDot size={20} />, 
            color: 'text-rose-600', 
            bg: 'bg-rose-100',
            action: isHobby ? () => onRestrictedClick?.('Demo Catcher') : onOpenRecorder,
            locked: isHobby
        },
        { 
            id: 'agent', 
            title: 'AI Chat', 
            description: 'An AI that thinks in logic scribbles.', 
            icon: <Bot size={20} />, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100',
            action: isHobby ? () => onRestrictedClick?.('AI Chat') : () => onAIAppGen?.("Let's start a new architectural discussion.", 'chat'),
            locked: isHobby
        },
    ];

    return (
        <div ref={scrollContainerRef} className="h-full w-full bg-[var(--color-background)] relative overflow-y-auto custom-scrollbar flex flex-col p-8 md:p-16 text-[var(--color-text-primary)]">
            <BackgroundDoodles />
            <div className="relative z-10 max-w-5xl mx-auto w-full">
                <div ref={headerRef} style={{ willChange: 'transform' }}>
                    <div className="flex justify-between items-start mb-12">
                        <div className="animate-fade-in">
                            <p className="text-3xl md:text-4xl text-[var(--color-text-secondary)] doodle-text mb-4">
                               Hello, <span className="text-[var(--color-text-accent)]">{userName}</span>.
                            </p>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--color-text-primary)] tracking-tighter mb-4 doodle-text">
                                Let's <span className="relative inline-block">Code.<svg className="absolute bottom-[-12px] left-0 w-full h-4" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0,5 Q50,10 100,5" stroke="var(--color-text-accent)" strokeWidth="8" fill="none" strokeLinecap="round"/></svg></span> Collaborate. Create.
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-xl max-w-xl font-medium mt-8 leading-relaxed">
                                Turn your scribbles into logic with Sai. Organic synthesis for a modern, AI-first ecosystem.
                            </p>
                        </div>
                    </div>
                </div>

                <div ref={searchRef} className="mb-24 w-full" style={{ willChange: 'transform' }}>
                    <form onSubmit={handleAIPromptSubmit} className="relative group">
                        <div className="relative flex items-center bg-white sketch-border sketch-shadow shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] p-2 transition-all group-focus-within:-translate-y-1 group-focus-within:shadow-xl">
                            <div className="pl-4 pr-3 text-gray-400 group-focus-within:text-[var(--color-text-accent)] transition-colors">
                                <Compass size={24} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="text" 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="What should we build today in Sai?..."
                                className="flex-1 bg-transparent text-gray-800 text-2xl font-bold focus:outline-none doodle-text h-14 placeholder-gray-400"
                            />
                            <button type="submit" className="p-3 bg-[var(--color-accent)] text-white rounded-2xl hover:bg-[var(--color-accent-hover)] transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </form>
                </div>

                <div ref={blueprintsRef} style={{ willChange: 'transform' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {BLUEPRINTS.map(bp => (
                            <button 
                                key={bp.id} 
                                onClick={() => bp.action?.()}
                                className={`text-left bg-white sketch-border sketch-shadow p-6 group hover:-translate-y-2 transition-all relative ${bp.locked ? 'opacity-75' : ''}`}
                            >
                                 {bp.locked && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Lock size={12} className="text-amber-600" />
                                    </div>
                                 )}
                                 <div className="absolute -bottom-2 -right-2 w-12 h-12 border-2 border-dashed border-gray-200 rounded-xl transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"></div>
                                <div className={`w-14 h-14 rounded-2xl ${bp.bg} ${bp.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                    {bp.icon}
                                </div>
                                <h3 className="font-black text-gray-900 mb-2 doodle-text text-xl">{bp.title}</h3>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed">{bp.description}</p>
                                {bp.locked && <p className="text-[10px] text-amber-600 font-bold mt-2">Pro Feature</p>}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={footerActionsRef} style={{ willChange: 'transform' }}>
                    <div className="mt-20 pt-16 border-t-2 border-dashed border-gray-200 flex flex-wrap gap-6 justify-center">
                        <button onClick={onNewFile} className="flex items-center gap-2.5 text-sm font-black text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)] transition-all hover:scale-105">
                            <Plus size={16} strokeWidth={3} /> New Draft
                        </button>
                        <button onClick={onOpenCommandPalette} className="flex items-center gap-2.5 text-sm font-black text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)] transition-all hover:scale-105">
                            <Terminal size={16} strokeWidth={3} /> Run Cmd
                        </button>
                        <button onClick={onOpenSettings} className="flex items-center gap-2.5 text-sm font-black text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)] transition-all hover:scale-105">
                            <Settings size={16} strokeWidth={3} /> Config
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;