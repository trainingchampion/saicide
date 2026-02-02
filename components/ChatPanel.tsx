import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Send, Paperclip, RefreshCw, ArrowUp, MessageSquare, Image as ImageIcon, 
    Video, Mic, Code, Check, ChevronDown, Bot, X, Plus, History, Trash2,
    Layers, Globe, User, Wand2, Clock, Search, Cpu, Sparkles, Brain, Code2,
    Music, Play, Monitor, ChevronLeft, MessageSquarePlus, Maximize2
} from 'lucide-react';
import { ChatSession, ChatMessage, AIModel, TeamMember, AIPersona, MCPServer, AppPlan, ChatAttachment } from '../types';
import { AI_MODELS_DATA, IMAGE_MODELS_DATA, VIDEO_MODELS_DATA, AUDIO_MODELS_DATA } from '../constants';
import aiService from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

// Polyfill for window.aistudio if not present in the environment
const aistudio = (window as any).aistudio || {
  hasSelectedApiKey: async () => true,
  openSelectKey: async () => {}
};

interface ChatPanelProps {
    activeModelId: string;
    activePersona: AIPersona | null;
    session: ChatSession;
    allSessions: ChatSession[];
    onUpdateSession: (messages: ChatMessage[]) => void;
    onNewChat: () => void;
    onSwitchChat: (sessionId: string) => void;
    onDeployRequest: () => void;
    onAppGeneration: (plan: AppPlan, prompt: string) => void;
    apiKeys: { [key: string]: string };
    onCollapse: () => void;
    currentUser: TeamMember | null;
    onModelChange: (modelId: string) => void;
    initialPrompt?: string;
    onClearInitialPrompt?: () => void;
    initialMode?: ChatMode;
    onClearInitialMode?: () => void;
    mcpServers?: MCPServer[];
    onDeleteSession?: (sessionId: string) => void;
    onInsertCodeIntoEditor: (code: string) => void;
    onOpenPreview?: () => void;
}

type ChatMode = 'chat' | 'image' | 'video' | 'audio' | 'app';

