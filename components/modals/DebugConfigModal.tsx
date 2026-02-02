import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Terminal } from 'lucide-react';

export interface DebugConfig {
    command: string;
    args: string;
    env: string;
}

interface DebugConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: DebugConfig) => void;
    initialConfig: DebugConfig;
}

const DebugConfigModal: React.FC<DebugConfigModalProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
    const [config, setConfig] = useState<DebugConfig>(initialConfig);

    useEffect(() => {
        if (isOpen) setConfig(initialConfig);
    }, [isOpen, initialConfig]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-[#1e2227] w-full max-w-md rounded-xl border border-gray-700 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)]">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Debug Configuration</h2>
                            <p className="text-xs text-gray-400">Configure launch parameters</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Runtime Executable</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">
                                <Terminal size={14} />
                            </span>
                            <input 
                                type="text" 
                                value={config.command}
                                onChange={(e) => setConfig({...config, command: e.target.value})}
                                placeholder="e.g. npm, python, node"
                                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-gray-600"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Arguments</label>
                        <input 
                            type="text" 
                            value={config.args}
                            onChange={(e) => setConfig({...config, args: e.target.value})}
                            placeholder="e.g. run dev, main.py --verbose"
                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Environment Variables</label>
                        <textarea 
                            value={config.env}
                            onChange={(e) => setConfig({...config, env: e.target.value})}
                            placeholder="NODE_ENV=development&#10;PORT=3000"
                            rows={4}
                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono resize-none focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-gray-600"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onSave(config); onClose(); }}
                        className="px-6 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[var(--color-accent)]/20"
                    >
                        <Save size={16} />
                        Save Config
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugConfigModal;
