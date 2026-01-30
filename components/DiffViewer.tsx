
import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface DiffViewerProps {
    original: string;
    modified: string;
    fileName: string;
    onApply: () => void;
    onDiscard: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified, fileName, onApply, onDiscard }) => {
    // Basic line-by-line diff for visualization
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    return (
        <div className="flex flex-col h-full bg-[#0d1117] animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-white/10 shadow-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            Reviewing Proposed Logic <ArrowRight size={14} className="text-gray-600" /> <span className="text-cyan-400 font-mono">{fileName}</span>
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Synthesis complete • AI-Native Refactor</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onDiscard}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={onApply}
                        className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-900/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <ShieldCheck size={14} /> Accept Synthesis
                    </button>
                </div>
            </div>

            {/* Diff Content */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs">
                {/* Original */}
                <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-black/40 text-[10px] font-black text-rose-500 uppercase border-b border-white/5 tracking-tighter">Current Source</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0d1117]">
                        {originalLines.map((line, i) => (
                            <div key={i} className="flex gap-4 min-h-[1.2rem]">
                                <span className="w-8 text-right text-gray-700 select-none">{i + 1}</span>
                                <span className="text-gray-400 whitespace-pre">{line}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modified */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
                    <div className="px-4 py-2 bg-black/40 text-[10px] font-black text-cyan-400 uppercase border-b border-white/5 tracking-tighter">AI-Synthesized Target</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0d1117]">
                        {modifiedLines.map((line, i) => {
                            const isNew = !originalLines.includes(line);
                            return (
                                <div key={i} className={`flex gap-4 min-h-[1.2rem] ${isNew ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : ''}`}>
                                    <span className={`w-8 text-right select-none ${isNew ? 'text-cyan-500 font-bold' : 'text-gray-700'}`}>{i + 1}</span>
                                    <span className={`${isNew ? 'text-white' : 'text-gray-400'} whitespace-pre`}>{line}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiffViewer;
