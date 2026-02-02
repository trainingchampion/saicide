
import React, { useState, useRef, useCallback } from 'react';
import { 
    Palette, 
    Upload, 
    Sparkles, 
    RefreshCw, 
    Save, 
    Code2, 
    ImageIcon, 
    Wand2, 
    X, 
    Check, 
    ArrowRight, 
    Eye, 
    Monitor, 
    Zap, 
    Layout, 
    Layers, 
    Type, 
    Component, 
    Globe, 
    ShieldCheck, 
    BookOpen, 
    Activity 
} from 'lucide-react';
import aiService from '../services/geminiService';

interface StitchStudioPaneProps {
  onCollapse: () => void;
  onSaveFile: (path: string, content: string) => void;
  activeModelId: string;
}

interface Workbench {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    prompt: string;
    color: string;
}

const WORKBENCHES: Workbench[] = [
    { 
        id: 'refactor', 
        label: 'Logic Refactor', 
        icon: <Code2 size={16} />, 
        description: "Analyze code for performance bottlenecks and modern patterns.",
        prompt: "Act as a Senior Principal Engineer. Refactor the provided code to use modern ESNext/TypeScript patterns, optimize for time complexity, and ensure dry principles are followed. Provide ONLY the refactored code block.",
        color: "text-blue-400"
    },
    { 
        id: 'security', 
        label: 'Security Shield', 
        icon: <ShieldCheck size={16} />, 
        description: "Perform a deep-logic scan for OWASP vulnerabilities and leakages.",
        prompt: "Act as a Security Researcher. Scrutinize the provided code for security flaws, hardcoded secrets, and injection vulnerabilities. Return a markdown table of findings and a hardened version of the code.",
        color: "text-emerald-400"
    },
    { 
        id: 'docs', 
        label: 'Spec Architect', 
        icon: <BookOpen size={16} />, 
        description: "Generate comprehensive technical specs and JSDoc annotations.",
        prompt: "Act as a Technical Architect. Analyze the code and generate a formal architecture spec including: Purpose, Parameters, Returns, Complexity, and an usage example. Output in professional Markdown.",
        color: "text-purple-400"
    },
];

const DESIGN_SYSTEMS = [
    { id: 'stitch', name: 'Google Stitch', provider: 'Material 3+', tokens: true },
    { id: 'tailwind', name: 'Tailwind UI', provider: 'Utility First', tokens: false },
    { id: 'carbon', name: 'IBM Carbon', provider: 'Enterprise', tokens: true }
];

