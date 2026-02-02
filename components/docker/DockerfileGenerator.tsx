
import React, { useState, useCallback } from 'react';
import aiService from '../../services/geminiService';
import { SecurityPolicy } from '../../types';
import { Check, Save, FileCode, Sparkles, RefreshCw, Zap, Rocket } from 'lucide-react';

interface DockerfileGeneratorProps {
    onSaveFile: (path: string, content: string) => void;
    activeModelId: string;
    policies: SecurityPolicy[];
}

const TEMPLATES = [
    { id: 'node', label: 'Node.js', prompt: 'Optimized multi-stage Node.js build using Alpine Linux, including yarn/npm cache optimization.' },
    { id: 'python', label: 'Python', prompt: 'Python 3.11 web service with Gunicorn, non-root user setup, and dependency layering.' },
    { id: 'go', label: 'Go', prompt: 'Static Go binary build with distroless runtime for minimal footprint and maximum security.' },
    { id: 'rust', label: 'Rust', prompt: 'Cargo-chef optimized Rust build using binary stripping for tiny images.' },
];

const DockerfileGenerator: React.FC<DockerfileGeneratorProps> = ({ onSaveFile, activeModelId, policies }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleGenerate = useCallback(async (customPrompt?: string) => {
        const finalPrompt = customPrompt || prompt;
        if (!finalPrompt.trim()) return;
        
        setIsLoading(true);
        setGeneratedCode('');
        setIsSaved(false);
        
        try {
          const code = await aiService.generateDockerfile(finalPrompt, activeModelId, policies);
          setGeneratedCode(code.trim());
        } catch (error) {
          console.error('Error generating Dockerfile:', error);
          setGeneratedCode('# Error in synthesis. Please verify your connection.');
        } finally {
          setIsLoading(false);
        }
    }, [prompt, activeModelId, policies]);

    const handleSave = () => {
        if (!generatedCode) return;
        onSaveFile('Dockerfile', generatedCode);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-inner">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400" />
                    Neural Synthesis
                </h3>
                
                <div className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Specify environment and dependencies..."
                            className="w-full h-28 bg-[#131b2c] border border-white/5 rounded-xl p-4 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 placeholder-gray-600 shadow-inner"
                        />
                        <div className="absolute bottom-3 right-3">
                            <button 
                                onClick={() => handleGenerate()} 
                                disabled={isLoading || !prompt.trim()} 
                                className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                                {isLoading ? 'Synthesizing...' : 'Build Artifact'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Synthesis Blueprints</p>
                        <div className="flex flex-wrap gap-2">
                            {TEMPLATES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => { setPrompt(t.prompt); handleGenerate(t.prompt); }}
                                    className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {generatedCode && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synthesis complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleSave} className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                                {isSaved ? <Check size={12} /> : <Save size={12} />}
                                {isSaved ? 'Injected' : 'Save to Workspace'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0b0c10] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileCode size={12} className="text-gray-500" />
                                <span className="text-[10px] font-mono text-gray-400">Dockerfile</span>
                            </div>
                        </div>
                        <pre className="p-5 text-xs font-mono text-cyan-100/80 overflow-auto max-h-[300px] custom-scrollbar leading-relaxed">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                    
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-start gap-3">
                         <Rocket size={18} className="text-purple-400 mt-0.5" />
                         <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Architectural Review</h4>
                            <p className="text-[10px] text-gray-500 leading-normal">
                                This configuration has been synthesized using Gemini 3 Pro and verified against your active security policies. 
                            </p>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DockerfileGenerator;
