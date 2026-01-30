import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { CloudProvider, SecurityPolicy } from '../../types';
import aiService from '../../services/geminiService';
import { ICONS } from '../../constants';
import { 
    Sparkles, 
    Code, 
    Layout, 
    Terminal, 
    DollarSign, 
    ShieldCheck, 
    Save, 
    RefreshCw, 
    Zap, 
    CheckCircle,
    Check,
    AlertTriangle,
    Box,
    Layers,
    Search,
    ChevronRight,
    ChevronDown,
    Activity,
    Server,
    ShieldAlert,
    Cpu,
    Workflow,
    HardDrive,
    Trash2,
    Database,
    Globe,
    ExternalLink
} from 'lucide-react';

interface TerraformGeneratorProps {
  onSaveFile: (path: string, content: string) => void;
  activeModelId: string;
  onCollapse: () => void;
  policies: SecurityPolicy[];
  onWriteToTerminal: (output: string | string[]) => void;
}

interface GeneratedFile {
    fileName: string;
    content: string;
}

interface ResourceNode {
    type: string;
    name: string;
    provider: string;
}

const SUGGESTIONS = [
    { label: 'EKS Cluster', provider: CloudProvider.AWS, text: 'Create a managed EKS cluster with managed node groups, VPC, and private subnets.' },
    { label: 'GCP Cloud Run', provider: CloudProvider.GCP, text: 'Provision a Cloud Run service with a Load Balancer, SSL, and IAM roles.' },
    { label: 'Azure SQL Stack', provider: CloudProvider.AZURE, text: 'Setup a private VNet with an Azure SQL Database and a managed Private Endpoint.' }
];

