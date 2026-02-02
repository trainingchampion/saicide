
import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types';
import { 
    X, Send, GripHorizontal, MessageSquare, Activity, Github,
    Lightbulb, HelpCircle, GitCommit, MessageCircle as MessageCircleIcon, Rocket, Pencil, Zap, Code2,
    Minimize2,
    Search
} from 'lucide-react';

interface LiveSessionChatProps {
    isOpen: boolean;
    isMinimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    currentUser: TeamMember;
    teamMembers: TeamMember[];
    messages: { user: string; text: string; time: string }[];
    onSendMessage: (text: string) => void;
    hasUnread: boolean;
    activity: { id: string, icon: React.ReactNode, text: string, time: string }[];
    discussions: any[];
}

const useDraggable = (initialPos: { x: number, y: number }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
      setIsDragging(true);
      const newX = Math.max(0, Math.min(pos.x, window.innerWidth - 50));
      const newY = Math.max(0, Math.min(pos.y, window.innerHeight - 50));
      setPos({ x: newX, y: newY });
      offset.current = { x: e.clientX - newX, y: e.clientY - newY };
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
    }, [isDragging, pos]);
  
    return { pos, handleMouseDown };
};


const LiveSessionChat: React.FC<LiveSessionChatProps> = ({ 
    isOpen, onClose, currentUser, teamMembers,
    isMinimized, onMinimize, onMaximize, hasUnread,
    messages, onSendMessage, activity, discussions
}) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'pulse' | 'hub'>('chat');
    const [chatInput, setChatInput] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Draggable & Resizable State
    const { pos, handleMouseDown } = useDraggable({ x: window.innerWidth - 420, y: 100 });
    const [size, setSize] = useState({ width: 400, height: 600 });
    const isResizing = useRef(false);

    useEffect(() => {
        setFilterTerm('');
    }, [activeTab]);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing.current) {
                setSize(prev => ({ width: Math.max(300, e.clientX - pos.x), height: Math.max(400, e.clientY - pos.y) }));
            }
        };
        const handleMouseUp = () => isResizing.current = false;
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [pos.x, pos.y]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        onSendMessage(chatInput);
        setChatInput('');
    };
    
    const filteredActivity = activity.filter(act =>
      act.text.toLowerCase().includes(filterTerm.toLowerCase())
    );

    const filteredDiscussions = discussions.filter(d =>
      d.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      d.user.toLowerCase().includes(filterTerm.toLowerCase())
    );


    if (!isOpen) return null;
    
    if (isMinimized) {
        return (
            <div 
                className="fixed z-[200] group right-0 bottom-24 flex items-end"
            >
                <button 
                    onClick={onMaximize} 
                    className="w-16 h-16 bg-[#131b2c]/90 backdrop-blur-md border border-gray-700/50 rounded-l-full flex items-center justify-center text-white shadow-2xl hover:border-cyan-500 transition-all"
                    title="Open Session Hub"
                >
                    <MessageSquare size={24} />
                    {hasUnread && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#131b2c]"></div>}
                </button>
                <button 
                    onClick={onClose} 
                    className="absolute -top-1 right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Close Chat"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }


    return (
        <div 
            className="fixed bg-[#131b2c] border border-gray-700 rounded-2xl shadow-2xl z-[200] flex flex-col overflow-hidden animate-fade-in"
            style={{ left: pos.x, top: pos.y, width: size.width, height: size.height }}
        >
            <div 
                className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#0b101b] cursor-move select-none"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal size={14} className="text-gray-500"/>
                    <h3 className="font-bold text-white text-sm">Session Hub</h3>
                </div>
                <div className="flex items-center">
                    <button onClick={onMinimize} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10" title="Minimize"><Minimize2 size={16} /></button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10" title="Close"><X size={16} /></button>
                </div>
            </div>
            
            <div className="flex border-b border-gray-700 bg-[#0f1522]">
                <button onClick={() => setActiveTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'chat' ? 'text-white bg-[#131b2c]' : 'text-gray-500 hover:text-white'}`}><MessageSquare size={12} /> Chat</button>
                <button onClick={() => setActiveTab('pulse')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'pulse' ? 'text-white bg-[#131b2c]' : 'text-gray-500 hover:text-white'}`}><Activity size={12} /> Pulse</button>
                <button onClick={() => setActiveTab('hub')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'hub' ? 'text-white bg-[#131b2c]' : 'text-gray-500 hover:text-white'}`}><Github size={12} /> Hub</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1522]">
                {activeTab === 'chat' && (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.user === currentUser.name ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2 mb-1"><span className="text-xs font-bold text-gray-300">{msg.user}</span><span className="text-[10px] text-gray-500">{msg.time}</span></div>
                            <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${msg.user === currentUser.name ? 'bg-[var(--color-accent)] text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {activeTab === 'pulse' && (
                    filteredActivity.map(act => (
                        <div key={act.id} className="flex items-center gap-3 p-2 text-xs text-gray-300">
                            {act.icon}
                            <span className="flex-1 text-gray-400">{act.text}</span>
                            <span className="text-gray-500">{act.time}</span>
                        </div>
                    ))
                )}
                {activeTab === 'hub' && (
                    <div className="space-y-4">
                        {filteredDiscussions.map((d, i) => (
                            <div key={`${d.title}-${i}`} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold`}>
                                    {d.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-xs text-gray-200 hover:text-[var(--color-accent)] cursor-pointer">{d.title}</p>
                                    <p className="text-[10px] text-gray-500">by @{d.user} • {d.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {activeTab === 'chat' && (
                <div className="p-3 bg-[#131b2c] border-t border-gray-700">
                    <div className="flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]" />
                        <button onClick={handleSendMessage} disabled={!chatInput.trim()} className="p-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg disabled:opacity-50 transition-colors"><Send size={18} /></button>
                    </div>
                </div>
            )}
            
            {(activeTab === 'pulse' || activeTab === 'hub') && (
                <div className="p-3 bg-[#131b2c] border-t border-gray-700">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            value={filterTerm} 
                            onChange={(e) => setFilterTerm(e.target.value)} 
                            placeholder={`Filter ${activeTab}...`}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>
                </div>
            )}
            
            <div onMouseDown={startResizing} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center opacity-50 hover:opacity-100">
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" strokeWidth="2" fill="none"><path d="M16 16l6 6" strokeLinecap="round" /><path d="M12 20l8-8" strokeLinecap="round" strokeOpacity="0.5"/></svg>
            </div>
        </div>
    );
};

export default LiveSessionChat;
