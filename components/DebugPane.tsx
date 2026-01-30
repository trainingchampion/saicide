
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { 
    Play, 
    Settings, 
    ShieldAlert, 
    Square, 
    Terminal, 
    Package, 
    Command, 
    RotateCw, 
    Cpu, 
    Zap, 
    Activity, 
    Layers, 
    Clock,
    FileCode,
    Hammer,
    Code2,
    Coffee,
    Box,
    Binary,
    Plus,
    Wrench,
    Check,
    AlertTriangle,
    Sparkles,
    Bot
} from 'lucide-react';
import { FileNode, SecurityIssue, Severity } from '../types';
import DebugConfigModal, { DebugConfig } from './modals/DebugConfigModal';
import aiService from '../services/geminiService';

interface DebugPaneProps {
  onCollapse: () => void;
  onRun?: (customCommand?: string) => void;
  activeFile?: FileNode | null;
  securityIssues?: SecurityIssue[];
  fileStructure?: FileNode;
  terminalHistory?: string[];
  activeModelId?: string;
}

interface Task {
    id: string;
    label: string;
    command: string;
    source: string;
    icon?: React.ReactNode;
    description?: string;
}

const DebugPane: React.FC<DebugPaneProps> = ({ 
    onCollapse, 
    onRun, 
    activeFile, 
    securityIssues = [], 
    fileStructure, 
    terminalHistory = [], 
    activeModelId = 'gemini-3-pro-preview' 
}) => {
  const [activeTask, setActiveTask] = useState<{ name: string; startTime: number; command: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fileActions, setFileActions] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'healing'>('tasks');
  
  // Self-Healing State
  const [analyzingError, setAnalyzingError] = useState(false);
  const [suggestedFix, setSuggestedFix] = useState<{ issue: string, fix: string, command: string } | null>(null);
  
  // Configuration State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [debugConfig, setDebugConfig] = useState<DebugConfig>({
      command: 'npm',
      args: 'start',
      env: 'NODE_ENV=development'
  });

  // Governance Check
  const isBlockedByPolicy = useMemo(() => {
      if (!activeFile) return false;
      return securityIssues.some(issue => issue.file === activeFile.name && (issue.severity === Severity.CRITICAL || issue.severity === Severity.HIGH));
  }, [activeFile, securityIssues]);

  const findFile = (node: FileNode | undefined, name: string): string | null => {
      if (!node) return null;
      if (node.type === 'file' && node.name === name && node.content) return node.content;
      if (node.children) {
          for (const child of node.children) {
              const res = findFile(child, name);
              if (res) return res;
          }
      }
      return null;
  };

  useEffect(() => {
      const newTasks: Task[] = [];
      const packageJson = findFile(fileStructure, 'package.json');
      const goMod = findFile(fileStructure, 'go.mod');
      const cargoToml = findFile(fileStructure, 'Cargo.toml');

      if (packageJson) {
          try {
              const json = JSON.parse(packageJson);
              if (json.scripts) {
                  Object.entries(json.scripts).forEach(([name, cmd]) => {
                      newTasks.push({ id: `npm-${name}`, label: name, command: `npm run ${name}`, source: 'npm', icon: <Package size={12}/> });
                  });
              }
          } catch (e) {}
      }

      if (cargoToml) {
          newTasks.push(
              { id: 'cargo-build', label: 'Build', command: 'cargo build', source: 'cargo', icon: <Hammer size={12}/> },
              { id: 'cargo-run', label: 'Run', command: 'cargo run', source: 'cargo', icon: <Play size={12}/> }
          );
      }

      if (goMod) {
          newTasks.push({ id: 'go-run', label: 'Run .', command: 'go run .', source: 'go', icon: <Play size={12}/> });
      }

      setTasks(newTasks);

      const actions: Task[] = [];
      if (activeFile) {
          const ext = activeFile.name.split('.').pop()?.toLowerCase();
          const fileName = activeFile.name;
          if (ext === 'js' || ext === 'ts') actions.push({ id: 'node-run', label: 'Run with Node', command: `node ${fileName}`, source: 'file', icon: <Code2 size={14} className="text-green-400"/> });
          if (ext === 'py') actions.push({ id: 'py-run', label: 'Run Python', command: `python ${fileName}`, source: 'file', icon: <Code2 size={14} className="text-yellow-400"/> });
          if (ext === 'go') actions.push({ id: 'go-run-f', label: 'Go Run', command: `go run ${fileName}`, source: 'file', icon: <Box size={14} className="text-cyan-400"/> });
      }
      setFileActions(actions);
  }, [fileStructure, activeFile]);

  const handleRunTask = (label: string, command: string) => {
      if (isBlockedByPolicy) return;
      setActiveTask({ name: label, startTime: Date.now(), command });
      if (onRun) onRun(command);
  };

  const handleStopTask = () => {
      if (onRun) onRun('\u0003'); // Real SIGINT
      setActiveTask(null);
  };

  const analyzeError = async () => {
      setAnalyzingError(true);
      setSuggestedFix(null);
      try {
          const lastOutput = terminalHistory.slice(-20).join('\n');
          if (!lastOutput.trim()) return;
          const result = await aiService.analyzeTerminalError(lastOutput, activeModelId);
          setSuggestedFix(result);
      } catch (e) { console.error(e); }
      finally { setAnalyzingError(false); }
  };

  const getElapsedTime = () => {
      if (!activeTask) return '';
      const seconds = Math.floor((Date.now() - activeTask.startTime) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0 border-b border-[var(--color-border)] mb-2">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Run & Debug</h2>
        <button onClick={onCollapse} className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="flex px-2 mb-3 bg-black/20 p-1 rounded-lg shrink-0">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-1 text-[10px] font-black uppercase rounded transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}>Tasks</button>
          <button onClick={() => setActiveTab('healing')} className={`flex-1 py-1 text-[10px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'healing' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}><Wrench size={10} /> Self-Healing</button>
      </div>

      {activeTab === 'tasks' ? (
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-5 custom-scrollbar">
            {activeTask && (
                <div className="bg-[#0d1117] border border-cyan-500/30 rounded-xl p-4 shadow-2xl animate-fade-in relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2">
                        <button onClick={handleStopTask} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg transition-colors"><Square size={14} fill="currentColor" /></button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Active Process</h3>
                    </div>
                    <p className="text-[11px] font-mono text-cyan-400 truncate mb-1">{activeTask.command}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Started {getElapsedTime()} ago</p>
                    <div className="mt-4 flex gap-4 border-t border-white/5 pt-3">
                        <div className="flex-1">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Real-time IO</p>
                            <p className="text-xs font-bold text-gray-300">Connected</p>
                        </div>
                    </div>
                </div>
            )}

            {isBlockedByPolicy && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 animate-fade-in">
                    <ShieldAlert size={20} className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase">Blocked by Governance</h4>
                        <p className="text-[10px] text-red-300/70 mt-1">High-severity security issues must be resolved before this file can be executed.</p>
                    </div>
                </div>
            )}

            {fileActions.length > 0 && (
                <section>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1">Active File</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {fileActions.map(task => (
                            <button key={task.id} onClick={() => handleRunTask(task.label, task.command)} disabled={isBlockedByPolicy} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-xl transition-all group disabled:opacity-30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white">{task.icon}</div>
                                    <span className="text-xs font-bold">{task.label}</span>
                                </div>
                                <Play size={12} className="text-gray-600 group-hover:text-emerald-400" fill="currentColor" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {tasks.length > 0 && (
                <section>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1">Workspace Tasks</h3>
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-gray-500">{task.icon}</div>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white truncate">{task.label}</span>
                                    </div>
                                    <p className="text-[9px] font-mono text-gray-600 truncate">{task.command}</p>
                                </div>
                                <button onClick={() => handleRunTask(task.label, task.command)} className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 transition-all"><Play size={14} fill="currentColor" /></button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <button onClick={() => setIsConfigModalOpen(true)} className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/10 hover:border-white/30 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-300 transition-all">
                <Plus size={14} /> Custom Execution...
            </button>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                      <Wrench className="text-indigo-400" size={18} /> Self-Healing Runtime
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-6 leading-relaxed relative z-10">AI agents will analyze the real terminal stream to diagnose and propose automated fixes for runtime errors.</p>
                  <button onClick={analyzeError} disabled={analyzingError} className="w-full py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative z-10">
                      {analyzingError ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} fill="currentColor" />}
                      {analyzingError ? 'Debugging...' : 'Analyze Shell Error'}
                  </button>
                  <div className="absolute top-[-20px] right-[-20px] opacity-10 text-indigo-400"><Bot size={120} /></div>
              </div>

              {suggestedFix && (
                  <div className="bg-[#1e2227] border border-emerald-500/30 rounded-2xl p-5 animate-fade-in shadow-2xl space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest"><Check size={16} strokeWidth={3} /> Proactive Fix</div>
                      <div className="space-y-4">
                          <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Diagnosis</p>
                              <p className="text-xs text-gray-300 leading-relaxed font-medium">{suggestedFix.issue}</p>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                              <p className="text-[9px] font-black text-cyan-500 uppercase mb-2">Automated Resolution</p>
                              <code className="text-[10px] font-mono text-gray-400 block whitespace-pre-wrap">{suggestedFix.command}</code>
                          </div>
                          <button onClick={() => handleRunTask('Auto-Fix', suggestedFix.command)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20">Apply Patch</button>
                      </div>
                  </div>
              )}
          </div>
      )}

      <DebugConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} initialConfig={debugConfig} onSave={setDebugConfig} />
    </div>
  );
};

export default DebugPane;
