import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FileNode, AppEvent, TeamMember, RemoteUserState, SecurityIssue, SecurityPolicy, Extension, Panel, Severity, RecentItem, DiffData, EditorTabGroup, EditorTab, Comment, GitStatus } from '../types';
import RealTerminal, { RealTerminalRef } from './RealTerminal';
import { 
    X, Save, Command, Play, GitBranch, Settings, MessageSquare, 
    Terminal as TerminalIcon, Maximize2, Minimize2, MoreHorizontal, 
    AlertTriangle, AlertCircle, XCircle, Info, Sparkles, Code2, 
    Plus, ChevronDown, Trash2, Columns, Ban, LayoutGrid, Check, 
    Book, Cloud, Github, FolderOpen, FilePlus, ShieldAlert, Layers, RefreshCw, Wand2,
    ExternalLink,
    Download,
    FileText,
    ChevronRight,
    FoldVertical,
    FileCode,
    ChevronRight as BreadcrumbSeparator,
    MessageSquarePlus
} from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import aiService from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import DiffViewer from './DiffViewer';
import WhiteboardPane from './WhiteboardPane';

export interface EditorPaneProps {
    tabGroups: EditorTabGroup[];
    focusedGroupId: string;
    onSelectTab: (groupId: string, tabIndex: number) => void;
    onCloseTab: (groupId: string, tabIndex: number) => void;
    onToggleGroupCollapse: (groupId: string) => void;
    onCreateGroup: () => void;
    onFileUpdate: (content: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    appEvents: AppEvent[];
    onClearEvents: () => void;
    onGoToFile: (file: string, line: number) => void;
    onOpenChat: () => void;
    onOpenSettings: () => void;
    onStartDebugging: () => void;
    onCloneRepo: () => void;
    onChangePanel: (panel: Panel) => void;
    onNewFile: (defaultName?: string) => void;
    onNewFolder: (name?: string) => void;
    onDeleteFile: (path: string, silent: boolean) => void;
    fontSize: string;
    wordWrap: string;
    keymap: string;
    vimMode: boolean;
    isMac: boolean;
    onOpenCommandPalette: () => void;
    collaborationState: Record<string, RemoteUserState>;
    teamMembers: TeamMember[];
    currentUser: TeamMember | null;
    fileStructure: FileNode;
    setFileStructure: React.Dispatch<React.SetStateAction<FileNode>>;
    canEdit: boolean;
    terminalHeight: number;
    onTerminalResize: (height: number) => void;
    policies: SecurityPolicy[];
    securityIssues: SecurityIssue[];
    installedExtensions: Extension[];
    onGetSuggestions: () => void;
    onClearProblems: () => void;
    onValidateCommand: (cmd: string) => { allowed: boolean; reason?: string };
    diffData: DiffData | null;
    onCloseDiff: () => void;
    onReturnToSetup: () => void;
    onGitAction?: (action: 'add' | 'commit' | 'push' | 'pull' | 'status', args: string[]) => void;
    onServerReady?: (url: string) => void;
    onAIAppGen?: (prompt: string, mode?: 'chat' | 'app') => void;
    onOpenGitGraph?: () => void;
    // Standardized prop name to activeModelId to match naming in other components
    activeModelId?: string;
    onOpenDocs?: () => void;
    onOpenRecorder?: () => void;
    recents?: RecentItem[];
    onTerminalOutput?: (text: string) => void;
    onCloudAuth?: (provider: string) => void;
    comments: Record<string, Comment[]>;
    onOpenCommentThread: (filePath: string, lineNumber: number) => void;
    gitStatus: GitStatus;
    onSetStagedCommitMessage: (message: string) => void;
    onGitPush: () => void;
    onCwdChange?: (cwd: string) => void;
    onRestrictedClick?: (featureName: string) => void;
}

export interface EditorPaneRef {
    runTerminalCommand: (cmd: string) => void;
    createTerminal: () => void;
    writeToTerminal: (text: string) => void;
    ensureTerminalVisible: () => void;
    getTerminalCwd: () => string;
}

interface TerminalSession {
    id: string;
    name: string;
    shell: string;
    ref: React.RefObject<RealTerminalRef>;
}

const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>((props, ref) => {
    const { 
        tabGroups, focusedGroupId, onSelectTab, onCloseTab, onToggleGroupCollapse, onCreateGroup,
        onFileUpdate, terminalHeight, onTerminalResize, securityIssues, 
        // Standardized prop name to activeModelId
        diffData, onCloseDiff, currentUser, activeModelId,
        onNewFile, onNewFolder, onDeleteFile, onCloneRepo, onOpenCommandPalette, onOpenSettings, onAIAppGen,
        onOpenDocs, onOpenRecorder, recents, onChangePanel, onOpenGitGraph,
        onTerminalOutput, onCloudAuth, comments, onOpenCommentThread, gitStatus,
        onSetStagedCommitMessage, onGitPush, onCwdChange
    } = props;
    
    const [emptyView, setEmptyView] = useState<'welcome' | 'whiteboard'>('welcome');
    const [localWordWrap, setLocalWordWrap] = useState(props.wordWrap === 'on');

    const defaultShell = 'bash';
    const [terminals, setTerminals] = useState<TerminalSession[]>([
        { id: '1', name: defaultShell, shell: defaultShell, ref: React.createRef() }
    ]);
    const [activeTerminalId, setActiveTerminalId] = useState('1');
    const [activeTerminalTab, setActiveTerminalTab] = useState<'problems' | 'output' | 'terminal'>('terminal');
    const [isTerminalDropdownOpen, setIsTerminalDropdownOpen] = useState(false);
    const terminalDropdownTriggerRef = useRef<HTMLButtonElement>(null);

    const [isResizing, setIsResizing] = useState(false);
    const isResizingRef = useRef(false);

    const terminalUsername = useMemo(() => {
        if (!currentUser?.name) return 'developer';
        const parts = currentUser.name.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        return `${firstName.toLowerCase()}${lastName[0].toLowerCase()}`;
    }, [currentUser?.name]);

    const handleNewTerminal = (shellType?: string) => {
        const newShell = shellType || defaultShell;
        const newId = Date.now().toString();
        const newSession = { id: newId, name: newShell, shell: newShell, ref: React.createRef<RealTerminalRef>() };
        setTerminals(prev => [...prev, newSession]);
        setActiveTerminalId(newId);
        if (terminalHeight === 0) onTerminalResize(250);
        return newId;
    };

    const handleCloseTerminal = () => {
        if (terminals.length > 1) {
            const newTerminals = terminals.filter(t => t.id !== activeTerminalId);
            setTerminals(newTerminals);
            setActiveTerminalId(newTerminals[newTerminals.length - 1].id);
        } else {
            onTerminalResize(0);
        }
    };

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            const newHeight = window.innerHeight - e.clientY;
            const maxHeight = window.innerHeight * 0.8;
            if (newHeight >= 0 && newHeight <= maxHeight) {
                onTerminalResize(newHeight);
            }
        };

        const handleMouseUp = () => {
            if (isResizingRef.current) {
                isResizingRef.current = false;
                setIsResizing(false);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onTerminalResize]);

    useImperativeHandle(ref, () => ({
        runTerminalCommand: (cmd: string) => {
            if (terminalHeight < 100) {
                onTerminalResize(250);
            }
            setActiveTerminalTab('terminal');
            const activeSession = terminals.find(t => t.id === activeTerminalId);
            activeSession?.ref.current?.runCommand(cmd);
        },
        createTerminal: () => {
            handleNewTerminal();
        },
        writeToTerminal: (text: string) => {
            const activeSession = terminals.find(t => t.id === activeTerminalId);
            activeSession?.ref.current?.write(text);
        },
        ensureTerminalVisible: () => {
            if (terminalHeight < 100) {
                onTerminalResize(250);
            }
            setActiveTerminalTab('terminal');
        },
        getTerminalCwd: () => {
            const activeSession = terminals.find(t => t.id === activeTerminalId);
            return activeSession?.ref.current?.getCwd() || '~';
        }
    }));

    const renderTextarea = (tab: EditorTab) => {
        const content = tab.node.content || '';
        const lineCount = content.split('\n').length;
        
        const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
        const fileComments = comments[tab.path] || [];

        return (
            <div className={`flex h-full w-full bg-[var(--color-background)]`}>
                <div className="text-right text-gray-600 select-none py-4 pr-3 font-mono text-sm leading-relaxed overflow-y-hidden border-r border-[var(--color-border)] opacity-60 flex flex-col relative" style={{ fontSize: `${props.fontSize}px`, minWidth: '3.5rem', paddingLeft: '1rem' }}>
                    {lineNumbers.map(ln => {
                        const hasComment = fileComments.some(c => (c as any).lineNumber === ln);
                        return (
                            <div key={ln} className="relative group/line h-[21px] flex items-center justify-end" style={{lineHeight: '21px'}}>
                                {ln}
                                <button
                                    onClick={() => onOpenCommentThread(tab.path, ln)}
                                    className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasComment ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400 opacity-0 group-hover/line:opacity-100'}`}
                                >
                                    {hasComment ? <MessageSquarePlus size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <textarea
                    value={content}
                    onChange={(e) => onFileUpdate(e.target.value)}
                    className={`w-full h-full bg-transparent text-[var(--color-text-primary)] py-4 pr-4 pl-3 font-mono text-sm resize-none focus:outline-none leading-relaxed custom-scrollbar`}
                    style={{ 
                        fontSize: `${props.fontSize}px`, 
                        whiteSpace: localWordWrap ? 'pre-wrap' : 'pre',
                        tabSize: 4,
                        lineHeight: '21px'
                    }}
                    spellCheck={false}
                />
            </div>
        );
    };
    
    const renderProblems = () => {
        const issuesByFile: { [key: string]: SecurityIssue[] } = {};
        securityIssues.forEach(issue => {
            if (!issuesByFile[issue.file]) issuesByFile[issue.file] = [];
            issuesByFile[issue.file].push(issue);
        });

        const severityOrder = { [Severity.CRITICAL]: 1, [Severity.HIGH]: 2, [Severity.MEDIUM]: 3, [Severity.LOW]: 4 };
        const getSeverityIcon = (severity: Severity) => {
            switch (severity) {
                case Severity.CRITICAL: return <AlertCircle size={14} className="text-red-500" />;
                case Severity.HIGH: return <AlertTriangle size={14} className="text-orange-400" />;
                case Severity.MEDIUM: return <AlertTriangle size={14} className="text-yellow-400" />;
                default: return <Info size={14} className="text-blue-400" />;
            }
        };

        return (
            <div className="h-full w-full p-4 text-xs font-mono text-gray-400">
                {Object.keys(issuesByFile).length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-30">
                        No problems detected in workspace.
                    </div>
                ) : (
                    Object.entries(issuesByFile).sort(([fileA], [fileB]) => fileA.localeCompare(fileB)).map(([fileName, issues]) => (
                        <div key={fileName} className="mb-3">
                            <p className="font-bold text-gray-300 mb-1">{fileName}</p>
                            <div className="pl-4 border-l border-gray-700/50">
                                {issues.sort((a,b) => severityOrder[a.severity] - severityOrder[b.severity]).map(issue => (
                                    <div key={issue.id} className="flex items-start gap-2 py-1 hover:bg-white/5 rounded cursor-pointer" onClick={() => props.onGoToFile(issue.file, issue.line)}>
                                        {getSeverityIcon(issue.severity)}
                                        <span className="text-gray-400">line {issue.line}:</span>
                                        <span className="text-gray-200">{issue.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        )
    };

    const activeTerminal = terminals.find(t => t.id === activeTerminalId);

    const renderTerminalTabs = (isOpen: boolean) => (
        <div className={`flex bg-[var(--color-background-secondary)] ${!isOpen ? 'border-t' : ''} border-[var(--color-border)] text-xs font-medium text-gray-400 select-none`}>
            <button onClick={() => { setActiveTerminalTab('problems'); if (!isOpen) onTerminalResize(250); }} className={`px-4 py-2 border-b-2 ${activeTerminalTab === 'problems' && isOpen ? 'border-[var(--color-accent)] text-white bg-[var(--color-background)]' : 'border-transparent hover:text-white'} flex items-center gap-2`}>
                <AlertTriangle size={14}/> Problems {securityIssues.length > 0 && <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 rounded-full">{securityIssues.length}</span>}
            </button>
            <button onClick={() => { setActiveTerminalTab('output'); if (!isOpen) onTerminalResize(250); }} className={`px-4 py-2 border-b-2 ${activeTerminalTab === 'output' && isOpen ? 'border-[var(--color-accent)] text-white bg-[var(--color-background)]' : 'border-transparent hover:text-white'} flex items-center gap-2`}>
                <Layers size={14}/> Output
            </button>
            <button onClick={() => { setActiveTerminalTab('terminal'); if (!isOpen) onTerminalResize(250); }} className={`px-4 py-2 border-b-2 ${activeTerminalTab === 'terminal' && isOpen ? 'border-[var(--color-accent)] text-white bg-[var(--color-background)]' : 'border-transparent hover:text-white'} flex items-center gap-2`}>
                <TerminalIcon size={14}/> Terminal
            </button>
            <div className="ml-auto flex items-center px-2 gap-1">
                {isOpen && activeTerminalTab === 'terminal' && (
                    <>
                        <div className="relative">
                            <button ref={terminalDropdownTriggerRef} onClick={() => setIsTerminalDropdownOpen(!isTerminalDropdownOpen)} className="flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-md text-xs text-gray-400 hover:text-white">
                                {terminals.length} {activeTerminal?.name} <ChevronDown size={12} />
                            </button>
                            {isTerminalDropdownOpen && createPortal(
                                <div className="absolute bottom-full mb-1 right-0 w-48 bg-[#161b22] border border-white/10 rounded-lg shadow-lg z-[200] p-1.5">
                                    {terminals.map(term => (
                                        <button key={term.id} onClick={() => { setActiveTerminalId(term.id); setIsTerminalDropdownOpen(false); }} className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-md text-xs ${activeTerminalId === term.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                                            <span>{term.name}</span>
                                            {activeTerminalId === term.id && <Check size={14} className="text-cyan-400" />}
                                        </button>
                                    ))}
                                </div>, document.body
                            )}
                        </div>
                        <button onClick={() => handleNewTerminal()} className="p-1.5 bg-black/20 rounded-md text-gray-400 hover:text-white"><Plus size={14}/></button>
                        <button onClick={handleCloseTerminal} className="p-1.5 bg-black/20 rounded-md text-gray-400 hover:text-white"><Trash2 size={14}/></button>
                    </>
                )}
                <button onClick={() => onTerminalResize(isOpen ? 0 : 250)} className="p-1.5 bg-black/20 rounded-md text-gray-400 hover:text-white">
                    {isOpen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
                </button>
            </div>
        </div>
    );

    const anyFileOpen = tabGroups.some(g => g.tabs.length > 0);

    return (
        <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
                {(() => {
                    if (diffData) {
                        return <DiffViewer original={diffData.original} modified={diffData.modified} fileName={diffData.fileName} onApply={() => { if (anyFileOpen) onFileUpdate(diffData.modified); onCloseDiff(); }} onDiscard={onCloseDiff} />;
                    }

                    if (!anyFileOpen) {
                        if (emptyView === 'welcome') {
                            return (
                                <WelcomeScreen 
                                    onNewFile={() => onNewFile()}
                                    onCloneRepo={onCloneRepo}
                                    onOpenCommandPalette={onOpenCommandPalette}
                                    onOpenSettings={onOpenSettings}
                                    isMac={props.isMac}
                                    onClose={() => {}}
                                    userName={currentUser?.name}
                                    // Standardized to activeModelId
                                    activeModelId={activeModelId}
                                    onAIAppGen={onAIAppGen}
                                    onOpenDocs={onOpenDocs}
                                    onOpenRecorder={onOpenRecorder}
                                    recents={recents}
                                    onOpenCollaboration={() => onChangePanel(Panel.TEAM)}
                                    onOpenWhiteboard={() => setEmptyView('whiteboard')}
                                    userPlan={currentUser?.plan}
                                    onRestrictedClick={props.onRestrictedClick}
                                />
                            );
                        } else {
                             return <WhiteboardPane onReturnToWelcome={() => setEmptyView('welcome')} activeModelId={activeModelId} />;
                        }
                    }
                
                    return (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-black/20">
                                {tabGroups.map((group) => (
                                    <div key={group.id} className={`flex flex-col border-b border-white/5 last:border-0 transition-all ${group.isCollapsed ? 'shrink-0' : 'flex-1 min-h-[120px]'}`}>
                                        <div className="flex items-center justify-between px-3 h-10 bg-[#161b22] border-b border-white/5 shrink-0 select-none">
                                            <div className="flex h-full items-center">
                                                {group.tabs.map((tab, tidx) => {
                                                    const isActive = group.activeTabIndex === tidx;
                                                    return (
                                                        <div 
                                                            key={tab.path} 
                                                            onClick={() => onSelectTab(group.id, tidx)}
                                                            className={`flex items-center gap-2 px-4 h-full cursor-pointer transition-all relative group/tab
                                                                ${isActive 
                                                                    ? 'bg-[#0d1117] text-white' 
                                                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                                                                }
                                                                ${isActive ? 'sketch-border border-b-0 rounded-t-xl mx-0.5 mt-1' : 'border-r border-white/5'}
                                                            `}
                                                            style={isActive ? { borderBottom: 'none', borderBottomLeftRadius: '0', borderBottomRightRadius: '0' } : {}}
                                                        >
                                                            <div className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                                                                {tab.node.name.endsWith('.tsx') || tab.node.name.endsWith('.ts') ? <FileCode size={14} /> : <FileText size={14} />}
                                                            </div>
                                                            <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                                                {tab.node.name}
                                                            </span>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); onCloseTab(group.id, tidx); }}
                                                                className={`ml-1 p-0.5 rounded-full transition-all ${isActive ? 'opacity-100 text-gray-500 hover:bg-white/10 hover:text-white' : 'opacity-0 group-hover/tab:opacity-100 text-gray-600 hover:bg-white/5 hover:text-gray-300'}`}
                                                            >
                                                                <X size={10} strokeWidth={3} />
                                                            </button>
                                                            {isActive && (
                                                                <div className="absolute -top-[1px] left-2 right-2 h-0.5 bg-cyan-500 rounded-full shadow-[0_2px_8px_cyan]" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <button onClick={() => onNewFile()} className="p-2 ml-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button onClick={onCreateGroup} className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 hover:text-cyan-400 transition-all">
                                                    <LayoutGrid size={12} /> Split
                                                </button>
                                            </div>
                                        </div>

                                        {group.activeTabIndex !== -1 && group.tabs[group.activeTabIndex] && (
                                            <div className="h-8 flex items-center px-6 bg-[#0d1117]/80 border-b border-white/5 select-none shrink-0 overflow-hidden">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <span className="hover:text-gray-300 cursor-pointer">workspace</span>
                                                    <BreadcrumbSeparator size={10} className="opacity-30" />
                                                    <span className="hover:text-gray-300 cursor-pointer">src</span>
                                                    <BreadcrumbSeparator size={10} className="opacity-30" />
                                                    <span className="text-cyan-400/70">{group.tabs[group.activeTabIndex].node.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        {!group.isCollapsed && (
                                            <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
                                                <div className="flex-1 min-h-0">
                                                    {group.activeTabIndex !== -1 && group.tabs[group.activeTabIndex] ? (
                                                        renderTextarea(group.tabs[group.activeTabIndex])
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-gray-700 text-xs italic font-medium p-8 bg-[#0d1117]/50 gap-4">
                                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                                                <FileText size={24} className="opacity-20" />
                                                            </div>
                                                            No active file in this group
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="flex-shrink-0 flex flex-col">
                {terminalHeight > 0 ? (
                    <div style={{ height: `${terminalHeight}px` }} className="flex flex-col">
                        <div 
                            onMouseDown={startResizing}
                            className="w-full h-1.5 bg-[var(--color-background-tertiary)] hover:bg-[var(--color-accent)] transition-colors cursor-row-resize flex-shrink-0"
                        />
                        {renderTerminalTabs(true)}
                        <div className="flex-1 min-0 bg-[#0d1117] overflow-y-auto custom-scrollbar">
                            {activeTerminalTab === 'problems' && renderProblems()}
                            {activeTerminalTab === 'output' && <div className="p-4 text-xs font-mono text-gray-400 h-full flex items-center justify-center opacity-30">Application output stream offline.</div>}
                            {activeTerminalTab === 'terminal' && (
                                <>
                                    {terminals.map(term => (
                                        <div key={term.id} className={`h-full w-full ${term.id === activeTerminalId ? 'block' : 'hidden'}`}>
                                            <RealTerminal 
                                                ref={term.ref} 
                                                shell={term.shell} 
                                                fontSize={props.fontSize} 
                                                fileStructure={props.fileStructure} 
                                                onNewFile={onNewFile}
                                                onNewFolder={onNewFolder}
                                                onDeleteFile={onDeleteFile}
                                                onCloudAuth={onCloudAuth}
                                                username={terminalUsername}
                                                gitStatus={gitStatus}
                                                onAiIntentRequest={onAIAppGen}
                                                activeModelId={activeModelId}
                                                onCwdChange={onCwdChange}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    renderTerminalTabs(false)
                )}
            </div>
        </div>
    );
});

export default EditorPane;