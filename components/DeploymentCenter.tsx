
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Rocket, Terminal, RefreshCw, X, Upload, Copy, Sparkles } from 'lucide-react';
import { FileNode } from '../types';
import aiService from '../services/geminiService';

// Free-tier deployment targets
const DEPLOYMENT_TARGETS = [
  { 
    id: 'azure-webapp-free',
    name: 'Azure App Service', 
    tier: 'Free F1',
    provider: 'Azure',
    description: 'Node.js/Python web apps with free SSL',
    command: (name: string) => `az webapp up --name ${name} --sku F1 --runtime "NODE:20-lts"`,
    icon: '🔷',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  { 
    id: 'azure-swa',
    name: 'Azure Static Web Apps', 
    tier: 'Free',
    provider: 'Azure',
    description: 'Static sites + serverless APIs',
    command: (name: string) => `az staticwebapp create --name ${name} --resource-group sai-deployments`,
    icon: '⚡',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  { 
    id: 'azure-functions',
    name: 'Azure Functions', 
    tier: 'Consumption',
    provider: 'Azure',
    description: 'Serverless functions (1M free requests/mo)',
    command: (name: string) => `func azure functionapp publish ${name}`,
    icon: 'λ',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  { 
    id: 'netlify',
    name: 'Netlify', 
    tier: 'Free',
    provider: 'Netlify',
    description: 'Static sites with CI/CD',
    command: () => `npx netlify-cli deploy --prod`,
    icon: '◆',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10'
  },
  { 
    id: 'vercel',
    name: 'Vercel', 
    tier: 'Hobby',
    provider: 'Vercel',
    description: 'Next.js & static sites',
    command: () => `npx vercel --prod`,
    icon: '▲',
    color: 'text-white',
    bg: 'bg-white/10'
  },
  { 
    id: 'gcp-cloudrun',
    name: 'GCP Cloud Run', 
    tier: 'Free Tier',
    provider: 'GCP',
    description: 'Containerized apps (2M free requests/mo)',
    command: (name: string) => `gcloud run deploy ${name} --source . --allow-unauthenticated`,
    icon: '☁️',
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  },
  { 
    id: 'firebase',
    name: 'Firebase Hosting', 
    tier: 'Spark (Free)',
    provider: 'Firebase',
    description: 'Static + dynamic hosting',
    command: () => `firebase deploy --only hosting`,
    icon: '🔥',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  },
  { 
    id: 'github-pages',
    name: 'GitHub Pages', 
    tier: 'Free',
    provider: 'GitHub',
    description: 'Static sites from repo',
    command: () => `npx gh-pages -d dist`,
    icon: '🐙',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
];

interface DeploymentCenterProps {
  onClose: () => void;
  authenticatedProviders: string[];
  fileStructure: FileNode;
  onRunInTerminal: (cmd: string) => void;
  activeModelId: string;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = ({ onClose, fileStructure, onRunInTerminal, activeModelId }) => {
  const [projectName, setProjectName] = useState(() => {
    const baseName = fileStructure.name || 'sai-app';
    return baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32);
  });
  const [selectedTarget, setSelectedTarget] = useState(DEPLOYMENT_TARGETS[0]);
  const [logs, setLogs] = useState<string[]>(['[system] Deployment Center ready. Select a target and deploy.']);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'cmd' = 'info') => {
    const colors: Record<string, string> = {
      info: 'text-gray-400',
      success: 'text-emerald-400',
      error: 'text-red-400',
      cmd: 'text-cyan-400'
    };
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `<span class="text-gray-600">[${timestamp}]</span> <span class="${colors[type]}">${message}</span>`]);
  };

  const flattenFiles = (node: FileNode, depth = 0): string => {
    let str = '  '.repeat(depth) + (node.type === 'folder' ? '📁 ' : '📄 ') + node.name + '\n';
    if (node.children) {
      node.children.forEach(c => str += flattenFiles(c, depth + 1));
    }
    return str;
  };

  const workspaceSnapshot = useMemo(() => flattenFiles(fileStructure), [fileStructure]);

  // Detect project type
  const projectType = useMemo(() => {
    const files = workspaceSnapshot.toLowerCase();
    if (files.includes('next.config')) return 'Next.js';
    if (files.includes('vite.config')) return 'Vite';
    if (files.includes('angular.json')) return 'Angular';
    if (files.includes('package.json') && files.includes('index.html')) return 'Static + Node';
    if (files.includes('requirements.txt') || files.includes('.py')) return 'Python';
    if (files.includes('dockerfile')) return 'Docker';
    if (files.includes('package.json')) return 'Node.js';
    return 'Unknown';
  }, [workspaceSnapshot]);

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAiSuggestion(null);
    addLog('Analyzing project structure with AI...', 'info');
    
    try {
      const prompt = `Analyze this project and suggest the best FREE deployment option.

Project files:
${workspaceSnapshot}

Available free targets:
- Azure App Service Free F1 (Node.js/Python web apps)
- Azure Static Web Apps (static + serverless)
- Azure Functions Consumption (serverless)
- Netlify (static sites)
- Vercel (Next.js, static)
- GCP Cloud Run (containers, 2M free req/mo)
- Firebase Hosting (static + dynamic)
- GitHub Pages (static only)

Return a JSON object with:
{
  "recommendedTarget": "target id",
  "reason": "brief explanation",
  "preDeployCommands": ["npm run build", etc],
  "deployCommand": "the actual deploy command",
  "estimatedCost": "$0/month for X requests"
}`;

      const res = await aiService.chat(prompt, activeModelId);
      const parsed = JSON.parse(res.replace(/```json\n?|\n?```/g, '').trim());
      setAiSuggestion(JSON.stringify(parsed, null, 2));
      addLog(`AI recommends: ${parsed.recommendedTarget} - ${parsed.reason}`, 'success');
      
      // Auto-select the recommended target
      const target = DEPLOYMENT_TARGETS.find(t => t.id === parsed.recommendedTarget);
      if (target) {
        setSelectedTarget(target);
      }
      if (parsed.deployCommand) {
        setCustomCommand(parsed.deployCommand);
      }
    } catch (e) {
      addLog('Failed to analyze project. Using default settings.', 'error');
    } finally {
      setIsAnalyzing(false);
      setShowAiAssist(true);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployedUrl(null);
    
    const command = useCustom && customCommand 
      ? customCommand 
      : selectedTarget.command(projectName);
    
    addLog(`Deploying to ${selectedTarget.name} (${selectedTarget.tier})...`, 'info');
    addLog(`$ ${command}`, 'cmd');
    
    // Run the actual command in terminal
    onRunInTerminal(command);
    
    addLog('Command sent to terminal. Watch terminal for deployment progress.', 'info');
    addLog('The actual deployment URL will appear in the terminal output.', 'info');
    
    // Show deployment sent confirmation
    setTimeout(() => {
      setDeployedUrl('pending'); // Just marks that deployment was triggered
      addLog('✓ Deploy command executed. Check terminal for results and URL.', 'success');
      setIsDeploying(false);
    }, 1500);
  };

  const handleCopyCommand = () => {
    const command = useCustom && customCommand 
      ? customCommand 
      : selectedTarget.command(projectName);
    navigator.clipboard.writeText(command);
    addLog('Command copied to clipboard', 'success');
  };

  const getPreDeployCommands = () => {
    const commands: string[] = [];
    if (projectType === 'Next.js' || projectType === 'Vite') {
      commands.push('npm run build');
    }
    if (selectedTarget.provider === 'Azure' && selectedTarget.id !== 'azure-webapp-free') {
      commands.push('az login');
    }
    if (selectedTarget.id === 'netlify') {
      commands.push('npm install -g netlify-cli');
    }
    if (selectedTarget.id === 'vercel') {
      commands.push('npm install -g vercel');
    }
    if (selectedTarget.id === 'firebase') {
      commands.push('npm install -g firebase-tools');
      commands.push('firebase login');
    }
    return commands;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0f111a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Deploy Center</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Free-Tier Cloud Deployment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {projectType}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deployment Name</label>
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="w-full bg-[#131b2c] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            placeholder="my-app-name"
          />
        </div>

        {/* AI Assist Button */}
        <button
          onClick={handleAnalyzeWithAI}
          disabled={isAnalyzing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-purple-600/30 hover:to-pink-600/30 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <><RefreshCw size={14} className="animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles size={14} /> AI: Recommend Best Free Deployment</>
          )}
        </button>

        {/* AI Suggestion */}
        {showAiAssist && aiSuggestion && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
            <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2">AI Recommendation</div>
            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">{aiSuggestion}</pre>
          </div>
        )}

        {/* Deployment Targets Grid */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Target (All Free Tier)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DEPLOYMENT_TARGETS.map(target => (
              <button
                key={target.id}
                onClick={() => { setSelectedTarget(target); setUseCustom(false); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTarget.id === target.id 
                    ? `${target.bg} border-white/20 ring-1 ring-white/10` 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{target.icon}</span>
                  <span className={`text-xs font-bold ${target.color}`}>{target.name}</span>
                </div>
                <div className="text-[9px] text-gray-500 font-medium">{target.tier}</div>
                <div className="text-[8px] text-gray-600 mt-1">{target.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-deploy Commands */}
        {getPreDeployCommands().length > 0 && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pre-Deploy Setup</label>
            <div className="bg-[#131b2c] rounded-xl p-3 space-y-1">
              {getPreDeployCommands().map((cmd, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-600">{i + 1}.</span>
                  <code className="text-cyan-400">{cmd}</code>
                  <button 
                    onClick={() => onRunInTerminal(cmd)}
                    className="ml-auto text-[8px] uppercase font-bold text-gray-500 hover:text-cyan-400 px-2 py-0.5 rounded bg-white/5"
                  >
                    Run
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deploy Command */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deploy Command</label>
            <label className="flex items-center gap-2 text-[9px] text-gray-500">
              <input 
                type="checkbox" 
                checked={useCustom} 
                onChange={(e) => setUseCustom(e.target.checked)}
                className="rounded"
              />
              Custom command
            </label>
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              value={useCustom ? customCommand : selectedTarget.command(projectName)}
              onChange={(e) => { setCustomCommand(e.target.value); setUseCustom(true); }}
              className="flex-1 bg-[#131b2c] border border-white/5 rounded-xl px-4 py-3 text-sm text-cyan-400 font-mono focus:outline-none focus:border-emerald-500/50"
              readOnly={!useCustom}
            />
            <button 
              onClick={handleCopyCommand}
              className="px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
              title="Copy command"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !projectName}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.15em] text-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 ${
            isDeploying 
              ? 'bg-gray-700' 
              : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-900/30'
          }`}
        >
          {isDeploying ? (
            <><RefreshCw size={16} className="animate-spin" /> Deploying...</>
          ) : (
            <><Upload size={16} /> Deploy to {selectedTarget.name}</>
          )}
        </button>

        {/* Deployment Status */}
        {deployedUrl && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                <Terminal size={18} />
              </div>
              <div className="flex-1">
                <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Deployment Command Sent</div>
                <p className="text-sm font-bold text-white">Check the terminal below for your deployment URL</p>
                <div className="mt-2 p-2 bg-black/30 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-mono">Look for output like:</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-1">✓ Service URL: https://your-app.azurewebsites.net</p>
                  <p className="text-[10px] text-emerald-400 font-mono">✓ Live at: https://your-app.netlify.app</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Console Logs */}
        <div className="bg-[#0d1117] border border-white/5 rounded-xl overflow-hidden">
          <div className="bg-[#161b22] px-4 py-2 border-b border-white/5 flex items-center gap-2 text-[9px] font-black uppercase text-gray-500 tracking-widest">
            <Terminal size={12} className="text-cyan-400" />
            <span>Activity Log</span>
          </div>
          <div className="p-4 font-mono text-[11px] max-h-[200px] overflow-y-auto custom-scrollbar leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: log }} />
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Quick Reference */}
        <div className="text-[9px] text-gray-600 space-y-1">
          <div className="font-bold uppercase tracking-widest text-gray-500 mb-2">Free Tier Limits (typical)</div>
          <div>• Azure App Service F1: 60 min CPU/day, 1GB storage</div>
          <div>• Azure Functions: 1M executions/month free</div>
          <div>• Netlify/Vercel: 100GB bandwidth/month</div>
          <div>• GCP Cloud Run: 2M requests/month free</div>
          <div>• Firebase: 10GB/month hosting bandwidth</div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentCenter;

