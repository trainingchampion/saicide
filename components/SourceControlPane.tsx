
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { 
    GitBranch, 
    Check, 
    RefreshCw, 
    Plus, 
    Minus, 
    AlertTriangle, 
    GitPullRequest,
    RotateCw,
    ArrowUp,
    ArrowDown,
    List,
    GitGraph,
    MoreHorizontal,
    Archive,
    Undo2,
    FileCode,
    File,
    FileJson,
    Settings,
    Box,
    Coffee,
    Binary,
    Upload,
    ChevronDown,
    ChevronRight,
    Eye,
    Sparkles,
    Bot,
    Loader2
} from 'lucide-react';
import { ChangeItem, Commit, FileNode } from '../types';
import GitGraphPane from './GitGraphPane';
import aiService from '../services/geminiService';

interface SourceControlPaneProps {
  onCollapse: () => void;
  changes: ChangeItem[];
  stagedChanges: ChangeItem[];
  onStageFile: (file: string) => void;
  onUnstageFile: (file: string) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onCommit: (message: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  currentBranch: string;
  branches: string[];
  onBranchChange: (branch: string) => void;
  onCreateBranch: (branch: string) => void;
  onSelectFile?: (file: string) => void; 
  commits: Commit[];
  view?: 'changes' | 'graph';
  onViewChange?: (view: 'changes' | 'graph') => void;
  fileStructure: FileNode;
  activeModelId: string;
  onWriteToTerminal?: (text: string | string[]) => void;
  onRefreshGitStatus?: () => void;
}

const getFileIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName === 'dockerfile') return <div className="text-blue-500"><Box size={14} /></div>;
    if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx')) return <FileCode size={14} className="text-blue-300" />;
    if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx')) return <FileCode size={14} className="text-yellow-300" />;
    if (lowerName.endsWith('.json')) return <FileJson size={14} className="text-yellow-500" />;
    if (lowerName.endsWith('.py')) return <FileCode size={14} className="text-blue-500" />;
    if (lowerName.endsWith('.go')) return <div className="text-cyan-400"><Box size={14} /></div>;
    if (lowerName.endsWith('.rs')) return <Settings size={14} className="text-orange-400" />;
    if (lowerName.endsWith('.java')) return <Coffee size={14} className="text-red-400" />;
    if (lowerName.endsWith('.c') || lowerName.endsWith('.cpp')) return <Binary size={14} className="text-purple-400" />;
    return <File size={14} className="text-gray-400" />;
};

const SectionHeader: React.FC<{ 
    title: string; 
    count?: number; 
    isExpanded: boolean; 
    onToggle: () => void; 
    actions?: React.ReactNode 
}> = ({ title, count, isExpanded, onToggle, actions }) => (
    <div className="flex items-center justify-between group py-1 px-1 cursor-pointer hover:bg-white/5 transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {title} {count !== undefined && count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-gray-800 rounded-full text-[9px]">{count}</span>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {actions}
        </div>
    </div>
);