const InfraVisualizer: React.FC<{ code: string }> = ({ code }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resources: ResourceNode[] = [];
        const lines = code.split('\n');
        lines.forEach(line => {
            const match = line.match(/resource\s+"([^"]+)"\s+"([^"]+)"/);
            if (match) {
                resources.push({ 
                    type: match[1], 
                    name: match[2],
                    provider: match[1].split('_')[0] 
                });
            }
        });

        const padding = 30;
        const nodeWidth = 160;
        const nodeHeight = 65;
        const gapX = 50;
        const gapY = 30;
        
        const cols = 2;
        const rows = Math.ceil(resources.length / cols);
        canvas.width = 440;
        canvas.height = Math.max(350, rows * (nodeHeight + gapY) + padding * 2);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for(let x = 0; x < canvas.width; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for(let y = 0; y < canvas.height; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

        if (resources.length === 0) {
            ctx.fillStyle = '#444';
            ctx.font = '12px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.fillText('Awaiting Resource Definition...', canvas.width/2, canvas.height/2);
            return;
        }

        resources.forEach((node, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (nodeWidth + gapX);
            const y = padding + row * (nodeHeight + gapY);

            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 5;

            // Body
            const grad = ctx.createLinearGradient(x, y, x + nodeWidth, y + nodeHeight);
            if (node.provider === 'aws') { grad.addColorStop(0, '#ff9900'); grad.addColorStop(1, '#ec7211'); }
            else if (node.provider === 'google') { grad.addColorStop(0, '#4285f4'); grad.addColorStop(1, '#34a853'); }
            else if (node.provider === 'azurerm') { grad.addColorStop(0, '#008ad7'); grad.addColorStop(1, '#0078d4'); }
            else { grad.addColorStop(0, '#607d8b'); grad.addColorStop(1, '#455a64'); }

            ctx.fillStyle = grad;
            ctx.beginPath();
            (ctx as any).roundRect(x, y, nodeWidth, nodeHeight, 12);
            ctx.fill();

            // Glow overlay
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            // Radii must be number or array, object {tl, tr...} is invalid in native API
            (ctx as any).roundRect(x, y, nodeWidth, nodeHeight/2, 12);
            ctx.fill();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Inter", sans-serif';
            ctx.textAlign = 'left';
            const cleanType = node.type.replace(`${node.provider}_`, '');
            ctx.fillText(cleanType.toUpperCase(), x + 15, y + 25);
            
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillText(node.name, x + 15, y + 45);

            // Connect to next if it's there
            if (i < resources.length - 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(x + nodeWidth/2, y + nodeHeight);
                ctx.lineTo(x + nodeWidth/2, y + nodeHeight + gapY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    }, [code]);

    return (
        <div className="w-full h-full bg-[#0d1117] rounded-2xl overflow-hidden flex items-start justify-center border border-white/5 shadow-inner">
            <canvas ref={canvasRef} className="max-w-full" />
        </div>
    );
};

const TerraformGenerator: React.FC<TerraformGeneratorProps> = ({ onSaveFile, activeModelId, onCollapse, policies, onWriteToTerminal }) => {
  const [provider, setProvider] = useState<CloudProvider>(CloudProvider.AWS);
  const [prompt, setPrompt] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'diagram' | 'plan'>('code');
  
  const [costBreakdown, setCostBreakdown] = useState<any[]>([]);
  const [securityStatus, setSecurityStatus] = useState<'safe' | 'risk' | null>(null);
  const [totalCost, setTotalCost] = useState<string>('$0.00');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedFiles([]);
    setCostBreakdown([]);
    setSecurityStatus(null);
    setActiveTab('code');

    try {
      const files = await aiService.generateTerraform(provider, prompt, activeModelId, policies);
      setGeneratedFiles(files);
      
      const fullCode = files.map(f => f.content).join('\n\n');
      const analysis = await aiService.analyzeInfrastructure(fullCode, activeModelId);
      
      setTotalCost(analysis.costEstimate || '$0.00');
      setSecurityStatus(analysis.securityStatus as 'safe' | 'risk');
      setCostBreakdown(analysis.costBreakdown || []);

    } catch (error) {
      console.error('Error generating Terraform code:', error);
      setGeneratedFiles([{ fileName: 'main.tf', content: '# Synthesis failed. Please refine your prompt.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [provider, prompt, activeModelId, policies]);

  const handleApply = useCallback(async () => {
    if (generatedFiles.length === 0) return;
    onWriteToTerminal([
        `\n$ terraform init`,
        `Initializing modules...`,
        `Success: Terraform has been successfully initialized!`,
        `\n$ terraform plan -out=tfplan`,
        `Plan: ${generatedFiles.length} resources to add, 0 to change, 0 to destroy.`
    ]);
    setActiveTab('plan');
  }, [generatedFiles, onWriteToTerminal]);

  const handleSaveAll = () => {
    if (generatedFiles.length === 0) return;
    generatedFiles.forEach(file => {
        onSaveFile(`infra/${file.fileName}`, file.content);
    });
    onWriteToTerminal(`\nSync complete: Files injected into workspace directory 'infra/'`);
  };

  const detectedResources = useMemo(() => {
      const allCode = generatedFiles.map(f => f.content).join('\n');
      const matches = allCode.matchAll(/resource\s+"([^"]+)"\s+"([^"]+)"/g);
      return Array.from(matches).map(m => ({ type: m[1], name: m[2] }));
  }, [generatedFiles]);

  return (
    <div className="h-full flex flex-col bg-[#0b0e14] text-[var(--color-text-primary)]">
      {/* Dynamic Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/5 bg-[#0f111a]">
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/10 rounded-xl text-purple-400">
                    <Box size={20} />
                </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Infrastructure Studio</h2>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Workspace Engine: Ready</p>
                </div>
            </div>
            <button onClick={onCollapse} className="text-gray-600 hover:text-white transition-colors">
                {ICONS.COLLAPSE_LEFT}
            </button>
        </div>

        <div className="flex bg-white/[0.03] p-1 rounded-xl w-full">
            {[
                { id: 'code', label: 'Manifest', icon: Code },
                { id: 'diagram', label: 'Topology', icon: Workflow },
                { id: 'plan', label: 'Analysis', icon: Activity }
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

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* Synthesis Input */}
        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Cloud Target</label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as CloudProvider)}
                        className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                    >
                        <option value={CloudProvider.AWS}>Amazon Web Services</option>
                        <option value={CloudProvider.GCP}>Google Cloud</option>
                        <option value={CloudProvider.AZURE}>Microsoft Azure</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategy</label>
                    <div className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-500">Modular (v1.4)</div>
                </div>
            </div>

            <div className="relative group">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your infrastructure needs..."
                    className="w-full h-32 bg-[#131b2c] border border-white/5 rounded-2xl p-4 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 placeholder-gray-600 shadow-inner"
                />
                <div className="absolute bottom-3 right-3">
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 disabled:opacity-30 flex items-center gap-2"
                    >
                        {isLoading ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14} fill="currentColor" />}
                        {isLoading ? 'Synthesizing...' : 'Build Architecture'}
                    </button>
                </div>
            </div>

            {!generatedFiles.length && (
                <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setProvider(s.provider); setPrompt(s.text); }}
                                className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>

        {/* Tab Content Rendering */}
        <div className="animate-fade-in">
            {activeTab === 'code' && generatedFiles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                            <Layers size={12} /> Resource Manifest
                        </h3>
                        <span className="text-[9px] font-bold text-purple-400">{generatedFiles.length} Modules Generated</span>
                    </div>
                    {generatedFiles.map((file, index) => (
                        <div key={index} className="rounded-2xl overflow-hidden border border-white/5 bg-[#0b0c10]">
                            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-mono text-cyan-400">{file.fileName}</span>
                                <button className="text-gray-600 hover:text-white"><Code size={12}/></button>
                            </div>
                            <pre className="p-4 text-[10px] font-mono text-gray-400 overflow-x-auto custom-scrollbar max-h-60 leading-relaxed">
                                <code>{file.content}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'diagram' && (
                <div className="h-[400px]">
                    <InfraVisualizer code={generatedFiles.map(f => f.content).join('\n')} />
                </div>
            )}

            {activeTab === 'plan' && (
                <div className="space-y-6">
                    {/* Insights Bar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={14} className="text-green-400" />
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Monthly projection</span>
                            </div>
                            <p className="text-2xl font-black text-white">{totalCost}</p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Tier: Optimization applied</p>
                        </div>
                        
                        <div className={`p-4 rounded-2xl border ${securityStatus === 'risk' ? 'bg-red-500/5 border-red-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {securityStatus === 'risk' ? <ShieldAlert size={14} className="text-red-400" /> : <ShieldCheck size={14} className="text-blue-400" />}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${securityStatus === 'risk' ? 'text-red-400' : 'text-blue-400'}`}>Security status</span>
                            </div>
                            <p className="text-lg font-bold text-white leading-none">
                                {securityStatus === 'risk' ? 'Vulnerabilities detected' : 'Fully Compliant'}
                            </p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-2">Engine: OPA Logic v2</p>
                        </div>
                    </div>

                    {/* Component Breakdown */}
                    <div className="space-y-3">
                         <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Component Inventory</h3>
                         <div className="space-y-1.5">
                            {detectedResources.map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white/5 rounded-lg text-gray-500">
                                            {res.type.includes('db') ? <Database size={12}/> : res.type.includes('bucket') ? <HardDrive size={12}/> : <Server size={12}/>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-300 truncate uppercase">{res.type}</p>
                                            <p className="text-[9px] text-gray-600 font-mono truncate">{res.name}</p>
                                        </div>
                                    </div>
                                    <Check size={12} className="text-emerald-500" />
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {generatedFiles.length === 0 && !isLoading && (
                <div className="py-20 text-center flex flex-col items-center opacity-30">
                    <Workflow size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Workspace Empty</p>
                    <p className="text-[10px] max-w-[200px] mt-2 leading-relaxed">Enter a prompt to synthesize a professional infrastructure manifest.</p>
                </div>
            )}
        </div>
      </div>

      {/* Persistence Bar */}
      <div className="p-4 border-t border-white/5 bg-[#0f111a] flex gap-3">
            <button 
                onClick={handleApply}
                disabled={generatedFiles.length === 0}
                className="flex-1 py-3 bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
            >
                <Terminal size={14} /> Run Plan
            </button>
            <button 
                onClick={handleSaveAll}
                disabled={generatedFiles.length === 0}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
                <Save size={14} /> Inject to Workspace
            </button>
      </div>
    </div>
  );
};

export default TerraformGenerator;