const StitchStudioPane: React.FC<StitchStudioPaneProps> = ({ onCollapse, onSaveFile, activeModelId }) => {
    const [activeTab, setActiveTab] = useState<'ui' | 'code'>('ui');

    // UI Stitch State
    const [image, setImage] = useState<string | null>(null);
    const [isProcessingUI, setIsProcessingUI] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [designSystem, setDesignSystem] = useState(DESIGN_SYSTEMS[2]);
    const [isCodeSaved, setIsCodeSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Code Synthesis State
    const [activeWorkbench, setActiveWorkbench] = useState<Workbench>(WORKBENCHES[0]);
    const [inputCode, setInputCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [codeOutput, setCodeOutput] = useState<string | null>(null);
    const [isCodeSynthSaved, setIsCodeSynthSaved] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSynthesizeUI = async () => {
        if (!image) return;
        setIsProcessingUI(true);
        setGeneratedCode(null);
        setIsCodeSaved(false);

        try {
            // Check if user is using an image-capable model
            const modelToUse = activeModelId.includes('image') ? activeModelId : 'gemini-2.5-flash-image';
            const base64Data = image.split(',')[1];
            const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

            const res = await aiService.getChatResponse({
                prompt: `Convert this design into a pixel-perfect React component using the ${designSystem.name} Design System.
                Requirements:
                - Use ${designSystem.name} design tokens and CSS variables.
                - If Google Stitch is selected, strictly follow Material 3 token naming (e.g., md-sys-color-primary).
                - Ensure the layout is fluid and utilizes semantic HTML5.
                - Implement accessibility (ARIA roles).
                - Return ONLY the TypeScript/React code block.`,
                modelId: modelToUse,
                attachments: [{
                    data: base64Data,
                    mimeType: mimeType,
                    name: 'mockup.png'
                }]
            });

            const text = res.text || '';
            const codeMatch = text.match(/```(?:jsx|tsx|html|js)?\n([\s\S]*?)```/);
            setGeneratedCode(codeMatch ? codeMatch[1] : text || "Synthesis failed.");
        } catch (error) {
            console.error(error);
            setGeneratedCode("// Error in Stitch Synthesis Pipeline. Please verify your Neural API Key and Model compatibility.");
        } finally {
            setIsProcessingUI(false);
        }
    };

    const handleSaveUI = () => {
        if (!generatedCode) return;
        const fileName = `StitchComponent_${Date.now()}.tsx`;
        onSaveFile(`src/components/stitch/${fileName}`, generatedCode);
        setIsCodeSaved(true);
        setTimeout(() => setIsCodeSaved(false), 2000);
    };

    const handleRunCodeSynthesis = async () => {
        if (!inputCode.trim()) return;
        setIsGeneratingCode(true);
        setCodeOutput(null);
        setIsCodeSynthSaved(false);

        try {
            const response = await aiService.getChatResponse({
                prompt: `${activeWorkbench.prompt}\n\nINPUT CODE:\n${inputCode}`,
                modelId: activeModelId
            });
            setCodeOutput(response.text || 'Synthesis yielded no results.');
        } catch (e) {
            setCodeOutput('Critical failure in neural synthesis pipeline.');
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleSaveCode = () => {
        if (!codeOutput) return;
        const fileName = `${activeWorkbench.id}_synthesis_${Date.now()}.md`;
        onSaveFile(`studio/${fileName}`, codeOutput);
        setIsCodeSynthSaved(true);
        setTimeout(() => setIsCodeSynthSaved(false), 2000);
    };

    return (
        <div className="flex h-full w-full bg-[#0b0e14] overflow-hidden text-white font-sans">
            <main className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-[#0f111a]/30 flex justify-between items-start shrink-0">
                    <div>
                        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                            <Component size={24} className="text-blue-400" />
                            Stitch Studio
                        </h1>
                        <p className="text-sm text-gray-500 max-w-lg">Synthesize pixel-perfect UI from mockups or refactor complex logic with AI.</p>
                    </div>
                    <button onClick={onCollapse} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={24}/></button>
                </div>
                
                <div className="px-8 border-b border-white/5 flex gap-2">
                    <button onClick={() => setActiveTab('ui')} className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 ${activeTab==='ui' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-white'}`}><Palette size={16}/> UI Stitch</button>
                    <button onClick={() => setActiveTab('code')} className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 ${activeTab==='code' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-white'}`}><Code2 size={16}/> Code Synthesis</button>
                </div>

                {activeTab === 'ui' ? (
                     <div className="flex-1 flex divide-x divide-white/5 overflow-hidden">
                        {/* Left: Canvas & Controls */}
                        <div className="w-1/2 flex flex-col p-8 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon size={12} /> Visual Mockup
                                </h3>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video bg-[#0d1117] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                >
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    {image ? (
                                        <img src={image} alt="Mockup" className="max-w-full max-h-full object-contain rounded-lg" />
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 border border-white/5 group-hover:border-blue-500/20 transition-all mb-4">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-300">Drop your design here</p>
                                            <p className="text-xs text-gray-500">or click to browse. Supports PNG, JPG, WebP.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Design System</label>
                                <select 
                                    value={designSystem.id} 
                                    onChange={(e) => setDesignSystem(DESIGN_SYSTEMS.find(ds => ds.id === e.target.value) || DESIGN_SYSTEMS[0])}
                                    className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                                >
                                    {DESIGN_SYSTEMS.map(ds => <option key={ds.id} value={ds.id}>{ds.name} ({ds.provider})</option>)}
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleSynthesizeUI} 
                                disabled={isProcessingUI || !image}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-900/20 transition-all disabled:opacity-30 disabled:grayscale active:scale-[0.98] flex items-center justify-center gap-3 mt-auto"
                            >
                                {isProcessingUI ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                {isProcessingUI ? 'Stitching...' : 'Synthesize Component'}
                            </button>
                        </div>
                        
                        {/* Right: Code Output */}
                        <div className="w-1/2 flex flex-col p-8 gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Code2 size={12} /> Synthesized Output
                                </h3>
                                {generatedCode && (
                                    <button 
                                        onClick={handleSaveUI}
                                        className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1.5 hover:underline"
                                    >
                                        {isCodeSaved ? <Check size={12} /> : <Save size={12} />}
                                        {isCodeSaved ? 'Injected' : 'Save to Workspace'}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-inner relative">
                                {isProcessingUI ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 space-y-4">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Neural engine processing...</span>
                                    </div>
                                ) : null}
                                {generatedCode ? (
                                    <pre className="p-4 text-[11px] font-mono h-full overflow-auto custom-scrollbar text-cyan-100/80 leading-relaxed">
                                        <code>{generatedCode}</code>
                                    </pre>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <Layers size={48} strokeWidth={1} className="mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Mockup</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                         <nav className="w-72 border-r border-white/5 bg-[#0f111a] p-6 flex flex-col gap-8 flex-shrink-0">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Workbenches</h3>
                            <div className="space-y-1.5">
                                {WORKBENCHES.map(wb => (
                                    <button 
                                        key={wb.id} 
                                        onClick={() => { setActiveWorkbench(wb); setCodeOutput(null); }} 
                                        className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group ${activeWorkbench.id === wb.id ? 'bg-white/5 text-white border border-white/10 shadow-xl' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] border border-transparent'}`}
                                    >
                                        <div className={`transition-transform group-hover:scale-110 ${activeWorkbench.id === wb.id ? wb.color : 'text-gray-600'}`}>
                                            {wb.icon}
                                        </div>
                                        <span className="text-xs font-bold">{wb.label}</span>
                                    </button>
                                ))}
                            </div>
                        </nav>
                        <div className="flex-1 flex overflow-hidden p-8 gap-8">
                            {/* Input Field */}
                            <div className="flex-1 flex flex-col space-y-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Code2 size={14} /> Source logic</span>
                                <textarea value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Paste code to synthesize..." className="flex-1 bg-[#0d1117] border border-white/5 rounded-[2rem] p-6 font-mono text-sm text-blue-100/70 focus:outline-none focus:border-blue-500/30 shadow-inner resize-none custom-scrollbar"/>
                                <button onClick={handleRunCodeSynthesis} disabled={isGeneratingCode || !inputCode.trim()} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-900/20 transition-all disabled:opacity-30 disabled:grayscale active:scale-[0.98] flex items-center justify-center gap-3 mt-auto">
                                    {isGeneratingCode ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    {isGeneratingCode ? 'Synthesizing...' : 'Run Analysis'}
                                </button>
                            </div>

                            {/* Right: Output */}
                            <div className="flex-1 flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} /> Analysis Result
                                    </h3>
                                    {codeOutput && (
                                        <button 
                                            onClick={handleSaveCode}
                                            className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1.5 hover:underline"
                                        >
                                            {isCodeSynthSaved ? <Check size={12} /> : <Save size={12} />}
                                            {isCodeSynthSaved ? 'Injected' : 'Save Report'}
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-inner relative">
                                    {isGeneratingCode ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 space-y-4">
                                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Neural engine processing...</span>
                                        </div>
                                    ) : null}
                                    {codeOutput ? (
                                        <pre className="p-4 text-[11px] font-mono h-full overflow-auto custom-scrollbar text-purple-100/80 leading-relaxed whitespace-pre-wrap">
                                            {codeOutput}
                                        </pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                            <Code2 size={48} strokeWidth={1} className="mb-4" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Ready for Logic</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StitchStudioPane;
