import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { io, Socket } from 'socket.io-client';
import { FileNode, GitStatus } from '../types';
import { 
    Loader2, 
    Activity, 
    Terminal as TerminalIcon, 
    Trash2,
    Power,
    Plus,
    X,
    ChevronDown,
    Search,
    SplitSquareHorizontal,
    Maximize2,
    Minimize2,
    Copy,
    ArrowUp,
    ArrowDown,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Square,
    Command,
    History,
    Bookmark,
    Play,
    GitBranch,
    Cpu,
    Timer,
    Clipboard,
    ClipboardPaste,
    RotateCcw,
    Keyboard,
    FolderOpen,
    FileText,
    ChevronRight,
    Sparkles,
    Box,
    Download,
    Upload,
    RefreshCw,
    Settings2,
    Layers,
    AlertTriangle,
    Bug,
    Wrench,
    Shield,
    Eye,
    EyeOff,
    Brain,
    Cloud,
    Laptop,
    Globe,
    Server
} from 'lucide-react';

// Terminal connection modes
type TerminalMode = 'local' | 'cloud' | 'browser';

// ═══════════════════════════════════════════════════════════════════════════
// SHELL INTEGRATION - VS Code-style command detection and decorations
// ═══════════════════════════════════════════════════════════════════════════

// Command execution entry with decoration info (VS Code OSC 633 compatible)
interface CommandEntry {
    id: string;
    command: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    exitCode?: number;
    cwd: string;
    // Terminal buffer positions for navigation
    startLine: number;
    endLine?: number;
    // Decoration state
    decoration: 'success' | 'error' | 'running' | 'neutral';
    // Output captured (for quick access)
    outputPreview?: string;
}

// Directory history entry
interface DirectoryEntry {
    path: string;
    lastVisited: Date;
    visitCount: number;
}

// Shell integration state
interface ShellIntegrationState {
    enabled: boolean;
    quality: 'none' | 'basic' | 'rich';
    // Command tracking
    commands: CommandEntry[];
    currentCommandId?: string;
    // Directory tracking
    directories: DirectoryEntry[];
    currentDirectory: string;
    // Sticky scroll state
    stickyCommand?: CommandEntry;
    // Navigation state
    selectedCommandIndex: number;
}

// Cloud provider configurations for terminal
interface CloudTerminalProvider {
    id: string;
    name: string;
    icon: string;
    description: string;
    endpoint?: string;
    connected?: boolean;
}
import aiService from '../services/geminiService';

const XTERM_CSS = `
.xterm{cursor:text;position:relative;user-select:none;-ms-user-select:none;-webkit-user-select:none}.xterm.focus,.xterm:focus{outline:none}.xterm .xterm-helpers{position:absolute;z-index:5}.xterm .xterm-helper-textarea{position:absolute;opacity:0;z-index:-5;margin:0;cursor:default;width:0;height:0;overflow:hidden;white-space:nowrap}.xterm .composition-view{background:#000;color:#FFF;display:none;position:absolute;white-space:pre;z-index:1}.xterm .composition-view.active{display:block}.xterm .xterm-viewport{background-color:transparent !important;overflow-y:scroll;cursor:default;position:absolute;right:0;left:0;top:0;bottom:0}.xterm .xterm-screen{position:relative}.xterm .xterm-screen canvas{position:absolute;left:0;top:0}.xterm-char-measure-element{display:inline-block;visibility:hidden;position:absolute;left:0;top:0}.xterm.enable-mouse-events{cursor:default}.xterm.xterm-cursor-pointer{cursor:pointer}.xterm.xterm-cursor-crosshair{cursor:crosshair}.xterm .xterm-accessibility,.xterm .xterm-message{position:absolute;left:0;top:0;bottom:0;right:0;z-index:10;color:transparent}.xterm .live-region{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.xterm-dim{opacity:0.5}.xterm-underline{text-decoration:underline}.xterm .xterm-viewport::-webkit-scrollbar{width:8px}.xterm .xterm-viewport::-webkit-scrollbar-track{background:transparent}.xterm .xterm-viewport::-webkit-scrollbar-thumb{background:#333;border-radius:4px}.xterm .xterm-viewport::-webkit-scrollbar-thumb:hover{background:#555}
`;

// Cloud terminal providers
const CLOUD_TERMINAL_PROVIDERS: CloudTerminalProvider[] = [
    { id: 'gcp', name: 'Google Cloud Shell', icon: '☁️', description: 'Free cloud environment with 5GB storage' },
    { id: 'aws', name: 'AWS CloudShell', icon: '🔶', description: 'AWS console with 1GB storage' },
    { id: 'azure', name: 'Azure Cloud Shell', icon: '🔷', description: 'Azure portal shell (Bash/PowerShell)' },
    { id: 'gitpod', name: 'Gitpod', icon: '🍊', description: 'Cloud development environments' },
    { id: 'codespaces', name: 'GitHub Codespaces', icon: '🐙', description: 'VS Code in the cloud' },
    { id: 'replit', name: 'Replit', icon: '🔄', description: 'Collaborative browser IDE' },
];

export interface RealTerminalRef {
    runCommand: (cmd: string) => void;
    write: (text: string) => void;
    ensureTerminalVisible: () => void;
    createNewTerminal: (name?: string, shell?: string, mode?: TerminalMode) => void;
    killCurrentTerminal: () => void;
    focusTerminal: () => void;
    getCwd: () => string;
}

interface TerminalSession {
    id: string;
    name: string;
    shell: string;
    terminal: Terminal | null;
    fitAddon: FitAddon | null;
    searchAddon: SearchAddon | null;
    socket: Socket | null;
    isConnected: boolean;
    cwd: string;
    commandHistory: string[];
    historyIndex: number;
    currentLine: string;
    exitCode: number | null;
    isRunning: boolean;
    startTime: Date;
    pid?: number;
    lastCommandTime?: Date;
    lastCommandDuration?: number;
    bookmarkedCommands: string[];
    mode: TerminalMode;
    cloudProvider?: string;
    environment: {
        nodeVersion?: string;
        pythonVersion?: string;
        gitBranch?: string;
    };
    // Shell Integration (VS Code-style)
    shellIntegration: ShellIntegrationState;
}

interface TerminalPane {
    id: string;
    sessions: string[];
    activeSessionId: string;
    splitDirection?: 'horizontal' | 'vertical';
}

interface RealTerminalProps {
    fileStructure: FileNode;
    onNewFile?: (name: string) => void;
    onNewFolder?: (name: string) => void;
    onDeleteFile?: (path: string, silent: boolean) => void;
    shell?: string;
    fontSize?: string;
    username?: string;
    activeModelId?: string;
    onOutput?: (text: string) => void;
    onCloudAuth?: (provider: string) => void;
    authenticatedProviders?: string[];
    gitStatus?: GitStatus;
    onAiIntentRequest?: (prompt: string, mode?: 'chat' | 'app') => void;
    onCwdChange?: (cwd: string) => void;
}

// Shell options - shown dynamically based on platform
const SHELL_OPTIONS_UNIX = [
    { value: 'default', label: 'Default Shell', icon: '💻', shortcut: '⌘1', platform: 'all' },
    { value: 'zsh', label: 'Zsh', icon: '⚡', shortcut: '⌘2', platform: 'unix' },
    { value: 'bash', label: 'Bash', icon: '🐚', shortcut: '⌘3', platform: 'unix' },
    { value: 'fish', label: 'Fish', icon: '🐟', shortcut: '⌘4', platform: 'unix' },
    { value: 'node', label: 'Node REPL', icon: '🟢', shortcut: '⌘5', platform: 'all' },
    { value: 'python', label: 'Python', icon: '🐍', shortcut: '⌘6', platform: 'all' },
];

const SHELL_OPTIONS_WINDOWS = [
    { value: 'default', label: 'Default Shell', icon: '💻', shortcut: '⌘1', platform: 'all' },
    { value: 'gitbash', label: 'Git Bash', icon: '🐚', shortcut: '⌘2', platform: 'win32' },
    { value: 'wsl', label: 'WSL (Linux)', icon: '🐧', shortcut: '⌘3', platform: 'win32' },
    { value: 'pwsh', label: 'PowerShell 7', icon: '⚡', shortcut: '⌘4', platform: 'win32' },
    { value: 'powershell', label: 'PowerShell', icon: '🔷', shortcut: '⌘5', platform: 'win32' },
    { value: 'cmd', label: 'Command Prompt', icon: '📟', shortcut: '⌘6', platform: 'win32' },
    { value: 'node', label: 'Node REPL', icon: '🟢', shortcut: '⌘7', platform: 'all' },
    { value: 'python', label: 'Python', icon: '🐍', shortcut: '⌘8', platform: 'all' },
];

// Detect platform (will be overridden by server info)
const getShellOptions = (platform?: string) => {
    if (platform === 'win32') {
        return SHELL_OPTIONS_WINDOWS;
    }
    return SHELL_OPTIONS_UNIX;
};

// Default fallback
const SHELL_OPTIONS = SHELL_OPTIONS_UNIX;

// Quick command palette
const QUICK_COMMANDS = [
    { label: 'Install Dependencies', cmd: 'npm install', icon: Download, category: 'npm' },
    { label: 'Start Dev Server', cmd: 'npm run dev', icon: Play, category: 'npm' },
    { label: 'Build Project', cmd: 'npm run build', icon: Box, category: 'npm' },
    { label: 'Run Tests', cmd: 'npm test', icon: CheckCircle, category: 'npm' },
    { label: 'Git Status', cmd: 'git status', icon: GitBranch, category: 'git' },
    { label: 'Git Pull', cmd: 'git pull', icon: Download, category: 'git' },
    { label: 'Git Push', cmd: 'git push', icon: Upload, category: 'git' },
    { label: 'Clear Terminal', cmd: 'clear', icon: Trash2, category: 'system' },
];

