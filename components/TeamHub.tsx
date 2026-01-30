import React, { useState, useMemo, useEffect } from 'react';
import { 
    LayoutGrid, 
    Users, 
    Zap, 
    Clock, 
    Sparkles, 
    Plus, 
    Search, 
    ChevronRight, 
    Activity, 
    Cpu,
    ShieldCheck,
    Bot,
    MessageSquare,
    Compass,
    Github,
    Lightbulb,
    HelpCircle,
    MessageSquareText,
    Link as LinkIcon,
    ListChecks,
    CheckCircle,
    LayoutTemplate
} from 'lucide-react';
import { TeamMember, Project, Commit, ProjectStatus, AgendaItem } from '../types';

interface TeamHubProps {
    projects: Project[];
    teamMembers: TeamMember[];
    onLaunchWorkspace: (projectName: string) => void;
    onInvite: () => void;
    onCreateProject: () => void;
    onBrowseTemplates: () => void;
    currentUser: TeamMember | null;
    commits: Commit[];
    onAskHubAgent: (prompt: string) => void;
    onJoinDiscussion: (text: string, icon: React.ReactNode) => void;
    discussions: any[];
    onImportLink: (url: string) => void;
    agendaItems: AgendaItem[];
    activity: { id: string, icon: React.ReactNode, text: string, time: string, user?: string }[];
}

interface ActivityItem {
    user: string;
    action: string;
    target: string;
    time: string;
    type: 'deploy' | 'synth' | 'review' | 'commit' | 'comment';
    fullText?: string;
    icon?: React.ReactNode;
}

const MOCK_ACTIVITY_POOL: ActivityItem[] = [
    { user: 'Sarah Jones', action: 'pushed a commit to', target: 'neural-ux-lab', time: 'just now', type: 'commit' },
    { user: 'Alex Chen', action: 'deployed', target: 'hyper-commerce', time: 'just now', type: 'deploy' },
    { user: 'Mike Ross', action: 'commented on', target: 'Mobile Grid Fix', time: 'just now', type: 'comment' },
    { user: 'Emily Blunt', action: 'opened review on', target: 'alphabet-explorer', time: 'just now', type: 'review' },
    { user: 'Alex Chen', action: 'synthesized', target: 'payment_gateway.ts', time: 'just now', type: 'synth' },
];

const ImportLinkCard: React.FC<{ onImport: (url: string) => void }> = ({ onImport }) => {
    const [url, setUrl] = useState('');
    const isValidUrl = url.startsWith('http');

    const handleImport = () => {
        if (isValidUrl) {
            onImport(url);
            setUrl('');
        }
    };

    return (
        <div className="bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <LinkIcon size={20} className="text-[var(--color-text-secondary)]"/>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Import Link for Discussion</h3>
            </div>
            <p className="text-xs text-gray-500">Import any URL (GitHub, Medium, blogs) to start a discussion with your team.</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Paste any URL..." 
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-all font-medium"
                />
                <button 
                    onClick={handleImport}
                    disabled={!isValidUrl}
                    className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0 active:shadow-none disabled:opacity-30 disabled:grayscale disabled:translate-y-0 disabled:shadow-none"
                >
                    Import
                </button>
            </div>
        </div>
    );
};

const SessionAgendaCard: React.FC<{ agenda: AgendaItem[]; }> = ({ agenda = [] }) => {
    const completedCount = agenda.filter(item => item?.completed).length;
    const totalCount = agenda.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <ListChecks size={20} className="text-[var(--color-text-secondary)]"/>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Live Session Agenda</h3>
            </div>
            
            {totalCount > 0 ? (
                <>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                            <span>Progress</span>
                            <span>{completedCount} / {totalCount}</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-1.5">
                            <div className="bg-[var(--color-accent)] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                        {agenda.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                                {item.completed ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-3.5 h-3.5 border-2 border-gray-600 rounded-full" />}
                                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-xs text-gray-500 italic text-center py-4">No agenda set for the current session.</p>
            )}
        </div>
    );
};

