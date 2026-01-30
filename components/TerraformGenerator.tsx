
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CloudProvider, SecurityPolicy } from '../types';
import aiService from '../services/geminiService';
import creatorService from '../services/creatorService';
import { ICONS } from '../constants';
import { 
    Sparkles, 
    Code, 
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
    Activity,
    Server,
    ShieldAlert,
    Cpu,
    Workflow,
    HardDrive,
    Database,
    FileText
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

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

const SUGGESTIONS = [
    { label: 'EKS Cluster', provider: CloudProvider.AWS, text: 'Create a managed EKS cluster with managed node groups, VPC, and private subnets.' },
    { label: 'GCP Cloud Run', provider: CloudProvider.GCP, text: 'Provision a Cloud Run service with a Load Balancer, SSL, and IAM roles.' },
    { label: 'Azure SQL Stack', provider: CloudProvider.AZURE, text: 'Setup a private VNet with an Azure SQL Database and a managed Private Endpoint.' },
    { label: 'Serverless API', provider: CloudProvider.AWS, text: 'Build a serverless API with API Gateway, Lambda functions, and DynamoDB for data storage.' },
    { label: 'Data Pipeline', provider: CloudProvider.GCP, text: 'Create a real-time data ingestion pipeline using Pub/Sub, Cloud Functions, and BigQuery.' },
    { label: 'Static Site (CDN)', provider: CloudProvider.AZURE, text: 'Deploy a static website on Azure Blob Storage with Azure CDN for global delivery.' },
];

const TerraformGenerator: React.FC<TerraformGeneratorProps> = ({ onSaveFile, activeModelId, onCollapse, policies, onWriteToTerminal }) => {
  const [provider, setProvider] = useState<CloudProvider>(CloudProvider.AWS);
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState<'prompt' | 'review' | 'code'>('prompt');
  
  const [design, setDesign] = useState<{ description: string, diagram: string } | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [isLoadingIaC, setIsLoadingIaC] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'design' | 'topology' | 'code' | 'analysis'>('design');
  
  const [analysis, setAnalysis] = useState<{ costEstimate: string, securityStatus: 'safe' | 'risk', costBreakdown: any[] } | null>(null);

  const handleGenerateDesign = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoadingDesign(true);
    setDesign(null);
    setGeneratedFiles([]);
    setAnalysis(null);
    setStage('prompt');

    try {
        const result = await creatorService.runSystemArchitect({ systemDescription: prompt, scale: 'default', constraints: provider }, activeModelId);
        setDesign(result);
        setStage('review');
        setActiveTab('design');
    } catch (error) {
        console.error('Error generating design:', error);
    } finally {
        setIsLoadingDesign(false);
    }
  }, [provider, prompt, activeModelId]);

  const handleGenerateIaC = useCallback(async () => {
      if (!design?.diagram) return;
      setIsLoadingIaC(true);
      setGeneratedFiles([]);
      setAnalysis(null);

      try {
          const iacCode = await creatorService.generateIaCFromDiagram(design.diagram, activeModelId);
          // Simple multi-file parsing for now
          const filesRaw = iacCode.split('// FILE: ').filter(f => f.trim());
          if (filesRaw.length > 1) {
              const files = filesRaw.map(f => {
                  const firstLineEnd = f.indexOf('\n');
                  const fileName = f.substring(0, firstLineEnd).trim();
                  const content = f.substring(firstLineEnd + 1).trim();
                  return { fileName, content };
              });
              setGeneratedFiles(files);
          } else {
              setGeneratedFiles([{ fileName: 'main.tf', content: iacCode }]);
          }
          
          const analysisResult = await aiService.analyzeInfrastructure(iacCode, activeModelId);
          setAnalysis(analysisResult);
          setStage('code');
          setActiveTab('code');

      } catch (error) {
          console.error("Error generating IaC", error);
      } finally {
          setIsLoadingIaC(false);
      }
  }, [design, activeModelId]);

  const handleSaveAll = () => {
    if (generatedFiles.length === 0) return;
    generatedFiles.forEach(file => onSaveFile(`infra/${file.fileName}`, file.content));
    onWriteToTerminal(`\nSync complete: Files injected into workspace directory 'infra/'`);
  };

  const TABS = [
      { id: 'design', label: 'Design', icon: FileText, available: stage !== 'prompt' },
      { id: 'topology', label: 'Topology', icon: Workflow, available: stage !== 'prompt' },
      { id: 'code', label: 'IaC Code', icon: Code, available: stage === 'code' },
      { id: 'analysis', label: 'Analysis', icon: Activity, available: stage === 'code' }
  ];

  return (
    <div className="h-full flex flex-col bg-[#0b0e14] text-[var(--color-text-primary)]">
      <div className="flex-shrink-0 p-4 border-b border-white/5 bg-[#0f111a]">
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/10 rounded-xl text-purple-400"> <Box size={20} /> </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Infrastructure Studio</h2>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Workspace Engine: Ready</p>
                </div>
            </div>
            <button onClick={onCollapse} className="text-gray-600 hover:text-white transition-colors">{ICONS.COLLAPSE_LEFT}</button>
        </div>
        <div className="flex bg-white/[0.03] p-1 rounded-xl w-full">
            {TABS.map(t => (
                <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    disabled={!t.available}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white/5 text-white shadow-lg' : 'text-gray-600'} ${!t.available ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-400'}`}
                > <t.icon size={12} /> {t.label} </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Cloud Target</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value as CloudProvider)} className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none">
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
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your infrastructure needs..." className="w-full h-32 bg-[#131b2c] border border-white/5 rounded-2xl p-4 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 placeholder-gray-600 shadow-inner"/>
                <div className="absolute bottom-3 right-3">
                    <button onClick={handleGenerateDesign} disabled={isLoadingDesign || !prompt.trim()} className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 disabled:opacity-30 flex items-center gap-2">
                        {isLoadingDesign ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14} fill="currentColor" />}
                        {isLoadingDesign ? 'Designing...' : 'Design Architecture'}
                    </button>
                </div>
            </div>
        </section>

        {stage === 'prompt' && (
            <div className="py-20 text-center flex flex-col items-center opacity-30">
                <Workflow size={48} strokeWidth={1} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Design Prompt</p>
                <p className="text-[10px] max-w-[200px] mt-2 leading-relaxed">Describe your desired system to begin the architectural synthesis process.</p>
            </div>
        )}

        {stage !== 'prompt' && (
            <div className="animate-fade-in">
                {activeTab === 'design' && design && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 prose prose-invert prose-sm max-w-none">
                        <MarkdownRenderer content={design.description} />
                    </div>
                )}
                {activeTab === 'topology' && design && (
                    <div className="bg-[#0b0c10] rounded-2xl border border-white/5 p-4">
                        <pre className="text-xs text-cyan-300 font-mono"><code>{`graph TD\n${design.diagram}`}</code></pre>
                    </div>
                )}
                {activeTab === 'code' && generatedFiles.length > 0 && (
                     <div className="space-y-4">
                        {generatedFiles.map((file, index) => (
                            <div key={index} className="rounded-2xl overflow-hidden border border-white/5 bg-[#0b0c10]">
                                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center"><span className="text-[10px] font-mono text-cyan-400">{file.fileName}</span><button className="text-gray-600 hover:text-white"><Code size={12}/></button></div>
                                <pre className="p-4 text-[10px] font-mono text-gray-400 overflow-x-auto custom-scrollbar max-h-60 leading-relaxed"><code>{file.content}</code></pre>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'analysis' && analysis && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl"><div className="flex items-center gap-2 mb-2"><DollarSign size={14} className="text-green-400" /><span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Monthly projection</span></div><p className="text-2xl font-black text-white">{analysis.costEstimate}</p></div>
                            <div className={`p-4 rounded-2xl border ${analysis.securityStatus === 'risk' ? 'bg-red-500/5 border-red-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}><div className="flex items-center gap-2 mb-2">{analysis.securityStatus === 'risk' ? <ShieldAlert size={14} className="text-red-400" /> : <ShieldCheck size={14} className="text-blue-400" />}<span className={`text-[10px] font-black uppercase tracking-widest ${analysis.securityStatus === 'risk' ? 'text-red-400' : 'text-blue-400'}`}>Security status</span></div><p className="text-lg font-bold text-white leading-none">{analysis.securityStatus === 'risk' ? 'Vulnerabilities detected' : 'Fully Compliant'}</p></div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0f111a] flex gap-3">
        {stage === 'review' && (
            <button onClick={handleGenerateIaC} disabled={isLoadingIaC} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                {isLoadingIaC ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
                {isLoadingIaC ? 'Generating...' : 'Generate IaC Manifest'}
            </button>
        )}
        {stage === 'code' && (
            <>
                <button onClick={() => { onWriteToTerminal('$ terraform plan'); setActiveTab('analysis'); }} className="flex-1 py-3 bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"><Terminal size={14} /> Run Plan</button>
                <button onClick={handleSaveAll} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"><Save size={14} /> Inject to Workspace</button>
            </>
        )}
      </div>
    </div>
  );
};

export default TerraformGenerator;
