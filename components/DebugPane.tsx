
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    Bot,
    ChevronRight,
    ChevronDown,
    Circle,
    Pause,
    SkipForward,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Eye,
    Trash2,
    Bug,
    PlayCircle,
    StopCircle,
    Target
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

interface Breakpoint {
    id: string;
    file: string;
    line: number;
    enabled: boolean;
    condition?: string;
}

interface WatchVariable {
    id: string;
    name: string;
    value: string;
    type: string;
}

interface DebugSession {
    id: string;
    name: string;
    status: 'running' | 'paused' | 'stopped';
    startTime: number;
    command: string;
}

const DebugPane: React.FC<DebugPaneProps> = ({ 
    onCollapse, 
    onRun, 
    activeFile, 
    securityIssues = [], 
    fileStructure, 
    terminalHistory = [], 
    activeModelId = 'gemini-2.5-pro' 
}) => {
  const [activeTask, setActiveTask] = useState<DebugSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fileActions, setFileActions] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'run' | 'debug' | 'healing'>('run');
  
  // Debug State
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [watchVariables, setWatchVariables] = useState<WatchVariable[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['breakpoints', 'variables', 'callstack']));
  const [newWatchExpr, setNewWatchExpr] = useState('');
  
  // Launch Configurations
  const [launchConfigs, setLaunchConfigs] = useState<DebugConfig[]>(() => {
      const saved = localStorage.getItem('sai-debug-configs');
      return saved ? JSON.parse(saved) : [
          { command: 'npm', args: 'start', env: 'NODE_ENV=development' },
          { command: 'npm', args: 'run dev', env: 'NODE_ENV=development' },
          { command: 'node', args: 'index.js', env: '' },
      ];
  });
  const [selectedConfigIdx, setSelectedConfigIdx] = useState(0);
  
  // Self-Healing State
  const [analyzingError, setAnalyzingError] = useState(false);
  const [suggestedFix, setSuggestedFix] = useState<{ issue: string, fix: string, command: string } | null>(null);
  
  // Configuration Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfigIdx, setEditingConfigIdx] = useState<number | null>(null);

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

  // Save configs to localStorage
  useEffect(() => {
      localStorage.setItem('sai-debug-configs', JSON.stringify(launchConfigs));
  }, [launchConfigs]);

  // Detect tasks from project files
  useEffect(() => {
      const newTasks: Task[] = [];
      const packageJson = findFile(fileStructure, 'package.json');
      const goMod = findFile(fileStructure, 'go.mod');
      const cargoToml = findFile(fileStructure, 'Cargo.toml');
      const makefile = findFile(fileStructure, 'Makefile');
      const dockerfile = findFile(fileStructure, 'Dockerfile');

      if (packageJson) {
          try {
              const json = JSON.parse(packageJson);
              if (json.scripts) {
                  Object.entries(json.scripts).forEach(([name, cmd]) => {
                      const icon = name.includes('dev') ? <Zap size={12} className="text-yellow-400"/> :
                                   name.includes('build') ? <Hammer size={12} className="text-blue-400"/> :
                                   name.includes('test') ? <Target size={12} className="text-green-400"/> :
                                   name.includes('start') ? <Play size={12} className="text-emerald-400"/> :
                                   <Package size={12}/>;
                      newTasks.push({ id: 'npm-' + name, label: name, command: 'npm run ' + name, source: 'npm', icon, description: String(cmd) });
                  });
              }
          } catch (e) {}
      }

      if (cargoToml) {
          newTasks.push(
              { id: 'cargo-build', label: 'cargo build', command: 'cargo build', source: 'cargo', icon: <Hammer size={12} className="text-orange-400"/> },
              { id: 'cargo-run', label: 'cargo run', command: 'cargo run', source: 'cargo', icon: <Play size={12} className="text-orange-400"/> },
              { id: 'cargo-test', label: 'cargo test', command: 'cargo test', source: 'cargo', icon: <Target size={12} className="text-orange-400"/> }
          );
      }

      if (goMod) {
          newTasks.push(
              { id: 'go-run', label: 'go run .', command: 'go run .', source: 'go', icon: <Play size={12} className="text-cyan-400"/> },
              { id: 'go-build', label: 'go build', command: 'go build', source: 'go', icon: <Hammer size={12} className="text-cyan-400"/> },
              { id: 'go-test', label: 'go test', command: 'go test ./...', source: 'go', icon: <Target size={12} className="text-cyan-400"/> }
          );
      }

      if (makefile) {
          newTasks.push(
              { id: 'make', label: 'make', command: 'make', source: 'make', icon: <Hammer size={12} className="text-gray-400"/> },
              { id: 'make-clean', label: 'make clean', command: 'make clean', source: 'make', icon: <Trash2 size={12} className="text-gray-400"/> }
          );
      }

      if (dockerfile) {
          newTasks.push(
              { id: 'docker-build', label: 'docker build', command: 'docker build -t app .', source: 'docker', icon: <Box size={12} className="text-blue-400"/> }
          );
      }

      setTasks(newTasks);

      // File-specific actions
      const actions: Task[] = [];
      if (activeFile) {
          const ext = activeFile.name.split('.').pop()?.toLowerCase();
          const fileName = activeFile.name;
          if (ext === 'js') actions.push({ id: 'node-run', label: 'Run with Node', command: 'node ' + fileName, source: 'file', icon: <Code2 size={14} className="text-yellow-400"/> });
          if (ext === 'ts') actions.push({ id: 'ts-run', label: 'Run with ts-node', command: 'npx ts-node ' + fileName, source: 'file', icon: <Code2 size={14} className="text-blue-400"/> });
          if (ext === 'py') actions.push({ id: 'py-run', label: 'Run Python', command: 'python3 ' + fileName, source: 'file', icon: <Code2 size={14} className="text-yellow-400"/> });
          if (ext === 'go') actions.push({ id: 'go-run-f', label: 'Go Run', command: 'go run ' + fileName, source: 'file', icon: <Box size={14} className="text-cyan-400"/> });
          if (ext === 'rs') actions.push({ id: 'rust-run', label: 'Cargo Run', command: 'cargo run', source: 'file', icon: <Box size={14} className="text-orange-400"/> });
          if (ext === 'rb') actions.push({ id: 'ruby-run', label: 'Run Ruby', command: 'ruby ' + fileName, source: 'file', icon: <Code2 size={14} className="text-red-400"/> });
          if (ext === 'sh') actions.push({ id: 'sh-run', label: 'Run Script', command: 'bash ' + fileName, source: 'file', icon: <Terminal size={14} className="text-green-400"/> });
      }
      setFileActions(actions);
  }, [fileStructure, activeFile]);

  const handleRunTask = useCallback((label: string, command: string) => {
      if (isBlockedByPolicy) return;
      setActiveTask({ 
          id: Date.now().toString(), 
          name: label, 
          startTime: Date.now(), 
          command,
          status: 'running'
      });
      if (onRun) onRun(command);
  }, [isBlockedByPolicy, onRun]);

  const handleStopTask = useCallback(() => {
      if (onRun) onRun('\u0003'); // SIGINT
      setActiveTask(null);
  }, [onRun]);

  const handleRunConfig = useCallback(() => {
      const config = launchConfigs[selectedConfigIdx];
      if (!config) return;
      const fullCommand = config.env 
          ? config.env.split('\n').filter(Boolean).join(' ') + ' ' + config.command + ' ' + config.args
          : config.command + ' ' + config.args;
      handleRunTask(config.command + ' ' + config.args, fullCommand.trim());
  }, [launchConfigs, selectedConfigIdx, handleRunTask]);

  const handleSaveConfig = useCallback((config: DebugConfig) => {
      if (editingConfigIdx !== null) {
          setLaunchConfigs(prev => prev.map((c, i) => i === editingConfigIdx ? config : c));
      } else {
          setLaunchConfigs(prev => [...prev, config]);
          setSelectedConfigIdx(launchConfigs.length);
      }
      setEditingConfigIdx(null);
  }, [editingConfigIdx, launchConfigs.length]);

  const handleDeleteConfig = useCallback((idx: number) => {
      setLaunchConfigs(prev => prev.filter((_, i) => i !== idx));
      if (selectedConfigIdx >= idx && selectedConfigIdx > 0) {
          setSelectedConfigIdx(selectedConfigIdx - 1);
      }
  }, [selectedConfigIdx]);

  const toggleSection = (section: string) => {
      setExpandedSections(prev => {
          const next = new Set(prev);
          if (next.has(section)) next.delete(section);
          else next.add(section);
          return next;
      });
  };

  const addBreakpoint = useCallback(() => {
      if (!activeFile) return;
      const newBp: Breakpoint = {
          id: Date.now().toString(),
          file: activeFile.name,
          line: 1, // Default to line 1
          enabled: true
      };
      setBreakpoints(prev => [...prev, newBp]);
  }, [activeFile]);

  const toggleBreakpoint = useCallback((id: string) => {
      setBreakpoints(prev => prev.map(bp => bp.id === id ? {...bp, enabled: !bp.enabled} : bp));
  }, []);

  const removeBreakpoint = useCallback((id: string) => {
      setBreakpoints(prev => prev.filter(bp => bp.id !== id));
  }, []);

  const addWatchVariable = useCallback(() => {
      if (!newWatchExpr.trim()) return;
      const newVar: WatchVariable = {
          id: Date.now().toString(),
          name: newWatchExpr,
          value: '<not available>',
          type: 'unknown'
      };
      setWatchVariables(prev => [...prev, newVar]);
      setNewWatchExpr('');
  }, [newWatchExpr]);

  const removeWatchVariable = useCallback((id: string) => {
      setWatchVariables(prev => prev.filter(v => v.id !== id));
  }, []);

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
      return mins + ':' + secs.toString().padStart(2, '0');
  };

  const SectionHeader: React.FC<{ title: string; section: string; count?: number }> = ({ title, section, count }) => (
      <button 
          onClick={() => toggleSection(section)}
          className="w-full flex items-center gap-2 py-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
      >
          {expandedSections.has(section) ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
          {title}
          {count !== undefined && <span className="text-[9px] text-gray-600 font-mono">({count})</span>}
      </button>
  );

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0 border-b border-[var(--color-border)] mb-2">
        <div className="flex items-center gap-2">
            <Bug size={14} className="text-orange-400"/>
            <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Run & Debug</h2>
        </div>
        <button onClick={onCollapse} className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex px-2 mb-3 bg-black/20 p-1 rounded-lg shrink-0 gap-1">
          <button onClick={() => setActiveTab('run')} className={'flex-1 py-1.5 text-[10px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ' + (activeTab === 'run' ? 'bg-emerald-500/20 text-emerald-400 shadow' : 'text-gray-500 hover:text-gray-300')}>
              <Play size={10}/> Run
          </button>
          <button onClick={() => setActiveTab('debug')} className={'flex-1 py-1.5 text-[10px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ' + (activeTab === 'debug' ? 'bg-orange-500/20 text-orange-400 shadow' : 'text-gray-500 hover:text-gray-300')}>
              <Bug size={10}/> Debug
          </button>
          <button onClick={() => setActiveTab('healing')} className={'flex-1 py-1.5 text-[10px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ' + (activeTab === 'healing' ? 'bg-purple-500/20 text-purple-400 shadow' : 'text-gray-500 hover:text-gray-300')}>
              <Wrench size={10}/> Heal
          </button>
      </div>

      {/* Run Tab */}
      {activeTab === 'run' && (
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 custom-scrollbar">
            
            {/* Launch Configuration */}
            <section className="bg-[#0d1117] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Launch Configuration</span>
                    <button 
                        onClick={() => { setEditingConfigIdx(null); setIsConfigModalOpen(true); }}
                        className="text-[9px] text-gray-500 hover:text-white flex items-center gap-1"
                    >
                        <Plus size={10}/> New
                    </button>
                </div>
                <select 
                    value={selectedConfigIdx}
                    onChange={(e) => setSelectedConfigIdx(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50 mb-3"
                >
                    {launchConfigs.map((cfg, idx) => (
                        <option key={idx} value={idx}>{cfg.command} {cfg.args}</option>
                    ))}
                </select>
                <div className="flex gap-2">
                    <button 
                        onClick={handleRunConfig}
                        disabled={isBlockedByPolicy || launchConfigs.length === 0}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                    >
                        <Play size={12} fill="currentColor"/> Run
                    </button>
                    <button 
                        onClick={() => { setEditingConfigIdx(selectedConfigIdx); setIsConfigModalOpen(true); }}
                        className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all"
                    >
                        <Settings size={14}/>
                    </button>
                    {launchConfigs.length > 1 && (
                        <button 
                            onClick={() => handleDeleteConfig(selectedConfigIdx)}
                            className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                            <Trash2 size={14}/>
                        </button>
                    )}
                </div>
            </section>

            {/* Active Process */}
            {activeTask && (
                <div className="bg-[#0d1117] border border-emerald-500/30 rounded-xl p-4 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                        <button onClick={handleStopTask} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg transition-colors"><Square size={14} fill="currentColor" /></button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Running</h3>
                        <span className="text-[10px] font-mono text-gray-500">{getElapsedTime()}</span>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-400 truncate">{activeTask.command}</p>
                </div>
            )}

            {/* Governance Block */}
            {isBlockedByPolicy && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 animate-fade-in">
                    <ShieldAlert size={20} className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase">Blocked by Policy</h4>
                        <p className="text-[10px] text-red-300/70 mt-1">Resolve security issues before running.</p>
                    </div>
                </div>
            )}

            {/* File Actions */}
            {fileActions.length > 0 && (
                <section>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 px-1">Active File</h3>
                    <div className="space-y-2">
                        {fileActions.map(task => (
                            <button key={task.id} onClick={() => handleRunTask(task.label, task.command)} disabled={isBlockedByPolicy} className="w-full flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group disabled:opacity-30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg">{task.icon}</div>
                                    <div className="text-left">
                                        <span className="text-xs font-bold block">{task.label}</span>
                                        <span className="text-[9px] font-mono text-gray-600">{task.command}</span>
                                    </div>
                                </div>
                                <Play size={12} className="text-gray-600 group-hover:text-emerald-400" fill="currentColor" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Workspace Tasks */}
            {tasks.length > 0 && (
                <section>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 px-1">Detected Tasks</h3>
                    <div className="space-y-1">
                        {tasks.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="text-gray-500">{task.icon}</div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] font-bold text-gray-300 group-hover:text-white block truncate">{task.label}</span>
                                        <span className="text-[9px] font-mono text-gray-600 truncate block">{task.command}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleRunTask(task.label, task.command)} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 transition-all shrink-0"><Play size={12} fill="currentColor" /></button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
          </div>
      )}

      {/* Debug Tab */}
      {activeTab === 'debug' && (
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-3 custom-scrollbar">
            
            {/* Debug Controls */}
            <div className="bg-[#0d1117] border border-orange-500/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Debug Session</span>
                    <div className="flex gap-1">
                        <button className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 transition-all" title="Continue"><Play size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-yellow-500/20 text-gray-500 hover:text-yellow-400 transition-all" title="Pause"><Pause size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-all" title="Step Over"><SkipForward size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-cyan-500/20 text-gray-500 hover:text-cyan-400 transition-all" title="Step Into"><ArrowDownRight size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-purple-500/20 text-gray-500 hover:text-purple-400 transition-all" title="Step Out"><ArrowUpRight size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-orange-500/20 text-gray-500 hover:text-orange-400 transition-all" title="Restart"><RefreshCw size={12}/></button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all" title="Stop"><Square size={12}/></button>
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 italic">Start a debug session to control execution</p>
            </div>

            {/* Breakpoints */}
            <section className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <SectionHeader title="Breakpoints" section="breakpoints" count={breakpoints.length}/>
                {expandedSections.has('breakpoints') && (
                    <div className="px-3 pb-3 space-y-2">
                        {breakpoints.length === 0 ? (
                            <p className="text-[10px] text-gray-600 italic py-2">No breakpoints set</p>
                        ) : (
                            breakpoints.map(bp => (
                                <div key={bp.id} className="flex items-center gap-2 group">
                                    <button onClick={() => toggleBreakpoint(bp.id)} className={'w-3 h-3 rounded-full border transition-all ' + (bp.enabled ? 'bg-red-500 border-red-400' : 'bg-transparent border-gray-600')}/>
                                    <span className="text-[10px] font-mono text-gray-400 flex-1 truncate">{bp.file}:{bp.line}</span>
                                    <button onClick={() => removeBreakpoint(bp.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={10}/></button>
                                </div>
                            ))
                        )}
                        <button onClick={addBreakpoint} className="w-full text-[9px] text-gray-500 hover:text-white py-1.5 border border-dashed border-white/10 hover:border-white/30 rounded-lg transition-all flex items-center justify-center gap-1">
                            <Plus size={10}/> Add Breakpoint
                        </button>
                    </div>
                )}
            </section>

            {/* Watch Variables */}
            <section className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <SectionHeader title="Watch" section="variables" count={watchVariables.length}/>
                {expandedSections.has('variables') && (
                    <div className="px-3 pb-3 space-y-2">
                        {watchVariables.map(v => (
                            <div key={v.id} className="flex items-center gap-2 group">
                                <Eye size={10} className="text-cyan-500"/>
                                <span className="text-[10px] font-mono text-gray-300">{v.name}</span>
                                <span className="text-[10px] text-gray-600">=</span>
                                <span className="text-[10px] font-mono text-yellow-400 flex-1 truncate">{v.value}</span>
                                <button onClick={() => removeWatchVariable(v.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={10}/></button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newWatchExpr}
                                onChange={(e) => setNewWatchExpr(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addWatchVariable()}
                                placeholder="Add expression..."
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            <button onClick={addWatchVariable} className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-[10px]"><Plus size={10}/></button>
                        </div>
                    </div>
                )}
            </section>

            {/* Call Stack */}
            <section className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <SectionHeader title="Call Stack" section="callstack"/>
                {expandedSections.has('callstack') && (
                    <div className="px-3 pb-3">
                        <p className="text-[10px] text-gray-600 italic py-2">No active stack frame</p>
                    </div>
                )}
            </section>
          </div>
      )}

      {/* Self-Healing Tab */}
      {activeTab === 'healing' && (
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 custom-scrollbar">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                      <Wrench className="text-indigo-400" size={18} /> AI Error Analysis
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-6 leading-relaxed relative z-10">AI analyzes terminal output to diagnose and fix runtime errors automatically.</p>
                  <button onClick={analyzeError} disabled={analyzingError} className="w-full py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative z-10">
                      {analyzingError ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} fill="currentColor" />}
                      {analyzingError ? 'Analyzing...' : 'Analyze Errors'}
                  </button>
                  <div className="absolute top-[-20px] right-[-20px] opacity-10 text-indigo-400"><Bot size={120} /></div>
              </div>

              {suggestedFix && (
                  <div className="bg-[#1e2227] border border-emerald-500/30 rounded-2xl p-5 animate-fade-in shadow-2xl space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest"><Check size={16} strokeWidth={3} /> Solution Found</div>
                      <div className="space-y-4">
                          <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Issue</p>
                              <p className="text-xs text-gray-300 leading-relaxed font-medium">{suggestedFix.issue}</p>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                              <p className="text-[9px] font-black text-cyan-500 uppercase mb-2">Fix Command</p>
                              <code className="text-[10px] font-mono text-gray-400 block whitespace-pre-wrap">{suggestedFix.command}</code>
                          </div>
                          <button onClick={() => handleRunTask('AI Fix', suggestedFix.command)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20">Apply Fix</button>
                      </div>
                  </div>
              )}
          </div>
      )}

      <DebugConfigModal 
          isOpen={isConfigModalOpen} 
          onClose={() => { setIsConfigModalOpen(false); setEditingConfigIdx(null); }} 
          initialConfig={editingConfigIdx !== null ? launchConfigs[editingConfigIdx] : { command: '', args: '', env: '' }} 
          onSave={handleSaveConfig} 
      />
    </div>
  );
};

export default DebugPane;