const EMPTY_STATES: Record<ChatMode, { title: string, description: string, icon: React.ReactNode, color: string, btnColor: string }> = {
    chat: {
        title: "Awaiting Draft",
        description: "Describe what you want to build. I'll sketch the logic and synthesize the implementation.",
        icon: <Brain size={48} />,
        color: "text-blue-600",
        btnColor: "bg-blue-600"
    },
    image: {
        title: "Visual Canvas",
        description: "Prompt a description, and I'll generate a high-fidelity visual sketch for your project using Imagen.",
        icon: <ImageIcon size={48} />,
        color: "text-emerald-600",
        btnColor: "bg-emerald-600"
    },
    video: {
        title: "Motion Engine",
        description: "Describe a scene. I'll synthesize a cinematic video preview using Veo 3.1 technology.",
        icon: <Play size={48} fill="currentColor" />,
        color: "text-rose-600",
        btnColor: "bg-rose-600"
    },
    audio: {
        title: "Neural Voice",
        description: "Provide a script or text. I'll generate natural-sounding speech or ambient audio textures.",
        icon: <Mic size={48} />,
        color: "text-amber-600",
        btnColor: "bg-amber-600"
    },
    app: {
        title: "App Engine",
        description: "Powered by SAI. Describe an entire application or game, and I'll architect the full stack in one run.",
        icon: <Code2 size={48} />,
        color: "text-indigo-600",
        btnColor: "bg-indigo-600"
    }
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
    activeModelId,
    activePersona,
    session,
    allSessions = [],
    onUpdateSession,
    onCollapse,
    onModelChange,
    onNewChat,
    onSwitchChat,
    onDeleteSession,
    initialPrompt,
    onClearInitialPrompt,
    initialMode,
    onClearInitialMode,
    onAppGeneration,
    onInsertCodeIntoEditor,
    onOpenPreview
}) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('chat');
    const [attachedFiles, setAttachedFiles] = useState<ChatAttachment[]>([]);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableModels = useMemo(() => {
        switch (mode) {
            case 'image': return IMAGE_MODELS_DATA;
            case 'video': return VIDEO_MODELS_DATA;
            case 'audio': return AUDIO_MODELS_DATA;
            case 'app': return [{ id: 'google-opal', name: 'Opal (App Engine)', provider: 'Google', description: 'Advanced app synthesis engine.' }];
            case 'chat':
            default: return AI_MODELS_DATA;
        }
    }, [mode]);

    useEffect(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [session?.messages, mode]);

    useEffect(() => {
        if (initialPrompt) { setInput(initialPrompt); onClearInitialPrompt?.(); }
    }, [initialPrompt, onClearInitialPrompt]);

    useEffect(() => {
        if (initialMode) { 
            setMode(initialMode); 
            onClearInitialMode?.(); 
            if (initialMode === 'app') onModelChange('google-opal');
        }
    }, [initialMode, onClearInitialMode, onModelChange]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
                setIsModelDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modelDropdownRef]);

    useEffect(() => {
        const currentModelList = availableModels;
        const isModelInList = currentModelList.some(m => m.id === activeModelId);
        
        if (!isModelInList && currentModelList.length > 0) {
            onModelChange(currentModelList[0].id);
        }
    }, [mode, availableModels, activeModelId, onModelChange]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        (Array.from(files) as File[]).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                const data = base64.split(',')[1];
                setAttachedFiles(prev => [...prev, {
                    data,
                    mimeType: file.type,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const performSend = async () => {
        if (!input.trim() && attachedFiles.length === 0) return;
        
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
            mode: mode,
            attachments: attachedFiles.length > 0 ? attachedFiles : undefined
        };
        
        const updatedMessages = [...(session?.messages || []), userMessage];
        onUpdateSession(updatedMessages);
        setInput('');
        setAttachedFiles([]);
        setIsLoading(true);
        
        try {
            // Build system instruction from active persona
            const systemInstruction = activePersona?.systemInstruction || 
                "You are Sai, a helpful AI assistant specialized in software development, cloud infrastructure, and security. Be concise and helpful.";
            
            const response = await aiService.getChatResponse({
                prompt: input,
                modelId: activeModelId,
                systemInstruction,
                attachments: userMessage.attachments
            });
            
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text || 'I apologize, but I was unable to generate a response.',
                timestamp: new Date().toISOString(),
                mode: mode
            };
            
            // Handle app generation mode
            if (mode === 'app' && response.appPlan) {
                onAppGeneration(response.appPlan, input);
            }
            
            onUpdateSession([...updatedMessages, assistantMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'An error occurred while processing your request. Please try again.',
                timestamp: new Date().toISOString(),
                mode: mode
            };
            onUpdateSession([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const emptyState = EMPTY_STATES[mode];

    const filteredMessages = useMemo(() => {
        return (session?.messages || []).filter(msg => {
            if (!msg.mode) return mode === 'chat';
            return msg.mode === mode;
        });
    }, [session?.messages, mode]);

    const handleLaunchFullScreenPreview = () => {
        window.open(`${window.location.origin}${window.location.pathname}#preview=true`, '_blank');
        if (onOpenPreview) onOpenPreview();
    };

    return (
        <div className="flex h-full bg-[var(--color-background)] text-[var(--color-text-primary)] border-l-2 border-[var(--color-border)] relative overflow-hidden">
            
            {/* History Sidebar */}
            <div className={`absolute inset-y-0 left-0 z-30 w-72 bg-[var(--color-background-secondary)] border-r border-[var(--color-border)] transition-transform duration-300 ease-in-out shadow-2xl ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Archives</h3>
                            <button 
                                onClick={() => { onNewChat(); setIsHistoryOpen(false); }}
                                className="p-1 hover:bg-blue-500/10 rounded-md text-blue-500 transition-all active:scale-90"
                                title="New Session"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>
                        </div>
                        <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-white/5 rounded-md text-gray-500 hover:text-white">
                            <ChevronLeft size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                        {(allSessions || []).map(s => (
                            <div key={s.id} className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${session?.id === s.id ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-white' : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                                <div className="flex-1 min-w-0" onClick={() => { onSwitchChat(s.id); setIsHistoryOpen(false); }}>
                                    <p className="text-xs font-bold truncate leading-tight">{s.title}</p>
                                    <p className="text-[9px] font-black uppercase text-gray-600 mt-1">{s.messages?.length || 0} messages</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession?.(s.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b-2 border-[var(--color-border)] bg-[var(--color-background-secondary)]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-cyan-400 transition-all relative">
                            <History size={20} />
                            {(allSessions?.length || 0) > 1 && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[var(--color-background-secondary)]" />}
                        </button>
                        <div>
                            <h2 className="text-[9px] md:text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-[0.2em] mb-1">Neural Co-Pilot</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-[var(--color-text-accent)]" />
                                    <span className="text-xs font-bold doodle-text text-base md:text-lg truncate max-w-[150px] md:max-w-none">{activePersona?.name || 'General Draftsman'}</span>
                                </div>
                                
                                <div className="relative" ref={modelDropdownRef}>
                                    <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-background-tertiary)] sketch-border border-[var(--color-border)]/20 hover:border-[var(--color-border)]/50 transition-all">
                                        <Cpu size={14} className="text-[var(--color-text-accent)]" />
                                        <span className="text-xs font-bold doodle-text text-[var(--color-text-secondary)]">{availableModels.find(m => m.id === activeModelId)?.name || 'Select Model'}</span>
                                        <ChevronDown size={14} className={`text-[var(--color-text-secondary)] transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isModelDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--color-background-secondary)] sketch-border border-[var(--color-border)] shadow-xl z-10 p-2 rounded-lg animate-fade-in">
                                            {availableModels.map(model => (
                                                <button 
                                                    key={model.id} 
                                                    onClick={() => { onModelChange(model.id); setIsModelDropdownOpen(false); }}
                                                    className={`w-full text-left p-2 rounded-md text-sm doodle-text font-bold flex items-center justify-between ${activeModelId === model.id ? 'bg-[var(--color-selection)] text-[var(--color-text-accent)]' : 'hover:bg-[var(--color-background-hover)]'}`}
                                                >
                                                    {model.name}
                                                    {activeModelId === model.id && <Check size={16} className="text-[var(--color-text-accent)]" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onCollapse} className="p-2 hover:bg-[var(--color-background-hover)] rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>


                {/* Workflow Mode Selector */}
                <div className="px-4 py-3 bg-[var(--color-background)] border-b border-dashed border-[var(--color-border)]/20 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-2 min-w-max">
                        {[
                            { id: 'chat', icon: <MessageSquare size={14} />, label: 'Chat', color: 'bg-blue-600' },
                            { id: 'image', icon: <ImageIcon size={14} />, label: 'Image', color: 'bg-emerald-600' },
                            { id: 'video', icon: <Video size={14} />, label: 'Video', color: 'bg-rose-600' },
                            { id: 'audio', icon: <Mic size={14} />, label: 'Voice', color: 'bg-amber-600' },
                            { id: 'app', icon: <Code2 size={14} />, label: 'Build App', color: 'bg-indigo-600' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => {
                                    setMode(btn.id as ChatMode);
                                    if (btn.id === 'app') onModelChange('google-opal');
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all sketch-border ${
                                    mode === btn.id 
                                    ? `${btn.color} text-white sketch-shadow` 
                                    : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                            >
                                {btn.icon} <span className="doodle-text">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8 custom-scrollbar">
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6 md:px-10 animate-fade-in" key={mode}>
                            <div className={`p-4 md:p-5 bg-[var(--color-background-tertiary)] sketch-border sketch-shadow mb-6 ${emptyState.color}`}>
                                {emptyState.icon}
                            </div>
                            <h3 className="text-xl md:text-2xl font-black doodle-text text-[var(--color-text-primary)] mb-2">{emptyState.title}</h3>
                            <p className="text-xs md:text-sm font-medium text-[var(--color-text-secondary)]">{emptyState.description}</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, i) => {
                            if (msg.sender === 'ai') {
                                return (
                                    <div key={i} className="flex justify-start animate-fade-in">
                                        <div className="max-w-[95%] md:max-w-[90%] text-left">
                                            <div className={`inline-block p-4 ${msg.appPlan ? 'bg-indigo-600 text-white' : 'bg-[var(--color-background-tertiary)]'} rounded-2xl shadow-md`}>
                                                {msg.videoUrl && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--color-border)]/20 bg-black">
                                                        <video src={msg.videoUrl} controls className="w-full h-auto max-h-60 object-contain" />
                                                    </div>
                                                )}
                                                {msg.imageUrl && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--color-border)]/20">
                                                        <img src={msg.imageUrl} alt="Sketch" className="w-full h-auto max-h-60 object-cover" />
                                                    </div>
                                                )}
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                    <MarkdownRenderer content={msg.text} isAppPlan={!!msg.appPlan} onInsertCode={onInsertCodeIntoEditor} />
                                                </div>
                                                
                                                {/* Post-Synthesis Actions */}
                                                {msg.appPlan && !msg.isGenerating && (
                                                    <div className="mt-6 pt-4 border-t border-indigo-400/30 flex gap-3">
                                                        <button 
                                                            onClick={handleLaunchFullScreenPreview}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
                                                        >
                                                            <Monitor size={14} /> Full Page Preview
                                                        </button>
                                                    </div>
                                                )}

                                                {msg.isGenerating && (
                                                    <div className={`mt-4 flex items-center gap-3 ${msg.appPlan ? 'text-indigo-200' : 'text-[var(--color-text-accent)]'} font-black text-[9px] uppercase tracking-widest doodle-text`}>
                                                        <RefreshCw size={12} className="animate-spin" /> Wet ink drying...
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-2 font-mono">
                                                SAI SKETCHER • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            
                            const theme = EMPTY_STATES[msg.mode as ChatMode || 'chat'];
                            return (
                                <div key={i} className="flex justify-end animate-fade-in">
                                    <div className="max-w-[95%] md:max-w-[90%] text-right">
                                        <div className={`inline-block p-4 text-left rounded-2xl ${theme.btnColor} text-white shadow-lg`}>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mb-3 flex flex-wrap gap-2">
                                                    {msg.attachments.map((file, idx) => (
                                                        file.mimeType.startsWith('image/') && (
                                                            <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden border border-white/20">
                                                                <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                <MarkdownRenderer content={msg.text} onInsertCode={onInsertCodeIntoEditor} />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-2 font-mono">
                                            You • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t-2 border-dashed border-[var(--color-border)]/20">
                    
                    {/* Attachment Previews */}
                    {attachedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
                            {attachedFiles.map((file, i) => (
                                <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-white/10 sketch-shadow">
                                    {file.mimeType.startsWith('image/') ? (
                                        <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Code size={20} className="text-gray-500"/></div>
                                    )}
                                    <button 
                                        onClick={() => removeAttachment(i)}
                                        className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-[var(--color-border)]/5 rounded-[1.5rem] blur-sm"></div>
                        <div className="relative bg-[var(--color-background-tertiary)] sketch-border p-1 md:p-2 flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                multiple 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="hidden sm:block p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)] transition-colors" 
                                title="Attach context (Images)"
                            >
                                <Paperclip size={20}/>
                            </button>
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && performSend()}
                                placeholder={mode === 'app' ? "Synthesize an app with SAI..." : mode === 'image' ? "Imagine..." : "Sketch..."}
                                className="flex-1 bg-transparent border-none outline-none py-2 md:py-3 text-sm font-bold doodle-text text-base md:text-lg"
                            />
                            <button 
                                onClick={performSend}
                                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                                className={`p-2.5 md:p-3 rounded-xl transition-all ${ (input.trim() || attachedFiles.length > 0) ? `${EMPTY_STATES[mode].btnColor} text-white shadow-lg` : 'bg-[var(--color-background-hover)] text-[var(--color-text-secondary)]/30 cursor-not-allowed'}`}
                            >
                                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={3} />}
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[8px] md:text-[9px] font-black text-[var(--color-text-secondary)]/40 uppercase tracking-[0.2em]">
                        <Globe size={10} /> AI Assistant Ready
                    </div>
                </div>
            </div>
        </div>
    );
};