const SourceControlPane: React.FC<SourceControlPaneProps> = ({ 
    onCollapse, 
    changes, 
    stagedChanges, 
    onStageFile, 
    onUnstageFile,
    onStageAll,
    onUnstageAll,
    onCommit,
    onSync,
    isSyncing,
    currentBranch,
    branches,
    onBranchChange,
    onCreateBranch,
    onSelectFile,
    commits,
    view: propView,
    onViewChange,
    fileStructure,
    activeModelId,
    onWriteToTerminal,
    onRefreshGitStatus
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [localView, setLocalView] = useState<'changes' | 'graph'>('changes');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const view = propView || localView;
  const setView = onViewChange || setLocalView;

  const [expandedSections, setExpandedSections] = useState({
      staged: true,
      changes: true,
      stashes: false
  });

  const handleCommit = () => {
      if (!commitMessage.trim()) return;
      onCommit(commitMessage);
      setCommitMessage('');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerateCommitMessage = async () => {
    if (stagedChanges.length === 0) return;
    setIsAiLoading(true);
    setCommitMessage('Jules is thinking...');
    try {
        const message = await aiService.generateCommitMessage(stagedChanges);
        setCommitMessage(message);
    } catch (e) {
        setCommitMessage('// AI failed to generate message.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleGenerateBranchName = async () => {
    setIsAiLoading(true);
    setNewBranchName('Jules is thinking...');
    try {
        const summary = 'Changes in files: ' + [...stagedChanges, ...changes].map(c => c.file).join(', ');
        const name = await aiService.generateBranchName(summary);
        setNewBranchName(name);
    } catch (e) {
        setNewBranchName('feat/ai-failed');
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
        onCreateBranch(newBranchName.trim());
        setIsCreatingBranch(false);
        setNewBranchName('');
    }
  };

  const totalChangesCount = changes.length + stagedChanges.length;

  return (
    <div className="h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-3 flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex items-center gap-2">
            <Bot size={12} className="text-purple-400" />
            <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Source Control</h2>
        </div>
        <div className="flex items-center gap-2">
             <div className="flex gap-0.5 bg-black/20 p-0.5 rounded-md border border-white/5">
                 <button 
                    onClick={() => setView('changes')}
                    className={`p-1 rounded-sm transition-all ${view === 'changes' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Changes List"
                >
                    <List size={14} />
                </button>
                 <button 
                    onClick={() => setView('graph')}
                    className={`p-1 rounded-sm transition-all ${view === 'graph' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Git Graph"
                >
                    <GitGraph size={14} />
                </button>
            </div>
            <button onClick={onCollapse} title="Collapse Panel" className="text-gray-500 hover:text-white p-1 rounded-md transition-colors">
                {ICONS.COLLAPSE_LEFT}
            </button>
        </div>
      </div>

      {view === 'graph' ? (
          <GitGraphPane commits={commits} minimal={true} />
      ) : (
          <>
            <div className="px-3 py-3 bg-[var(--color-background)] border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="relative flex-1">
                        <button 
                            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-black/20 hover:bg-black/40 border border-white/5 rounded-lg text-xs text-gray-300 transition-all font-bold"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <GitBranch size={14} className="text-cyan-400" />
                                <span className="truncate">{currentBranch}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-600 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isBranchMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-[#1e2227] border border-white/10 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-fade-in">
                                {branches.map(b => (
                                    <button 
                                        key={b} 
                                        onClick={() => { onBranchChange(b); setIsBranchMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--color-accent)]/20 hover:text-white flex items-center justify-between transition-colors ${currentBranch === b ? 'text-cyan-400 bg-white/5' : 'text-gray-400'}`}
                                    >
                                        <span className="font-bold">{b}</span>
                                        {currentBranch === b && <Check size={12} />}
                                    </button>
                                ))}
                                <div className="border-t border-white/5 mt-2 pt-2">
                                    <button onClick={() => { setIsCreatingBranch(true); setIsBranchMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-cyan-400 hover:bg-white/5 flex items-center gap-2 font-bold">
                                        <Plus size={14} /> New Branch...
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onSync}
                        disabled={isSyncing}
                        className="ml-2 flex items-center justify-center p-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 rounded-lg transition-all border border-cyan-600/20 disabled:opacity-30"
                        title="Sync with Remote"
                    >
                        <RotateCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <textarea 
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder="Commit message (Enter to commit)"
                            className="w-full bg-[#131b2c] border border-white/5 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-cyan-500/50 resize-none h-[80px] font-medium placeholder-gray-600 shadow-inner"
                            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCommit(); }}
                        />
                         <button 
                            onClick={handleGenerateCommitMessage}
                            disabled={isAiLoading || stagedChanges.length === 0}
                            className="absolute bottom-2 right-2 p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full transition-all disabled:opacity-30"
                            title="Generate with Jules AI"
                        >
                            {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                    </div>
                    <button 
                        onClick={handleCommit}
                        disabled={stagedChanges.length === 0 || !commitMessage.trim()}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-[0.2em] py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                    >
                        <Check size={16} strokeWidth={3} /> Commit to {currentBranch}
                    </button>
                </div>

                 {isCreatingBranch && (
                    <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 space-y-3 animate-fade-in">
                        <h4 className="text-xs font-bold text-gray-400">Create New Branch</h4>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newBranchName}
                                onChange={e => setNewBranchName(e.target.value)}
                                placeholder="feat/new-feature-name"
                                className="w-full bg-[#131b2c] border border-white/5 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleGenerateBranchName}
                                disabled={isAiLoading}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full transition-all disabled:opacity-30"
                                title="Generate with Jules AI"
                            >
                                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateBranch} className="flex-1 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded">Create</button>
                            <button onClick={() => setIsCreatingBranch(false)} className="flex-1 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 rounded">Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4 select-none">
                <div className="space-y-1">
                    <SectionHeader 
                        title="Staged Changes" 
                        count={stagedChanges.length}
                        isExpanded={expandedSections.staged} 
                        onToggle={() => toggleSection('staged')}
                        actions={<button onClick={onUnstageAll} className="hover:text-white p-1 text-gray-500"><Minus size={14}/></button>}
                    />
                    {expandedSections.staged && stagedChanges.map(change => (
                        <div key={change.file} className="group flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer">
                            <div className="flex items-center gap-2 overflow-hidden flex-1" onClick={() => onSelectFile?.(change.file)}>
                                {getFileIcon(change.file)}
                                <span className="text-xs text-gray-300 truncate font-medium">{change.file.split('/').pop()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-green-400 w-4 text-center">{change.status}</span>
                                <button onClick={() => onUnstageFile(change.file)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-gray-500"><Minus size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-1">
                    <SectionHeader 
                        title="Changes" 
                        count={changes.length}
                        isExpanded={expandedSections.changes} 
                        onToggle={() => toggleSection('changes')}
                        actions={
                            <div className="flex gap-1">
                                <button className="hover:text-white p-1 text-gray-500"><Undo2 size={14} /></button>
                                <button onClick={onStageAll} className="hover:text-white p-1 text-gray-500"><Plus size={14} /></button>
                            </div>
                        }
                    />
                    {expandedSections.changes && (
                        changes.length === 0 ? (
                            <div className="text-center py-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Workspace Clean</div>
                        ) : (
                            changes.map(change => (
                                <div key={change.file} className="group flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer">
                                    <div className="flex items-center gap-2 overflow-hidden flex-1" onClick={() => onSelectFile?.(change.file)}>
                                        {getFileIcon(change.file)}
                                        <span className="text-xs text-gray-300 truncate font-medium">{change.file.split('/').pop()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black w-4 text-center ${change.status === 'M' ? 'text-yellow-500' : 'text-green-500'}`}>{change.status}</span>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                            <button onClick={() => onSelectFile?.(change.file)} className="p-1 text-gray-500 hover:text-cyan-400" title="Open Diff"><Eye size={14} /></button>
                                            <button onClick={() => onStageFile(change.file)} className="p-1 text-gray-500 hover:text-white"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {totalChangesCount > 0 && (
                <div className="p-4 bg-black/10 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Workspace Summary</span>
                        <span className="text-cyan-400">{totalChangesCount} Changes</span>
                    </div>
                    <div className="mt-3 flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-800">
                        <div className="bg-green-500 h-full" style={{ width: `${(stagedChanges.length / totalChangesCount) * 100}%` }} />
                        <div className="bg-yellow-500 h-full" style={{ width: `${(changes.length / totalChangesCount) * 100}%` }} />
                    </div>
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default SourceControlPane;
