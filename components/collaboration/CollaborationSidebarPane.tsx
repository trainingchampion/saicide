
import React, { useState } from 'react';
import { TeamMember, RemoteUserState, AgendaItem } from '../../types';
import { Radio, UserPlus, Users, CheckCircle, FileText, Bell, Plus, Trash2, ListChecks, ArrowRightLeft, Link as LinkIcon, Copy, Check, ChevronsLeft } from 'lucide-react';

interface CollaborationSidebarPaneProps {
  isLive: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onInvite: () => void;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onCollapse: () => void;
  collaborationState?: Record<string, RemoteUserState>;
  inviteDockLocation?: 'header' | 'sidebar';
  onMoveInvite?: () => void;
  onPopOut: () => void;
  agendaItems: AgendaItem[];
  onAddAgendaItem: (text: string) => void;
  onToggleAgendaItem: (id: string) => void;
  onDeleteAgendaItem: (id: string) => void;
  onInviteSent?: () => void;
}

const CollaborationSidebarPane: React.FC<CollaborationSidebarPaneProps> = ({
  isLive,
  onStartSession,
  onStopSession,
  onInvite,
  teamMembers,
  currentUser,
  onCollapse,
  collaborationState = {},
  inviteDockLocation = 'header',
  onMoveInvite,
  onPopOut,
  agendaItems,
  onAddAgendaItem,
  onToggleAgendaItem,
  onDeleteAgendaItem,
  onInviteSent
}) => {
  const onlineMembers = teamMembers.filter(m => m.status === 'online');
  const offlineMembers = teamMembers.filter(m => m.status !== 'online');
  const [isCopied, setIsCopied] = useState(false);
  
  const [newItemText, setNewItemText] = useState('');

  const addAgendaItem = (e: React.FormEvent) => {
      e.preventDefault();
      onAddAgendaItem(newItemText);
      setNewItemText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://sai.sh/join/${Math.random().toString(36).substring(7)}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (onInviteSent) onInviteSent();
  };

  const completedCount = agendaItems.filter(i => i.completed).length;
  const progress = agendaItems.length > 0 ? (completedCount / agendaItems.length) * 100 : 0;

  const handleNudge = (name: string) => {
      alert(`Nudged ${name} to join!`);
  };

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-white">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-widest">Collaboration</h2>
         <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            <ChevronsLeft size={18} />
        </button>
      </div>
      
      <div className="p-2 space-y-3">
        {isLive ? (
          <button
            onClick={onStopSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition-all shadow-lg shadow-red-500/10 active:scale-95"
          >
            <Radio size={16} className="animate-pulse" />
            <span>End Live Session</span>
          </button>
        ) : (
          <button
            onClick={onStartSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <Radio size={16} />
            <span>Start Live Session</span>
          </button>
        )}
        
        <div className={`p-4 rounded-2xl transition-all relative overflow-hidden group ${inviteDockLocation === 'sidebar' ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 shadow-xl' : 'bg-white/5 border border-white/5'}`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                            <UserPlus size={18} />
                        </div>
                        <span className="text-xs font-black uppercase text-white tracking-wider">Invite Hub</span>
                    </div>
                    <button 
                        onClick={onMoveInvite}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                        title={inviteDockLocation === 'sidebar' ? 'Dock to Header' : 'Keep in Sidebar'}
                    >
                        <ArrowRightLeft size={14} className={inviteDockLocation === 'sidebar' ? 'text-cyan-400' : ''} />
                    </button>
                </div>

                <div className="space-y-2">
                    <button
                      onClick={onInvite}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
                    >
                      <Plus size={16} />
                      <span>Invite Teammates</span>
                    </button>
                    
                    <button 
                        onClick={handleCopyLink}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isCopied ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                    >
                        {isCopied ? <Check size={14} /> : <LinkIcon size={14} />}
                        {isCopied ? 'Link Copied!' : 'Copy Magic Link'}
                    </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Recent Collaborators</p>
                    <div className="flex -space-x-1 px-1">
                        {onlineMembers.slice(0, 4).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[var(--color-background-secondary)] flex items-center justify-center text-[8px] font-bold text-gray-400" title={m.name}>{m.initials}</div>
                        ))}
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-[var(--color-background-secondary)] flex items-center justify-center text-[10px] text-cyan-400 cursor-pointer hover:bg-cyan-500/30 transition-colors" onClick={onInvite}>
                            <Plus size={10} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all duration-500"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 border-t border-[var(--color-border)]">
        <div className="p-2">
            <h3 className="text-xs font-bold uppercase text-[var(--color-text-secondary)] mb-3 px-1 flex items-center gap-2">
                <ListChecks size={14} />
                Session Agenda
            </h3>
            
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-2 mb-3">
                {agendaItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group p-1.5 rounded-md hover:bg-white/5 transition-colors">
                        <button 
                            onClick={() => onToggleAgendaItem(item.id)}
                            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-gray-300'}`}
                        >
                            {item.completed && <Check size={12} className="text-black" />}
                        </button>
                        <span className={`text-sm flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {item.text}
                        </span>
                        <button 
                            onClick={() => onDeleteAgendaItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addAgendaItem} className="flex gap-2 mt-2">
                <input 
                    type="text" 
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add task..." 
                    className="flex-1 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--color-accent)]"
                />
                <button type="submit" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white p-1 rounded">
                    <Plus size={14} />
                </button>
            </form>
        </div>

        <div className="p-2 border-t border-[var(--color-border)] mt-2">
            <h3 className="text-xs font-bold uppercase text-[var(--color-text-secondary)] mb-3 px-1 flex items-center gap-2">
                <Users size={14} />
                Participants ({onlineMembers.length})
            </h3>
            <div className="space-y-3">
            {onlineMembers.map(member => {
                const userState = collaborationState[member.id];
                const activeFile = userState?.activeFile;
                
                return (
                    <div key={member.id} className="flex flex-col gap-1 px-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold border border-gray-600">{member.initials}</div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--color-background-secondary)] rounded-full animate-pulse"></span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-200">{member.name} {member.id === currentUser.id ? '(You)' : ''}</p>
                                    <p className="text-[10px] text-gray-500">{member.role}</p>
                                </div>
                            </div>
                        </div>
                        {activeFile && member.id !== currentUser.id && (
                            <div className="ml-11 flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded w-fit">
                                <FileText size={10} />
                                <span className="truncate max-w-[120px]">{activeFile}</span>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {offlineMembers.length > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-800/50">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 px-1">Offline</p>
                    {offlineMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between px-1 py-1 group">
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs border border-gray-700">{member.initials}</div>
                                <span className="text-sm text-gray-400">{member.name}</span>
                            </div>
                            <button 
                                onClick={() => handleNudge(member.name)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-all"
                                title="Nudge to join"
                            >
                                <Bell size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationSidebarPane;