const RealTerminal = forwardRef<RealTerminalRef, RealTerminalProps>(({ 
    fontSize = '13', 
    fileStructure,
    onNewFile,
    onNewFolder,
    onDeleteFile,
    username = 'dev',
    activeModelId = 'gemini-3-flash-preview',
    onCloudAuth,
    onAiIntentRequest,
    onCwdChange
}, ref) => {
    // State for multi-terminal support
    const [sessions, setSessions] = useState<Map<string, TerminalSession>>(new Map());
    const [panes, setPanes] = useState<TerminalPane[]>([]);
    const [activePane, setActivePane] = useState<string>('');
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [showQuickCommands, setShowQuickCommands] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [completionSuggestions, setCompletionSuggestions] = useState<string[]>([]);
    const [selectedCompletionIndex, setSelectedCompletionIndex] = useState(0);
    const [lastCopiedText, setLastCopiedText] = useState<string | null>(null);
    
    // Terminal mode state
    const [showTerminalModeSelector, setShowTerminalModeSelector] = useState(false);
    const [selectedTerminalMode, setSelectedTerminalMode] = useState<TerminalMode>('local');
    const [selectedCloudProvider, setSelectedCloudProvider] = useState<string | null>(null);
    const [cloudProviders, setCloudProviders] = useState<CloudTerminalProvider[]>(CLOUD_TERMINAL_PROVIDERS);
    
    // Backend server state
    const [backendStatus, setBackendStatus] = useState<'checking' | 'running' | 'stopped'>('checking');
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [isStartingBackend, setIsStartingBackend] = useState(false);
    
    // Platform detection for shell options
    const [serverPlatform, setServerPlatform] = useState<string | null>(null);
    const [availableShells, setAvailableShells] = useState<{ id: string; name: string; available: boolean }[]>([]);
    
    // Fetch platform info from server on mount
    React.useEffect(() => {
        fetch('/api/terminal/shells')
            .then(res => res.json())
            .then(data => {
                setServerPlatform(data.platform);
                setAvailableShells(data.shells || []);
            })
            .catch(() => {
                // Fallback: try to detect from userAgent
                const isWindows = navigator.userAgent.includes('Windows');
                setServerPlatform(isWindows ? 'win32' : 'darwin');
            });
    }, []);

    // Check backend server status
    const checkBackendStatus = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/terminal/shells', { 
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) {
                setBackendStatus('running');
                return true;
            }
            setBackendStatus('stopped');
            return false;
        } catch {
            setBackendStatus('stopped');
            return false;
        }
    }, []);

    // Auto-start backend when terminal is opened
    const startBackend = useCallback(async () => {
        if (isStartingBackend || backendStatus === 'running') return true;
        
        setIsStartingBackend(true);
        
        try {
            // Try to start the backend server via API endpoint
            const response = await fetch('/api/start-backend', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                // Wait a moment for server to initialize
                await new Promise(resolve => setTimeout(resolve, 1500));
                const isRunning = await checkBackendStatus();
                setIsStartingBackend(false);
                return isRunning;
            }
        } catch {
            // If API doesn't exist, the backend might already be running or needs manual start
        }
        
        // Check if it's already running
        const isRunning = await checkBackendStatus();
        setIsStartingBackend(false);
        
        if (!isRunning) {
            console.log('Backend not running. Terminal will use browser mode.');
        }
        
        return isRunning;
    }, [isStartingBackend, backendStatus, checkBackendStatus]);

    // Stop/disconnect backend
    const stopBackend = useCallback(async () => {
        // Disconnect all socket connections
        sessions.forEach(session => {
            if (session.socket) {
                session.socket.disconnect();
            }
        });
        
        // Update all sessions to disconnected
        setSessions(prev => {
            const updated = new Map(prev);
            updated.forEach(session => {
                session.isConnected = false;
                session.socket = null;
            });
            return updated;
        });
        
        setBackendStatus('stopped');
        setShowDisconnectModal(false);
    }, [sessions]);

    // Check backend status on mount
    React.useEffect(() => {
        checkBackendStatus();
    }, [checkBackendStatus]);
    
    // Get shell options based on detected platform
    const shellOptions = React.useMemo(() => {
        const options = getShellOptions(serverPlatform || undefined);
        // If we have available shells from server, mark unavailable ones
        if (availableShells.length > 0) {
            return options.map(opt => ({
                ...opt,
                available: opt.value === 'default' || opt.value === 'node' || opt.value === 'python' || 
                    availableShells.some(s => s.id === opt.value && s.available)
            }));
        }
        return options.map(opt => ({ ...opt, available: true }));
    }, [serverPlatform, availableShells]);
    
    // Self-Healing Runtime State
    const [selfHealingEnabled, setSelfHealingEnabled] = useState(true);
    const [detectedErrors, setDetectedErrors] = useState<{
        id: string;
        error: string;
        context: string;
        timestamp: Date;
        sessionId: string;
        diagnosis?: { issue: string; fix: string; command: string };
        isAnalyzing?: boolean;
        isResolved?: boolean;
    }[]>([]);
    const [showSelfHealingPanel, setShowSelfHealingPanel] = useState(false);
    const outputBufferRef = useRef<Map<string, string>>(new Map());
    
    // Shell Integration State (VS Code-style)
    const [showStickyScroll, setShowStickyScroll] = useState(true);
    const [showCommandDecorations, setShowCommandDecorations] = useState(true);
    const [showRecentDirectories, setShowRecentDirectories] = useState(false);
    const [showCommandGuide, setShowCommandGuide] = useState(false);
    const [hoveredCommandId, setHoveredCommandId] = useState<string | null>(null);
    
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const sessionCounter = useRef(0);
    const sessionsRef = useRef<Map<string, TerminalSession>>(new Map());
    
    // Keep sessionsRef in sync
    useEffect(() => {
        sessionsRef.current = sessions;
    }, [sessions]);
    
    // Shell Integration keyboard shortcuts (⌘↑, ⌘↓, ⌘G, ⌘R)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeSession) return;
            
            // Check for meta key (Cmd on Mac, Ctrl on Windows)
            const isMeta = e.metaKey || e.ctrlKey;
            
            if (isMeta && e.key === 'ArrowUp') {
                // Navigate to previous command
                e.preventDefault();
                const result = navigateToPreviousCommand(activeSession.shellIntegration);
                if (result) {
                    setActiveSessionId(prev => {
                        setSessions(prevSessions => {
                            const newSessions = new Map(prevSessions);
                            const session = newSessions.get(activeSessionId);
                            if (session) {
                                session.shellIntegration = result;
                            }
                            return newSessions;
                        });
                        return prev;
                    });
                }
            } else if (isMeta && e.key === 'ArrowDown') {
                // Navigate to next command
                e.preventDefault();
                const result = navigateToNextCommand(activeSession.shellIntegration);
                if (result) {
                    setActiveSessionId(prev => {
                        setSessions(prevSessions => {
                            const newSessions = new Map(prevSessions);
                            const session = newSessions.get(activeSessionId);
                            if (session) {
                                session.shellIntegration = result;
                            }
                            return newSessions;
                        });
                        return prev;
                    });
                }
            } else if (isMeta && e.key === 'g') {
                // Toggle Recent Directories panel
                e.preventDefault();
                setShowRecentDirectories(prev => !prev);
            } else if (isMeta && e.key === 'r' && !e.shiftKey) {
                // Rerun last command (only if not refresh shortcut)
                if (activeSession.shellIntegration.commands.length > 0) {
                    const lastCmd = activeSession.shellIntegration.commands[activeSession.shellIntegration.commands.length - 1];
                    if (lastCmd) {
                        e.preventDefault();
                        handleSimulatedCommand(lastCmd.command);
                    }
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeSession, activeSessionId]);
    
    // Terminal themes
    const terminalTheme = useMemo(() => ({
        background: 'transparent',
        foreground: '#e4e4e7',
        cursor: '#67e8f9',
        cursorAccent: '#000000',
        selectionBackground: 'rgba(103, 232, 249, 0.3)',
        selectionForeground: '#ffffff',
        selectionInactiveBackground: 'rgba(103, 232, 249, 0.15)',
        black: '#09090b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f4f4f5',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
    }), []);

    // Generate unique session ID
    const generateSessionId = useCallback(() => {
        sessionCounter.current += 1;
        return `term-${Date.now()}-${sessionCounter.current}`;
    }, []);

    // Get active session
    const getActiveSession = useCallback(() => {
        const pane = panes.find(p => p.id === activePane);
        if (!pane) return null;
        return sessions.get(pane.activeSessionId) || null;
    }, [panes, activePane, sessions]);

    // Get files at current directory (for simulated mode)
    const getFilesAtCurrentDir = useCallback((cwd: string) => {
        let current = fileStructure;
        if (cwd !== '~') {
            const parts = cwd.split('/').filter(p => p !== '~' && p !== '');
            for (const part of parts) {
                const found = current.children?.find(c => c.name === part);
                if (found) current = found;
            }
        }
        return current.children || [];
    }, [fileStructure]);

    // Write prompt
    const writePrompt = useCallback((term: Terminal, cwd: string) => {
        const branch = 'main';
        term.write(`\r\n\x1b[1;38;2;34;197;94m${username}\x1b[0m \x1b[1;38;2;59;130;246m${cwd}\x1b[0m \x1b[38;2;168;85;247m(${branch})\x1b[0m \x1b[38;2;250;204;21m❯\x1b[0m `);
    }, [username]);

    // AI suggestion helper
    const getAiSuggestion = useCallback((input: string): string | null => {
        if (!input || input.length < 2) return null;
        const commonCmds = [
            'ls -la', 'ls -lah', 'cd src', 'cd ..', 'cd ~',
            'mkdir components', 'mkdir src', 'mkdir test',
            'npm install', 'npm run dev', 'npm run build', 'npm run test', 'npm start',
            'yarn install', 'yarn dev', 'yarn build',
            'pnpm install', 'pnpm dev', 'pnpm build',
            'git status', 'git add .', 'git commit -m "', 'git push', 'git pull', 'git log --oneline',
            'git checkout -b ', 'git branch', 'git merge ',
            'docker ps', 'docker images', 'docker-compose up', 'docker build -t ',
            'code .', 'vim ', 'nano ',
            'cat ', 'grep -r "', 'find . -name "',
            'curl -X GET ', 'wget ',
            'python ', 'python3 ', 'node ', 'deno run ',
            'az login', 'aws configure', 'gcloud auth login',
            'kubectl get pods', 'kubectl apply -f ', 'kubectl logs ',
            'terraform init', 'terraform plan', 'terraform apply',
            'sai synth "', 'clear', 'exit', 'history'
        ];
        const match = commonCmds.find(c => c.startsWith(input) && c !== input);
        return match ? match.slice(input.length) : null;
    }, []);

    // Enhanced file-based completion
    const getFileCompletions = useCallback((input: string, cwd: string): string[] => {
        const parts = input.trim().split(/\s+/);
        const lastPart = parts[parts.length - 1] || '';
        const files = getFilesAtCurrentDir(cwd);
        
        // Commands that typically take file/folder arguments
        const fileCommands = ['cd', 'cat', 'ls', 'rm', 'cp', 'mv', 'touch', 'mkdir', 'code', 'vim', 'nano', 'less', 'more', 'head', 'tail'];
        const isFileCommand = parts.length > 1 && fileCommands.includes(parts[0]);
        
        if (isFileCommand || lastPart.includes('/')) {
            return files
                .filter(f => f.name.toLowerCase().startsWith(lastPart.toLowerCase()))
                .map(f => f.type === 'folder' ? `${f.name}/` : f.name)
                .slice(0, 10);
        }
        return [];
    }, [getFilesAtCurrentDir]);

    // Bookmark command
    const bookmarkCommand = useCallback((sessionId: string, cmd: string) => {
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s && !s.bookmarkedCommands.includes(cmd)) {
                s.bookmarkedCommands = [...s.bookmarkedCommands, cmd];
            }
            return updated;
        });
    }, []);

    // Remove bookmark
    const removeBookmark = useCallback((sessionId: string, cmd: string) => {
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s) {
                s.bookmarkedCommands = s.bookmarkedCommands.filter(c => c !== cmd);
            }
            return updated;
        });
    }, []);

    // Copy to clipboard with feedback
    const copyToClipboard = useCallback(async (text: string) => {
        await navigator.clipboard.writeText(text);
        setLastCopiedText(text);
        setTimeout(() => setLastCopiedText(null), 2000);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // SHELL INTEGRATION - VS Code-style Command Detection & Decorations
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Create initial shell integration state
    const createShellIntegrationState = useCallback((): ShellIntegrationState => ({
        enabled: true,
        quality: 'rich',
        commands: [],
        directories: [],
        currentDirectory: '~',
        selectedCommandIndex: -1,
    }), []);

    // Start tracking a new command
    const startCommandTracking = useCallback((sessionId: string, command: string) => {
        const session = sessionsRef.current.get(sessionId);
        if (!session?.terminal) return;
        
        const commandEntry: CommandEntry = {
            id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            command,
            startTime: new Date(),
            cwd: session.cwd,
            startLine: session.terminal.buffer.active.cursorY + session.terminal.buffer.active.viewportY,
            decoration: 'running',
        };
        
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s) {
                s.shellIntegration.commands = [...s.shellIntegration.commands.slice(-99), commandEntry]; // Keep last 100
                s.shellIntegration.currentCommandId = commandEntry.id;
            }
            return updated;
        });
        
        return commandEntry.id;
    }, []);

    // Complete a tracked command with exit code
    const completeCommandTracking = useCallback((sessionId: string, exitCode: number = 0) => {
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s && s.shellIntegration.currentCommandId) {
                const endTime = new Date();
                s.shellIntegration.commands = s.shellIntegration.commands.map(cmd => 
                    cmd.id === s.shellIntegration.currentCommandId
                        ? {
                            ...cmd,
                            endTime,
                            duration: endTime.getTime() - cmd.startTime.getTime(),
                            exitCode,
                            endLine: s.terminal?.buffer.active.cursorY ?? cmd.startLine,
                            decoration: exitCode === 0 ? 'success' : 'error',
                        }
                        : cmd
                );
                s.shellIntegration.currentCommandId = undefined;
            }
            return updated;
        });
    }, []);

    // Track directory change
    const trackDirectoryChange = useCallback((sessionId: string, newDir: string) => {
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s) {
                const existingDir = s.shellIntegration.directories.find(d => d.path === newDir);
                if (existingDir) {
                    s.shellIntegration.directories = s.shellIntegration.directories.map(d =>
                        d.path === newDir
                            ? { ...d, lastVisited: new Date(), visitCount: d.visitCount + 1 }
                            : d
                    );
                } else {
                    s.shellIntegration.directories = [
                        ...s.shellIntegration.directories.slice(-49), // Keep last 50
                        { path: newDir, lastVisited: new Date(), visitCount: 1 }
                    ];
                }
                s.shellIntegration.currentDirectory = newDir;
            }
            return updated;
        });
    }, []);

    // Navigate to previous command (Cmd+Up)
    const navigateToPreviousCommand = useCallback(() => {
        const session = getActiveSession();
        if (!session?.terminal || session.shellIntegration.commands.length === 0) return;
        
        const commands = session.shellIntegration.commands;
        const currentIndex = session.shellIntegration.selectedCommandIndex;
        const newIndex = currentIndex < 0 
            ? commands.length - 1 
            : Math.max(0, currentIndex - 1);
        
        const targetCommand = commands[newIndex];
        if (targetCommand && targetCommand.startLine !== undefined) {
            session.terminal.scrollToLine(targetCommand.startLine);
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(session.id);
                if (s) s.shellIntegration.selectedCommandIndex = newIndex;
                return updated;
            });
        }
    }, [getActiveSession]);

    // Navigate to next command (Cmd+Down)
    const navigateToNextCommand = useCallback(() => {
        const session = getActiveSession();
        if (!session?.terminal || session.shellIntegration.commands.length === 0) return;
        
        const commands = session.shellIntegration.commands;
        const currentIndex = session.shellIntegration.selectedCommandIndex;
        const newIndex = currentIndex < 0 
            ? 0 
            : Math.min(commands.length - 1, currentIndex + 1);
        
        const targetCommand = commands[newIndex];
        if (targetCommand && targetCommand.startLine !== undefined) {
            session.terminal.scrollToLine(targetCommand.startLine);
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(session.id);
                if (s) s.shellIntegration.selectedCommandIndex = newIndex;
                return updated;
            });
        }
    }, [getActiveSession]);

    // Re-run a command from history
    const rerunCommand = useCallback((sessionId: string, command: string) => {
        const session = sessionsRef.current.get(sessionId);
        if (!session?.terminal) return;
        
        if (session.isConnected && session.socket) {
            session.socket.emit('input', command + '\r');
        } else {
            session.terminal.write(command);
            handleSimulatedCommand(command, session);
        }
    }, [handleSimulatedCommand]);

    // Get recent directories sorted by last visit
    const getRecentDirectories = useCallback((sessionId: string): DirectoryEntry[] => {
        const session = sessionsRef.current.get(sessionId);
        if (!session) return [];
        return [...session.shellIntegration.directories]
            .sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime())
            .slice(0, 10);
    }, []);

    // Parse OSC 633 escape sequences (VS Code shell integration protocol)
    const parseOSC633Sequence = useCallback((data: string, sessionId: string) => {
        // OSC 633 ; A ST - Mark prompt start
        // OSC 633 ; B ST - Mark prompt end  
        // OSC 633 ; C ST - Mark pre-execution
        // OSC 633 ; D [; <exitcode>] ST - Mark execution finished
        // OSC 633 ; E ; <commandline> ST - Set command line
        // OSC 633 ; P ; <Property>=<Value> ST - Set property
        
        const oscPattern = /\x1b\]633;([A-Z]);?([^\x07\x1b]*)?(?:\x07|\x1b\\)/g;
        let match;
        
        while ((match = oscPattern.exec(data)) !== null) {
            const [, type, value] = match;
            
            switch (type) {
                case 'A': // Prompt start
                    break;
                case 'B': // Prompt end
                    break;
                case 'C': // Pre-execution (command about to run)
                    break;
                case 'D': // Execution finished
                    const exitCode = value ? parseInt(value, 10) : 0;
                    completeCommandTracking(sessionId, exitCode);
                    break;
                case 'E': // Command line
                    if (value) {
                        const decodedCommand = value
                            .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                            .replace(/\\\\/g, '\\');
                        startCommandTracking(sessionId, decodedCommand);
                    }
                    break;
                case 'P': // Property
                    if (value) {
                        const [prop, propValue] = value.split('=');
                        if (prop === 'Cwd') {
                            trackDirectoryChange(sessionId, propValue);
                        }
                    }
                    break;
            }
        }
    }, [startCommandTracking, completeCommandTracking, trackDirectoryChange]);

    // ═══════════════════════════════════════════════════════════════════════════
    // SELF-HEALING RUNTIME - Error Detection & AI Diagnosis
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Error patterns to detect in terminal output
    const ERROR_PATTERNS = useMemo(() => [
        // Node.js / npm errors
        { pattern: /npm\s+ERR!/gi, type: 'npm' },
        { pattern: /Error:\s+(.+)/gi, type: 'general' },
        { pattern: /ENOENT|EACCES|EPERM|EEXIST/gi, type: 'filesystem' },
        { pattern: /Cannot find module ['"](.+)['"]/gi, type: 'module' },
        { pattern: /SyntaxError:\s+(.+)/gi, type: 'syntax' },
        { pattern: /TypeError:\s+(.+)/gi, type: 'type' },
        { pattern: /ReferenceError:\s+(.+)/gi, type: 'reference' },
        { pattern: /FATAL\s+ERROR/gi, type: 'fatal' },
        
        // Python errors
        { pattern: /Traceback \(most recent call last\)/gi, type: 'python' },
        { pattern: /ModuleNotFoundError:\s+(.+)/gi, type: 'python-module' },
        { pattern: /ImportError:\s+(.+)/gi, type: 'python-import' },
        { pattern: /IndentationError:\s+(.+)/gi, type: 'python-indent' },
        { pattern: /NameError:\s+(.+)/gi, type: 'python-name' },
        
        // Shell errors
        { pattern: /command not found/gi, type: 'command' },
        { pattern: /No such file or directory/gi, type: 'path' },
        { pattern: /Permission denied/gi, type: 'permission' },
        { pattern: /zsh:\s+(.+)/gi, type: 'shell' },
        { pattern: /bash:\s+(.+)/gi, type: 'shell' },
        
        // Git errors
        { pattern: /fatal:\s+(.+)/gi, type: 'git' },
        { pattern: /error:\s+failed to push/gi, type: 'git-push' },
        { pattern: /CONFLICT \(content\)/gi, type: 'git-conflict' },
        
        // Build errors
        { pattern: /Build failed/gi, type: 'build' },
        { pattern: /Compilation failed/gi, type: 'compile' },
        { pattern: /Failed to compile/gi, type: 'compile' },
        { pattern: /\[ERROR\]/gi, type: 'general' },
        
        // Docker errors
        { pattern: /docker:\s+Error/gi, type: 'docker' },
        { pattern: /Cannot connect to the Docker daemon/gi, type: 'docker-daemon' },
        
        // Network errors
        { pattern: /ETIMEDOUT|ECONNREFUSED|ECONNRESET/gi, type: 'network' },
        { pattern: /getaddrinfo\s+ENOTFOUND/gi, type: 'dns' },
    ], []);

    // Detect errors in terminal output
    const detectErrors = useCallback((output: string, sessionId: string): boolean => {
        if (!selfHealingEnabled) return false;
        
        // Strip ANSI codes for analysis
        const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[\?[0-9;]*[a-zA-Z]/g, '');
        
        for (const { pattern, type } of ERROR_PATTERNS) {
            pattern.lastIndex = 0; // Reset regex
            if (pattern.test(cleanOutput)) {
                // Get context around the error (last few lines)
                const lines = cleanOutput.split(/\r?\n/).filter(l => l.trim());
                const errorContext = lines.slice(-15).join('\n');
                
                // Check if this error was already detected recently (debounce)
                const errorHash = `${type}-${errorContext.slice(0, 100)}`;
                const existingError = detectedErrors.find(e => 
                    e.sessionId === sessionId && 
                    e.context.slice(0, 100) === errorContext.slice(0, 100) &&
                    Date.now() - e.timestamp.getTime() < 5000
                );
                
                if (!existingError) {
                    const newError = {
                        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        error: type,
                        context: errorContext,
                        timestamp: new Date(),
                        sessionId,
                        isAnalyzing: true,
                    };
                    
                    setDetectedErrors(prev => [newError, ...prev].slice(0, 10)); // Keep last 10 errors
                    setShowSelfHealingPanel(true);
                    
                    // Trigger AI diagnosis
                    analyzeErrorWithAI(newError.id, errorContext);
                    return true;
                }
            }
        }
        return false;
    }, [selfHealingEnabled, ERROR_PATTERNS, detectedErrors]);

    // AI-powered error analysis
    const analyzeErrorWithAI = useCallback(async (errorId: string, errorContext: string) => {
        try {
            const diagnosis = await aiService.analyzeTerminalError(errorContext, activeModelId);
            
            setDetectedErrors(prev => prev.map(e => 
                e.id === errorId 
                    ? { ...e, diagnosis, isAnalyzing: false }
                    : e
            ));
        } catch (error) {
            console.error('AI diagnosis failed:', error);
            setDetectedErrors(prev => prev.map(e => 
                e.id === errorId 
                    ? { 
                        ...e, 
                        diagnosis: { 
                            issue: 'Analysis failed', 
                            fix: 'Try running the command again or check the error manually.', 
                            command: '' 
                        }, 
                        isAnalyzing: false 
                    }
                    : e
            ));
        }
    }, [activeModelId]);

    // Apply suggested fix
    const applySuggestedFix = useCallback((errorId: string, command: string) => {
        const session = getActiveSession();
        if (session && command) {
            if (session.isConnected && session.socket) {
                session.socket.emit('input', command + '\r');
            } else if (session.terminal) {
                session.terminal.write(command);
                handleSimulatedCommand(command, session);
            }
            
            // Mark error as resolved
            setDetectedErrors(prev => prev.map(e => 
                e.id === errorId ? { ...e, isResolved: true } : e
            ));
        }
    }, [getActiveSession]);

    // Dismiss error
    const dismissError = useCallback((errorId: string) => {
        setDetectedErrors(prev => prev.filter(e => e.id !== errorId));
    }, []);

    // Clear all errors
    const clearAllErrors = useCallback(() => {
        setDetectedErrors([]);
        setShowSelfHealingPanel(false);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════

    // Paste from clipboard
    const pasteFromClipboard = useCallback(async () => {
        const text = await navigator.clipboard.readText();
        const session = getActiveSession();
        if (session?.terminal) {
            if (session.isConnected && session.socket) {
                session.socket.emit('input', text);
            } else {
                session.terminal.write(text);
            }
        }
    }, [getActiveSession]);

    // Kill a terminal session
    const killSession = useCallback((sessionId: string) => {
        const session = sessionsRef.current.get(sessionId);
        if (session) {
            session.terminal?.dispose();
            session.socket?.disconnect();
        }

        setSessions(prev => {
            const updated = new Map(prev);
            updated.delete(sessionId);
            return updated;
        });

        setPanes(prev => prev.map(p => {
            const newSessions = p.sessions.filter(s => s !== sessionId);
            if (newSessions.length === 0) return p;
            return {
                ...p,
                sessions: newSessions,
                activeSessionId: p.activeSessionId === sessionId ? newSessions[0] : p.activeSessionId
            };
        }).filter(p => p.sessions.length > 0));
    }, []);

    // Handle simulated commands
    const handleSimulatedCommand = useCallback(async (
        cmd: string, 
        session: TerminalSession
    ) => {
        const term = session.terminal;
        if (!term) return;
        
        const trimmed = cmd.trim();
        if (!trimmed) {
            writePrompt(term, session.cwd);
            return;
        }

        // Track command execution time
        const startTime = Date.now();
        
        // Shell Integration: Start tracking this command
        const commandId = startCommandTracking(session.id, trimmed);

        // Add to history
        const updatedHistory = [...session.commandHistory, trimmed];
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(session.id);
            if (s) {
                s.commandHistory = updatedHistory;
                s.historyIndex = updatedHistory.length;
                s.lastCommandTime = new Date();
            }
            return updated;
        });

        const parts = trimmed.split(/\s+/);
        const action = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Update duration after command completes
        const updateDuration = (exitCode: number = 0) => {
            const duration = Date.now() - startTime;
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(session.id);
                if (s) {
                    s.lastCommandDuration = duration;
                }
                return updated;
            });
            // Shell Integration: Complete command tracking
            completeCommandTracking(session.id, exitCode);
        };

        // Filesystem commands - try real filesystem first, fall back to virtual
        if (action === 'ls') {
            const showAll = args.includes('-a') || args.includes('-la') || args.includes('-lah');
            const showLong = args.includes('-l') || args.includes('-la') || args.includes('-lah');
            
            // Try to list real local files via API
            try {
                const targetPath = args.find(a => !a.startsWith('-')) || session.cwd;
                const apiPath = targetPath === '~' ? '' : targetPath;
                const endpoint = showAll ? '/api/fs/list-all' : '/api/fs/list';
                const response = await fetch(`${endpoint}?path=${encodeURIComponent(apiPath)}`);
                const data = await response.json();
                
                if (data.success && data.items) {
                    if (data.items.length === 0) {
                        term.write('\r\n');
                    } else if (showLong) {
                        term.write('\r\n\x1b[38;2;148;163;184mtotal ' + data.items.length + '\x1b[0m\r\n');
                        data.items.forEach((f: any) => {
                            const type = f.isDirectory ? 'd' : '-';
                            const perms = f.isDirectory ? 'rwxr-xr-x' : 'rw-r--r--';
                            const color = f.isDirectory ? '\x1b[1;38;2;59;130;246m' : (f.isHidden ? '\x1b[38;2;100;100;120m' : '');
                            const suffix = f.isDirectory ? '/' : '';
                            const size = f.size ? String(f.size).padStart(8) : '    4096';
                            const date = f.modified ? new Date(f.modified).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Jan 31 12:00';
                            term.write(`\x1b[38;2;148;163;184m${type}${perms}  1 ${username}  staff ${size} ${date}\x1b[0m ${color}${f.name}${suffix}\x1b[0m\r\n`);
                        });
                    } else {
                        const output = data.items.map((f: any) => 
                            f.isDirectory ? `\x1b[1;38;2;59;130;246m${f.name}/\x1b[0m` : (f.isHidden ? `\x1b[38;2;100;100;120m${f.name}\x1b[0m` : f.name)
                        ).join('  ');
                        term.write(`\r\n${output}\r\n`);
                    }
                    updateDuration(0);
                    writePrompt(term, session.cwd);
                    return;
                }
            } catch {
                // Fall back to virtual filesystem
            }
            
            // Fallback: use virtual file structure
            const files = getFilesAtCurrentDir(session.cwd);
            
            if (files.length === 0) {
                term.write('\r\n');
            } else {
                if (showLong) {
                    term.write('\r\n\x1b[38;2;148;163;184mtotal ' + files.length + '\x1b[0m\r\n');
                    files.forEach(f => {
                        const type = f.type === 'folder' ? 'd' : '-';
                        const perms = f.type === 'folder' ? 'rwxr-xr-x' : 'rw-r--r--';
                        const color = f.type === 'folder' ? '\x1b[1;38;2;59;130;246m' : '';
                        const suffix = f.type === 'folder' ? '/' : '';
                        term.write(`\x1b[38;2;148;163;184m${type}${perms}  1 ${username}  staff    4096 Jan 31 12:00\x1b[0m ${color}${f.name}${suffix}\x1b[0m\r\n`);
                    });
                } else {
                    const output = files.map(f => 
                        f.type === 'folder' ? `\x1b[1;38;2;59;130;246m${f.name}/\x1b[0m` : f.name
                    ).join('  ');
                    term.write(`\r\n${output}\r\n`);
                }
            }
        } else if (action === 'cd') {
            const target = args[0] || '~';
            let newCwd = session.cwd;
            
            // Try real filesystem first
            try {
                let targetPath = target;
                if (target === '~') {
                    const homeRes = await fetch('/api/fs/home');
                    const homeData = await homeRes.json();
                    if (homeData.success) {
                        targetPath = homeData.home;
                    }
                } else if (target === '..') {
                    const parts = session.cwd.split('/');
                    parts.pop();
                    targetPath = parts.join('/') || '/';
                } else if (!target.startsWith('/')) {
                    targetPath = session.cwd === '~' ? target : `${session.cwd}/${target}`;
                }
                
                const checkRes = await fetch(`/api/fs/exists?path=${encodeURIComponent(targetPath)}`);
                const checkData = await checkRes.json();
                
                if (checkData.success && checkData.exists && checkData.isDirectory) {
                    newCwd = checkData.path;
                    setSessions(prev => {
                        const updated = new Map(prev);
                        const s = updated.get(session.id);
                        if (s) s.cwd = newCwd;
                        return updated;
                    });
                    session.cwd = newCwd;
                    onCwdChange?.(newCwd);
                    trackDirectoryChange(session.id, newCwd); // Shell Integration
                    updateDuration(0);
                    writePrompt(term, session.cwd);
                    return;
                } else if (checkData.success && !checkData.exists) {
                    term.write(`\r\n\x1b[38;2;239;68;68mcd: no such directory: ${target}\x1b[0m\r\n`);
                    updateDuration(1); // Error exit code
                    writePrompt(term, session.cwd);
                    return;
                }
            } catch {
                // Fall back to virtual filesystem
            }
            
            // Fallback to virtual filesystem
            if (target === '~' || target === '/') {
                newCwd = '~';
            } else if (target === '..') {
                if (session.cwd !== '~') {
                    const cwdParts = session.cwd.split('/');
                    cwdParts.pop();
                    newCwd = cwdParts.join('/') || '~';
                }
            } else if (target.startsWith('/')) {
                newCwd = target;
            } else {
                const files = getFilesAtCurrentDir(session.cwd);
                const dir = files.find(f => f.name === target && f.type === 'folder');
                if (dir) {
                    newCwd = session.cwd === '~' ? target : `${session.cwd}/${target}`;
                } else {
                    term.write(`\r\n\x1b[38;2;239;68;68mcd: no such directory: ${target}\x1b[0m\r\n`);
                }
            }
            
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(session.id);
                if (s) s.cwd = newCwd;
                return updated;
            });
            session.cwd = newCwd;
            onCwdChange?.(newCwd);
            trackDirectoryChange(session.id, newCwd); // Shell Integration
        } else if (action === 'pwd') {
            term.write(`\r\n${session.cwd}\r\n`);
        } else if (action === 'mkdir') {
            if (args[0] && onNewFolder) {
                onNewFolder(args[0]);
                term.write(`\r\n\x1b[38;2;34;197;94m✓\x1b[0m Created directory: ${args[0]}\r\n`);
            } else {
                term.write(`\r\n\x1b[38;2;239;68;68mmkdir: missing operand\x1b[0m\r\n`);
            }
        } else if (action === 'touch') {
            if (args[0] && onNewFile) {
                onNewFile(args[0]);
                term.write(`\r\n\x1b[38;2;34;197;94m✓\x1b[0m Created file: ${args[0]}\r\n`);
            } else {
                term.write(`\r\n\x1b[38;2;239;68;68mtouch: missing file operand\x1b[0m\r\n`);
            }
        } else if (action === 'rm') {
            const target = args.find(a => !a.startsWith('-'));
            if (target && onDeleteFile) {
                onDeleteFile(target, true);
                term.write(`\r\n\x1b[38;2;34;197;94m✓\x1b[0m Removed: ${target}\r\n`);
            }
        } else if (action === 'cat') {
            if (args[0]) {
                // Try real filesystem first
                try {
                    const filePath = args[0].startsWith('/') ? args[0] : 
                        (session.cwd === '~' ? args[0] : `${session.cwd}/${args[0]}`);
                    const response = await fetch(`/api/fs/read?path=${encodeURIComponent(filePath)}`);
                    const data = await response.json();
                    
                    if (data.success && data.content !== undefined) {
                        // Syntax highlight based on file extension
                        const ext = args[0].split('.').pop()?.toLowerCase();
                        const content = data.content;
                        
                        if (['json', 'js', 'ts', 'tsx', 'jsx'].includes(ext || '')) {
                            term.write(`\r\n\x1b[38;2;148;163;184m${content}\x1b[0m\r\n`);
                        } else {
                            term.write(`\r\n${content}\r\n`);
                        }
                        updateDuration(0);
                        writePrompt(term, session.cwd);
                        return;
                    }
                } catch {
                    // Fall back to virtual filesystem
                }
                
                // Fallback to virtual filesystem
                const files = getFilesAtCurrentDir(session.cwd);
                const file = files.find(f => f.name === args[0] && f.type === 'file');
                if (file && file.content) {
                    term.write(`\r\n${file.content}\r\n`);
                } else {
                    term.write(`\r\n\x1b[38;2;239;68;68mcat: ${args[0]}: No such file\x1b[0m\r\n`);
                }
            }
        } else if (action === 'echo') {
            term.write(`\r\n${args.join(' ')}\r\n`);
        } else if (action === 'whoami') {
            term.write(`\r\n${username}\r\n`);
        } else if (action === 'date') {
            term.write(`\r\n${new Date().toString()}\r\n`);
        } 
        // Windows command aliases
        else if (action === 'dir') {
            // Alias for ls -la on Windows
            const files = getFilesAtCurrentDir(session.cwd);
            term.write('\r\n\x1b[38;2;148;163;184m Directory of ' + session.cwd + '\x1b[0m\r\n\r\n');
            if (files.length === 0) {
                term.write('\x1b[38;2;148;163;184m  (empty)\x1b[0m\r\n');
            } else {
                files.forEach(f => {
                    const type = f.type === 'folder' ? '<DIR>' : '     ';
                    const color = f.type === 'folder' ? '\x1b[1;38;2;59;130;246m' : '';
                    term.write(`\x1b[38;2;148;163;184m  ${type}\x1b[0m  ${color}${f.name}\x1b[0m\r\n`);
                });
                term.write(`\r\n\x1b[38;2;148;163;184m  ${files.length} item(s)\x1b[0m\r\n`);
            }
        } else if (action === 'type') {
            // Windows alias for cat
            if (args[0]) {
                const files = getFilesAtCurrentDir(session.cwd);
                const file = files.find(f => f.name === args[0] && f.type === 'file');
                if (file && file.content) {
                    term.write(`\r\n${file.content}\r\n`);
                } else {
                    term.write(`\r\n\x1b[38;2;239;68;68mThe system cannot find the file specified.\x1b[0m\r\n`);
                }
            } else {
                term.write(`\r\n\x1b[38;2;239;68;68mThe syntax of the command is incorrect.\x1b[0m\r\n`);
            }
        } else if (action === 'md') {
            // Windows alias for mkdir
            if (args[0] && onNewFolder) {
                onNewFolder(args[0]);
                term.write(`\r\n\x1b[38;2;34;197;94m✓\x1b[0m Created directory: ${args[0]}\r\n`);
            } else {
                term.write(`\r\n\x1b[38;2;239;68;68mThe syntax of the command is incorrect.\x1b[0m\r\n`);
            }
        } else if (action === 'del' || action === 'erase') {
            // Windows alias for rm
            const target = args.find(a => !a.startsWith('/'));
            if (target && onDeleteFile) {
                onDeleteFile(target, true);
                term.write(`\r\n\x1b[38;2;34;197;94m✓\x1b[0m Deleted: ${target}\r\n`);
            }
        } else if (action === 'copy') {
            term.write(`\r\n\x1b[38;2;234;179;8m⚠\x1b[0m File copy is not available in browser mode.\r\n`);
        } else if (action === 'move' || action === 'mv') {
            term.write(`\r\n\x1b[38;2;234;179;8m⚠\x1b[0m File move is not available in browser mode.\r\n`);
        } else if (action === 'ren' || action === 'rename') {
            term.write(`\r\n\x1b[38;2;234;179;8m⚠\x1b[0m Rename is not available in browser mode.\r\n`);
        } else if (action === 'ver') {
            // Windows version command
            term.write('\r\n\x1b[38;2;148;163;184mSai IDE Terminal v3.0 [Browser Mode]\x1b[0m\r\n');
            term.write('\x1b[38;2;100;100;120mCross-platform terminal emulator\x1b[0m\r\n');
        } else if (action === 'hostname') {
            term.write('\r\nsai-ide.local\r\n');
        } else if (action === 'uname') {
            const flag = args[0] || '';
            if (flag === '-a') {
                term.write('\r\nSai-IDE Browser 3.0 x86_64 Sai Terminal\r\n');
            } else {
                term.write('\r\nSai-IDE\r\n');
            }
        } else if (action === 'neofetch' || action === 'sysinfo' || action === 'systeminfo') {
            // Modern system info display
            term.write('\r\n');
            term.write('\x1b[38;2;6;182;212m       ███████╗ █████╗ ██╗\x1b[0m      \x1b[1m' + username + '\x1b[0m\x1b[38;2;148;163;184m@\x1b[0m\x1b[1msai-ide\x1b[0m\r\n');
            term.write('\x1b[38;2;6;182;212m       ██╔════╝██╔══██╗██║\x1b[0m      \x1b[38;2;148;163;184m──────────────────────\x1b[0m\r\n');
            term.write('\x1b[38;2;6;182;212m       ███████╗███████║██║\x1b[0m      \x1b[38;2;250;204;21mOS:\x1b[0m Sai IDE v3.0\r\n');
            term.write('\x1b[38;2;6;182;212m       ╚════██║██╔══██║██║\x1b[0m      \x1b[38;2;250;204;21mShell:\x1b[0m ' + (session.shell === 'default' ? 'zsh' : session.shell) + '\r\n');
            term.write('\x1b[38;2;6;182;212m       ███████║██║  ██║██║\x1b[0m      \x1b[38;2;250;204;21mTerminal:\x1b[0m Neural Terminal\r\n');
            term.write('\x1b[38;2;6;182;212m       ╚══════╝╚═╝  ╚═╝╚═╝\x1b[0m      \x1b[38;2;250;204;21mNode:\x1b[0m ' + (session.environment.nodeVersion || 'N/A') + '\r\n');
            term.write('\x1b[0m                               \x1b[38;2;250;204;21mPython:\x1b[0m ' + (session.environment.pythonVersion || 'N/A') + '\r\n');
            term.write('\x1b[38;2;6;182;212m     Neural-Powered IDE\x1b[0m        \x1b[38;2;250;204;21mGit:\x1b[0m ' + (session.environment.gitBranch || 'N/A') + '\r\n');
            term.write('                               \x1b[38;2;250;204;21mUptime:\x1b[0m ' + Math.floor((Date.now() - session.startTime.getTime()) / 1000) + 's\r\n');
            term.write('\r\n');
            term.write('       \x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m\r\n');
            term.write('\r\n');
        } else if (action === 'clear' || action === 'cls') {
            term.clear();
        } else if (action === 'history') {
            session.commandHistory.forEach((histCmd, i) => {
                term.write(`\r\n  ${i + 1}  ${histCmd}`);
            });
            term.write('\r\n');
        } else if (action === 'exit' || action === 'quit') {
            term.write('\r\n\x1b[38;2;148;163;184mSession ended.\x1b[0m\r\n');
            killSession(session.id);
            return;
        }
        // Cloud CLI interceptors
        else if (action === 'az' && args[0] === 'login') {
            term.write('\r\n\x1b[38;2;6;182;212m⚡ [Sai] Azure Login Intent detected. Opening Identity Provider...\x1b[0m\r\n');
            if (onCloudAuth) onCloudAuth('Azure');
        } else if (action === 'aws' && (args[0] === 'configure' || args[0] === 'login')) {
            term.write('\r\n\x1b[38;2;6;182;212m⚡ [Sai] AWS Configuration Intent detected. Opening Identity Provider...\x1b[0m\r\n');
            if (onCloudAuth) onCloudAuth('AWS');
        } else if (action === 'gcloud' && args[0] === 'auth') {
            term.write('\r\n\x1b[38;2;6;182;212m⚡ [Sai] GCP Auth Intent detected. Opening Identity Provider...\x1b[0m\r\n');
            if (onCloudAuth) onCloudAuth('GCP');
        }
        // IDE Synthesis commands
        else if (action === 'sai' || action === 'synth') {
            const subAction = action === 'synth' ? 'synth' : args[0]?.toLowerCase();
            if (subAction === 'synth') {
                const prompt = action === 'synth' ? args.join(' ') : args.slice(1).join(' ');
                if (onAiIntentRequest && prompt) {
                    term.write(`\r\n\x1b[38;2;6;182;212m⚡ [Sai] Handing over to Neural Synthesis Engine...\x1b[0m\r\n`);
                    term.write(`\x1b[38;2;148;163;184m   Prompt: "${prompt}"\x1b[0m\r\n`);
                    onAiIntentRequest(prompt, 'app');
                } else {
                    term.write('\r\n\x1b[38;2;239;68;68mError: Synthesis requires a descriptive prompt.\x1b[0m\r\n');
                    term.write('\x1b[38;2;148;163;184mUsage: sai synth "create a weather dashboard"\x1b[0m\r\n');
                }
            } else if (subAction === 'help') {
                term.write('\r\n\x1b[1;38;2;6;182;212mSai IDE Commands:\x1b[0m\r\n');
                term.write('  \x1b[38;2;250;204;21msai synth\x1b[0m <prompt>  - Generate code from natural language\r\n');
                term.write('  \x1b[38;2;250;204;21msai help\x1b[0m             - Show this help message\r\n');
            }
        }
        // Help command
        else if (action === 'help') {
            term.write('\r\n');
            term.write('\x1b[38;2;82;82;91m╭──────────────────────────────────────────────────────────────────╮\x1b[0m\r\n');
            term.write('\x1b[38;2;82;82;91m│\x1b[0m  \x1b[1;38;2;6;182;212m⚡ Sai Terminal\x1b[0m \x1b[38;2;148;163;184m- Cross-Platform Command Interface\x1b[0m          \x1b[38;2;82;82;91m│\x1b[0m\r\n');
            term.write('\x1b[38;2;82;82;91m╰──────────────────────────────────────────────────────────────────╯\x1b[0m\r\n');
            term.write('\r\n');
            term.write('\x1b[1;38;2;250;204;21m📁 File System\x1b[0m \x1b[38;2;100;100;120m(Unix / Windows)\x1b[0m\r\n');
            term.write('  \x1b[38;2;34;197;94mls\x1b[0m / \x1b[38;2;59;130;246mdir\x1b[0m        List directory contents\r\n');
            term.write('  \x1b[38;2;34;197;94mcd\x1b[0m <dir>          Change directory\r\n');
            term.write('  \x1b[38;2;34;197;94mpwd\x1b[0m                Print working directory\r\n');
            term.write('  \x1b[38;2;34;197;94mmkdir\x1b[0m / \x1b[38;2;59;130;246mmd\x1b[0m        Create directory\r\n');
            term.write('  \x1b[38;2;34;197;94mtouch\x1b[0m <name>       Create file\r\n');
            term.write('  \x1b[38;2;34;197;94mrm\x1b[0m / \x1b[38;2;59;130;246mdel\x1b[0m          Remove file/folder\r\n');
            term.write('  \x1b[38;2;34;197;94mcat\x1b[0m / \x1b[38;2;59;130;246mtype\x1b[0m        Display file contents\r\n');
            term.write('\r\n');
            term.write('\x1b[1;38;2;168;85;247m💻 Terminal\x1b[0m\r\n');
            term.write('  \x1b[38;2;34;197;94mclear\x1b[0m / \x1b[38;2;59;130;246mcls\x1b[0m      Clear terminal screen\r\n');
            term.write('  \x1b[38;2;34;197;94mhistory\x1b[0m            Show command history\r\n');
            term.write('  \x1b[38;2;34;197;94mexit\x1b[0m / \x1b[38;2;59;130;246mquit\x1b[0m      Close terminal session\r\n');
            term.write('  \x1b[38;2;34;197;94mecho\x1b[0m <text>        Print text\r\n');
            term.write('  \x1b[38;2;34;197;94mdate\x1b[0m               Show current date/time\r\n');
            term.write('  \x1b[38;2;34;197;94mwhoami\x1b[0m             Display username\r\n');
            term.write('  \x1b[38;2;34;197;94mneofetch\x1b[0m           System information\r\n');
            term.write('\r\n');
            term.write('\x1b[1;38;2;59;130;246m☁️  Cloud CLI\x1b[0m\r\n');
            term.write('  \x1b[38;2;34;197;94maz login\x1b[0m           Authenticate with Azure\r\n');
            term.write('  \x1b[38;2;34;197;94maws configure\x1b[0m      Configure AWS credentials\r\n');
            term.write('  \x1b[38;2;34;197;94mgcloud auth\x1b[0m        Authenticate with GCP\r\n');
            term.write('\r\n');
            term.write('\x1b[1;38;2;6;182;212m✨ Sai IDE\x1b[0m\r\n');
            term.write('  \x1b[38;2;34;197;94msai synth\x1b[0m <prompt>  Generate code with AI\r\n');
            term.write('  \x1b[38;2;34;197;94msai help\x1b[0m            Show Sai commands\r\n');
            term.write('\r\n');
            term.write('\x1b[38;2;148;163;184m💡 Pro Tips:\x1b[0m\r\n');
            term.write('  • \x1b[38;2;34;197;94mUnix\x1b[0m and \x1b[38;2;59;130;246mWindows\x1b[0m commands both work\r\n');
            term.write('  • Press \x1b[1mTab\x1b[0m for autocomplete suggestions\r\n');
            term.write('  • Use \x1b[1m↑/↓\x1b[0m arrows to navigate command history\r\n');
            term.write('  • Type any command - AI will help with unknowns\r\n');
            term.write('\r\n');
        }
        // AI fallback for unknown commands
        else {
            setIsAiThinking(true);
            term.write('\r\n\x1b[38;2;6;182;212m⚡ Synthesizing command response...\x1b[0m');
            try {
                const aiResponse = await aiService.getTerminalAiResponse(trimmed, activeModelId);
                term.write('\r\x1b[K'); 
                term.write(aiResponse + '\r\n');
            } catch {
                term.write('\r\x1b[K');
                term.write(`\r\n\x1b[38;2;239;68;68m✗ Command not found: ${action}\x1b[0m\r\n`);
                term.write(`\x1b[38;2;148;163;184mType 'help' for available commands.\x1b[0m\r\n`);
            } finally {
                setIsAiThinking(false);
            }
        }
        
        updateDuration(0);
        writePrompt(term, session.cwd);
    }, [getFilesAtCurrentDir, writePrompt, onNewFolder, onNewFile, onDeleteFile, onCloudAuth, onAiIntentRequest, activeModelId, username, killSession]);

    // Initialize terminal for a session
    const initializeTerminal = useCallback((sessionId: string) => {
        const container = document.getElementById(`terminal-${sessionId}`);
        if (!container) return;

        // Inject CSS if needed
        if (!document.getElementById('xterm-css')) {
            const style = document.createElement('style');
            style.id = 'xterm-css';
            style.textContent = XTERM_CSS;
            document.head.appendChild(style);
        }

        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            cursorWidth: 2,
            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
            fontSize: parseInt(fontSize),
            fontWeight: '400',
            fontWeightBold: '600',
            letterSpacing: 0,
            lineHeight: 1.4,
            theme: terminalTheme,
            allowProposedApi: true,
            scrollback: 10000,
            tabStopWidth: 4,
            windowsMode: false,
            convertEol: true,
            screenReaderMode: false,
            macOptionIsMeta: true,
            macOptionClickForcesSelection: true,
            rightClickSelectsWord: true,
            drawBoldTextInBrightColors: true,
            minimumContrastRatio: 4.5,
        });

        const fitAddon = new FitAddon();
        const searchAddon = new SearchAddon();
        const webLinksAddon = new WebLinksAddon();
        const unicodeAddon = new Unicode11Addon();
        
        term.loadAddon(fitAddon);
        term.loadAddon(searchAddon);
        term.loadAddon(webLinksAddon);
        term.loadAddon(unicodeAddon);
        
        // Enable unicode11 for better emoji support
        term.unicode.activeVersion = '11';
        
        term.open(container);
        
        // Delay fit to ensure container has dimensions
        setTimeout(() => {
            fitAddon.fit();
        }, 100);

        // Get session to check mode
        const sessionData = sessionsRef.current.get(sessionId);
        const terminalMode = sessionData?.mode || 'local';
        const cloudProvider = sessionData?.cloudProvider;

        // Handle different terminal modes
        if (terminalMode === 'browser') {
            // Browser-only mode - no socket connection attempt
            term.writeln('\x1b[38;2;6;182;212m⚡\x1b[0m \x1b[1;38;2;103;232;249mBrowser Terminal Ready\x1b[0m');
            term.writeln('\x1b[38;2;148;163;184mCommands like ls, cd, cat, echo, mkdir, and more are supported\x1b[0m');
            term.writeln('\x1b[38;2;82;82;91m─────────────────────────────────────────────\x1b[0m');
            writePrompt(term, sessionData?.cwd || '~');
            return;
        }

        if (terminalMode === 'cloud' && cloudProvider) {
            // Cloud terminal mode
            const provider = CLOUD_TERMINAL_PROVIDERS.find(p => p.id === cloudProvider);
            term.writeln(`\x1b[38;2;59;130;246m☁\x1b[0m \x1b[1;38;2;103;232;249mConnecting to ${provider?.name || 'Cloud Shell'}...\x1b[0m`);
            
            // Simulate cloud connection (in real implementation, this would connect to cloud provider's API)
            setTimeout(() => {
                const session = sessionsRef.current.get(sessionId);
                if (session) {
                    term.writeln('\x1b[38;2;34;197;94m✓\x1b[0m \x1b[1;38;2;6;182;212mCloud Shell Ready\x1b[0m');
                    term.writeln(`\x1b[38;2;148;163;184mConnected to ${provider?.name}. ${provider?.description}\x1b[0m`);
                    term.writeln('\x1b[38;2;234;179;8m⚠\x1b[0m \x1b[38;2;148;163;184mNote: Full cloud integration requires authentication.\x1b[0m');
                    term.writeln('\x1b[38;2;82;82;91m─────────────────────────────────────────────\x1b[0m');
                    setSessions(prev => {
                        const updated = new Map(prev);
                        const s = updated.get(sessionId);
                        if (s) s.isConnected = true;
                        return updated;
                    });
                    writePrompt(term, session.cwd);
                }
            }, 1500);
            return;
        }

        // Local mode - connect to backend socket with timeout
        const socket = io(window.location.origin, { 
            path: '/socket.io/',
            timeout: 3000,
            reconnectionAttempts: 2
        });

        // If connection doesn't happen in 3 seconds, show browser terminal message
        const connectionTimeout = setTimeout(() => {
            const session = sessionsRef.current.get(sessionId);
            if (session && !session.isConnected) {
                term.writeln('\x1b[38;2;6;182;212m⚡\x1b[0m \x1b[1;38;2;103;232;249mBrowser Terminal Ready\x1b[0m');
                term.writeln('\x1b[38;2;148;163;184mRun Sai locally to connect to your machine\'s shell\x1b[0m');
                term.writeln('\x1b[38;2;82;82;91m─────────────────────────────────────────────\x1b[0m');
                writePrompt(term, session.cwd);
            }
        }, 2000);

        socket.on('connect', () => {
            clearTimeout(connectionTimeout);
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(sessionId);
                if (s) {
                    s.isConnected = true;
                    s.socket = socket;
                }
                return updated;
            });
            term.writeln('\x1b[38;2;34;197;94m✓\x1b[0m \x1b[1;38;2;6;182;212mTerminal connected\x1b[0m');
            term.writeln('\x1b[38;2;82;82;91m─────────────────────────────────────────────\x1b[0m');
        });

        socket.on('output', (data) => {
            term.write(data);
            
            // Self-Healing Runtime: Buffer output and check for errors
            const currentBuffer = outputBufferRef.current.get(sessionId) || '';
            const newBuffer = (currentBuffer + data).slice(-5000); // Keep last 5KB
            outputBufferRef.current.set(sessionId, newBuffer);
            
            // Detect errors in the output stream
            detectErrors(newBuffer, sessionId);
        });

        socket.on('disconnect', () => {
            setSessions(prev => {
                const updated = new Map(prev);
                const s = updated.get(sessionId);
                if (s) s.isConnected = false;
                return updated;
            });
            term.writeln('\r\n\x1b[38;2;234;179;8m⚠\x1b[0m \x1b[38;2;148;163;184mConnection lost. Reconnecting...\x1b[0m');
            const session = sessionsRef.current.get(sessionId);
            if (session) writePrompt(term, session.cwd);
        });

        // Handle terminal input
        let currentLine = '';
        let historyIndex = 0;

        term.onData((data) => {
            const session = sessionsRef.current.get(sessionId);
            if (!session) return;

            if (session.isConnected && session.socket) {
                session.socket.emit('input', data);
            } else {
                const code = data.charCodeAt(0);
                
                // Enter key
                if (code === 13) {
                    const cmd = currentLine;
                    currentLine = '';
                    historyIndex = session.commandHistory.length;
                    setSuggestion(null);
                    handleSimulatedCommand(cmd, session);
                }
                // Backspace
                else if (code === 127) {
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        term.write('\b \b');
                        setSuggestion(getAiSuggestion(currentLine));
                    }
                }
                // Tab - autocomplete
                else if (code === 9) {
                    if (suggestion) {
                        term.write(suggestion);
                        currentLine += suggestion;
                        setSuggestion(null);
                    }
                }
                // Ctrl+C
                else if (code === 3) {
                    term.write('^C');
                    currentLine = '';
                    setSuggestion(null);
                    writePrompt(term, session.cwd);
                }
                // Ctrl+L - clear screen
                else if (code === 12) {
                    term.clear();
                    writePrompt(term, session.cwd);
                    term.write(currentLine);
                }
                // Arrow Up - history navigation
                else if (data === '\x1b[A') {
                    if (historyIndex > 0) {
                        historyIndex--;
                        const histCmd = session.commandHistory[historyIndex] || '';
                        term.write('\r\x1b[K');
                        writePrompt(term, session.cwd);
                        term.write(histCmd);
                        currentLine = histCmd;
                    }
                }
                // Arrow Down - history navigation
                else if (data === '\x1b[B') {
                    if (historyIndex < session.commandHistory.length - 1) {
                        historyIndex++;
                        const histCmd = session.commandHistory[historyIndex] || '';
                        term.write('\r\x1b[K');
                        writePrompt(term, session.cwd);
                        term.write(histCmd);
                        currentLine = histCmd;
                    } else if (historyIndex === session.commandHistory.length - 1) {
                        historyIndex++;
                        term.write('\r\x1b[K');
                        writePrompt(term, session.cwd);
                        currentLine = '';
                    }
                }
                // Printable characters
                else if (code >= 32 && code <= 126) {
                    currentLine += data;
                    term.write(data);
                    setSuggestion(getAiSuggestion(currentLine));
                }
            }
        });

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
            const session = sessionsRef.current.get(sessionId);
            if (session?.isConnected && session.socket) {
                session.socket.emit('resize', { cols: term.cols, rows: term.rows });
            }
        });
        resizeObserver.observe(container);

        // Update session with terminal reference
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s) {
                s.terminal = term;
                s.fitAddon = fitAddon;
                s.searchAddon = searchAddon;
            }
            return updated;
        });

        // Focus terminal
        term.focus();
    }, [fontSize, terminalTheme, writePrompt, handleSimulatedCommand, getAiSuggestion, suggestion]);

    // Create new terminal session
    const createNewTerminal = useCallback(async (name?: string, shell?: string, mode?: TerminalMode, cloudProvider?: string) => {
        const sessionId = generateSessionId();
        const sessionNum = sessions.size + 1;
        const terminalMode = mode || selectedTerminalMode;
        const sessionName = name || (terminalMode === 'cloud' && cloudProvider 
            ? `Cloud (${CLOUD_TERMINAL_PROVIDERS.find(p => p.id === cloudProvider)?.name || cloudProvider})`
            : terminalMode === 'browser' 
                ? `Browser ${sessionNum}`
                : `Terminal ${sessionNum}`);
        const sessionShell = shell || 'default';

        // Auto-start backend for local mode
        if (terminalMode === 'local') {
            await startBackend();
        }

        const newSession: TerminalSession = {
            id: sessionId,
            name: sessionName,
            shell: sessionShell,
            terminal: null,
            fitAddon: null,
            searchAddon: null,
            socket: null,
            isConnected: false,
            cwd: '~',
            commandHistory: [],
            historyIndex: 0,
            currentLine: '',
            exitCode: null,
            isRunning: true,
            startTime: new Date(),
            bookmarkedCommands: [],
            mode: terminalMode,
            cloudProvider: cloudProvider,
            environment: {
                nodeVersion: 'v20.10.0',
                pythonVersion: '3.12.0',
                gitBranch: 'main',
            },
            // Shell Integration (VS Code-style)
            shellIntegration: createShellIntegrationState(),
        };

        setSessions(prev => {
            const updated = new Map(prev);
            updated.set(sessionId, newSession);
            return updated;
        });

        // Create or update pane
        if (panes.length === 0) {
            const newPane: TerminalPane = {
                id: `pane-${Date.now()}`,
                sessions: [sessionId],
                activeSessionId: sessionId,
            };
            setPanes([newPane]);
            setActivePane(newPane.id);
        } else {
            setPanes(prev => prev.map(p => 
                p.id === activePane 
                    ? { ...p, sessions: [...p.sessions, sessionId], activeSessionId: sessionId }
                    : p
            ));
        }

        // Initialize terminal after state update
        setTimeout(() => initializeTerminal(sessionId), 50);

        return sessionId;
    }, [generateSessionId, sessions.size, panes, activePane, initializeTerminal, selectedTerminalMode, startBackend]);

    // Switch active session in pane
    const switchSession = useCallback((paneId: string, sessionId: string) => {
        setPanes(prev => prev.map(p => 
            p.id === paneId ? { ...p, activeSessionId: sessionId } : p
        ));
        const session = sessions.get(sessionId);
        session?.terminal?.focus();
    }, [sessions]);

    // Rename session
    const renameSession = useCallback((sessionId: string, newName: string) => {
        setSessions(prev => {
            const updated = new Map(prev);
            const s = updated.get(sessionId);
            if (s) s.name = newName;
            return updated;
        });
    }, []);

    // Search in terminal
    const handleSearch = useCallback((query: string, direction: 'next' | 'prev' = 'next') => {
        const session = getActiveSession();
        if (!session?.searchAddon) return;
        
        if (direction === 'next') {
            session.searchAddon.findNext(query);
        } else {
            session.searchAddon.findPrevious(query);
        }
    }, [getActiveSession]);

    // Split terminal pane
    const splitPane = useCallback(() => {
        createNewTerminal(`Split ${sessions.size + 1}`);
    }, [createNewTerminal, sessions.size]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        runCommand: (cmd: string) => {
            const session = getActiveSession();
            if (!session?.terminal) return;
            
            if (session.isConnected && session.socket) {
                session.socket.emit('input', cmd + '\r');
            } else {
                session.terminal.write(cmd);
                handleSimulatedCommand(cmd, session);
            }
        },
        write: (text: string) => {
            const session = getActiveSession();
            if (session?.terminal) {
                session.terminal.writeln(`\r\n${text}`);
            }
        },
        ensureTerminalVisible: () => {},
        createNewTerminal,
        killCurrentTerminal: () => {
            const session = getActiveSession();
            if (session) killSession(session.id);
        },
        focusTerminal: () => {
            const session = getActiveSession();
            session?.terminal?.focus();
        },
        getCwd: () => {
            const session = getActiveSession();
            return session?.cwd || '~';
        }
    }), [getActiveSession, handleSimulatedCommand, createNewTerminal, killSession]);

    // Create initial terminal on mount
    useEffect(() => {
        if (sessions.size === 0) {
            createNewTerminal();
        }
    }, []);

    // Get current pane
    const currentPane = useMemo(() => panes.find(p => p.id === activePane), [panes, activePane]);
    const activeSession = useMemo(() => getActiveSession(), [getActiveSession]);

    return (
        <div className={`relative h-full w-full bg-[#0a0a0f] flex flex-col overflow-hidden transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
            {/* Terminal Header / Tab Bar */}
            <div className="h-11 bg-gradient-to-b from-[#14171f] to-[#111318] border-b border-white/[0.06] flex items-center justify-between px-2 shrink-0">
                {/* Left: Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                    {currentPane?.sessions.map(sessionId => {
                        const session = sessions.get(sessionId);
                        if (!session) return null;
                        const isActive = sessionId === currentPane.activeSessionId;
                        const modeColor = session.mode === 'cloud' 
                            ? 'bg-blue-500' 
                            : session.mode === 'browser' 
                                ? 'bg-amber-500' 
                                : session.isConnected 
                                    ? 'bg-emerald-500' 
                                    : 'bg-amber-500';
                        
                        return (
                            <div
                                key={sessionId}
                                onClick={() => switchSession(currentPane.id, sessionId)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setShowContextMenu({ x: e.clientX, y: e.clientY, sessionId });
                                }}
                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-gradient-to-b from-white/[0.12] to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.08]' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`relative w-2 h-2 rounded-full ${modeColor}`}>
                                    {session.isRunning && (
                                        <div className={`absolute inset-0 rounded-full ${modeColor} animate-ping opacity-75`} />
                                    )}
                                </div>
                                {session.mode === 'cloud' && <Cloud size={10} className="text-blue-400" />}
                                {session.mode === 'browser' && <Globe size={10} className="text-amber-400" />}
                                <span className="text-xs font-medium truncate max-w-[100px]">{session.name}</span>
                                {session.lastCommandDuration !== undefined && (
                                    <span className="text-[9px] text-zinc-600 font-mono">{session.lastCommandDuration}ms</span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        killSession(sessionId);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })}
                    
                    {/* New Terminal Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-1 px-2 py-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                        >
                            <Plus size={14} />
                            <ChevronDown size={10} />
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-80 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                                {/* Terminal Mode Tabs */}
                                <div className="flex border-b border-white/5">
                                    <button
                                        onClick={() => setSelectedTerminalMode('local')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all ${
                                            selectedTerminalMode === 'local' 
                                                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' 
                                                : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        <Laptop size={14} />
                                        Local
                                    </button>
                                    <button
                                        onClick={() => setSelectedTerminalMode('cloud')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all ${
                                            selectedTerminalMode === 'cloud' 
                                                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' 
                                                : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        <Cloud size={14} />
                                        Cloud
                                    </button>
                                    <button
                                        onClick={() => setSelectedTerminalMode('browser')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all ${
                                            selectedTerminalMode === 'browser' 
                                                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' 
                                                : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        <Globe size={14} />
                                        Browser
                                    </button>
                                </div>

                                {/* Local Terminal Options */}
                                {selectedTerminalMode === 'local' && (
                                    <>
                                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Local Shell</span>
                                            {serverPlatform && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-600">
                                                    {serverPlatform === 'win32' ? '🪟 Windows' : serverPlatform === 'darwin' ? '🍎 macOS' : '🐧 Linux'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-2 text-xs text-zinc-500 bg-zinc-900/50">
                                            <div className="flex items-start gap-2">
                                                <Laptop size={12} className="mt-0.5 text-emerald-400" />
                                                <span>Connects to your local machine. Run Sai locally for full shell access.</span>
                                            </div>
                                        </div>
                                        <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                            {shellOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        if (opt.available !== false) {
                                                            createNewTerminal(opt.label, opt.value, 'local');
                                                            setShowDropdown(false);
                                                        }
                                                    }}
                                                    disabled={opt.available === false}
                                                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors group ${
                                                        opt.available === false 
                                                            ? 'text-zinc-600 cursor-not-allowed opacity-50' 
                                                            : 'text-zinc-300 hover:bg-white/[0.06]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-base">{opt.icon}</span>
                                                        <span>{opt.label}</span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 font-mono">{opt.shortcut}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Cloud Terminal Options */}
                                {selectedTerminalMode === 'cloud' && (
                                    <>
                                        <div className="px-3 py-2 border-b border-white/5">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Cloud Providers</span>
                                        </div>
                                        <div className="p-2 text-xs text-zinc-500 bg-zinc-900/50">
                                            <div className="flex items-start gap-2">
                                                <Cloud size={12} className="mt-0.5 text-blue-400" />
                                                <span>Connect to cloud shell environments. May require authentication.</span>
                                            </div>
                                        </div>
                                        <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                            {CLOUD_TERMINAL_PROVIDERS.map(provider => (
                                                <button
                                                    key={provider.id}
                                                    onClick={() => {
                                                        createNewTerminal(undefined, 'default', 'cloud', provider.id);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-colors group"
                                                >
                                                    <span className="text-base">{provider.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{provider.name}</div>
                                                        <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{provider.description}</div>
                                                    </div>
                                                    <Server size={12} className="text-zinc-600" />
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Browser Terminal Options */}
                                {selectedTerminalMode === 'browser' && (
                                    <>
                                        <div className="px-3 py-2 border-b border-white/5">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Browser Terminal</span>
                                        </div>
                                        <div className="p-2 text-xs text-zinc-500 bg-zinc-900/50">
                                            <div className="flex items-start gap-2">
                                                <Globe size={12} className="mt-0.5 text-amber-400" />
                                                <span>Runs entirely in your browser. Supports basic commands like ls, cd, cat, mkdir, etc.</span>
                                            </div>
                                        </div>
                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    createNewTerminal('Browser Terminal', 'default', 'browser');
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                                            >
                                                <span className="text-base">⚡</span>
                                                <div className="flex-1">
                                                    <div className="font-medium">Start Browser Terminal</div>
                                                    <div className="text-[10px] text-zinc-500">No backend required</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-white/5 p-1">
                                    <button 
                                        onClick={() => {
                                            splitPane();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                                    >
                                        <SplitSquareHorizontal size={14} />
                                        <span>Split Terminal</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-0.5">
                    {/* Quick Commands */}
                    <button
                        onClick={() => setShowQuickCommands(!showQuickCommands)}
                        className={`p-1.5 rounded-lg transition-all ${showQuickCommands ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Quick Commands (⌘P)"
                    >
                        <Sparkles size={14} />
                    </button>
                    
                    {/* History */}
                    <button
                        onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                        className={`p-1.5 rounded-lg transition-all ${showHistoryPanel ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Command History (⌘R)"
                    >
                        <History size={14} />
                    </button>
                    
                    {/* Recent Directories (VS Code-style) */}
                    <button
                        onClick={() => setShowRecentDirectories(!showRecentDirectories)}
                        className={`p-1.5 rounded-lg transition-all ${showRecentDirectories ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Recent Directories (⌘G)"
                    >
                        <FolderOpen size={14} />
                    </button>
                    
                    {/* Bookmarks */}
                    <button
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className={`p-1.5 rounded-lg transition-all ${showBookmarks ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Bookmarked Commands (⌘B)"
                    >
                        <Bookmark size={14} />
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Connection Status */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide ${
                        activeSession?.mode === 'cloud' 
                            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                            : activeSession?.mode === 'browser'
                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                : activeSession?.isConnected 
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    }`}>
                        {activeSession?.mode === 'cloud' ? (
                            <>
                                <Cloud size={10} className="animate-pulse" />
                                Cloud
                            </>
                        ) : activeSession?.mode === 'browser' ? (
                            <>
                                <Globe size={10} />
                                Browser
                            </>
                        ) : (
                            <>
                                <Activity size={10} className={activeSession?.isConnected ? 'animate-pulse' : ''} />
                                {isStartingBackend ? 'Starting...' : activeSession?.isConnected ? 'Connected' : 'Browser'}
                            </>
                        )}
                    </div>
                    
                    {/* Disconnect/Reconnect Button - only show when connected or in dev mode */}
                    {activeSession?.mode === 'local' && activeSession?.isConnected && (
                        <button
                            onClick={() => setShowDisconnectModal(true)}
                            className="p-1.5 text-emerald-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Disconnect from backend"
                        >
                            <Power size={14} />
                        </button>
                    )}
                    
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    
                    {/* Copy */}
                    <button
                        onClick={() => {
                            const session = activeSession;
                            if (session?.terminal) {
                                const selection = session.terminal.getSelection();
                                if (selection) copyToClipboard(selection);
                            }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                        title="Copy Selection (⌘C)"
                    >
                        <Copy size={14} />
                    </button>
                    
                    {/* Paste */}
                    <button
                        onClick={pasteFromClipboard}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                        title="Paste (⌘V)"
                    >
                        <ClipboardPaste size={14} />
                    </button>
                    
                    {/* Search Toggle */}
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            setTimeout(() => searchInputRef.current?.focus(), 100);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${showSearch ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Search (⌘F)"
                    >
                        <Search size={14} />
                    </button>
                    
                    {/* Clear */}
                    <button
                        onClick={() => activeSession?.terminal?.clear()}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                        title="Clear Terminal (⌘K)"
                    >
                        <Trash2 size={14} />
                    </button>
                    
                    {/* Kill Process */}
                    <button
                        onClick={() => {
                            if (activeSession?.isConnected && activeSession.socket) {
                                activeSession.socket.emit('input', '\u0003');
                            }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Kill Process (⌃C)"
                    >
                        <Square size={14} />
                    </button>
                    
                    {/* Keyboard Shortcuts */}
                    <button
                        onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                        className={`p-1.5 rounded-lg transition-all ${showKeyboardShortcuts ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Keyboard Shortcuts (?)"
                    >
                        <Keyboard size={14} />
                    </button>
                    
                    {/* Self-Healing Runtime Toggle */}
                    <button
                        onClick={() => setShowSelfHealingPanel(!showSelfHealingPanel)}
                        className={`relative p-1.5 rounded-lg transition-all ${
                            detectedErrors.filter(e => !e.isResolved).length > 0 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                : selfHealingEnabled 
                                    ? 'text-green-500 hover:bg-green-500/10' 
                                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title={`Self-Healing Runtime ${selfHealingEnabled ? '(Active)' : '(Paused)'}`}
                    >
                        <Brain size={14} />
                        {detectedErrors.filter(e => !e.isResolved).length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold animate-pulse">
                                {detectedErrors.filter(e => !e.isResolved).length}
                            </span>
                        )}
                    </button>
                    
                    {/* Maximize */}
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="h-10 bg-[#0f1115] border-b border-white/[0.06] flex items-center gap-2 px-3">
                    <Search size={14} className="text-zinc-500" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(searchQuery, e.shiftKey ? 'prev' : 'next');
                            } else if (e.key === 'Escape') {
                                setShowSearch(false);
                            }
                        }}
                        placeholder="Search terminal output..."
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                    />
                    <button
                        onClick={() => handleSearch(searchQuery, 'prev')}
                        className="p-1 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded transition-all"
                    >
                        <ArrowUp size={14} />
                    </button>
                    <button
                        onClick={() => handleSearch(searchQuery, 'next')}
                        className="p-1 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded transition-all"
                    >
                        <ArrowDown size={14} />
                    </button>
                    <button
                        onClick={() => setShowSearch(false)}
                        className="p-1 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Terminal Content Area */}
            <div ref={terminalContainerRef} className="flex-1 overflow-hidden relative">
                {/* Sticky Scroll Header (VS Code-style) */}
                {showStickyScroll && activeSession?.shellIntegration.commands.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/[0.06] px-3 py-1.5">
                        {(() => {
                            const lastCmd = activeSession.shellIntegration.commands[activeSession.shellIntegration.commands.length - 1];
                            if (!lastCmd) return null;
                            return (
                                <div className="flex items-center gap-2 text-xs">
                                    {/* Decoration indicator */}
                                    <div className={`w-2 h-2 rounded-full ${
                                        lastCmd.decoration === 'running' ? 'bg-blue-500 animate-pulse' :
                                        lastCmd.decoration === 'success' ? 'bg-emerald-500' :
                                        lastCmd.decoration === 'error' ? 'bg-red-500' : 'bg-zinc-500'
                                    }`} />
                                    <span className="font-mono text-zinc-300 truncate max-w-[300px]">
                                        {lastCmd.command}
                                    </span>
                                    {lastCmd.duration && (
                                        <span className="text-[10px] text-zinc-600 font-mono">
                                            {lastCmd.duration}ms
                                        </span>
                                    )}
                                    {lastCmd.exitCode !== undefined && lastCmd.exitCode !== 0 && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                            exit {lastCmd.exitCode}
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Command Decorations Gutter (VS Code-style) */}
                {showCommandDecorations && activeSession?.shellIntegration.commands.length > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-6 z-20 pointer-events-auto">
                        {activeSession.shellIntegration.commands.slice(-20).map((cmd, idx) => {
                            // Approximate position based on command index
                            const topOffset = 40 + (idx * 24);
                            return (
                                <div
                                    key={cmd.id}
                                    className="absolute left-1 group cursor-pointer"
                                    style={{ top: `${topOffset}px` }}
                                    onMouseEnter={() => setHoveredCommandId(cmd.id)}
                                    onMouseLeave={() => setHoveredCommandId(null)}
                                    onClick={() => {
                                        if (activeSession.terminal && cmd.startLine !== undefined) {
                                            activeSession.terminal.scrollToLine(cmd.startLine);
                                        }
                                    }}
                                >
                                    {/* Decoration circle */}
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                                        cmd.decoration === 'running' ? 'bg-blue-500/30 ring-2 ring-blue-500/50' :
                                        cmd.decoration === 'success' ? 'bg-emerald-500/20 hover:bg-emerald-500/40' :
                                        cmd.decoration === 'error' ? 'bg-red-500/30 ring-1 ring-red-500/50' : 'bg-zinc-600/30'
                                    }`}>
                                        {cmd.decoration === 'success' && (
                                            <CheckCircle size={8} className="text-emerald-400" />
                                        )}
                                        {cmd.decoration === 'error' && (
                                            <XCircle size={8} className="text-red-400" />
                                        )}
                                        {cmd.decoration === 'running' && (
                                            <Loader2 size={8} className="text-blue-400 animate-spin" />
                                        )}
                                    </div>
                                    
                                    {/* Tooltip on hover */}
                                    {hoveredCommandId === cmd.id && (
                                        <div className="absolute left-6 top-0 z-50 w-64 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-2 pointer-events-auto">
                                            <div className="text-[10px] text-zinc-500 mb-1">
                                                {cmd.startTime.toLocaleTimeString()}
                                                {cmd.duration && ` • ${cmd.duration}ms`}
                                            </div>
                                            <div className="font-mono text-xs text-zinc-300 truncate mb-2">
                                                {cmd.command}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        rerunCommand(activeSession.id, cmd.command);
                                                    }}
                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                                                >
                                                    <RotateCcw size={10} />
                                                    Re-run
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(cmd.command);
                                                    }}
                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                                                >
                                                    <Copy size={10} />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {currentPane?.sessions.map(sessionId => {
                    const isActive = sessionId === currentPane.activeSessionId;
                    return (
                        <div
                            key={sessionId}
                            id={`terminal-${sessionId}`}
                            className={`absolute inset-0 p-3 ${showCommandDecorations ? 'pl-8' : ''} ${isActive ? 'block' : 'hidden'}`}
                        />
                    );
                })}
                
                {/* AI Suggestion Overlay */}
                {suggestion && activeSession?.terminal && (
                    <div 
                        className="absolute pointer-events-none z-40"
                        style={{
                            left: `${(activeSession.terminal.buffer.active.cursorX * parseInt(fontSize) * 0.6) + (showCommandDecorations ? 36 : 16)}px`,
                            top: `${(activeSession.terminal.buffer.active.cursorY * parseInt(fontSize) * 1.4) + 12}px`,
                        }}
                    >
                        <span className="text-zinc-600 font-mono" style={{ fontSize: `${fontSize}px` }}>
                            {suggestion}
                        </span>
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 bg-white/5 border border-white/10 rounded">
                            TAB
                        </span>
                    </div>
                )}
            </div>

            {/* Footer Status Bar */}
            <div className="h-7 bg-gradient-to-r from-[#0c0e12] to-[#0e1016] border-t border-white/[0.04] flex items-center justify-between px-3 text-[10px] text-zinc-500">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03]">
                        <TerminalIcon size={10} className="text-cyan-500" />
                        <span className="font-medium text-zinc-400">{activeSession?.shell === 'default' ? 'zsh' : activeSession?.shell}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <FolderOpen size={10} className="text-blue-400" />
                        <span className="font-mono">{activeSession?.cwd}</span>
                    </span>
                    {activeSession?.environment.gitBranch && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
                            <GitBranch size={10} />
                            <span className="font-medium">{activeSession.environment.gitBranch}</span>
                        </span>
                    )}
                    {/* Shell Integration Quality Indicator */}
                    {activeSession?.shellIntegration.enabled && (
                        <span 
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 cursor-help"
                            title={`Shell Integration: ${activeSession.shellIntegration.quality} quality - ${activeSession.shellIntegration.commands.length} commands tracked`}
                        >
                            <Layers size={9} />
                            <span className="text-[9px] font-medium uppercase">{activeSession.shellIntegration.quality}</span>
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {activeSession?.environment.nodeVersion && (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                            <span className="text-[9px]">⬢</span>
                            <span className="font-mono">{activeSession.environment.nodeVersion}</span>
                        </span>
                    )}
                    {activeSession?.environment.pythonVersion && (
                        <span className="flex items-center gap-1.5 text-yellow-500">
                            <span className="text-[9px]">🐍</span>
                            <span className="font-mono">{activeSession.environment.pythonVersion}</span>
                        </span>
                    )}
                    <div className="w-px h-3 bg-white/10" />
                    {/* Commands tracked count */}
                    {activeSession?.shellIntegration.commands.length > 0 && (
                        <span className="flex items-center gap-1 text-zinc-600">
                            <Command size={9} />
                            <span className="font-mono">{activeSession.shellIntegration.commands.length}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Clock size={10} />
                        {activeSession?.startTime.toLocaleTimeString()}
                    </span>
                    {activeSession?.lastCommandDuration !== undefined && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400">
                            <Timer size={10} />
                            <span className="font-mono">{activeSession.lastCommandDuration}ms</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        {activeSession?.exitCode === null ? (
                            <><Activity size={10} className="text-emerald-400 animate-pulse" /> <span className="text-emerald-400">Running</span></>
                        ) : activeSession?.exitCode === 0 ? (
                            <><CheckCircle size={10} className="text-emerald-400" /> <span className="text-emerald-400">Exit 0</span></>
                        ) : (
                            <><XCircle size={10} className="text-red-400" /> <span className="text-red-400">Exit {activeSession?.exitCode}</span></>
                        )}
                    </span>
                </div>
            </div>

            {/* AI Thinking Indicator */}
            {isAiThinking && (
                <div className="absolute bottom-10 right-4 flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-xl shadow-xl">
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-300">Neural Processing...</span>
                </div>
            )}

            {/* Context Menu */}
            {showContextMenu && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowContextMenu(null)} 
                    />
                    <div 
                        className="fixed z-50 w-52 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        style={{ left: showContextMenu.x, top: showContextMenu.y }}
                    >
                        <div className="p-1">
                            <button 
                                onClick={() => {
                                    const name = prompt('Enter new name:');
                                    if (name) renameSession(showContextMenu.sessionId, name);
                                    setShowContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg"
                            >
                                <Settings2 size={14} />
                                Rename
                            </button>
                            <button 
                                onClick={() => {
                                    splitPane();
                                    setShowContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg"
                            >
                                <SplitSquareHorizontal size={14} />
                                Split Terminal
                            </button>
                            <button 
                                onClick={() => {
                                    const session = sessions.get(showContextMenu.sessionId);
                                    if (session?.terminal) {
                                        const text = session.terminal.buffer.active.getLine(0)?.translateToString() || '';
                                        copyToClipboard(text);
                                    }
                                    setShowContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg"
                            >
                                <Copy size={14} />
                                Copy Output
                            </button>
                            <button 
                                onClick={() => {
                                    const session = sessions.get(showContextMenu.sessionId);
                                    session?.terminal?.clear();
                                    setShowContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg"
                            >
                                <Trash2 size={14} />
                                Clear Terminal
                            </button>
                            <div className="border-t border-white/5 my-1" />
                            <button 
                                onClick={() => {
                                    killSession(showContextMenu.sessionId);
                                    setShowContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                                <Power size={14} />
                                Kill Terminal
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Quick Commands Panel */}
            {showQuickCommands && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowQuickCommands(false)} />
                    <div className="absolute top-12 right-4 w-72 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-purple-400" />
                                <span className="text-xs font-semibold text-white">Quick Commands</span>
                            </div>
                            <button onClick={() => setShowQuickCommands(false)} className="text-zinc-500 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {['npm', 'git', 'system'].map(category => (
                                <div key={category} className="mb-2">
                                    <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold px-2 py-1">{category}</div>
                                    {QUICK_COMMANDS.filter(c => c.category === category).map((cmd, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const session = getActiveSession();
                                                if (session?.terminal) {
                                                    if (session.isConnected && session.socket) {
                                                        session.socket.emit('input', cmd.cmd + '\r');
                                                    } else {
                                                        session.terminal.write(cmd.cmd);
                                                        handleSimulatedCommand(cmd.cmd, session);
                                                    }
                                                }
                                                setShowQuickCommands(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg group"
                                        >
                                            <cmd.icon size={14} className="text-zinc-500 group-hover:text-cyan-400" />
                                            <div className="flex-1">
                                                <div className="font-medium">{cmd.label}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono">{cmd.cmd}</div>
                                            </div>
                                            <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-500" />
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* History Panel */}
            {showHistoryPanel && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHistoryPanel(false)} />
                    <div className="absolute top-12 right-4 w-80 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={14} className="text-blue-400" />
                                <span className="text-xs font-semibold text-white">Run Recent Command</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-500">⌘R</span>
                                <button onClick={() => setShowHistoryPanel(false)} className="text-zinc-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="p-2 max-h-72 overflow-y-auto">
                            {activeSession?.shellIntegration.commands.length === 0 ? (
                                <div className="text-center py-6 text-zinc-600 text-sm">No commands yet</div>
                            ) : (
                                [...(activeSession?.shellIntegration.commands || [])].reverse().map((cmd) => (
                                    <div
                                        key={cmd.id}
                                        className="group flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] rounded-lg"
                                    >
                                        {/* Decoration indicator */}
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            cmd.decoration === 'success' ? 'bg-emerald-500' :
                                            cmd.decoration === 'error' ? 'bg-red-500' :
                                            cmd.decoration === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'
                                        }`} />
                                        <button
                                            onClick={() => {
                                                if (activeSession) {
                                                    rerunCommand(activeSession.id, cmd.command);
                                                }
                                                setShowHistoryPanel(false);
                                            }}
                                            className="flex-1 text-left font-mono text-sm text-zinc-300 truncate"
                                        >
                                            {cmd.command}
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                            <span className="text-[9px] text-zinc-600 font-mono">
                                                {cmd.duration ? `${cmd.duration}ms` : ''}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(cmd.command);
                                                }}
                                                className="p-1 text-zinc-500 hover:text-white rounded"
                                                title="Copy"
                                            >
                                                <Copy size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (activeSession) bookmarkCommand(activeSession.id, cmd.command);
                                                }}
                                                className="p-1 text-zinc-500 hover:text-yellow-400 rounded"
                                                title="Bookmark"
                                            >
                                                <Bookmark size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-3 py-2 border-t border-white/5 text-[10px] text-zinc-600">
                            <span className="flex items-center gap-2">
                                <span>↑↓ Navigate</span>
                                <span>⏎ Run</span>
                                <span>⌥⏎ Insert without running</span>
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Recent Directories Panel (VS Code-style ⌘G) */}
            {showRecentDirectories && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRecentDirectories(false)} />
                    <div className="absolute top-12 right-4 w-80 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FolderOpen size={14} className="text-cyan-400" />
                                <span className="text-xs font-semibold text-white">Go to Recent Directory</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-500">⌘G</span>
                                <button onClick={() => setShowRecentDirectories(false)} className="text-zinc-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="p-2 max-h-72 overflow-y-auto">
                            {(activeSession ? getRecentDirectories(activeSession.id) : []).length === 0 ? (
                                <div className="text-center py-6 text-zinc-600 text-sm">
                                    <FolderOpen size={24} className="mx-auto mb-2 opacity-30" />
                                    No recent directories
                                    <div className="text-xs mt-1">Use 'cd' to navigate</div>
                                </div>
                            ) : (
                                (activeSession ? getRecentDirectories(activeSession.id) : []).map((dir) => (
                                    <div
                                        key={dir.path}
                                        className="group flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] rounded-lg"
                                    >
                                        <FolderOpen size={14} className="text-blue-400 shrink-0" />
                                        <button
                                            onClick={() => {
                                                if (activeSession) {
                                                    const cdCmd = `cd "${dir.path}"`;
                                                    rerunCommand(activeSession.id, cdCmd);
                                                }
                                                setShowRecentDirectories(false);
                                            }}
                                            className="flex-1 text-left font-mono text-sm text-zinc-300 truncate"
                                        >
                                            {dir.path}
                                        </button>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 shrink-0">
                                            <span className="text-[9px] text-zinc-600">
                                                {dir.visitCount}x
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(dir.path);
                                                }}
                                                className="p-1 text-zinc-500 hover:text-white rounded"
                                                title="Copy path"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-3 py-2 border-t border-white/5 text-[10px] text-zinc-600">
                            <span className="flex items-center gap-2">
                                <span>↑↓ Navigate</span>
                                <span>⏎ Go to directory</span>
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Self-Healing Runtime Panel */}
            {showSelfHealingPanel && detectedErrors.length > 0 && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSelfHealingPanel(false)} />
                    <div className="absolute bottom-14 right-4 w-[420px] bg-[#1a1d24]/95 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-red-500/20 bg-red-950/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Brain size={18} className="text-red-400" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-white">Self-Healing Runtime</span>
                                    <span className="ml-2 text-xs text-red-400/80">{detectedErrors.filter(e => !e.isResolved).length} error{detectedErrors.filter(e => !e.isResolved).length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelfHealingEnabled(!selfHealingEnabled)}
                                    className={`p-1.5 rounded-lg transition-colors ${selfHealingEnabled ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700/50 text-zinc-500'}`}
                                    title={selfHealingEnabled ? 'Disable auto-detection' : 'Enable auto-detection'}
                                >
                                    {selfHealingEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button 
                                    onClick={clearAllErrors} 
                                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button 
                                    onClick={() => setShowSelfHealingPanel(false)} 
                                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Error List */}
                        <div className="max-h-80 overflow-y-auto">
                            {detectedErrors.map((error) => (
                                <div 
                                    key={error.id} 
                                    className={`border-b border-white/5 last:border-b-0 ${error.isResolved ? 'opacity-50' : ''}`}
                                >
                                    {/* Error Header */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-red-950/20 to-transparent">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={14} className={error.isResolved ? 'text-green-500' : 'text-red-400'} />
                                                <span className="text-xs font-mono text-red-300 uppercase">{error.error}</span>
                                                {error.isResolved && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">Resolved</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-zinc-600">{error.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        
                                        {/* Error Context (collapsed) */}
                                        <pre className="mt-2 text-[11px] text-zinc-500 font-mono overflow-x-auto max-h-16 scrollbar-thin">
                                            {error.context.split('\n').slice(-3).join('\n')}
                                        </pre>
                                    </div>
                                    
                                    {/* AI Diagnosis */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-purple-950/10 to-transparent">
                                        {error.isAnalyzing ? (
                                            <div className="flex items-center gap-2 text-purple-400">
                                                <Loader2 size={14} className="animate-spin" />
                                                <span className="text-xs">AI analyzing error...</span>
                                            </div>
                                        ) : error.diagnosis ? (
                                            <div className="space-y-2">
                                                {/* Issue */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-semibold mb-1">
                                                        <Bug size={10} />
                                                        Issue
                                                    </div>
                                                    <p className="text-xs text-zinc-300">{error.diagnosis.issue}</p>
                                                </div>
                                                
                                                {/* Suggested Fix */}
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-semibold mb-1">
                                                        <Wrench size={10} />
                                                        Suggested Fix
                                                    </div>
                                                    <p className="text-xs text-zinc-400">{error.diagnosis.fix}</p>
                                                </div>
                                                
                                                {/* Command to run */}
                                                {error.diagnosis.command && !error.isResolved && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <code className="flex-1 text-xs font-mono bg-black/40 px-3 py-2 rounded-lg text-cyan-300 border border-cyan-500/20">
                                                            {error.diagnosis.command}
                                                        </code>
                                                        <button
                                                            onClick={() => applySuggestedFix(error.id, error.diagnosis!.command)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-green-500/20"
                                                        >
                                                            <Play size={12} />
                                                            Apply Fix
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-zinc-500">No diagnosis available</div>
                                        )}
                                    </div>
                                    
                                    {/* Dismiss button */}
                                    {!error.isResolved && (
                                        <div className="px-4 py-2 border-t border-white/5 flex justify-end">
                                            <button
                                                onClick={() => dismissError(error.id)}
                                                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                                <Shield size={10} />
                                <span>Powered by AI diagnosis</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${selfHealingEnabled ? 'bg-green-500' : 'bg-zinc-600'}`} />
                                <span className="text-[10px] text-zinc-500">{selfHealingEnabled ? 'Monitoring' : 'Paused'}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Self-Healing Error Indicator (minimized) */}
            {!showSelfHealingPanel && detectedErrors.filter(e => !e.isResolved).length > 0 && (
                <button
                    onClick={() => setShowSelfHealingPanel(true)}
                    className="absolute bottom-14 right-4 flex items-center gap-2 px-3 py-2 bg-red-950/80 border border-red-500/30 rounded-full shadow-xl backdrop-blur-xl animate-pulse z-50"
                >
                    <Brain size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-300">
                        {detectedErrors.filter(e => !e.isResolved).length} error{detectedErrors.filter(e => !e.isResolved).length !== 1 ? 's' : ''} detected
                    </span>
                    <ChevronRight size={12} className="text-red-500" />
                </button>
            )}

            {/* Bookmarks Panel */}
            {showBookmarks && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBookmarks(false)} />
                    <div className="absolute top-12 right-4 w-72 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bookmark size={14} className="text-yellow-400" />
                                <span className="text-xs font-semibold text-white">Bookmarked Commands</span>
                            </div>
                            <button onClick={() => setShowBookmarks(false)} className="text-zinc-500 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {activeSession?.bookmarkedCommands.length === 0 ? (
                                <div className="text-center py-6 text-zinc-600 text-sm">No bookmarks yet<br /><span className="text-xs">Use history to bookmark commands</span></div>
                            ) : (
                                activeSession?.bookmarkedCommands.map((cmd, i) => (
                                    <div
                                        key={i}
                                        className="group flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] rounded-lg"
                                    >
                                        <button
                                            onClick={() => {
                                                const session = getActiveSession();
                                                if (session?.terminal) {
                                                    if (session.isConnected && session.socket) {
                                                        session.socket.emit('input', cmd + '\r');
                                                    } else {
                                                        session.terminal.write(cmd);
                                                        handleSimulatedCommand(cmd, session);
                                                    }
                                                }
                                                setShowBookmarks(false);
                                            }}
                                            className="flex-1 text-left font-mono text-sm text-zinc-300 truncate"
                                        >
                                            {cmd}
                                        </button>
                                        <button
                                            onClick={() => activeSession && removeBookmark(activeSession.id, cmd)}
                                            className="p-1 text-zinc-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"
                                            title="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Keyboard Shortcuts Panel */}
            {showKeyboardShortcuts && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowKeyboardShortcuts(false)} />
                    <div className="absolute top-12 right-4 w-80 bg-[#1a1d24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Keyboard size={14} className="text-white" />
                                <span className="text-xs font-semibold text-white">Keyboard Shortcuts</span>
                            </div>
                            <button onClick={() => setShowKeyboardShortcuts(false)} className="text-zinc-500 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-3 max-h-80 overflow-y-auto space-y-3">
                            {[
                                { category: 'Shell Integration', shortcuts: [
                                    { keys: '⌘ ↑', desc: 'Previous command' },
                                    { keys: '⌘ ↓', desc: 'Next command' },
                                    { keys: '⌘ R', desc: 'Run recent command' },
                                    { keys: '⌘ G', desc: 'Go to directory' },
                                    { keys: '⇧ ⌘ ↑', desc: 'Select to previous command' },
                                    { keys: '⇧ ⌘ ↓', desc: 'Select to next command' },
                                ]},
                                { category: 'Navigation', shortcuts: [
                                    { keys: '⌘ K', desc: 'Clear terminal' },
                                    { keys: '⌘ F', desc: 'Search output' },
                                    { keys: '⌘ T', desc: 'New terminal' },
                                    { keys: '⌘ W', desc: 'Close terminal' },
                                    { keys: '⇧ ⌘ ]', desc: 'Next terminal' },
                                    { keys: '⇧ ⌘ [', desc: 'Previous terminal' },
                                ]},
                                { category: 'Editing', shortcuts: [
                                    { keys: '⌃ C', desc: 'Cancel/Kill process' },
                                    { keys: '⌃ D', desc: 'Exit shell' },
                                    { keys: '⌃ L', desc: 'Clear screen' },
                                    { keys: '⌃ A', desc: 'Move to line start' },
                                    { keys: '⌃ E', desc: 'Move to line end' },
                                    { keys: '⌃ U', desc: 'Clear line' },
                                ]},
                                { category: 'History', shortcuts: [
                                    { keys: '↑ / ↓', desc: 'Navigate history' },
                                    { keys: '⌃ R', desc: 'Reverse search' },
                                    { keys: 'Tab', desc: 'Autocomplete' },
                                ]},
                            ].map(group => (
                                <div key={group.category}>
                                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">{group.category}</div>
                                    <div className="space-y-1">
                                        {group.shortcuts.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-1">
                                                <span className="text-sm text-zinc-400">{s.desc}</span>
                                                <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] font-mono text-zinc-300">{s.keys}</kbd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Copy Success Toast */}
            {lastCopiedText && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/20 px-4 py-2 rounded-full backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Copied to clipboard</span>
                </div>
            )}

            {/* Disconnect Backend Modal */}
            {showDisconnectModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowDisconnectModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] bg-gradient-to-b from-[#1a1d26] to-[#14161d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <Power size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Disconnect Terminal</h3>
                                    <p className="text-xs text-zinc-500">End connection to local backend</p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-zinc-400 mb-6">
                                This will disconnect all terminal sessions from your local machine. 
                                You can reconnect at any time by clicking the connect button.
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowDisconnectModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={stopBackend}
                                    className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-sm font-medium text-red-400 transition-all flex items-center justify-center gap-2"
                                >
                                    <Power size={16} />
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.03)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_3px,3px_100%] z-0 opacity-30" />
            
            {/* Click backdrop for dropdowns */}
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
        </div>
    );
});

RealTerminal.displayName = 'RealTerminal';

export default RealTerminal;