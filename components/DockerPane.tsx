
import React, { useState, useEffect } from 'react';
import { SecurityPolicy, FileNode } from '../types';
import { ICONS } from '../constants';
import DockerfileGenerator from './docker/DockerfileGenerator';
import aiService from '../services/geminiService';
import RegistryConnectModal from './modals/RegistryConnectModal';
import { 
    Container, 
    Zap, 
    Play, 
    Check, 
    Layers, 
    Activity,
    Cpu,
    Trash2,
    Terminal,
    RefreshCw,
    ShieldCheck,
    LayoutDashboard,
    Search,
    AlertTriangle,
    FileCode,
    Sparkles,
    ShieldAlert,
    Plus,
    Server,
    Globe
} from 'lucide-react';

interface DockerPaneProps {
  onSaveFile: (path: string, content: string) => void;
  activeModelId: string;
  onCollapse: () => void;
  policies: SecurityPolicy[];
  onWriteToTerminal: (output: string | string[]) => void;
  fileStructure: FileNode;
}

interface ConnectedRegistry {
    name: string;
    url: string;
    username: string;
    provider: string;
}

const DockerPane: React.FC<DockerPaneProps> = ({ onSaveFile, activeModelId, onCollapse, policies, onWriteToTerminal, fileStructure }) => {
    const [activeTab, setActiveTab] = useState<'build' | 'fleet' | 'security'>('build');
    const [detectedDockerfiles, setDetectedDockerfiles] = useState<string[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<{ content: string; explanation: string } | null>(null);
    
    // Registry State
    const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
    const [connectedRegistries, setConnectedRegistries] = useState<ConnectedRegistry[]>([]);

    // Deep search for Dockerfiles in the actual file structure
    useEffect(() => {
        const findDockerfiles = (node: FileNode, path = ''): string[] => {
            let found: string[] = [];
            const currentPath = path ? `${path}/${node.name}` : node.name;
            if (node.type === 'file' && (node.name.toLowerCase() === 'dockerfile' || node.name.endsWith('.dockerfile'))) {
                found.push(currentPath);
            }
            if (node.children) {
                node.children.forEach(child => {
                    found = [...found, ...findDockerfiles(child, currentPath === 'sai-monorepo' ? '' : currentPath)];
                });
            }
            return found;
        };
        setDetectedDockerfiles(findDockerfiles(fileStructure));
    }, [fileStructure]);

    const handleRunBuild = (path: string) => {
        const imageName = path.split('/').shift()?.toLowerCase() || 'app';
        onWriteToTerminal([
            `$ docker build -f ${path} -t ${imageName}:latest .`,
            `Sending build context to Docker daemon...`,
            `Step 1/10 : FROM ...`
        ]);
    };

    const handleOptimize = async (path: string) => {
        const findContent = (node: FileNode, targetPath: string): string | null => {
            const parts = targetPath.split('/');
            let current = node;
            for (const part of parts) {
                const found = current.children?.find(c => c.name === part);
                if (!found) return null;
                current = found;
            }
            return current.content || null;
        };

        const content = findContent(fileStructure, path);
        if (!content) return;

        setIsOptimizing(true);
        setOptimizationResult(null);
        try {
            const result = await aiService.optimizeDockerfile(content, activeModelId);
            setOptimizationResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleRegistryConnect = (registry: ConnectedRegistry) => {
        setConnectedRegistries(prev => [...prev, registry]);
        onWriteToTerminal([
            `$ docker login ${registry.url}`,
            `Authenticating as ${registry.username}...`,
            `Login Succeeded`
        ]);
    };

    return (
        <div className="h-full flex flex-col bg-[#0b0e14] text-[var(--color-text-primary)]">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/5 bg-[#0f111a]">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                            <Container size={18} />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Docker Studio</h2>
                            <p className="text-[9px] text-gray-600 font-bold uppercase">Real-time Engine: Active</p>
                        </div>
                    </div>
                    <button onClick={onCollapse} className="text-gray-600 hover:text-white transition-colors">
                        {ICONS.COLLAPSE_LEFT}
                    </button>
                </div>

                <div className="flex bg-white/[0.03] p-1 rounded-xl w-full">
                    {[
                        { id: 'build', label: 'Synthesis', icon: Zap },
                        { id: 'fleet', label: 'Workspace', icon: LayoutDashboard },
                        { id: 'security', label: 'Hardening', icon: ShieldCheck },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white/5 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            <t.icon size={12} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b0e14]">
                {activeTab === 'build' && (
                    <div className="p-4 animate-fade-in">
                        <DockerfileGenerator onSaveFile={onSaveFile} activeModelId={activeModelId} policies={policies} />
                    </div>
                )}

                {activeTab === 'fleet' && (
                    <div className="p-4 animate-fade-in space-y-6">
                        {/* Registries Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <Server size={12} /> Connected Registries
                                </h3>
                                <button 
                                    onClick={() => setIsRegistryModalOpen(true)}
                                    className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={12} /> Connect
                                </button>
                            </div>

                            <div className="space-y-2">
                                {connectedRegistries.length > 0 ? (
                                    connectedRegistries.map((reg, idx) => (
                                        <div key={idx} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                    <Globe size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-white truncate">{reg.name}</h4>
                                                    <p className="text-[9px] text-gray-500 font-mono truncate">{reg.url}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <Check size={10} /> AUTHED
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-600 font-medium italic">No external registries connected</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="h-px bg-white/5" />

                        {/* Artifacts Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <Search size={12} /> Local Artifacts
                                </h3>
                                <span className="text-[9px] font-bold text-cyan-500">{detectedDockerfiles.length} Found</span>
                            </div>

                            {detectedDockerfiles.length > 0 ? (
                                <div className="space-y-2">
                                    {detectedDockerfiles.map(path => (
                                        <div key={path} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                        <FileCode size={16} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{path}</h4>
                                                        <p className="text-[10px] text-gray-500 font-mono">Build Context: .</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleOptimize(path)}
                                                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" 
                                                        title="AI Optimize"
                                                    >
                                                        <Zap size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRunBuild(path)}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                                                        title="Run Build"
                                                    >
                                                        <Play size={14} fill="currentColor" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center opacity-30">
                                    <Container size={48} strokeWidth={1} className="mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No Dockerfiles in Workspace</p>
                                    <button 
                                        onClick={() => setActiveTab('build')}
                                        className="mt-4 text-[10px] text-blue-400 hover:underline font-black"
                                    >
                                        Synthesize one with AI →
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="p-4 animate-fade-in space-y-6">
                        {!optimizationResult ? (
                             <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 text-center">
                                <ShieldAlert size={32} className="mx-auto mb-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-white mb-2">Neural Hardening</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                                    Select a Dockerfile from the <span className="text-gray-300">Workspace</span> tab to analyze and apply production-grade security patches using {activeModelId}.
                                </p>
                                {isOptimizing && (
                                    <div className="flex items-center justify-center gap-3 text-purple-400 animate-pulse font-black text-[10px] uppercase tracking-widest">
                                        <RefreshCw size={14} className="animate-spin" /> Analyzing Layers...
                                    </div>
                                )}
                             </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                                        <Sparkles size={14} /> Optimization Ready
                                    </h3>
                                    <button onClick={() => setOptimizationResult(null)} className="text-xs text-gray-500 hover:text-white">Clear</button>
                                </div>
                                
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Neural Explanation</h4>
                                    <p className="text-xs text-gray-300 leading-relaxed italic">
                                        "{optimizationResult.explanation}"
                                    </p>
                                </div>

                                <div className="bg-[#0b0c10] rounded-xl border border-white/5 overflow-hidden">
                                    <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-gray-400">Patched Dockerfile</span>
                                        <button 
                                            onClick={() => onSaveFile('Dockerfile.optimized', optimizationResult.content)}
                                            className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline"
                                        >
                                            Apply Changes
                                        </button>
                                    </div>
                                    <pre className="p-4 text-[10px] font-mono text-cyan-100/70 overflow-auto max-h-[300px]">
                                        <code>{optimizationResult.content}</code>
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                             <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Active Guardrails</h3>
                             <div className="space-y-2">
                                {policies.filter(p => p.enabled).map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                        <Check size={12} className="text-emerald-500" />
                                        <span className="text-xs font-medium text-gray-400">{p.title}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-[#0f111a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-gray-600" />
                    <span className="text-[10px] font-mono text-gray-500">Workspace Driven</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    S.AI Logic Connected
                </div>
            </div>

            <RegistryConnectModal 
                isOpen={isRegistryModalOpen}
                onClose={() => setIsRegistryModalOpen(false)}
                onConnect={handleRegistryConnect}
            />
        </div>
    );
};

export default DockerPane;
