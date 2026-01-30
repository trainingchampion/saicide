
import React, { useState, useEffect } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { Copy, Check, Zap, Play, X, RotateCcw } from 'lucide-react';

interface ToolInput {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: string[];
}

interface ToolRunnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    toolName: string;
    toolInputs: ToolInput[];
    onRun: (inputs: Record<string, string>) => Promise<any>;
}

const ToolRunnerModal: React.FC<ToolRunnerModalProps> = ({ isOpen, onClose, toolName, toolInputs, onRun }) => {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    // Reset state when tool changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setInputs({});
            setResult(null);
            setIsLoading(false);
            setCopied(false);
        }
    }, [isOpen, toolName]);

    if (!isOpen) return null;

    const handleInputChange = (name: string, value: string) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const output = await onRun(inputs);
            setResult(output);
        } catch (error) {
            setResult("An error occurred while running the tool.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (typeof result === 'string') {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Determine if the result is an image URL (data URI or http link)
    const isImageResult = typeof result === 'string' && (result.startsWith('data:image') || result.match(/\.(jpeg|jpg|gif|png)$/) != null);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-[#131b2c] rounded-2xl w-full max-w-2xl text-white border border-gray-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-[#0b101b]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)]">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {toolName}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-[#131b2c]">
                    {!result ? (
                        <div className="space-y-6">
                            {toolInputs.map((input) => (
                                <div key={input.name} className="group">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-[var(--color-accent)] transition-colors">
                                        {input.label}
                                    </label>
                                    {input.type === 'select' ? (
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all appearance-none shadow-inner"
                                                value={inputs[input.name] || ''}
                                                onChange={(e) => handleInputChange(input.name, e.target.value)}
                                            >
                                                <option value="">Select an option...</option>
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <input 
                                            type="text" 
                                            className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all shadow-inner"
                                            placeholder={input.placeholder}
                                            value={inputs[input.name] || ''}
                                            onChange={(e) => handleInputChange(input.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wide flex items-center gap-2">
                                    <Check size={16} /> Result Generated
                                </h3>
                                {!isImageResult && (
                                    <button 
                                        onClick={handleCopy}
                                        className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${copied ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            
                            {isImageResult ? (
                                <div className="rounded-xl overflow-hidden border border-gray-700 bg-black/50 flex justify-center shadow-lg">
                                    <img src={result} alt="Generated" className="max-h-[400px] object-contain" />
                                </div>
                            ) : (
                                <div className="bg-[#0b101b] p-5 rounded-xl border border-gray-700 shadow-inner overflow-x-auto">
                                    <MarkdownRenderer content={result} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-between items-center bg-[#0b101b]">
                    {result ? (
                        <>
                            <button 
                                onClick={() => setResult(null)} 
                                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={16} /> Run Again
                            </button>
                            <button 
                                onClick={onClose} 
                                className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-sm transition-colors shadow-lg shadow-[var(--color-accent)]/20"
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={onClose} 
                                className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-cyan-600 hover:from-[var(--color-accent-hover)] hover:to-cyan-500 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-[var(--color-accent)]/25 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                        <span className="animate-pulse">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Run Tool
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToolRunnerModal;
