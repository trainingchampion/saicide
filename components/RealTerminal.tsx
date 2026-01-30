import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import { FileNode, GitStatus } from '../types';
import { 
    Loader2, 
    Activity, 
    Terminal as TerminalIcon, 
    Trash2,
    RefreshCw,
    Power
} from 'lucide-react';
import aiService from '../services/geminiService';

const XTERM_CSS = `
.xterm{cursor:text;position:relative;user-select:none;-ms-user-select:none;-webkit-user-select:none}.xterm.focus,.xterm:focus{outline:none}.xterm .xterm-helpers{position:absolute;z-index:5}.xterm .xterm-helper-textarea{position:absolute;opacity:0;z-index:-5;margin:0;cursor:default;width:0;height:0;overflow:hidden;white-space:nowrap}.xterm .composition-view{background:#000;color:#FFF;display:none;position:absolute;white-space:pre;z-index:1}.xterm .composition-view.active{display:block}.xterm .xterm-viewport{background-color:transparent !important;overflow-y:scroll;cursor:default;position:absolute;right:0;left:0;top:0;bottom:0}.xterm .xterm-screen{position:relative}.xterm .xterm-screen canvas{position:absolute;left:0;top:0}.xterm-char-measure-element{display:inline-block;visibility:hidden;position:absolute;left:0;top:0}.xterm.enable-mouse-events{cursor:default}.xterm.xterm-cursor-pointer{cursor:pointer}.xterm.xterm-cursor-crosshair{cursor:crosshair}.xterm .xterm-accessibility,.xterm .xterm-message{position:absolute;left:0;top:0;bottom:0;right:0;z-index:10;color:transparent}.xterm .live-region{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.xterm-dim{opacity:0.5}.xterm-underline{text-decoration:underline}
`;

export interface RealTerminalRef {
    runCommand: (cmd: string) => void;
    write: (text: string) => void;
    ensureTerminalVisible: () => void;
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
}

