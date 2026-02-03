import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Send, Paperclip, RefreshCw, ArrowUp, MessageSquare, Image as ImageIcon, 
    Video, Mic, Code, Check, ChevronDown, Bot, X, Plus, History, Trash2,
    Layers, Globe, User, Wand2, Clock, Search, Cpu, Sparkles, Brain, Code2,
    Music, Play, Monitor, ChevronLeft, MessageSquarePlus, Maximize2,
    Share2, Download, ExternalLink, Copy, CheckCircle, Loader2, Upload, Rocket,
    Terminal, Package, ArrowRight, Zap, Key, Settings
} from 'lucide-react';
import socialMediaService from '../services/socialMediaService';
import deploymentService, { getNetlifyToken, getVercelToken, setNetlifyToken, setVercelToken } from '../services/deploymentService';
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
    
    // Social Media Export State
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportingMedia, setExportingMedia] = useState<{ url: string; type: 'video' | 'audio' | 'image'; prompt: string } | null>(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStatus, setExportStatus] = useState('');
    const [exportPlatform, setExportPlatform] = useState<'youtube' | 'tiktok' | 'facebook' | 'instagram' | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    
    // Deployment State
    const [deployModalOpen, setDeployModalOpen] = useState(false);
    const [deployingApp, setDeployingApp] = useState<AppPlan | null>(null);
    const [deployPlatform, setDeployPlatform] = useState<'netlify' | 'vercel' | null>(null);
    const [deployProgress, setDeployProgress] = useState(0);
    const [deployStatus, setDeployStatus] = useState('');
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
    const [projectName, setProjectName] = useState('my-sai-app');
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [netlifyToken, setNetlifyTokenState] = useState(getNetlifyToken() || '');
    const [vercelToken, setVercelTokenState] = useState(getVercelToken() || '');
    
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

    // Social Media Export Handlers
    const openExportModal = (url: string, type: 'video' | 'audio' | 'image', prompt: string) => {
        setExportingMedia({ url, type, prompt });
        setExportModalOpen(true);
        setExportProgress(0);
        setExportStatus('');
        setExportPlatform(null);
        setExportSuccess(null);
    };

    const handleExportToPlatform = async (platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram') => {
        if (!exportingMedia) return;
        
        setExportPlatform(platform);
        setExportProgress(0);
        setExportStatus('Preparing export...');
        setExportSuccess(null);

        try {
            const resultUrl = await socialMediaService.uploadMedia(
                exportingMedia.url,
                exportingMedia.type,
                platform,
                {
                    title: `SAI Generated ${exportingMedia.type.charAt(0).toUpperCase() + exportingMedia.type.slice(1)}`,
                    caption: exportingMedia.prompt.slice(0, 200),
                    tags: ['ai', 'generated', 'sai', exportingMedia.type],
                    destination: '@sai_creator',
                    privacy: 'public'
                },
                (progress, status) => {
                    setExportProgress(progress);
                    setExportStatus(status);
                }
            );
            
            setExportSuccess(resultUrl);
        } catch (error: any) {
            setExportStatus(`Error: ${error.message}`);
            setExportProgress(0);
            setExportPlatform(null);
        }
    };

    const handleDownloadMedia = () => {
        if (!exportingMedia) return;
        
        const link = document.createElement('a');
        link.href = exportingMedia.url;
        link.download = `sai-${exportingMedia.type}-${Date.now()}.${exportingMedia.type === 'video' ? 'mp4' : exportingMedia.type === 'audio' ? 'mp3' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyMediaUrl = () => {
        if (!exportingMedia) return;
        navigator.clipboard.writeText(exportingMedia.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const socialPlatforms = [
        { id: 'youtube' as const, name: 'YouTube', icon: '▶️', color: 'bg-red-600 hover:bg-red-700', supports: ['video', 'audio'] },
        { id: 'tiktok' as const, name: 'TikTok', icon: '🎵', color: 'bg-black hover:bg-zinc-800 ring-1 ring-white/20', supports: ['video'] },
        { id: 'instagram' as const, name: 'Instagram', icon: '📷', color: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90', supports: ['video', 'image'] },
        { id: 'facebook' as const, name: 'Facebook', icon: '👤', color: 'bg-blue-600 hover:bg-blue-700', supports: ['video', 'image', 'audio'] },
    ];

    // Deployment Handlers
    const openDeployModal = (appPlan: AppPlan) => {
        setDeployingApp(appPlan);
        setDeployModalOpen(true);
        setDeployPlatform(null);
        setDeployProgress(0);
        setDeployStatus('');
        setDeployLogs([]);
        setDeployedUrl(null);
        // Generate a project name from the app title
        const name = (appPlan.name || 'my-sai-app').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32);
        setProjectName(name);
    };

    const addDeployLog = (message: string) => {
        setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const handleSaveTokens = () => {
        if (netlifyToken) setNetlifyToken(netlifyToken);
        if (vercelToken) setVercelToken(vercelToken);
        setShowTokenInput(false);
    };

    const handleDeployToNetlify = async () => {
        if (!deployingApp) return;
        setDeployPlatform('netlify');
        setDeployProgress(0);
        setDeployedUrl(null);
        setDeployLogs([]);

        try {
            const token = getNetlifyToken();
            
            const result = await deploymentService.deployToNetlify(
                {
                    projectName,
                    files: [], // Will auto-generate from appPlan
                    framework: 'vite'
                },
                (progress) => {
                    setDeployProgress(progress.progress);
                    setDeployStatus(progress.status);
                    if (progress.log) addDeployLog(progress.log);
                },
                token || undefined
            );

            if (result.success && result.url) {
                setDeployedUrl(result.url);
                setDeployProgress(100);
                setDeployStatus('Deployment complete!');
            } else {
                throw new Error(result.error || 'Deployment failed');
            }
        } catch (error: any) {
            addDeployLog(`❌ Error: ${error.message}`);
            setDeployStatus('Deployment failed');
            setDeployPlatform(null);
        }
    };

    const handleDeployToVercel = async () => {
        if (!deployingApp) return;
        setDeployPlatform('vercel');
        setDeployProgress(0);
        setDeployedUrl(null);
        setDeployLogs([]);

        try {
            const token = getVercelToken();
            
            const result = await deploymentService.deployToVercel(
                {
                    projectName,
                    files: [], // Will auto-generate from appPlan
                    framework: 'vite'
                },
                (progress) => {
                    setDeployProgress(progress.progress);
                    setDeployStatus(progress.status);
                    if (progress.log) addDeployLog(progress.log);
                },
                token || undefined
            );

            if (result.success && result.url) {
                setDeployedUrl(result.url);
                setDeployProgress(100);
                setDeployStatus('Live on Vercel!');
            } else {
                throw new Error(result.error || 'Deployment failed');
            }
        } catch (error: any) {
            addDeployLog(`❌ Error: ${error.message}`);
            setDeployStatus('Deployment failed');
            setDeployPlatform(null);
        }
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
                                                {/* Video with Export Button */}
                                                {msg.videoUrl && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--color-border)]/20 bg-black relative group">
                                                        <video src={msg.videoUrl} controls className="w-full h-auto max-h-60 object-contain" />
                                                        {/* Export Overlay */}
                                                        {!msg.isGenerating && (
                                                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openExportModal(msg.videoUrl!, 'video', msg.text)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all active:scale-95"
                                                                    title="Export to Social Media"
                                                                >
                                                                    <Share2 size={11} /> Share
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Audio with Export Button */}
                                                {msg.audioUrl && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--color-border)]/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3 relative group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                                <Music size={20} className="text-white" />
                                                            </div>
                                                            <audio src={msg.audioUrl} controls className="flex-1 h-10" />
                                                        </div>
                                                        {/* Export Button for Audio */}
                                                        {!msg.isGenerating && (
                                                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openExportModal(msg.audioUrl!, 'audio', msg.text)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all active:scale-95"
                                                                    title="Export Audio"
                                                                >
                                                                    <Share2 size={11} /> Share
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Image with Export Button */}
                                                {msg.imageUrl && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--color-border)]/20 relative group">
                                                        <img src={msg.imageUrl} alt="Sketch" className="w-full h-auto max-h-60 object-cover" />
                                                        {/* Export Overlay for Images */}
                                                        {!msg.isGenerating && (
                                                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openExportModal(msg.imageUrl!, 'image', msg.text)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all active:scale-95"
                                                                    title="Export to Social Media"
                                                                >
                                                                    <Share2 size={11} /> Share
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                    <MarkdownRenderer content={msg.text} isAppPlan={!!msg.appPlan} onInsertCode={onInsertCodeIntoEditor} />
                                                </div>
                                                
                                                {/* Post-Synthesis Actions */}
                                                {msg.appPlan && !msg.isGenerating && (
                                                    <div className="mt-6 pt-4 border-t border-indigo-400/30 space-y-3">
                                                        {/* Preview Button */}
                                                        <button 
                                                            onClick={handleLaunchFullScreenPreview}
                                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
                                                        >
                                                            <Monitor size={14} /> Full Page Preview
                                                        </button>
                                                        
                                                        {/* Deploy Buttons */}
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => openDeployModal(msg.appPlan!)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
                                                            >
                                                                <span className="text-sm">◆</span> Netlify
                                                            </button>
                                                            <button 
                                                                onClick={() => openDeployModal(msg.appPlan!)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ring-1 ring-white/20 transition-all active:scale-95"
                                                            >
                                                                <span className="text-sm">▲</span> Vercel
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Deploy hint */}
                                                        <p className="text-[8px] text-indigo-300/70 text-center">
                                                            Deploy your app to the cloud with one click
                                                        </p>
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

            {/* Social Media Export Modal */}
            {exportModalOpen && exportingMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--color-background-secondary)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Share2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)]">Export {exportingMedia.type}</h3>
                                    <p className="text-[10px] text-[var(--color-text-secondary)]">Share to social media or download</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setExportModalOpen(false)}
                                className="p-2 hover:bg-[var(--color-background-hover)] rounded-lg transition-colors"
                            >
                                <X size={18} className="text-[var(--color-text-secondary)]" />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="p-4 border-b border-[var(--color-border)]">
                            <div className="rounded-xl overflow-hidden bg-black/50 max-h-40">
                                {exportingMedia.type === 'video' && (
                                    <video src={exportingMedia.url} className="w-full h-full max-h-40 object-contain" />
                                )}
                                {exportingMedia.type === 'audio' && (
                                    <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                            <Music size={24} className="text-white" />
                                        </div>
                                        <audio src={exportingMedia.url} controls className="flex-1" />
                                    </div>
                                )}
                                {exportingMedia.type === 'image' && (
                                    <img src={exportingMedia.url} alt="Export preview" className="w-full h-full max-h-40 object-contain" />
                                )}
                            </div>
                            <p className="mt-2 text-[10px] text-[var(--color-text-secondary)] line-clamp-2">{exportingMedia.prompt}</p>
                        </div>

                        {/* Export Options */}
                        {!exportSuccess ? (
                            <div className="p-4 space-y-4">
                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDownloadMedia}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] text-[var(--color-text-primary)] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border border-[var(--color-border)]"
                                    >
                                        <Download size={14} /> Download
                                    </button>
                                    <button
                                        onClick={handleCopyMediaUrl}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] text-[var(--color-text-primary)] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border border-[var(--color-border)]"
                                    >
                                        {copiedUrl ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                        {copiedUrl ? 'Copied!' : 'Copy URL'}
                                    </button>
                                </div>

                                {/* Platform Selection */}
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Share to Platform</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {socialPlatforms
                                            .filter(p => p.supports.includes(exportingMedia.type))
                                            .map(platform => (
                                                <button
                                                    key={platform.id}
                                                    onClick={() => handleExportToPlatform(platform.id)}
                                                    disabled={exportPlatform !== null}
                                                    className={`flex items-center justify-center gap-2 py-3 px-4 ${platform.color} text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                                                >
                                                    <span className="text-base">{platform.icon}</span>
                                                    {exportPlatform === platform.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        platform.name
                                                    )}
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {exportPlatform && (
                                    <div className="space-y-2">
                                        <div className="h-2 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                                                style={{ width: `${exportProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] text-center font-medium">{exportStatus}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Success State */
                            <div className="p-6 text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <CheckCircle size={32} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)]">Published Successfully!</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Your content is now live</p>
                                </div>
                                <a
                                    href={exportSuccess}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                                >
                                    <ExternalLink size={14} /> View on Platform
                                </a>
                                <button
                                    onClick={() => {
                                        setExportModalOpen(false);
                                        setExportSuccess(null);
                                        setExportPlatform(null);
                                    }}
                                    className="block w-full mt-2 text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Deployment Modal */}
            {deployModalOpen && deployingApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--color-background-secondary)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-lg mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Rocket size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)]">Deploy Application</h3>
                                    <p className="text-[10px] text-[var(--color-text-secondary)]">{deployingApp.name || 'SAI Generated App'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDeployModalOpen(false)}
                                className="p-2 hover:bg-[var(--color-background-hover)] rounded-lg transition-colors"
                            >
                                <X size={18} className="text-[var(--color-text-secondary)]" />
                            </button>
                        </div>

                        {!deployedUrl ? (
                            <>
                                {/* Project Name Input */}
                                <div className="p-4 border-b border-[var(--color-border)]">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-2 block">Project Name</label>
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-[var(--color-text-secondary)]" />
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                            className="flex-1 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="my-sai-app"
                                        />
                                        <button
                                            onClick={() => setShowTokenInput(!showTokenInput)}
                                            className={`p-2 rounded-lg transition-colors ${showTokenInput ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[var(--color-background-hover)] text-[var(--color-text-secondary)]'}`}
                                            title="Configure API tokens for direct deployment"
                                        >
                                            <Key size={16} />
                                        </button>
                                    </div>
                                    
                                    {/* Token Configuration */}
                                    {showTokenInput && (
                                        <div className="mt-3 p-3 bg-[var(--color-background-tertiary)] rounded-lg border border-[var(--color-border)] space-y-3 animate-fade-in">
                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                                <Key size={10} />
                                                API Tokens (Optional - enables direct deployment)
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-teal-400 text-sm font-bold w-6">◆</span>
                                                    <input
                                                        type="password"
                                                        value={netlifyToken}
                                                        onChange={(e) => setNetlifyTokenState(e.target.value)}
                                                        placeholder="Netlify Personal Access Token"
                                                        className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-1.5 text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm font-bold w-6">▲</span>
                                                    <input
                                                        type="password"
                                                        value={vercelToken}
                                                        onChange={(e) => setVercelTokenState(e.target.value)}
                                                        placeholder="Vercel Access Token"
                                                        className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-1.5 text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-white/20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[8px] text-[var(--color-text-secondary)]">
                                                    Get tokens from{' '}
                                                    <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Netlify</a>
                                                    {' / '}
                                                    <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Vercel</a>
                                                </p>
                                                <button
                                                    onClick={handleSaveTokens}
                                                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-[9px] font-bold uppercase hover:bg-cyan-500/30 transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                            <p className="text-[8px] text-amber-400/70">
                                                Without tokens: Downloads bundle + opens platform for manual deploy
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Platform Selection */}
                                <div className="p-4 space-y-3">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Select Platform</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Netlify */}
                                        <button
                                            onClick={handleDeployToNetlify}
                                            disabled={deployPlatform !== null}
                                            className="group relative p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border border-teal-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <span className="text-white text-2xl font-bold">◆</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--color-text-primary)]">Netlify</span>
                                                <span className="text-[9px] text-[var(--color-text-secondary)]">Free • CDN • Auto HTTPS</span>
                                            </div>
                                            {deployPlatform === 'netlify' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                                    <Loader2 size={24} className="text-teal-400 animate-spin" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Vercel */}
                                        <button
                                            onClick={handleDeployToVercel}
                                            disabled={deployPlatform !== null}
                                            className="group relative p-4 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:from-zinc-700/50 hover:to-zinc-800/50 border border-white/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20 group-hover:scale-110 transition-transform">
                                                    <span className="text-white text-2xl font-bold">▲</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--color-text-primary)]">Vercel</span>
                                                <span className="text-[9px] text-[var(--color-text-secondary)]">Hobby • Edge • Fast</span>
                                            </div>
                                            {deployPlatform === 'vercel' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                                    <Loader2 size={24} className="text-white animate-spin" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Deployment Logs */}
                                {deployLogs.length > 0 && (
                                    <div className="p-4 border-t border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Terminal size={12} className="text-[var(--color-text-secondary)]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Build Output</span>
                                        </div>
                                        <div className="bg-[#0a0a0f] rounded-lg p-3 max-h-32 overflow-y-auto font-mono text-[10px] space-y-1">
                                            {deployLogs.map((log, i) => (
                                                <div key={i} className="text-emerald-400">{log}</div>
                                            ))}
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-3 space-y-1">
                                            <div className="h-2 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${
                                                        deployPlatform === 'netlify' 
                                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                                                            : 'bg-gradient-to-r from-zinc-600 to-white'
                                                    }`}
                                                    style={{ width: `${deployProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-[var(--color-text-secondary)] text-center">{deployStatus}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Success State */
                            <div className="p-6 text-center space-y-4">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                    <Rocket size={40} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-[var(--color-text-primary)]">🎉 Deployed!</h4>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Your app is now live on {deployPlatform === 'netlify' ? 'Netlify' : 'Vercel'}</p>
                                </div>
                                
                                {/* URL Display */}
                                <div className="bg-[var(--color-background-tertiary)] rounded-xl p-3 flex items-center gap-2">
                                    <Globe size={16} className="text-emerald-400 flex-shrink-0" />
                                    <span className="flex-1 text-sm font-mono text-cyan-400 truncate">{deployedUrl}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(deployedUrl!);
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Copy URL"
                                    >
                                        <Copy size={14} className="text-[var(--color-text-secondary)]" />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <a
                                        href={deployedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                                    >
                                        <ExternalLink size={14} /> Open Live Site
                                    </a>
                                </div>

                                <button
                                    onClick={() => {
                                        setDeployModalOpen(false);
                                        setDeployedUrl(null);
                                        setDeployPlatform(null);
                                        setDeployLogs([]);
                                    }}
                                    className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};