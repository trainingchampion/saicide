
import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types';
import { MessageSquare, Activity, Send, Code, Zap, ChevronsLeftRight, ArrowUpRightSquare } from 'lucide-react';
import { MOCK_ACTIVITY } from '../../constants';

interface TeamChannelProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  isFloating: boolean;
  onToggleFloat: () => void;
}

interface TeamChatMessage {
    id: string;
    author: string;
    initials: string;
    message: string;
    timestamp: string;
}

export const TeamChannel: React.FC<TeamChannelProps> = ({ currentUser, teamMembers, isFloating, onToggleFloat }) => {
    const [view, setView] = useState<'chat' | 'activity'>('chat');
    const [messages, setMessages] = useState<TeamChatMessage[]>([
        { id: 'msg1', author: 'Alex Chen', initials: 'AC', message: 'Hey team, I just pushed the initial auth logic. Can someone take a look?', timestamp: '10:32 AM' },
        { id: 'msg2', author: 'Sarah Jones', initials: 'SJ', message: 'On it! Pulling now.', timestamp: '10:33 AM' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].author === currentUser.name) {
            const timer = setTimeout(() => {
                const otherMembers = teamMembers.filter(m => m.id !== currentUser.id);
                const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
                const reply: TeamChatMessage = {
                    id: `msg-${Date.now()}`,
                    author: randomMember.name,
                    initials: randomMember.initials,
                    message: "Got it, thanks for the update!",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, reply]);
            }, 1500 + Math.random() * 1000);
            return () => clearTimeout(timer);
        }
    }, [messages, currentUser, teamMembers]);

    const handleSendMessage = () => {
        if (!input.trim()) return;
        const newMessage: TeamChatMessage = {
            id: `msg-${Date.now()}`,
            author: currentUser.name,
            initials: currentUser.initials,
            message: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-100 border-t border-slate-200 min-h-0">
            <div className="p-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex bg-slate-200 p-1 rounded-lg">
                    <button onClick={() => setView('chat')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 text-[10px] font-black uppercase rounded ${view === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                        <MessageSquare size={12} /> Chat
                    </button>
                    <button onClick={() => setView('activity')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 text-[10px] font-black uppercase rounded ${view === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                        <Activity size={12} /> Pulse
                    </button>
                </div>
                <button onClick={onToggleFloat} title={isFloating ? "Dock Channel" : "Pop Out Channel"} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg">
                    {isFloating ? <ChevronsLeftRight size={16} /> : <ArrowUpRightSquare size={16} />}
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {view === 'chat' ? (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-2 ${msg.author === currentUser.name ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0 text-slate-600 ${msg.author === currentUser.name ? 'bg-blue-600 text-white' : ''}`}>{msg.initials}</div>
                            <div className={`p-2 rounded-lg max-w-[80%] ${msg.author === currentUser.name ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                <p className="text-xs leading-relaxed">{msg.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    MOCK_ACTIVITY.map(act => (
                        <div key={act.id} className="flex items-center gap-3 p-2 text-xs text-gray-500">
                            {act.icon}
                            <span className="flex-1">{act.text}</span>
                            <span className="text-gray-400">{act.time}</span>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {view === 'chat' && (
                <div className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                            placeholder="Type your message..." 
                            className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs resize-none outline-none focus:border-[var(--color-accent)]"
                            rows={1}
                        />
                        <button onClick={handleSendMessage} className="p-2 bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors text-white"><Send size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};
