
import React from 'react';
import { ICONS } from '../constants';
import { Video, Mic, CircleDot, Film, Download, Trash2, Clock, Play, FileVideo, Inbox } from 'lucide-react';
import { Recording } from '../types';

interface RecorderPaneProps {
    onCollapse: () => void;
    onOpenRecorder: () => void;
    recordings?: Recording[];
    onDeleteRecording?: (id: string) => void;
}

const RecorderPane: React.FC<RecorderPaneProps> = ({ onCollapse, onOpenRecorder, recordings = [], onDeleteRecording }) => {
    return (
        <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
            <div className="flex justify-between items-center p-2 flex-shrink-0 border-b border-[var(--color-border)] mb-2">
                <div className="flex items-center gap-2">
                    <CircleDot size={16} className="text-red-400" />
                    <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Studio Recorder</h2>
                </div>
                <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    {ICONS.COLLAPSE_LEFT}
                </button>
            </div>

            <div className="px-2 py-4 flex flex-col items-center text-center shrink-0">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <Video size={28} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Capture Studio</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-[220px] leading-relaxed">
                    Record demos and walkthroughs directly from your neural workspace.
                </p>
                <button 
                    onClick={onOpenRecorder}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    New Recording
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 mt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Film size={12} /> Library
                    </h4>
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{recordings.length}</span>
                </div>

                <div className="space-y-2">
                    {recordings.length > 0 ? (
                        recordings.map(rec => (
                            <div key={rec.id} className="group bg-[var(--color-background-tertiary)] border border-[var(--color-border)] hover:border-red-500/30 rounded-xl p-3 transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-gray-600 group-hover:text-red-400 transition-colors">
                                            <FileVideo size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">{rec.name}</p>
                                            <p className="text-[10px] text-gray-500 flex items-center gap-2">
                                                <span>{rec.size}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                                                <span>{rec.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/50 mt-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-black/20 px-2 py-0.5 rounded-full">
                                        <Clock size={10} /> {rec.duration}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const win = window.open(rec.url, '_blank');
                                                win?.focus();
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                                            title="Play"
                                        >
                                            <Play size={12} fill="currentColor" />
                                        </button>
                                        <a 
                                            href={rec.url} 
                                            download={rec.name}
                                            onClick={e => e.stopPropagation()}
                                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                                            title="Download"
                                        >
                                            <Download size={12} />
                                        </a>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteRecording?.(rec.id); }}
                                            className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400" 
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                            <Inbox size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-white">No recordings yet</p>
                            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed px-4">
                                Your capture library is empty. Start a new recording to build your workspace history.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecorderPane;