const RealTerminal = forwardRef<RealTerminalRef, RealTerminalProps>(({ 
    fontSize = '12', 
    fileStructure,
    onNewFile,
    onNewFolder,
    onDeleteFile,
    username = 'dev',
    activeModelId = 'gemini-3-flash-preview',
    onCloudAuth,
    onAiIntentRequest
}, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [isUsingRealShell, setIsUsingRealShell] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const currentLineRef = useRef('');
  const cwdRef = useRef('~');

  const writePrompt = (term: Terminal) => {
      term.write(`\r\n\x1b[1;32m${username}\x1b[0m \x1b[1;34m${cwdRef.current}\x1b[0m \x1b[1;35m(main)\x1b[0m \x1b[33m$ \x1b[0m`);
  };

  const getFilesAtCurrentDir = () => {
      let current = fileStructure;
      if (cwdRef.current !== '~') {
          const parts = cwdRef.current.split('/').filter(p => p !== '~' && p !== '');
          for (const part of parts) {
              const found = current.children?.find(c => c.name === part);
              if (found) current = found;
          }
      }
      return current.children || [];
  };

  const handleSimulatedCommand = async (cmd: string, term: Terminal) => {
      const trimmed = cmd.trim();
      if (!trimmed) { writePrompt(term); return; }

      const parts = trimmed.split(/\s+/);
      const action = parts[0].toLowerCase();
      const args = parts.slice(1);

      // 1. Filesystem Utilities
      if (action === 'ls') {
          const files = getFilesAtCurrentDir();
          if (files.length === 0) {
              term.write('\r\n');
          } else {
              const output = files.map(f => f.type === 'folder' ? `\x1b[1;34m${f.name}/\x1b[0m` : f.name).join('  ');
              term.write(`\r\n${output}\r\n`);
          }
      } else if (action === 'cd') {
          const target = args[0] || '~';
          if (target === '~' || target === '/') {
              cwdRef.current = '~';
          } else if (target === '..') {
              if (cwdRef.current !== '~') {
                  const parts = cwdRef.current.split('/');
                  parts.pop();
                  cwdRef.current = parts.join('/') || '~';
              }
          } else {
              const files = getFilesAtCurrentDir();
              const dir = files.find(f => f.name === target && f.type === 'folder');
              if (dir) {
                  cwdRef.current = cwdRef.current === '~' ? target : `${cwdRef.current}/${target}`;
              } else {
                  term.write(`\r\ncd: no such directory: ${target}\r\n`);
              }
          }
      } else if (action === 'mkdir') {
          if (args[0] && onNewFolder) {
              onNewFolder(args[0]);
              term.write(`\r\nCreated directory: ${args[0]}\r\n`);
          }
      } else if (action === 'touch') {
          if (args[0] && onNewFile) {
              onNewFile(args[0]);
              term.write(`\r\nCreated file: ${args[0]}\r\n`);
          }
      } else if (action === 'rm') {
          const target = args[0];
          if (target && onDeleteFile) {
              onDeleteFile(target, true);
              term.write(`\r\nRemoved: ${target}\r\n`);
          }
      } 
      // 2. Cloud CLI Interceptors
      else if (action === 'az' && args[0] === 'login') {
          term.write('\r\n\x1b[1;36m[Sai] Azure Login Intent detected. Opening Identity Provider...\x1b[0m\r\n');
          if (onCloudAuth) onCloudAuth('Azure');
      } else if (action === 'aws' && (args[0] === 'configure' || args[0] === 'login')) {
          term.write('\r\n\x1b[1;36m[Sai] AWS Configuration Intent detected. Opening Identity Provider...\x1b[0m\r\n');
          if (onCloudAuth) onCloudAuth('AWS');
      } else if (action === 'gcloud' && args[0] === 'auth') {
          term.write('\r\n\x1b[1;36m[Sai] GCP Auth Intent detected. Opening Identity Provider...\x1b[0m\r\n');
          if (onCloudAuth) onCloudAuth('GCP');
      }
      // 3. IDE Synthesis Commands
      else if (action === 'sai' || action === 'synth') {
          const subAction = action === 'synth' ? 'synth' : args[0]?.toLowerCase();
          if (subAction === 'synth') {
              const prompt = action === 'synth' ? args.join(' ') : args.slice(1).join(' ');
              if (onAiIntentRequest && prompt) {
                  term.write(`\r\n\x1b[1;36m[Sai] Handing over to Neural Synthesis Engine: "${prompt}"\x1b[0m\r\n`);
                  onAiIntentRequest(prompt, 'app');
              } else {
                  term.write('\r\n\x1b[31mError: Synthesis requires a descriptive prompt.\x1b[0m\r\n');
              }
          }
      }
      // 4. General fallback to Simulated Synthesis
      else if (action === 'clear') {
          term.clear();
      } else {
          setIsAiThinking(true);
          term.write('\r\n\x1b[36m[Synthesizing command execution...]\x1b[0m');
          try {
              const aiResponse = await aiService.getTerminalAiResponse(trimmed, activeModelId);
              term.write('\r\x1b[K'); 
              term.writeln(aiResponse);
          } catch {
              term.write('\r\x1b[K');
              term.writeln(`\x1b[31m[Error] Execution pipeline failed.\x1b[0m`);
          } finally {
              setIsAiThinking(false);
          }
      }
      writePrompt(term);
  };

  useImperativeHandle(ref, () => ({
      runCommand: (cmd: string) => {
          const term = termRef.current;
          if (!term) return;
          if (isUsingRealShell && socketRef.current) {
              socketRef.current.emit('input', cmd + '\r');
          } else {
              term.write(cmd + '\r');
              handleSimulatedCommand(cmd, term);
          }
      },
      write: (text: string) => {
          const term = termRef.current;
          if (term) term.writeln(`\r\n${text}`);
      },
      ensureTerminalVisible: () => {}
  }));

  const getAiSuggestion = (input: string) => {
      if (!input || input.length < 2) return null;
      const commonCmds = ['ls -la', 'cd src', 'mkdir component', 'npm install ', 'npm run dev', 'git commit -m "', 'az login', 'aws configure', 'sai synth "a weather app"'];
      const match = commonCmds.find(c => c.startsWith(input) && c !== input);
      if (match) return match.slice(input.length);
      return null;
  };

  useEffect(() => {
    if (!terminalRef.current || termRef.current) return;
    
    if (!document.getElementById('xterm-css')) {
        const style = document.createElement('style'); 
        style.id = 'xterm-css'; 
        style.textContent = XTERM_CSS; 
        document.head.appendChild(style);
    }

    const term = new Terminal({ 
        cursorBlink: true, 
        fontFamily: '"JetBrains Mono", monospace', 
        fontSize: parseInt(fontSize), 
        theme: { 
            background: 'transparent',
            foreground: '#d4d4d4', 
            cursor: '#67e8f9',
            black: '#1a1a1a',
            red: '#f85149',
            green: '#3fb950',
            yellow: '#d29922',
            blue: '#58a6ff',
            magenta: '#bc8cff',
            cyan: '#39c5cf',
            white: '#f0f0f0'
        },
        allowProposedApi: true
    });

    const fitAddon = new FitAddon(); 
    term.loadAddon(fitAddon); 
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);
    fitAddon.fit();
    termRef.current = term;

    const socket = io(window.location.origin, { path: '/socket.io/' });
    socketRef.current = socket;

    socket.on('connect', () => {
        setIsUsingRealShell(true);
        term.writeln('\x1b[1;36m[Sai] Neural link established with local kernel.\x1b[0m');
    });

    socket.on('output', (data) => {
        term.write(data);
    });

    socket.on('disconnect', () => {
        setIsUsingRealShell(false);
        term.writeln('\r\n\x1b[1;33m[Kernel] Local runtime disconnected. Switching to Neural Engine.\x1b[0m');
        writePrompt(term);
    });

    term.onData(async (data) => {
        if (isUsingRealShell) {
            socket.emit('input', data);
        } else {
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                const cmd = currentLineRef.current;
                currentLineRef.current = '';
                setSuggestion(null);
                handleSimulatedCommand(cmd, term);
            } else if (code === 127) { // Backspace
                if (currentLineRef.current.length > 0) {
                    currentLineRef.current = currentLineRef.current.slice(0, -1);
                    term.write('\b \b');
                    setSuggestion(getAiSuggestion(currentLineRef.current));
                }
            } else if (code === 9) { // Tab
                if (suggestion) {
                    term.write(suggestion);
                    currentLineRef.current += suggestion;
                    setSuggestion(null);
                }
            } else if (code >= 32 && code <= 126) {
                currentLineRef.current += data;
                term.write(data);
                setSuggestion(getAiSuggestion(currentLineRef.current));
            }
        }
    });

    const resizeObserver = new ResizeObserver(() => {
        if (fitAddonRef.current) fitAddonRef.current.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
        resizeObserver.disconnect();
        term.dispose();
        termRef.current = null;
        socket.disconnect();
    };
  }, []);

  const suggestionPosition = useMemo(() => {
    if (!suggestion || !termRef.current) return null;
    const { cursorX, cursorY } = termRef.current.buffer.active;
    const charWidth = parseInt(fontSize) * 0.6;
    const lineHeight = parseInt(fontSize) * 1.5;
    return {
        left: `${(cursorX) * charWidth + 12}px`,
        top: `${(cursorY) * lineHeight + 8}px`
    };
  }, [suggestion, fontSize]);

  return (
    <div className="relative h-full w-full bg-[#080a0f] flex flex-col group overflow-hidden transition-all">
        {/* Terminal Header Toolbar */}
        <div className="h-9 bg-[#11141b] border-b border-white/5 flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className={isUsingRealShell ? "text-cyan-400" : "text-gray-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {isUsingRealShell ? 'Kernel Shell' : 'Neural Engine'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] rounded-full border border-white/5">
                    <Activity size={10} className={isUsingRealShell ? "text-emerald-500 animate-pulse" : "text-gray-600"} />
                    <span className="text-[8px] font-black text-gray-500 uppercase">
                        {isUsingRealShell ? 'Online' : 'Provisioned'}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => termRef.current?.clear()} 
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                    title="Clear Terminal"
                >
                    <Trash2 size={12} />
                </button>
                <button 
                    onClick={() => window.location.reload()} 
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                    title="Reset Link"
                >
                    <RefreshCw size={12} />
                </button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <button 
                    onClick={() => socketRef.current?.emit('input', '\u0003')} 
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    title="Interrupt (Ctrl+C)"
                >
                    <Power size={12} />
                </button>
            </div>
        </div>

        <div ref={terminalRef} className="flex-1 w-full overflow-hidden pl-3 pt-2" />
        
        {suggestion && suggestionPosition && (
            <div 
                className="absolute pointer-events-none text-gray-600 font-mono italic whitespace-nowrap z-50 transition-all duration-75"
                style={{
                    left: suggestionPosition.left,
                    top: suggestionPosition.top,
                    fontSize: `${fontSize}px`
                }}
            >
                {suggestion} <span className="text-[9px] bg-white/5 px-1 rounded-sm ml-2 not-italic font-black text-gray-500 border border-white/5">TAB</span>
            </div>
        )}

        {isAiThinking && (
            <div className="absolute bottom-4 right-6 flex items-center gap-2 bg-cyan-900/40 border border-cyan-500/20 px-3 py-1.5 rounded-full backdrop-blur-md animate-fade-in">
                <Loader2 size={12} className="animate-spin text-cyan-400" />
                <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest">Neural Link Processing</span>
            </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] z-0 opacity-20"></div>
    </div>
  );
});

export default RealTerminal;