const GitHubDiscussionsCard: React.FC<{
    onJoinDiscussion: (text: string, icon: React.ReactNode) => void;
    currentUser: TeamMember;
    discussions: any[];
}> = ({ onJoinDiscussion, currentUser, discussions = [] }) => (
    <div className="bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Github size={20} className="text-[var(--color-text-secondary)]"/>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Community Discussions</h3>
      </div>
      <div className="space-y-3">
        {(discussions || []).map((d, i) => (
            <button
                key={`${d.title}-${i}`}
                onClick={() => onJoinDiscussion(`${currentUser.name} joined discussion: "${d.title}"`, <MessageSquareText size={14} className="text-green-400"/>)}
                className="w-full text-left p-3 bg-black/20 rounded-lg hover:bg-black/40 transition-colors"
            >
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold`}>
                        {d.icon}
                    </div>
                    <div>
                        <p className="font-semibold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">{d.title}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">by @{d.user} • {d.time}</p>
                    </div>
                </div>
            </button>
        ))}
      </div>
    </div>
);

const TeamHub: React.FC<TeamHubProps> = ({ 
    projects = [], 
    teamMembers = [], 
    onLaunchWorkspace, 
    onInvite, 
    onCreateProject, 
    onBrowseTemplates, 
    currentUser, 
    commits = [], 
    onAskHubAgent, 
    onJoinDiscussion, 
    discussions = [], 
    onImportLink, 
    agendaItems = [],
    activity = [] 
}) => {
    const [search, setSearch] = useState('');

    const filteredProjects = (projects || []).filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
    );
    
    // Merge real workspace activity with the simulation pool
    const [liveActivity, setLiveActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        // Map the real activity prop to the pulse format
        const realActivityMapped: ActivityItem[] = (activity || []).map(act => ({
            user: act.user || currentUser?.name || 'User',
            action: '', 
            target: '', 
            time: act.time,
            type: 'synth', 
            fullText: act.text,
            icon: act.icon
        }));

        // Combine and prioritize real activity
        setLiveActivity(prev => {
            const combined = [...realActivityMapped];
            // Fill with simulation if empty
            if (combined.length < 5) {
                return [...combined, ...prev.slice(combined.length)].slice(0, 5);
            }
            return combined.slice(0, 5);
        });
    }, [activity, currentUser]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveActivity(prevFeed => {
                const newActivity = { ...MOCK_ACTIVITY_POOL[Math.floor(Math.random() * MOCK_ACTIVITY_POOL.length)] };
                newActivity.time = 'just now';
                
                if (prevFeed.length > 0 && prevFeed[0].fullText) {
                    return [prevFeed[0], newActivity, ...prevFeed.slice(1, 4)];
                }

                const ageTime = (time: string): string => {
                    if (time === 'just now') return '1m ago';
                    if (time.endsWith('m ago')) {
                        const minutes = parseInt(time) + 1;
                        return minutes < 60 ? `${minutes}m ago` : '1h ago';
                    }
                    if (time.endsWith('h ago')) {
                        const hours = parseInt(time) + 1;
                        return hours < 24 ? `${hours}h ago` : '1d ago';
                    }
                    return time;
                };
                
                const agedFeed = prevFeed.map(item => ({...item, time: ageTime(item.time)}));

                return [newActivity, ...agedFeed].slice(0, 5);
            });
        }, 8000); 

        return () => clearInterval(interval);
    }, []);

    if (!currentUser) return null;

    return (
        <div className="flex-1 h-full p-8 md:p-16 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-16">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-4 shadow-sm">
                            <Sparkles size={12} className="text-[var(--color-accent)]" />
                            <span className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-widest">Neural Core Status: Online</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-[var(--color-text-primary)] tracking-tighter relative">
                            Team Hub
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg font-medium mt-4">Manage your projects, team, and activity.</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={onBrowseTemplates}
                            className="bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0 active:shadow-none"
                        >
                            <LayoutTemplate size={14} className="inline mr-2" /> Templates
                        </button>
                        <button 
                            onClick={onCreateProject}
                            className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0 active:shadow-none"
                        >
                            <Plus size={14} className="inline mr-2" /> New Project
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Project Blueprints */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                                <Compass size={20} className="text-[var(--color-text-secondary)]" />
                                Project Blueprints
                            </h2>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Filter projects..." 
                                    className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-all font-medium"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredProjects.map(project => (
                                <button 
                                    key={project.id}
                                    onClick={() => onLaunchWorkspace(project.title)}
                                    className={`group text-left bg-[var(--color-background-secondary)] border border-[var(--color-border)] p-6 rounded-2xl transition-all hover:-translate-y-1 relative overflow-hidden shadow-lg hover:shadow-2xl`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-[var(--color-background-tertiary)] rounded-xl border border-[var(--color-border)] shadow-inner">
                                            <LayoutGrid size={20} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase bg-[var(--color-background-tertiary)] px-3 py-1 rounded-full text-[var(--color-text-secondary)] border border-[var(--color-border)] capitalize">{project.status}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{project.title}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-6 line-clamp-2 leading-relaxed">{project.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex -space-x-3">
                                            {(project.teamMemberIds || []).map((mid) => {
                                                const member = teamMembers.find(m => m.id === mid);
                                                return (
                                                    <div key={mid} className="w-8 h-8 rounded-full bg-[var(--color-background-tertiary)] border-2 border-[var(--color-background-secondary)] flex items-center justify-center text-[10px] font-black text-[var(--color-text-secondary)] uppercase shadow-sm">
                                                        {member?.initials || '??'}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1 text-[var(--color-accent)] font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                                            Launch <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                            
                            <button onClick={onBrowseTemplates} className="group text-left bg-transparent border-2 border-dashed border-[var(--color-border)] p-8 transition-all hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-accent)] flex flex-col items-center justify-center gap-4 rounded-2xl min-h-[280px]">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-background-secondary)] border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)]/50 transition-all group-hover:scale-110 shadow-sm">
                                    <LayoutTemplate size={32} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest group-hover:text-var(--color-text-primary)]">Use Template</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)] px-2 flex items-center gap-3 mb-4">
                                <Activity size={20} className="text-[var(--color-text-secondary)]" />
                                Team Pulse
                            </h2>
                            <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
                                {(liveActivity || []).map((activity, i) => (
                                    <div key={i} className="flex gap-4 relative animate-fade-in">
                                        {i < liveActivity.length - 1 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-[var(--color-border)]" />}
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[10px] font-black text-[var(--color-accent)] shrink-0 shadow-sm">
                                            {activity.user?.split(' ').map(n => n[0]).join('') || '??'}
                                        </div>
                                        <div className="min-w-0">
                                            {activity.fullText ? (
                                                <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-tight">
                                                    {activity.fullText}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-tight">
                                                    <span className="font-bold text-[var(--color-text-primary)]">{activity.user}</span> {activity.action} <span className="font-bold text-[var(--color-accent)]">{activity.target}</span>
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Clock size={10} className="text-[var(--color-text-secondary)]/50" />
                                                <span className="text-[9px] font-bold text-[var(--color-text-secondary)]/50 uppercase tracking-tighter">{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <SessionAgendaCard agenda={agendaItems} />
                        <ImportLinkCard onImport={onImportLink} />
                        <GitHubDiscussionsCard onJoinDiscussion={onJoinDiscussion} currentUser={currentUser} discussions={discussions} />

                        <button 
                            onClick={() => onAskHubAgent("Please provide a neural summary of the workspace health and active development trends.")}
                            className="w-full text-left bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent border border-[var(--color-accent)]/20 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
                        >
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold text-white mb-2">Ask the Hub Agent</h3>
                                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-4 leading-relaxed italic">"Summarize today's team activity..."</p>
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <Bot size={12} /> Neural Summary
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamHub;