
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileNode, TeamMember, RemoteUserState, SecurityIssue, Panel } from '../types';
import { ICONS } from '../constants';
import { 
    Edit2, 
    Box, 
    Settings, 
    Coffee, 
    Binary, 
    X, 
    Trash2, 
    ShieldAlert, 
    Activity, 
    Files, 
    AlertCircle, 
    Search,
    ChevronRight,
    ChevronDown,
    Hammer,
    Zap,
    ShieldCheck,
    TrendingUp,
    Cpu,
    Terminal,
    FolderOpen,
    MoreVertical,
    RefreshCw,
    ChevronsLeft,
    Clipboard,
    Play,
    FileCode,
    FolderSync,
    ExternalLink
} from 'lucide-react';

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    node: FileNode;
    path: string;
}

interface FileExplorerProps {
  rootNode: FileNode;
  onFileSelect: (file: FileNode, path: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onSaveToGithub: () => void;
  onBuild: () => void;
  onRenameFile: (originalName: string, newName: string) => void;
  onStartRenaming: (name: string) => void;
  onDeleteFile: (path: string, silent?: boolean) => void;
  onMoveNode: (sourceName: string, targetFolderName: string) => void;
  collaborationState?: Record<string, RemoteUserState>;
  teamMembers?: TeamMember[];
  activeFile: FileNode | null;
  onCollapse: () => void;
  securityIssues?: SecurityIssue[];
  onOpenDocuments?: () => void;
  onPanelChange?: (panel: Panel) => void;
  onOpenInTerminal?: (path: string) => void;
  onRunFile?: (path: string) => void;
  onCopyPath?: (path: string, relative?: boolean) => void;
  terminalCwd?: string;
}

// Helper to check if a file is executable/runnable
const isExecutableFile = (fileName: string): boolean => {
    const lowerName = fileName.toLowerCase();
    return lowerName.endsWith('.py') || 
           lowerName.endsWith('.js') || 
           lowerName.endsWith('.ts') || 
           lowerName.endsWith('.sh') || 
           lowerName.endsWith('.go') ||
           lowerName.endsWith('.rs') ||
           lowerName.endsWith('.rb');
};

const getFileIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName === 'dockerfile') return ICONS.DOCKERFILE;
    if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx')) return ICONS.TS_FILE;
    if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx')) return ICONS.JS_FILE;
    if (lowerName.endsWith('.json')) return ICONS.JSON_FILE;
    if (lowerName.endsWith('.py')) return ICONS.PYTHON_FILE;
    if (lowerName.endsWith('.yaml') || lowerName.endsWith('.yml')) return ICONS.YAML_FILE;
    if (lowerName.endsWith('.html')) return ICONS.HTML_FILE;
    if (lowerName.endsWith('.css')) return ICONS.CSS_FILE;
    if (lowerName.endsWith('.go')) return <Box size={16} className="text-cyan-400" />;
    if (lowerName.endsWith('.rs')) return <Settings size={16} className="text-orange-400" />;
    if (lowerName.endsWith('.java')) return <Coffee size={16} className="text-red-400" />;
    if (lowerName.endsWith('.c') || lowerName.endsWith('.cpp')) return <Binary size={16} className="text-purple-400" />;
    return ICONS.DEFAULT_FILE;
};

const SmartTreeNode: React.FC<{ 
  node: FileNode; 
  onFileSelect: (file: FileNode, path: string) => void; 
  level: number;
  collapseAllTrigger: number;
  onRenameFile: (originalName: string, newName: string) => void;
  onStartRenaming: (name: string) => void;
  onDeleteFile: (path: string, silent?: boolean) => void;
  onMoveNode: (sourceName: string, targetFolderName: string) => void;
  activeFile: FileNode | null;
  securityIssues: SecurityIssue[];
  path: string;
  onContextMenu: (e: React.MouseEvent, node: FileNode, path: string) => void;
}> = ({ node, securityIssues, path, onContextMenu, ...props }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [editText, setEditText] = useState(node.name);
    const [isOver, setIsOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.collapseAllTrigger > 0) setIsOpen(false);
    }, [props.collapseAllTrigger]);

    useEffect(() => {
        if (node.isRenaming) {
            setEditText(node.name);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [node.isRenaming, node.name]);

    const isFolder = node.type === 'folder';
    const isActive = !isFolder && props.activeFile && props.activeFile.name === node.name;
    
    const hasIssues = !isFolder && securityIssues.some(i => i.file === node.name);

    const handleToggle = () => isFolder ? setIsOpen(!isOpen) : props.onFileSelect(node, path);
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('sourceNodeName', node.name);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (isFolder) {
            e.preventDefault();
            setIsOver(true);
            e.dataTransfer.dropEffect = 'move';
        }
    };
    
    const handleDragLeave = () => setIsOver(false);

    const handleDrop = (e: React.DragEvent) => {
        if (isFolder) {
            e.preventDefault();
            setIsOver(false);
            const sourceName = e.dataTransfer.getData('sourceNodeName');
            if (sourceName && sourceName !== node.name) {
                props.onMoveNode(sourceName, node.name);
            }
        }
    };

    const onRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node, path);
    };

    if (node.isRenaming) {
        return (
            <div className="flex items-center p-1 rounded-md text-sm" style={{ paddingLeft: `${props.level * 1.25}rem` }}>
                {isFolder ? ICONS.FOLDER : getFileIcon(editText)}
                <input 
                    ref={inputRef} 
                    type="text" 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') props.onRenameFile(node.name, editText);
                        if (e.key === 'Escape') props.onRenameFile(node.name, node.name); // Cancel rename
                    }}
                    onBlur={() => {
                        if(!editText.trim()) props.onDeleteFile(path, true);
                        else props.onRenameFile(node.name, editText);
                    }} 
                    className="ml-1 w-full bg-[var(--color-background-hover)] border border-[var(--color-accent)] rounded-md py-0 px-1 text-sm focus:outline-none text-white" 
                    autoFocus 
                />
            </div>
        );
    }

    return (
        <div>
            <div 
                draggable={true}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleToggle}
                onContextMenu={onRightClick}
                className={`flex items-center justify-between p-1 rounded-md cursor-pointer text-sm group pr-2 transition-colors 
                    ${isActive ? 'bg-[var(--color-selection)]/20 text-[var(--color-text-accent)] border-l-2 border-[var(--color-accent)]' : 'hover:bg-[var(--color-background-tertiary)] border-l-2 border-transparent text-[var(--color-text-primary)]'}
                    ${isOver ? 'bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/30' : ''}
                `} 
                style={{ paddingLeft: `${isActive ? (props.level * 1.25) - 0.125 : props.level * 1.25}rem` }}
            >
                <div className="flex items-center truncate flex-1 min-w-0 pointer-events-none">
                    {isFolder ? (
                        <>
                            <div className="w-4 h-4 mr-1 transition-transform duration-200 flex-shrink-0 flex items-center justify-center">
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                            {ICONS.FOLDER}
                        </>
                    ) : (
                        <div className="w-4 h-4 mr-1 flex-shrink-0 flex items-center justify-center">
                             {getFileIcon(node.name)}
                        </div>
                    )}
                    <span className="ml-1 truncate">{node.name}</span>
                    {hasIssues && <ShieldAlert size={12} className="text-red-500 ml-2 animate-pulse" title="Governance Violation Detected" />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <button type="button" onClick={(e) => { e.stopPropagation(); props.onStartRenaming(node.name); }} className={`p-1 hover:text-white transition-opacity ${isActive ? 'text-[var(--color-text-accent)]' : 'text-gray-400'}`}><Edit2 size={12} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); props.onDeleteFile(path); }} className={`p-1 hover:text-red-400 transition-opacity ${isActive ? 'text-[var(--color-text-accent)]' : 'text-gray-400'}`} title="Delete"><Trash2 size={12} /></button>
                </div>
            </div>
            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map((child, index) => (
                        <SmartTreeNode key={`${child.name}-${index}`} node={child} securityIssues={securityIssues || []} {...props} level={props.level + 1} path={`${path}/${child.name}`} onContextMenu={onContextMenu} />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ rootNode, onFileSelect, onNewFile, onNewFolder, onRefresh, onSaveToGithub, onBuild, onRenameFile, onStartRenaming, onDeleteFile, onMoveNode, collaborationState = {}, teamMembers = [], activeFile, onCollapse, securityIssues = [], onOpenDocuments, onPanelChange, onOpenInTerminal, onRunFile, onCopyPath, terminalCwd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  
  // Show copied notification briefly
  useEffect(() => {
    if (copiedPath) {
      const timer = setTimeout(() => setCopiedPath(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedPath]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Handle global click to close context menu
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const filteredRootNode = useMemo(() => {
    if (!debouncedSearchTerm) return rootNode;
    const filterTree = (node: FileNode, term: string): FileNode | null => {
      const lowerCaseTerm = term.toLowerCase();
      if (node.type === 'file') return node.name.toLowerCase().includes(lowerCaseTerm) ? node : null;
      if (node.type === 'folder') {
        const filteredChildren = node.children?.map(child => filterTree(child, term)).filter((child): child is FileNode => child !== null);
        if (node.name.toLowerCase().includes(lowerCaseTerm) || (filteredChildren && filteredChildren.length > 0)) return { ...node, children: filteredChildren };
      }
      return null;
    };
    const filteredChildren = rootNode.children?.map(child => filterTree(child, debouncedSearchTerm)).filter((child): child is FileNode => child !== null);
    return { ...rootNode, children: filteredChildren };
  }, [rootNode, debouncedSearchTerm]);

  const stats = useMemo(() => {
      const countFiles = (node: FileNode): number => {
          let count = node.type === 'file' ? 1 : 0;
          if (node.children) {
              node.children.forEach(c => count += countFiles(c));
          }
          return count;
      };
      
      const fileCount = countFiles(rootNode);
      const issueCount = securityIssues?.length || 0;
      
      // Calculate dynamic integrity percentage
      const integrity = fileCount > 0 
        ? Math.max(0, Math.round(((fileCount - issueCount) / fileCount) * 100))
        : 100;
      
      return { fileCount, issueCount, integrity };
  }, [rootNode, securityIssues]);

  const handleRefresh = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode, path: string) => {
      setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          node,
          path
      });
  };

  return (
    <div className="p-0 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] relative">
       {/* High-Contrast Doodle Stats Hub */}
       <div className="p-3 bg-black/20 border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex flex-col items-start gap-1 p-2 sketch-border bg-white/[0.03]">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Files</span>
                <span className="text-xs font-black text-white">{stats.fileCount}</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col items-start gap-1 p-2 sketch-border bg-white/[0.03]">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Security</span>
                <span className={`text-xs font-black ${stats.issueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{stats.issueCount}</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col items-start gap-1 p-2 sketch-border bg-white/[0.03]">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Integrity</span>
                <span className={`text-xs font-black ${stats.integrity < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{stats.integrity}%</span>
            </div>
            <div className="flex-1" />
            <button onClick={onCollapse} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 transition-all hover:text-white transform active:scale-90" title="Hide Explorer">
                <ChevronsLeft size={16} />
            </button>
       </div>

       {/* Terminal CWD Sync Indicator */}
       {terminalCwd && (
           <div className="px-3 py-2 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center gap-2 overflow-hidden">
               <Terminal size={12} className="text-cyan-400 shrink-0" />
               <span className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider shrink-0">Terminal:</span>
               <span className="text-[10px] text-gray-400 truncate font-mono" title={terminalCwd}>{terminalCwd}</span>
           </div>
       )}

       {/* Copied Path Toast */}
       {copiedPath && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
               <div className="bg-emerald-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg">
                   <Clipboard size={12} />
                   Path copied!
               </div>
           </div>
       )}

       <div className="flex justify-between items-center p-3 flex-shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Explorer</h2>
        <div className="flex items-center gap-0.5">
            <button type="button" onClick={(e) => { e.stopPropagation(); onNewFile(); }} title="New File" className="p-1.5 hover:bg-white/5 rounded-md text-gray-400 hover:text-white transition-all transform active:scale-90">
                {ICONS.NEW_FILE}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onNewFolder(); }} title="New Folder" className="p-1.5 hover:bg-white/5 rounded-md text-gray-400 hover:text-white transition-all transform active:scale-90">
                {ICONS.NEW_FOLDER}
            </button>
            <button onClick={handleRefresh} className={`p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-all transform active:scale-90 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} title="Refresh">
                <RefreshCw size={18} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onBuild(); }} title="Build Project" className="p-1.5 hover:bg-white/5 rounded-md text-gray-400 hover:text-[var(--color-accent)] transition-all transform active:scale-90">
                {ICONS.BUILD}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setCollapseAllTrigger(c => c + 1); }} title="Collapse All" className="p-1.5 hover:bg-white/5 rounded-md text-gray-400 hover:text-white transition-all transform active:scale-90">
                {ICONS.COLLAPSE_ALL}
            </button>
        </div>
       </div>

       <div className="px-3 pb-3 flex-shrink-0">
         <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-500 group-focus-within:text-[var(--color-accent)] transition-colors">
                <Search size={12} />
            </span>
            <input 
                type="text"
                placeholder="Find in workspace..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-lg py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-all placeholder-gray-600"
            />
         </div>
       </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar">
        {filteredRootNode.children?.map((node, index) => (
            <SmartTreeNode 
                key={`${node.name}-${index}`} 
                node={node} 
                onFileSelect={onFileSelect} 
                level={0} 
                collapseAllTrigger={collapseAllTrigger}
                onRenameFile={onRenameFile}
                onStartRenaming={onStartRenaming}
                onDeleteFile={onDeleteFile}
                onMoveNode={onMoveNode}
                activeFile={activeFile}
                securityIssues={securityIssues || []}
                path={node.name}
                onContextMenu={handleContextMenu}
            />
        ))}
      </div>

      {/* High-Contrast Context Menu */}
      {contextMenu && (
          <div 
            className="fixed z-[1000] min-w-[200px] bg-[#1a1f2e]/95 backdrop-blur-xl border-4 border-white/10 sketch-border shadow-2xl p-1.5 animate-fade-in ring-1 ring-cyan-500/20"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
              <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center gap-2 overflow-hidden">
                   <div className="shrink-0">{contextMenu.node.type === 'folder' ? <ChevronRight size={14} className="text-blue-400" /> : getFileIcon(contextMenu.node.name)}</div>
                   <span className="text-[10px] font-black text-gray-300 uppercase truncate tracking-widest">{contextMenu.node.name}</span>
              </div>

              <ContextMenuItem 
                icon={<Terminal size={14} className="text-cyan-400" />} 
                label="Open in Terminal" 
                shortcut="⌘⇧T"
                onClick={() => {
                    onOpenInTerminal?.(contextMenu.path);
                    setContextMenu(null);
                }}
              />
              {contextMenu.node.type === 'file' && isExecutableFile(contextMenu.node.name) && (
                <ContextMenuItem 
                  icon={<Play size={14} className="text-green-400" />} 
                  label="Run File" 
                  shortcut="⌘⏎"
                  onClick={() => {
                      onRunFile?.(contextMenu.path);
                      setContextMenu(null);
                  }}
                />
              )}
              <ContextMenuItem 
                icon={<FolderOpen size={14} className="text-blue-400" />} 
                label={contextMenu.node.type === 'folder' ? "Reveal in Explorer" : "Open to the Side"} 
                onClick={() => setContextMenu(null)}
              />
              
              <div className="h-px bg-white/5 my-1 mx-1" />

              <ContextMenuItem 
                icon={<Clipboard size={14} className="text-gray-400" />} 
                label="Copy Path" 
                shortcut="⌘⇧C"
                onClick={() => {
                    onCopyPath?.(contextMenu.path, false);
                    navigator.clipboard.writeText(contextMenu.path);
                    setCopiedPath(contextMenu.path);
                    setContextMenu(null);
                }}
              />
              <ContextMenuItem 
                icon={<FileCode size={14} className="text-gray-400" />} 
                label="Copy Relative Path" 
                onClick={() => {
                    onCopyPath?.(contextMenu.path, true);
                    navigator.clipboard.writeText(contextMenu.path);
                    setCopiedPath(contextMenu.path);
                    setContextMenu(null);
                }}
              />
              
              <div className="h-px bg-white/5 my-1 mx-1" />

              <ContextMenuItem 
                icon={<Edit2 size={14} className="text-amber-400" />} 
                label="Rename" 
                shortcut="F2"
                onClick={() => {
                    onStartRenaming(contextMenu.node.name);
                    setContextMenu(null);
                }}
              />
              <ContextMenuItem 
                icon={<Trash2 size={14} className="text-rose-500" />} 
                label="Delete" 
                shortcut="⌫"
                onClick={() => {
                    onDeleteFile(contextMenu.path);
                    setContextMenu(null);
                }}
                className="text-rose-400 hover:bg-rose-500/10"
              />
          </div>
      )}
    </div>
  );
};

const ContextMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; className?: string; shortcut?: string }> = ({ icon, label, onClick, className, shortcut }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all group ${className}`}
    >
        <span className="group-hover:scale-110 transition-transform">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        {shortcut && <span className="text-[9px] text-gray-600 font-mono">{shortcut}</span>}
    </button>
);

export default FileExplorer;
