
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TeamMember, ChatSession } from '../types';
import { 
    Video, VideoOff, Mic, MicOff, ScreenShare, ScreenShareOff, PhoneOff, 
    Code, MessageSquare, Users, Eye, PanelRight, Terminal as TerminalIcon, 
    Bot, UserPlus, Hand, MoreVertical, Star, X, Send, ChevronLeft, Radio, Settings, Maximize2, Link as LinkIcon, Plus, Copy, Check, Activity, ChevronsLeft,
    Zap,
    GripHorizontal
} from 'lucide-react';
import InviteMemberModal from './modals/InviteMemberModal';
import { TeamChannel } from './collaboration/TeamChannel';

interface TeamCollaborationPaneProps {
  onClose: () => void;
  activeModelId: string;
  terminalHistory: string[];
  chatSession: ChatSession;
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  activeFileContent?: string;
  onPopOut: () => void;
  onInviteSent?: () => void;
}

const useDraggable = (initialPos: { x: number, y: number }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
      setIsDragging(true);
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const newX = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - 50));
            const newY = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - 50));
            setPos({ x: newX, y: newY });
        }
      };
      const handleMouseUp = () => setIsDragging(false);
  
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);
  
    return { pos, handleMouseDown };
};


export const TeamCollaborationPane: React.FC<TeamCollaborationPaneProps> = ({ onClose, terminalHistory, chatSession, currentUser, teamMembers, activeFileContent = '', onPopOut, onInviteSent }) => {
    const [isLiveSession, setIsLiveSession] = useState(true); // Always live when this pane is open
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const { pos, handleMouseDown } = useDraggable({ 
        x: window.innerWidth / 2 - 190, 
        y: 80 
    });

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://sai.sh/join/${Math.random().toString(36).substring(7)}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        if (onInviteSent) onInviteSent();
    };

    return (
        <section 
            className="fixed w-[380px] h-[calc(100vh-120px)] max-h-[750px] bg-[var(--color-background-secondary)]/95 backdrop-blur-xl text-[var(--color-text-primary)] flex flex-col font-sans rounded-2xl shadow-2xl border border-white/10 z-[200] animate-fade-in"
            style={{ left: pos.x, top: pos.y }}
        >
            <div 
                className="flex justify-between items-center p-2 pl-4 flex-shrink-0 cursor-move border-b border-white/5"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal size={16} className="text-gray-600" />
                    <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-widest">Live Session</h2>
                </div>
                <button onClick={onClose} title="Close Session" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    <X size={18} />
                </button>
            </div>
      
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4 flex flex-col">
                {isLiveSession ? (
                    <div
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-md"
                    >
                        <Radio size={16} className="animate-pulse" /> Live Session Active
                    </div>
                ) : null}
                
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-200 rounded-lg text-blue-700"><UserPlus size={18} /></div>
                        <span className="text-xs font-black uppercase text-blue-900 tracking-wider">Invite Hub</span>
                    </div>

                    <div className="space-y-2">
                        <button onClick={() => setIsInviteModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg">
                            <Plus size={16} /> Invite Teammates
                        </button>
                        <button onClick={handleCopyLink} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isCopied ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                            {isCopied ? <Check size={14} /> : <LinkIcon size={14} />}
                            {isCopied ? 'Link Copied!' : 'Copy Magic Link'}
                        </button>
                    </div>
                </div>

                {/* Team Channel */}
                <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-[400px] mt-4">
                   <TeamChannel 
                       currentUser={currentUser} 
                       teamMembers={teamMembers} 
                       isFloating={false}
                       onToggleFloat={onPopOut}
                   />
                </div>
            </div>
            
            <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onInviteSent={onInviteSent} />
        </section>
    );
};
