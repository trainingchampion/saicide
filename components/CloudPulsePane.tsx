
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, 
    Zap, 
    RefreshCw, 
    AlertTriangle, 
    Cpu,
    X,
    CheckCircle,
    Brain,
    Layers,
    Search,
    TrendingUp,
    ShieldAlert,
    TrendingDown
} from 'lucide-react';
import { FileNode } from '../types';

interface CloudPulsePaneProps {
  onCollapse: () => void;
  fileStructure: FileNode;
  activeModelId?: string;
}

interface GraphNode {
    id: string;
    name: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    level: number;
    type: 'file' | 'folder';
}

interface GraphLink {
    source: string;
    target: string;
}

const CloudPulsePane: React.FC<CloudPulsePaneProps> = ({ onCollapse, fileStructure }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphLink[]>([]);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [isSimulating, setIsSimulating] = useState(true);

    // Build graph from file structure
    useEffect(() => {
        const newNodes: GraphNode[] = [];
        const newLinks: GraphLink[] = [];

        const processNode = (node: FileNode, level = 0, parentId?: string) => {
            const id = `${level}-${node.name}-${Math.random().toString(36).substr(2, 5)}`;
            const color = level === 0 ? '#06b6d4' : node.type === 'folder' ? '#3b82f6' : '#6366f1';
            const size = Math.max(5, 15 - level * 2);

            newNodes.push({
                id,
                name: node.name,
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: 0,
                vy: 0,
                size,
                color,
                level,
                type: node.type
            });

            if (parentId) {
                newLinks.push({ source: parentId, target: id });
            }

            if (node.children) {
                node.children.forEach(child => processNode(child, level + 1, id));
            }
        };

        processNode(fileStructure);
        setNodes(newNodes);
        setLinks(newLinks);
    }, [fileStructure]);

    // Force-directed simulation loop
    useEffect(() => {
        if (!isSimulating || nodes.length === 0) return;

        const interval = setInterval(() => {
            setNodes(currentNodes => {
                const nextNodes = currentNodes.map(n => ({ ...n }));
                
                // Physics constants
                const repulsion = 1500;
                const attraction = 0.05;
                const friction = 0.9;

                // Repulsion
                for (let i = 0; i < nextNodes.length; i++) {
                    for (let j = i + 1; j < nextNodes.length; j++) {
                        const dx = nextNodes[i].x - nextNodes[j].x;
                        const dy = nextNodes[i].y - nextNodes[j].y;
                        const distSq = dx * dx + dy * dy || 1;
                        const force = repulsion / distSq;
                        const fx = (dx / Math.sqrt(distSq)) * force;
                        const fy = (dy / Math.sqrt(distSq)) * force;
                        nextNodes[i].vx += fx;
                        nextNodes[i].vy += fy;
                        nextNodes[j].vx -= fx;
                        nextNodes[j].vy -= fy;
                    }
                }

                // Attraction (links)
                links.forEach(link => {
                    const src = nextNodes.find(n => n.id === link.source);
                    const tgt = nextNodes.find(n => n.id === link.target);
                    if (src && tgt) {
                        const dx = tgt.x - src.x;
                        const dy = tgt.y - src.y;
                        src.vx += dx * attraction;
                        src.vy += dy * attraction;
                        tgt.vx -= dx * attraction;
                        tgt.vy -= dy * attraction;
                    }
                });

                // Update positions
                nextNodes.forEach(n => {
                    n.x += n.vx;
                    n.y += n.vy;
                    n.vx *= friction;
                    n.vy *= friction;
                    
                    // Boundary box
                    n.x = Math.max(50, Math.min(n.x, 750));
                    n.y = Math.max(50, Math.min(n.y, 550));
                });

                return nextNodes;
            });
        }, 33);

        return () => clearInterval(interval);
    }, [isSimulating, nodes.length, links]);

    // Draw to canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Links
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        links.forEach(link => {
            const src = nodes.find(n => n.id === link.source);
            const tgt = nodes.find(n => n.id === link.target);
            if (src && tgt) {
                ctx.beginPath();
                ctx.moveTo(src.x, src.y);
                ctx.lineTo(tgt.x, tgt.y);
                ctx.stroke();
            }
        });

        // Nodes
        nodes.forEach(node => {
            const isSelected = selectedNode?.id === node.id;
            
            // Outer Glow
            const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2);
            grad.addColorStop(0, node.color + '44');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * 2, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = isSelected ? '#fff' : node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();

            if (isSelected || node.level < 2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '10px "JetBrains Mono"';
                ctx.textAlign = 'center';
                ctx.fillText(node.name, node.x, node.y + node.size + 15);
            }
        });
    }, [nodes, links, selectedNode]);

    return (
        <div className="flex h-full w-full bg-[#0b0e14] overflow-hidden relative">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
                    <Brain size={24} className="text-cyan-400 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">SaiGraph</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Neural Project Topology</p>
                </div>
            </div>

            <button 
                onClick={onCollapse}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
            >
                <X size={20} />
            </button>

            {/* Canvas Stage */}
            <div className="flex-1 relative cursor-crosshair">
                <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={600} 
                    className="w-full h-full object-contain"
                    onClick={(e) => {
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const clicked = nodes.find(n => Math.sqrt((n.x - x)**2 + (n.y - y)**2) < n.size * 2);
                        setSelectedNode(clicked || null);
                    }}
                />
                
                {/* Floating Stats */}
                <div className="absolute bottom-8 left-8 space-y-4">
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-6 shadow-2xl">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Entities</span>
                            <span className="text-lg font-black text-white">{nodes.length}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Cognitive Load</span>
                            <span className="text-lg font-black text-cyan-400">Low</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Integrity</span>
                            <span className="text-lg font-black text-emerald-400">98%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Inspector */}
            <div className="w-80 bg-[#0f111a] border-l border-white/5 flex flex-col p-6 overflow-y-auto">
                {selectedNode ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-cyan-400">
                                    <Layers size={20} />
                                </div>
                                <h3 className="font-black text-white truncate">{selectedNode.name}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Type</p>
                                    <p className="text-xs font-bold text-gray-300 capitalize">{selectedNode.type}</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Depth</p>
                                    <p className="text-xs font-bold text-gray-300">Level {selectedNode.level}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Neural Insights</h4>
                            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 space-y-4">
                                <div className="flex gap-3">
                                    <Zap size={14} className="text-cyan-400 shrink-0" />
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic">This module is highly decoupled but presents a potential refactor opportunity in the dependency chain.</p>
                                </div>
                                <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                    Optimize Connections
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Risk Factor</h4>
                            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-xs font-bold">Stable</span>
                                </div>
                                <TrendingDown size={14} className="text-emerald-500" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                        <Search size={48} strokeWidth={1} className="mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Sai-Link Offline</p>
                        <p className="text-[10px] mt-2 leading-relaxed">Select a node in the project graph to visualize its cognitive relationships.</p>
                    </div>
                )}

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button 
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSimulating ? 'bg-white/5 text-gray-400' : 'bg-cyan-600 text-white shadow-lg'}`}
                    >
                        {isSimulating ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
                        {isSimulating ? 'Simulation Active' : 'Freeze Visualization'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloudPulsePane;
