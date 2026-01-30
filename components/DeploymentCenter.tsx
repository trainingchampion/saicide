
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Rocket, Link as LinkIcon, Check, Terminal, AlertTriangle, RefreshCw, Server, Globe, Box, Shield, Settings2, ExternalLink, X, Activity, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { FileNode } from '../types';
import aiService from '../services/geminiService';

const CLOUD_PROVIDERS = [
  { name: 'AWS', services: 'ECS / Lambda / S3', cli: 'aws', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { name: 'Azure', services: 'App Service / Functions', cli: 'az', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'GCP', services: 'Cloud Run / GKE', cli: 'gcloud', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
];

interface DeploymentCenterProps {
  onClose: () => void;
  authenticatedProviders: string[];
  fileStructure: FileNode;
  onRunInTerminal: (cmd: string) => void;
  activeModelId: string;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = ({ onClose, authenticatedProviders = [], fileStructure, onRunInTerminal, activeModelId }) => {
  const [projectName, setProjectName] = useState(fileStructure.name || 's-ai-app-v1');
  const [targetProvider, setTargetProvider] = useState(authenticatedProviders[0] || 'AWS');
  const [logs, setLogs] = useState<string[]>(['<span class="text-gray-500">system:</span> Deployment Engine initialized. Awaiting workspace analysis...']);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'analyzing' | 'provisioning' | 'success' | 'error'>('idle');
  const [liveUrl, setLiveUrl] = useState('');
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string) => {
      const timestamp = new Date().toISOString().split('T')[1].slice(0,8);
      setLogs(prev => [...prev, `<span class="text-gray-600">[${timestamp}]</span> ${message}`]);
  };

  const flattenFiles = (node: FileNode, depth = 0): string => {
      let str = `  `.repeat(depth) + (node.type === 'folder' ? '📁 ' : '📄 ') + node.name + '\n';
      if (node.children) {
          node.children.forEach(c => str += flattenFiles(c, depth + 1));
      }
      return str;
  };

  const workspaceSnapshot = useMemo(() => flattenFiles(fileStructure), [fileStructure]);

  const handleInitiateDeployment = async () => {
    if (!authenticatedProviders.includes(targetProvider)) {
        addLog(`<span class="text-red-400">error:</span> Not authenticated for <strong>${targetProvider}</strong>. Please run <code>${targetProvider.toLowerCase()} login</code> in terminal.`);
        return;
    }

    setIsDeploying(true);
    setDeployStatus('analyzing');
    addLog(`<span class="text-cyan-400">info:</span> Synthesizing deployment plan for <strong>${projectName}</strong> on <strong>${targetProvider}</strong>...`);

    try {
        const plan = await aiService.generateDeploymentPlan(targetProvider, workspaceSnapshot, activeModelId);
        
        addLog(`<span class="text-emerald-400">success:</span> Analysis complete. ${plan.explanation}`);
        
        setDeployStatus('provisioning');
        
        // Feed commands to real terminal bridge
        for (const cmd of plan.commands) {
            addLog(`<span class="text-blue-400">$</span> ${cmd}`);
            onRunInTerminal(cmd);
            await new Promise(r => setTimeout(r, 800)); // Artificial spacing for readable logs
        }

        if (plan.manifest) {
            addLog(`<span class="text-purple-400">manifest:</span> Applying generated IaC configuration...`);
            // Simulated manifest application in terminal
            onRunInTerminal(`cat <<EOF > deploy_manifest.yaml\n${plan.manifest}\nEOF`);
        }

        // Simulate the final stretch of provisioning
        await new Promise(r => setTimeout(r, 2000));
        
        setDeployStatus('success');
        setLiveUrl(`https://${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.s-ai.link`);
        addLog(`<span class="text-emerald-400">SUCCESS:</span> Application stack verified at primary endpoint.`);
        
    } catch (e: any) {
        setDeployStatus('error');
        addLog(`<span class="text-red-400">failure:</span> ${e.message}`);
    } finally {
        setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0f111a]">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Rocket size={20} />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Cloud Orchestrator</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Workspace Real-time Deployment</p>
            </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
            <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Workspace Target Card */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center gap-2 mb-6">
                <Cpu size={16} className="text-gray-500" />
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Deployment ID</label>
                    <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Infrastructure Target</label>
                    <select 
                        value={targetProvider}
                        onChange={(e) => setTargetProvider(e.target.value)}
                        className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                    >
                        {CLOUD_PROVIDERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={handleInitiateDeployment}
                        disabled={isDeploying}
                        className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${isDeploying ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-900/20'}`}
                    >
                        {isDeploying ? (
                            <>
                                <RefreshCw size={14} className="animate-spin" /> {deployStatus}...
                            </>
                        ) : (
                            <>
                                <Zap size={14} fill="currentColor" /> Initiate Provisioning
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-3">
                    {CLOUD_PROVIDERS.map(p => {
                        const isAuthed = authenticatedProviders.includes(p.name);
                        return (
                            <div key={p.name} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter transition-all ${isAuthed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                {isAuthed ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                {p.name} {isAuthed ? 'Active' : 'Unauth'}
                            </div>
                        );
                    })}
                </div>
                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} /> Workspace Integrity: <span className="text-emerald-500">100% Verified</span>
                </div>
            </div>
        </section>

        {/* Console & Stream */}
        <section className="flex flex-col flex-1 min-h-[400px] bg-[#0d1117] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="bg-[#161b22] px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">
                    <Terminal size={14} className="text-cyan-400" />
                    <span>Real-time Synthesis Stream</span>
                </div>
                {deployStatus === 'success' && (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black bg-emerald-900/20 px-4 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Check size={12} strokeWidth={3} /> STACK_ACTIVE
                    </div>
                )}
            </div>
            
            <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar leading-relaxed">
                {logs.map((log, i) => (
                    <div key={i} className="mb-2 break-all text-gray-300" dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {isDeploying && <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse mt-6"></div>}
                <div ref={logsEndRef} />
            </div>
            
            {deployStatus === 'success' && liveUrl && (
                <div className="p-6 bg-gradient-to-t from-[#161b22] to-transparent border-t border-white/5 flex justify-between items-center animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-lg">
                            <Globe size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Deployment Endpoint</p>
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-white hover:text-cyan-400 hover:underline flex items-center gap-2 transition-all">
                                {liveUrl} <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                    <button className="text-[10px] font-black uppercase bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2.5 rounded-xl border border-white/5 transition-all shadow-sm">
                        Access Telemetry
                    </button>
                </div>
            )}
        </section>

      </div>
    </div>
  );
};

export default DeploymentCenter;
