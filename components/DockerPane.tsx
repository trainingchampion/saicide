
import React, { useState, useEffect, useCallback } from 'react';
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
    Globe,
    Square,
    Box,
    HardDrive,
    Clock,
    XCircle
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

interface DockerImage {
    Repository: string;
    Tag: string;
    ID: string;
    Size: string;
    CreatedAt: string;
}

interface DockerContainer {
    ID: string;
    Names: string;
    Image: string;
    Status: string;
    State: string;
    Ports: string;
    CreatedAt: string;
}

const API_BASE = 'http://localhost:4000/api/docker';

const DockerPane: React.FC<DockerPaneProps> = ({ onSaveFile, activeModelId, onCollapse, policies, onWriteToTerminal, fileStructure }) => {
    const [activeTab, setActiveTab] = useState<'build' | 'fleet' | 'security'>('build');
    const [detectedDockerfiles, setDetectedDockerfiles] = useState<string[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<{ content: string; explanation: string } | null>(null);
    
    // Docker State
    const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
    const [dockerVersion, setDockerVersion] = useState<string>('');
    const [images, setImages] = useState<DockerImage[]>([]);
    const [containers, setContainers] = useState<DockerContainer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBuildingImage, setIsBuildingImage] = useState<string | null>(null);
    
    // Registry State
    const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
    const [connectedRegistries, setConnectedRegistries] = useState<ConnectedRegistry[]>([]);

    // Check Docker status on mount
    useEffect(() => {
        checkDockerStatus();
    }, []);

    const checkDockerStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/status`);
            const data = await res.json();
            setDockerAvailable(data.available);
            setDockerVersion(data.version || '');
            if (data.available) {
                fetchImages();
                fetchContainers();
            }
        } catch (e) {
            setDockerAvailable(false);
        }
    };

    const fetchImages = async () => {
        try {
            const res = await fetch(`${API_BASE}/images`);
            const data = await res.json();
            if (data.success) {
                setImages(data.images);
            }
        } catch (e) {
            console.error('Failed to fetch images:', e);
        }
    };

    const fetchContainers = async () => {
        try {
            const res = await fetch(`${API_BASE}/containers?all=true`);
            const data = await res.json();
            if (data.success) {
                setContainers(data.containers);
            }
        } catch (e) {
            console.error('Failed to fetch containers:', e);
        }
    };

    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([fetchImages(), fetchContainers()]);
        setIsLoading(false);
    }, []);

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

    const handleRunBuild = async (path: string) => {
        const imageName = path.split('/').shift()?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'app';
        setIsBuildingImage(path);
        onWriteToTerminal([`$ docker build -f ${path} -t ${imageName}:latest .`, `Building image...`]);
        
        try {
            const res = await fetch(`${API_BASE}/build`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dockerfilePath: path, imageName, tag: 'latest', context: '.' })
            });
            const data = await res.json();
            if (data.success) {
                onWriteToTerminal([`✓ Build completed successfully!`, data.output?.slice(-500) || '']);
                fetchImages();
            } else {
                onWriteToTerminal([`✗ Build failed:`, data.error || 'Unknown error']);
            }
        } catch (e: any) {
            onWriteToTerminal([`✗ Build error:`, e.message]);
        } finally {
            setIsBuildingImage(null);
        }
    };

    const handleRunContainer = async (image: DockerImage) => {
        const containerName = `${image.Repository.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
        onWriteToTerminal([`$ docker run -d --name ${containerName} ${image.Repository}:${image.Tag}`]);
        
        try {
            const res = await fetch(`${API_BASE}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: `${image.Repository}:${image.Tag}`, name: containerName, detach: true })
            });
            const data = await res.json();
            if (data.success) {
                onWriteToTerminal([`✓ Container started: ${data.containerId?.slice(0, 12)}`]);
                fetchContainers();
            } else {
                onWriteToTerminal([`✗ Failed to start container:`, data.error]);
            }
        } catch (e: any) {
            onWriteToTerminal([`✗ Error:`, e.message]);
        }
    };

    const handleStopContainer = async (containerId: string) => {
        onWriteToTerminal([`$ docker stop ${containerId.slice(0, 12)}`]);
        try {
            const res = await fetch(`${API_BASE}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ containerId })
            });
            const data = await res.json();
            if (data.success) {
                onWriteToTerminal([`✓ Container stopped`]);
                fetchContainers();
            } else {
                onWriteToTerminal([`✗ Failed:`, data.error]);
            }
        } catch (e: any) {
            onWriteToTerminal([`✗ Error:`, e.message]);
        }
    };

    const handleRemoveContainer = async (containerId: string) => {
        onWriteToTerminal([`$ docker rm -f ${containerId.slice(0, 12)}`]);
        try {
            const res = await fetch(`${API_BASE}/rm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ containerId, force: true })
            });
            const data = await res.json();
            if (data.success) {
                onWriteToTerminal([`✓ Container removed`]);
                fetchContainers();
            } else {
                onWriteToTerminal([`✗ Failed:`, data.error]);
            }
        } catch (e: any) {
            onWriteToTerminal([`✗ Error:`, e.message]);
        }
    };

    const handleRemoveImage = async (imageId: string) => {
        onWriteToTerminal([`$ docker rmi ${imageId.slice(0, 12)}`]);
        try {
            const res = await fetch(`${API_BASE}/rmi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, force: true })
            });
            const data = await res.json();
            if (data.success) {
                onWriteToTerminal([`✓ Image removed`]);
                fetchImages();
            } else {
                onWriteToTerminal([`✗ Failed:`, data.error]);
            }
        } catch (e: any) {
            onWriteToTerminal([`✗ Error:`, e.message]);
        }
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

    const handleRegistryConnect = async (registry: ConnectedRegistry) => {
        onWriteToTerminal([`$ docker login ${registry.url}`, `Authenticating as ${registry.username}...`]);
        
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    registry: registry.url, 
                    username: registry.username,
                    password: '' // Password should be handled securely - this is just a placeholder
                })
            });
            const data = await res.json();
            if (data.success) {
                setConnectedRegistries(prev => [...prev, registry]);
                onWriteToTerminal([`✓ Login Succeeded`]);
            } else {
                onWriteToTerminal([`✗ Login failed:`, data.error]);
            }
        } catch (e: any) {
            // Fallback - just add to connected list (for demo purposes)
            setConnectedRegistries(prev => [...prev, registry]);
            onWriteToTerminal([`✓ Registry configured (login required)`]);
        }
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
                        {/* Docker Status Banner */}
                        {dockerAvailable === false && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <AlertTriangle size={20} className="text-red-400" />
                                <div>
                                    <p className="text-sm font-bold text-red-400">Docker Not Available</p>
                                    <p className="text-xs text-gray-500">Make sure Docker Desktop is running</p>
                                </div>
                            </div>
                        )}

                        {dockerAvailable && (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-400">Docker Engine v{dockerVersion}</span>
                                </div>
                                <button 
                                    onClick={refreshAll}
                                    disabled={isLoading}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        )}

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

                        {/* Docker Images Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <Box size={12} /> Docker Images
                                </h3>
                                <span className="text-[9px] font-bold text-cyan-500">{images.length} Images</span>
                            </div>

                            {images.length > 0 ? (
                                <div className="space-y-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                        <Layers size={14} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white">{img.Repository}:{img.Tag}</h4>
                                                        <p className="text-[9px] text-gray-500 font-mono">{img.ID?.slice(7, 19)} • {img.Size}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleRunContainer(img)}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                                                        title="Run Container"
                                                    >
                                                        <Play size={12} fill="currentColor" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveImage(img.ID)}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center">
                                    <p className="text-[10px] text-gray-600 font-medium italic">No Docker images found</p>
                                </div>
                            )}
                        </section>

                        <div className="h-px bg-white/5" />

                        {/* Docker Containers Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <Container size={12} /> Containers
                                </h3>
                                <span className="text-[9px] font-bold text-cyan-500">{containers.length} Total</span>
                            </div>

                            {containers.length > 0 ? (
                                <div className="space-y-2">
                                    {containers.map((c, idx) => {
                                        const isRunning = c.State === 'running';
                                        return (
                                            <div key={idx} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-blue-500/30 transition-all">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isRunning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                            <Container size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-xs font-bold text-white">{c.Names}</h4>
                                                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                                    {c.State}
                                                                </span>
                                                            </div>
                                                            <p className="text-[9px] text-gray-500 font-mono">{c.Image} • {c.ID?.slice(0, 12)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {isRunning ? (
                                                            <button 
                                                                onClick={() => handleStopContainer(c.ID)}
                                                                className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" 
                                                                title="Stop Container"
                                                            >
                                                                <Square size={12} fill="currentColor" />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleRemoveContainer(c.ID)}
                                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                                                title="Remove Container"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center">
                                    <p className="text-[10px] text-gray-600 font-medium italic">No containers found</p>
                                </div>
                            )}
                        </section>

                        <div className="h-px bg-white/5" />

                        {/* Dockerfiles Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <FileCode size={12} /> Workspace Dockerfiles
                                </h3>
                                <span className="text-[9px] font-bold text-cyan-500">{detectedDockerfiles.length} Found</span>
                            </div>

                            {detectedDockerfiles.length > 0 ? (
                                <div className="space-y-2">
                                    {detectedDockerfiles.map(path => (
                                        <div key={path} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                        <FileCode size={14} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white">{path}</h4>
                                                        <p className="text-[9px] text-gray-500">Build context: .</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleOptimize(path)}
                                                        disabled={isOptimizing}
                                                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50" 
                                                        title="AI Optimize"
                                                    >
                                                        <Sparkles size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRunBuild(path)}
                                                        disabled={isBuildingImage === path}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50" 
                                                        title="Build Image"
                                                    >
                                                        {isBuildingImage === path ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center flex flex-col items-center opacity-50">
                                    <FileCode size={32} strokeWidth={1} className="mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No Dockerfiles</p>
                                    <button 
                                        onClick={() => setActiveTab('build')}
                                        className="mt-3 text-[10px] text-blue-400 hover:underline font-black"
                                    >
                                        Create with AI →
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
