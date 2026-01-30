import React from 'react';
import { Bot, Loader2, Check, X, Cpu, Terminal, Activity } from 'lucide-react';
import { AgentStep } from '../types';

interface GhostAgentProps {
    status: 'idle' | 'planning' | 'executing' | 'review' | 'completed' | 'suggestion';
    steps: AgentStep[];
    onClose: () => void;
    currentAction?: string;
}

const GhostAgent: React.FC<GhostAgentProps> = ({ status, steps = [], onClose, currentAction }) => {
    if (status === 'idle') return null;

    const mainStep = steps[0] || {};
    const hasAction = mainStep.action && mainStep.actionLabel;

    return (
        <div className="fixed bottom-12 right-12 w-[380px] z-[200] animate-slide-in-from-bottom">
            <div className="bg-[#131b2c]/95 backdrop-blur-3xl border border-cyan-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                <Bot size={24} className={(status === 'executing' || status === 'planning') ? 'animate-bounce' : ''} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#131b2c] animate-pulse shadow-[0_0_10px_#10b981]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] font-michroma">SaiFlow</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${status === 'executing' ? 'text-cyan-400' : 'text-gray-500'}`}>
                                    {status === 'suggestion' ? 'Intervention Proposal' : status === 'executing' ? 'Neural Link Active' : 'Agent Stable'}
                                </span>
                                {status === 'executing' && <Activity size={8} className="text-cyan-500 animate-pulse" />}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Live Action Tracker for App Gen */}
                    {status !== 'suggestion' && (
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal size={14} className="text-gray-500" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Synthesis Pipeline</span>
                            </div>
                            <p className="text-xs font-mono text-cyan-200/90 leading-relaxed min-h-[2.5rem]">
                                {status === 'executing' ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin text-cyan-400" />
                                        {currentAction || 'Architecting logic...'}
                                    </span>
                                ) : status === 'completed' ? (
                                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                                        <Check size={14} strokeWidth={3} /> Manifest injection successful.
                                    </span>
                                ) : (
                                    'Awaiting telemetry data...'
                                )}
                            </p>
                        </div>
                    )}
                    
                    {/* Main Content */}
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">
                            {status === 'suggestion' ? 'Proposed Action' : 'Roadmap'}
                        </h3>
                        <div className="space-y-2">
                            {steps.map((step, i) => (
                                <div key={step.id || i} className="flex items-start gap-4 group">
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                            step.status === 'completed' ? 'bg-cyan-500 border-cyan-500 text-black' : 
                                            step.status === 'running' ? 'border-cyan-400 animate-pulse' : 'border-gray-800'
                                        }`}>
                                            {step.status === 'completed' ? <Check size={12} strokeWidth={4} /> : status === 'suggestion' ? <Cpu size={10} className="text-cyan-400" /> : <span className="text-[10px] font-black text-gray-600">{i + 1}</span>}
                                        </div>
                                        {i < steps.length - 1 && <div className={`w-0.5 h-4 bg-gray-800 my-1 transition-colors ${step.status === 'completed' ? 'bg-cyan-500/30' : ''}`} />}
                                    </div>
                                    <div className="flex-1">
                                        <span className={`text-sm font-bold transition-all ${
                                            step.status === 'completed' ? 'text-gray-500' : 
                                            step.status === 'running' ? 'text-white translate-x-1' : status === 'suggestion' ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {step.label}
                                        </span>
                                        {hasAction && (
                                            <p className="text-xs text-gray-400 mt-2 font-mono bg-black/30 p-2 rounded border border-white/5">
                                                <code>{step.actionLabel}</code>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {hasAction && (
                    <div className="p-4 bg-black/20 flex gap-2">
                        <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-gray-400 bg-white/5 rounded-lg hover:bg-white/10">Reject</button>
                        <button onClick={() => { mainStep.action?.(); onClose(); }} className="flex-1 py-2 text-xs font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500">Apply</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GhostAgent;