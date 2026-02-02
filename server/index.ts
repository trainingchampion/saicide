
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os';
import fs from 'fs';
import { createRequire } from 'module';
import mcpRouter from './mcpRouter.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust pty import
let pty: any;
try {
    pty = require('node-pty');
} catch (e) {
    console.warn("node-pty not available. Terminal will run in browser mode.");
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: '*' },
    path: '/socket.io/'
});
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mount MCP Router
try {
    app.use('/api/mcp', mcpRouter);
    console.log('MCP Router mounted at /api/mcp');
} catch (error) {
    console.error('Failed to mount MCP router:', error);
}

// Windows shell detection helpers
const findWindowsShell = (): { shell: string; args: string[]; name: string } => {
    const platform = os.platform();
    if (platform !== 'win32') {
        return { shell: process.env.SHELL || '/bin/zsh', args: ['--login'], name: 'zsh' };
    }
    
    // Check for available shells on Windows in order of preference
    const shellOptions = [
        // Git Bash (most Unix-like experience)
        { 
            paths: [
                'C:\\Program Files\\Git\\bin\\bash.exe',
                'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
                path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Git', 'bin', 'bash.exe')
            ],
            args: ['--login', '-i'],
            name: 'Git Bash'
        },
        // WSL Bash
        { 
            paths: ['C:\\Windows\\System32\\wsl.exe'],
            args: [],
            name: 'WSL'
        },
        // PowerShell Core (cross-platform)
        { 
            paths: [
                'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                'C:\\Program Files (x86)\\PowerShell\\7\\pwsh.exe'
            ],
            args: ['-NoLogo'],
            name: 'PowerShell 7'
        },
        // Windows PowerShell (always available)
        { 
            paths: ['C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'powershell.exe'],
            args: ['-NoLogo'],
            name: 'PowerShell'
        },
        // Command Prompt (last resort)
        { 
            paths: ['C:\\Windows\\System32\\cmd.exe', 'cmd.exe'],
            args: [],
            name: 'Command Prompt'
        }
    ];
    
    for (const option of shellOptions) {
        for (const shellPath of option.paths) {
            try {
                if (fs.existsSync(shellPath)) {
                    console.log(`[Terminal] Found Windows shell: ${option.name} at ${shellPath}`);
                    return { shell: shellPath, args: option.args, name: option.name };
                }
            } catch {
                // Continue to next option
            }
        }
    }
    
    // Ultimate fallback
    return { shell: 'powershell.exe', args: ['-NoLogo'], name: 'PowerShell' };
};

// Get available shells for the current platform
const getAvailableShells = (): { id: string; name: string; available: boolean }[] => {
    const platform = os.platform();
    const shells: { id: string; name: string; available: boolean }[] = [];
    
    if (platform === 'win32') {
        // Windows shells
        const gitBashPaths = [
            'C:\\Program Files\\Git\\bin\\bash.exe',
            'C:\\Program Files (x86)\\Git\\bin\\bash.exe'
        ];
        const hasGitBash = gitBashPaths.some(p => { try { return fs.existsSync(p); } catch { return false; } });
        
        const hasWSL = (() => { try { return fs.existsSync('C:\\Windows\\System32\\wsl.exe'); } catch { return false; } })();
        const hasPwsh7 = (() => { try { return fs.existsSync('C:\\Program Files\\PowerShell\\7\\pwsh.exe'); } catch { return false; } })();
        
        shells.push(
            { id: 'gitbash', name: 'Git Bash', available: hasGitBash },
            { id: 'wsl', name: 'WSL (Linux)', available: hasWSL },
            { id: 'pwsh', name: 'PowerShell 7', available: hasPwsh7 },
            { id: 'powershell', name: 'PowerShell', available: true },
            { id: 'cmd', name: 'Command Prompt', available: true },
            { id: 'node', name: 'Node.js REPL', available: true },
            { id: 'python', name: 'Python REPL', available: true }
        );
    } else {
        // macOS/Linux shells
        const hasZsh = (() => { try { return fs.existsSync('/bin/zsh'); } catch { return false; } })();
        const hasBash = (() => { try { return fs.existsSync('/bin/bash'); } catch { return false; } })();
        const hasFish = (() => { try { return fs.existsSync('/usr/bin/fish') || fs.existsSync('/usr/local/bin/fish'); } catch { return false; } })();
        
        shells.push(
            { id: 'zsh', name: 'Zsh', available: hasZsh },
            { id: 'bash', name: 'Bash', available: hasBash },
            { id: 'fish', name: 'Fish', available: hasFish },
            { id: 'node', name: 'Node.js REPL', available: true },
            { id: 'python', name: 'Python REPL', available: true }
        );
    }
    
    return shells;
};

// Shell configuration helper with improved Windows support
const getShellCommand = (shellType?: string): { shell: string; args: string[]; name: string } => {
    const platform = os.platform();
    
    // If no shell specified, auto-detect best available
    if (!shellType || shellType === 'default') {
        if (platform === 'win32') {
            return findWindowsShell();
        }
        const defaultShell = process.env.SHELL || '/bin/zsh';
        return { shell: defaultShell, args: ['--login'], name: path.basename(defaultShell) };
    }
    
    // Specific shell requested
    switch (shellType) {
        case 'bash':
            if (platform === 'win32') {
                // Try Git Bash first
                const gitBashPaths = [
                    'C:\\Program Files\\Git\\bin\\bash.exe',
                    'C:\\Program Files (x86)\\Git\\bin\\bash.exe'
                ];
                for (const p of gitBashPaths) {
                    if (fs.existsSync(p)) {
                        return { shell: p, args: ['--login', '-i'], name: 'Git Bash' };
                    }
                }
                return { shell: 'bash.exe', args: ['--login'], name: 'Bash' };
            }
            return { shell: '/bin/bash', args: ['--login'], name: 'Bash' };
            
        case 'zsh':
            if (platform === 'win32') {
                return findWindowsShell(); // Fallback to best available
            }
            return { shell: '/bin/zsh', args: ['--login'], name: 'Zsh' };
            
        case 'gitbash':
            const gitBashPaths = [
                'C:\\Program Files\\Git\\bin\\bash.exe',
                'C:\\Program Files (x86)\\Git\\bin\\bash.exe'
            ];
            for (const p of gitBashPaths) {
                if (fs.existsSync(p)) {
                    return { shell: p, args: ['--login', '-i'], name: 'Git Bash' };
                }
            }
            return { shell: 'bash.exe', args: ['--login'], name: 'Git Bash' };
            
        case 'wsl':
            return { shell: 'wsl.exe', args: [], name: 'WSL' };
            
        case 'pwsh':
            if (platform === 'win32') {
                const pwshPath = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
                if (fs.existsSync(pwshPath)) {
                    return { shell: pwshPath, args: ['-NoLogo'], name: 'PowerShell 7' };
                }
            }
            return { shell: 'pwsh', args: ['-NoLogo'], name: 'PowerShell 7' };
            
        case 'powershell':
            return { 
                shell: platform === 'win32' ? 'powershell.exe' : 'pwsh', 
                args: ['-NoLogo'], 
                name: 'PowerShell' 
            };
            
        case 'cmd':
            return { shell: 'cmd.exe', args: [], name: 'Command Prompt' };
            
        case 'node':
            return { shell: 'node', args: [], name: 'Node.js' };
            
        case 'python':
            return { shell: platform === 'win32' ? 'python' : 'python3', args: [], name: 'Python' };
            
        case 'fish':
            return { shell: '/usr/bin/fish', args: ['--login'], name: 'Fish' };
            
        default:
            if (platform === 'win32') {
                return findWindowsShell();
            }
            return { shell: process.env.SHELL || '/bin/zsh', args: ['--login'], name: 'Default' };
    }
};

// Active terminal sessions tracking
const activeSessions = new Map<string, any>();

io.on('connection', (socket) => {
    console.log(`[Terminal] Client connected: ${socket.id}`);
    
    // Get shell type from query params
    const shellType = socket.handshake.query.shell as string | undefined;
    const requestedCwd = socket.handshake.query.cwd as string;
    // Use home directory as default - paths with spaces can cause issues
    const workingDir = requestedCwd && requestedCwd.length > 0 ? requestedCwd : os.homedir();
    
    if (pty) {
        try {
            const { shell, args } = getShellCommand(shellType);
            
            // Verify the shell exists
            const fs = require('fs');
            if (!fs.existsSync(shell)) {
                throw new Error(`Shell not found: ${shell}`);
            }
            
            const ptyProcess = pty.spawn(shell, args, { 
                name: 'xterm-256color', 
                cols: 120, 
                rows: 30, 
                cwd: os.homedir(), // Always start in home dir to avoid path issues
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
                    COLORTERM: 'truecolor',
                    LANG: 'en_US.UTF-8',
                    HOME: os.homedir(),
                    // Enable color support
                    CLICOLOR: '1',
                    CLICOLOR_FORCE: '1',
                    // Set editor
                    EDITOR: 'nano',
                    VISUAL: 'nano',
                }
            });
            
            // If a different working directory was requested, cd to it after spawn
            if (workingDir !== os.homedir()) {
                setTimeout(() => {
                    ptyProcess.write(`cd "${workingDir}"\r`);
                }, 100);
            }
            
            // Track session
            activeSessions.set(socket.id, {
                pty: ptyProcess,
                shell,
                startTime: new Date(),
                pid: ptyProcess.pid
            });

            // Send PID to client
            socket.emit('session-info', { 
                pid: ptyProcess.pid, 
                shell,
                cwd: workingDir 
            });
            
            ptyProcess.onData((data: string) => {
                socket.emit('output', data);
            });

            ptyProcess.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
                console.log(`[Terminal] Process exited: code=${exitCode}, signal=${signal}`);
                socket.emit('exit', { exitCode, signal });
                activeSessions.delete(socket.id);
            });
            
            socket.on('input', (data: string) => {
                if (ptyProcess) ptyProcess.write(data);
            });

            socket.on('resize', ({ cols, rows }: { cols: number, rows: number }) => {
                if (ptyProcess && cols > 0 && rows > 0) {
                    try {
                        ptyProcess.resize(cols, rows);
                    } catch (e) {
                        console.error('[Terminal] Resize error:', e);
                    }
                }
            });

            socket.on('kill', () => {
                console.log(`[Terminal] Kill request for ${socket.id}`);
                try {
                    ptyProcess.kill();
                } catch (e) {
                    // Ignore kill errors
                }
            });
            
            socket.on('disconnect', () => {
                console.log(`[Terminal] Session disconnected: ${socket.id}`);
                activeSessions.delete(socket.id);
                try {
                    ptyProcess.kill();
                } catch (e) {
                    // Ignore kill errors
                }
            });

            // Initial welcome message with session info
            socket.emit('output', `\x1b[38;2;34;197;94m✓\x1b[0m \x1b[1;38;2;6;182;212mTerminal ready\x1b[0m \x1b[38;2;100;100;120m(PID: ${ptyProcess.pid})\x1b[0m\r\n`);
            
        } catch (err: any) {
            console.error('[Terminal] PTY Spawn Error:', err);
            const platform = os.platform();
            const isWindows = platform === 'win32';
            
            let errorMessage = '\r\n\x1b[38;2;234;179;8m⚠\x1b[0m \x1b[1;38;2;239;68;68mCould not start shell process\x1b[0m\r\n\r\n';
            
            if (isWindows) {
                errorMessage += '\x1b[38;2;148;163;184mWindows terminal setup tips:\x1b[0m\r\n';
                errorMessage += '  \x1b[38;2;59;130;246m•\x1b[0m Install Git for Windows: \x1b[38;2;34;197;94mhttps://git-scm.com\x1b[0m\r\n';
                errorMessage += '  \x1b[38;2;59;130;246m•\x1b[0m Or enable WSL: \x1b[38;2;34;197;94mwsl --install\x1b[0m\r\n';
                errorMessage += '  \x1b[38;2;59;130;246m•\x1b[0m PowerShell is available as fallback\r\n';
            } else {
                errorMessage += `\x1b[38;2;148;163;184mError: ${err.message}\x1b[0m\r\n`;
            }
            
            errorMessage += '\r\n\x1b[38;2;168;85;247m→ Using browser-based terminal with simulated commands\x1b[0m\r\n';
            errorMessage += '\x1b[38;2;100;100;120mType "help" for available commands\x1b[0m\r\n';
            
            socket.emit('output', errorMessage);
            socket.emit('fallback-mode', { reason: err.message, platform });
        }
    } else {
        const platform = os.platform();
        const isWindows = platform === 'win32';
        
        let message = '\r\n\x1b[38;2;234;179;8m⚠\x1b[0m \x1b[1;38;2;6;182;212mBrowser Terminal Mode\x1b[0m\r\n\r\n';
        message += '\x1b[38;2;148;163;184mnode-pty is not available. Using simulated terminal.\x1b[0m\r\n\r\n';
        
        if (isWindows) {
            message += '\x1b[38;2;59;130;246mTo enable full terminal on Windows:\x1b[0m\r\n';
            message += '  1. Install Visual Studio Build Tools\r\n';
            message += '  2. Run: \x1b[38;2;34;197;94mnpm rebuild node-pty\x1b[0m\r\n';
        } else {
            message += '\x1b[38;2;59;130;246mTo enable full terminal:\x1b[0m\r\n';
            message += '  Run: \x1b[38;2;34;197;94mnpm install node-pty\x1b[0m\r\n';
        }
        
        message += '\r\n\x1b[38;2;100;100;120mType "help" for available commands\x1b[0m\r\n';
        
        socket.emit('output', message);
        socket.emit('fallback-mode', { reason: 'node-pty not installed', platform });
    }
});

// Terminal management endpoints
app.get('/api/terminal/sessions', (_req, res) => {
    const sessions = Array.from(activeSessions.entries()).map(([id, session]) => ({
        id,
        shell: session.shell,
        pid: session.pid,
        startTime: session.startTime,
    }));
    res.json(sessions);
});

// Get available shells for the current platform
app.get('/api/terminal/shells', (_req, res) => {
    const shells = getAvailableShells();
    const platform = os.platform();
    res.json({ 
        platform, 
        shells,
        hasPty: !!pty,
        recommended: shells.find(s => s.available)?.id || 'default'
    });
});

// Get system info for terminal
app.get('/api/terminal/info', (_req, res) => {
    res.json({
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        username: os.userInfo().username,
        homedir: os.homedir(),
        shell: process.env.SHELL || (os.platform() === 'win32' ? 'powershell' : '/bin/zsh'),
        hasPty: !!pty
    });
});

app.post('/api/terminal/kill/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    if (session) {
        try {
            session.pty.kill();
            activeSessions.delete(sessionId);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ success: false, error: String(e) });
        }
    } else {
        res.status(404).json({ success: false, error: 'Session not found' });
    }
});

// ==================== Filesystem API ====================

// List directory contents
app.get('/api/fs/list', (req, res) => {
    const dirPath = (req.query.path as string) || os.homedir();
    
    try {
        const resolvedPath = path.resolve(dirPath);
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
        
        const result = items
            .filter(item => !item.name.startsWith('.')) // Hide hidden files by default
            .map(item => ({
                name: item.name,
                path: path.join(resolvedPath, item.name),
                isDirectory: item.isDirectory(),
                isFile: item.isFile(),
                isSymlink: item.isSymbolicLink(),
            }))
            .sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });
        
        res.json({ 
            success: true, 
            path: resolvedPath,
            parent: path.dirname(resolvedPath),
            items 
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List directory with hidden files
app.get('/api/fs/list-all', (req, res) => {
    const dirPath = (req.query.path as string) || os.homedir();
    
    try {
        const resolvedPath = path.resolve(dirPath);
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
        
        const result = items
            .map(item => {
                let stats: fs.Stats | null = null;
                try {
                    stats = fs.statSync(path.join(resolvedPath, item.name));
                } catch {}
                
                return {
                    name: item.name,
                    path: path.join(resolvedPath, item.name),
                    isDirectory: item.isDirectory(),
                    isFile: item.isFile(),
                    isSymlink: item.isSymbolicLink(),
                    isHidden: item.name.startsWith('.'),
                    size: stats?.size || 0,
                    modified: stats?.mtime || null,
                };
            })
            .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });
        
        res.json({ 
            success: true, 
            path: resolvedPath,
            parent: path.dirname(resolvedPath),
            items: result 
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Read file content
app.get('/api/fs/read', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Path required' });
    }
    
    try {
        const resolvedPath = path.resolve(filePath);
        const stats = fs.statSync(resolvedPath);
        
        // Limit file size to 10MB
        if (stats.size > 10 * 1024 * 1024) {
            return res.status(413).json({ success: false, error: 'File too large (max 10MB)' });
        }
        
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        res.json({ 
            success: true, 
            path: resolvedPath,
            content,
            size: stats.size,
            modified: stats.mtime 
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Write file content
app.post('/api/fs/write', (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Path required' });
    }
    
    try {
        const resolvedPath = path.resolve(filePath);
        fs.writeFileSync(resolvedPath, content || '', 'utf-8');
        res.json({ success: true, path: resolvedPath });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create directory
app.post('/api/fs/mkdir', (req, res) => {
    const { path: dirPath } = req.body;
    if (!dirPath) {
        return res.status(400).json({ success: false, error: 'Path required' });
    }
    
    try {
        const resolvedPath = path.resolve(dirPath);
        fs.mkdirSync(resolvedPath, { recursive: true });
        res.json({ success: true, path: resolvedPath });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete file or directory
app.delete('/api/fs/delete', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Path required' });
    }
    
    try {
        const resolvedPath = path.resolve(filePath);
        const stats = fs.statSync(resolvedPath);
        
        if (stats.isDirectory()) {
            fs.rmSync(resolvedPath, { recursive: true });
        } else {
            fs.unlinkSync(resolvedPath);
        }
        
        res.json({ success: true, path: resolvedPath });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get home directory
app.get('/api/fs/home', (_req, res) => {
    res.json({ 
        success: true, 
        home: os.homedir(),
        username: os.userInfo().username,
        platform: os.platform(),
        hostname: os.hostname()
    });
});

// Check if path exists
app.get('/api/fs/exists', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Path required' });
    }
    
    try {
        const resolvedPath = path.resolve(filePath);
        const exists = fs.existsSync(resolvedPath);
        let isDirectory = false;
        let isFile = false;
        
        if (exists) {
            const stats = fs.statSync(resolvedPath);
            isDirectory = stats.isDirectory();
            isFile = stats.isFile();
        }
        
        res.json({ success: true, exists, isDirectory, isFile, path: resolvedPath });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== End Filesystem API ====================

app.post('/api/anthropic/messages', async (req, res) => {
  const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(401).json({ error: { message: 'Anthropic API key is not configured.' } });

  try {
    const response = await axios.post(ANTHROPIC_API_URL, req.body, { 
        headers: { 
            'x-api-key': apiKey, 
            'anthropic-version': '2023-06-01', 
            'content-type': 'application/json' 
        } 
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

app.post('/api/paystack/verify', async (req, res) => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    const { reference } = req.body;
    if (!key || !reference) return res.status(400).json({ status: false, message: 'Invalid request.' });
    
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, { 
            headers: { Authorization: `Bearer ${key}` } 
        });
        res.json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json(error.response?.data);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE MANAGER API - Real database connections and queries
// ═══════════════════════════════════════════════════════════════════════════════

// In-memory store for active database connections
const dbConnections: Map<string, {
    id: string;
    name: string;
    type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
    config: any;
    client?: any;
    connected: boolean;
}> = new Map();

// Test database connection
app.post('/api/db/test', async (req, res) => {
    const { type, host, port, database, user, password, connectionString, filePath } = req.body;
    
    try {
        if (type === 'postgres') {
            // Test PostgreSQL connection using psql command
            const { spawn } = require('child_process');
            const connStr = connectionString || `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;
            
            const psql = spawn('psql', [connStr, '-c', 'SELECT 1;'], { timeout: 10000 });
            
            let stdout = '';
            let stderr = '';
            
            psql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            psql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            psql.on('close', (code: number) => {
                if (code === 0) {
                    res.json({ success: true, message: 'PostgreSQL connection successful' });
                } else {
                    res.json({ success: false, error: stderr || 'Connection failed' });
                }
            });
            
            psql.on('error', () => {
                res.json({ success: false, error: 'psql not found. Install PostgreSQL client tools.' });
            });
            
        } else if (type === 'mysql') {
            const { spawn } = require('child_process');
            const args = ['-h', host, '-P', port || '3306', '-u', user, `-p${password}`, database, '-e', 'SELECT 1;'];
            
            const mysql = spawn('mysql', args, { timeout: 10000 });
            
            let stderr = '';
            mysql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            mysql.on('close', (code: number) => {
                if (code === 0) {
                    res.json({ success: true, message: 'MySQL connection successful' });
                } else {
                    res.json({ success: false, error: stderr || 'Connection failed' });
                }
            });
            
            mysql.on('error', () => {
                res.json({ success: false, error: 'mysql client not found. Install MySQL client tools.' });
            });
            
        } else if (type === 'sqlite') {
            const dbPath = filePath || database;
            if (!dbPath) {
                return res.json({ success: false, error: 'Database file path required' });
            }
            
            // Check if sqlite3 is available and file exists/can be created
            const { spawn } = require('child_process');
            const sqlite = spawn('sqlite3', [dbPath, '.tables'], { timeout: 5000 });
            
            let stderr = '';
            sqlite.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            sqlite.on('close', (code: number) => {
                if (code === 0) {
                    res.json({ success: true, message: 'SQLite connection successful' });
                } else {
                    res.json({ success: false, error: stderr || 'SQLite error' });
                }
            });
            
            sqlite.on('error', () => {
                res.json({ success: false, error: 'sqlite3 not found. Install SQLite.' });
            });
            
        } else if (type === 'mongodb') {
            const { spawn } = require('child_process');
            const uri = connectionString || `mongodb://${user}:${password}@${host}:${port || 27017}/${database}`;
            
            const mongosh = spawn('mongosh', [uri, '--eval', 'db.runCommand({ ping: 1 })'], { timeout: 10000 });
            
            let stderr = '';
            mongosh.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            mongosh.on('close', (code: number) => {
                if (code === 0) {
                    res.json({ success: true, message: 'MongoDB connection successful' });
                } else {
                    res.json({ success: false, error: stderr || 'Connection failed' });
                }
            });
            
            mongosh.on('error', () => {
                res.json({ success: false, error: 'mongosh not found. Install MongoDB Shell.' });
            });
        } else {
            res.json({ success: false, error: `Unsupported database type: ${type}` });
        }
    } catch (error: any) {
        res.json({ success: false, error: error.message });
    }
});

// Connect to database and store connection
app.post('/api/db/connect', async (req, res) => {
    const { id, name, type, host, port, database, user, password, connectionString, filePath } = req.body;
    
    const connectionId = id || `conn-${Date.now()}`;
    
    const config = { type, host, port, database, user, password, connectionString, filePath };
    
    dbConnections.set(connectionId, {
        id: connectionId,
        name: name || `${type}://${host || filePath}`,
        type,
        config,
        connected: true
    });
    
    res.json({ 
        success: true, 
        connectionId,
        message: `Connected to ${type} database`
    });
});

// Disconnect from database
app.post('/api/db/disconnect', (req, res) => {
    const { connectionId } = req.body;
    
    if (dbConnections.has(connectionId)) {
        dbConnections.delete(connectionId);
        res.json({ success: true, message: 'Disconnected' });
    } else {
        res.json({ success: false, error: 'Connection not found' });
    }
});

// List all connections
app.get('/api/db/connections', (_req, res) => {
    const connections = Array.from(dbConnections.values()).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        connected: c.connected
    }));
    res.json(connections);
});

// Get tables/collections for a connection
app.get('/api/db/tables', async (req, res) => {
    const { connectionId } = req.query;
    const conn = dbConnections.get(connectionId as string);
    
    if (!conn) {
        return res.json({ success: false, error: 'Connection not found' });
    }
    
    const { spawn } = require('child_process');
    const { type, host, port, database, user, password, connectionString, filePath } = conn.config;
    
    try {
        if (type === 'postgres') {
            const connStr = connectionString || `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;
            const psql = spawn('psql', [connStr, '-t', '-c', 
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            ]);
            
            let stdout = '';
            let stderr = '';
            psql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            psql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            psql.on('close', (code: number) => {
                if (code === 0) {
                    const tables = stdout.split('\n').map(t => t.trim()).filter(t => t);
                    res.json({ success: true, tables });
                } else {
                    res.json({ success: false, error: stderr });
                }
            });
            
        } else if (type === 'mysql') {
            const mysql = spawn('mysql', ['-h', host, '-P', port || '3306', '-u', user, `-p${password}`, database, '-N', '-e', 'SHOW TABLES;']);
            
            let stdout = '';
            let stderr = '';
            mysql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            mysql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            mysql.on('close', (code: number) => {
                if (code === 0) {
                    const tables = stdout.split('\n').map(t => t.trim()).filter(t => t);
                    res.json({ success: true, tables });
                } else {
                    res.json({ success: false, error: stderr });
                }
            });
            
        } else if (type === 'sqlite') {
            const sqlite = spawn('sqlite3', [filePath || database, '.tables']);
            
            let stdout = '';
            sqlite.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            
            sqlite.on('close', (code: number) => {
                if (code === 0) {
                    const tables = stdout.split(/\s+/).filter(t => t.trim());
                    res.json({ success: true, tables });
                } else {
                    res.json({ success: false, error: 'Failed to list tables' });
                }
            });
            
        } else if (type === 'mongodb') {
            const uri = connectionString || `mongodb://${user}:${password}@${host}:${port || 27017}/${database}`;
            const mongosh = spawn('mongosh', [uri, '--quiet', '--eval', 'db.getCollectionNames().join("\\n")']);
            
            let stdout = '';
            mongosh.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            
            mongosh.on('close', (code: number) => {
                if (code === 0) {
                    const tables = stdout.split('\n').map(t => t.trim()).filter(t => t && !t.startsWith('['));
                    res.json({ success: true, tables });
                } else {
                    res.json({ success: false, error: 'Failed to list collections' });
                }
            });
        } else {
            res.json({ success: false, error: 'Unsupported database type' });
        }
    } catch (error: any) {
        res.json({ success: false, error: error.message });
    }
});

// Get table schema
app.get('/api/db/schema', async (req, res) => {
    const { connectionId, table } = req.query;
    const conn = dbConnections.get(connectionId as string);
    
    if (!conn) {
        return res.json({ success: false, error: 'Connection not found' });
    }
    
    const { spawn } = require('child_process');
    const { type, host, port, database, user, password, connectionString, filePath } = conn.config;
    
    try {
        if (type === 'postgres') {
            const connStr = connectionString || `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;
            const psql = spawn('psql', [connStr, '-t', '-c', 
                `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position;`
            ]);
            
            let stdout = '';
            psql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            
            psql.on('close', (code: number) => {
                if (code === 0) {
                    const columns = stdout.split('\n').filter(l => l.trim()).map(line => {
                        const [name, dataType, nullable] = line.split('|').map(s => s.trim());
                        return { name, type: dataType, nullable: nullable === 'YES' };
                    });
                    res.json({ success: true, columns });
                } else {
                    res.json({ success: false, error: 'Failed to get schema' });
                }
            });
            
        } else if (type === 'mysql') {
            const mysql = spawn('mysql', ['-h', host, '-P', port || '3306', '-u', user, `-p${password}`, database, '-N', '-e', `DESCRIBE ${table};`]);
            
            let stdout = '';
            mysql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            
            mysql.on('close', (code: number) => {
                if (code === 0) {
                    const columns = stdout.split('\n').filter(l => l.trim()).map(line => {
                        const parts = line.split('\t');
                        return { name: parts[0], type: parts[1], nullable: parts[2] === 'YES' };
                    });
                    res.json({ success: true, columns });
                } else {
                    res.json({ success: false, error: 'Failed to get schema' });
                }
            });
            
        } else if (type === 'sqlite') {
            const sqlite = spawn('sqlite3', [filePath || database, `-cmd`, `.mode json`, `PRAGMA table_info(${table});`]);
            
            let stdout = '';
            sqlite.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            
            sqlite.on('close', (code: number) => {
                if (code === 0) {
                    try {
                        const info = JSON.parse(stdout);
                        const columns = info.map((col: any) => ({
                            name: col.name,
                            type: col.type,
                            nullable: col.notnull === 0
                        }));
                        res.json({ success: true, columns });
                    } catch {
                        res.json({ success: false, error: 'Failed to parse schema' });
                    }
                } else {
                    res.json({ success: false, error: 'Failed to get schema' });
                }
            });
        } else {
            res.json({ success: true, columns: [] }); // MongoDB is schemaless
        }
    } catch (error: any) {
        res.json({ success: false, error: error.message });
    }
});

// Execute query
app.post('/api/db/query', async (req, res) => {
    const { connectionId, query, limit = 100 } = req.body;
    const conn = dbConnections.get(connectionId);
    
    if (!conn) {
        return res.json({ success: false, error: 'Connection not found' });
    }
    
    const { spawn } = require('child_process');
    const { type, host, port, database, user, password, connectionString, filePath } = conn.config;
    
    try {
        if (type === 'postgres') {
            const connStr = connectionString || `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;
            // Add LIMIT if not present in SELECT queries
            let finalQuery = query;
            if (query.toLowerCase().trim().startsWith('select') && !query.toLowerCase().includes('limit')) {
                finalQuery = `${query.replace(/;?\s*$/, '')} LIMIT ${limit};`;
            }
            
            const psql = spawn('psql', [connStr, '-t', '-A', '-F', '\t', '-c', finalQuery]);
            
            let stdout = '';
            let stderr = '';
            psql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            psql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            psql.on('close', (code: number) => {
                if (code === 0) {
                    // Parse TSV output to JSON
                    const lines = stdout.split('\n').filter(l => l.trim());
                    if (lines.length === 0) {
                        res.json({ success: true, rows: [], rowCount: 0 });
                    } else {
                        // For SELECT queries, parse as data
                        const rows = lines.map(line => {
                            const values = line.split('\t');
                            return values;
                        });
                        res.json({ success: true, rows, rowCount: rows.length, message: `${rows.length} row(s)` });
                    }
                } else {
                    res.json({ success: false, error: stderr || 'Query failed' });
                }
            });
            
        } else if (type === 'mysql') {
            let finalQuery = query;
            if (query.toLowerCase().trim().startsWith('select') && !query.toLowerCase().includes('limit')) {
                finalQuery = `${query.replace(/;?\s*$/, '')} LIMIT ${limit};`;
            }
            
            const mysql = spawn('mysql', ['-h', host, '-P', port || '3306', '-u', user, `-p${password}`, database, '-N', '-e', finalQuery]);
            
            let stdout = '';
            let stderr = '';
            mysql.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            mysql.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            mysql.on('close', (code: number) => {
                if (code === 0) {
                    const rows = stdout.split('\n').filter(l => l.trim()).map(line => line.split('\t'));
                    res.json({ success: true, rows, rowCount: rows.length });
                } else {
                    res.json({ success: false, error: stderr.replace(/Warning:.+\n/g, '') || 'Query failed' });
                }
            });
            
        } else if (type === 'sqlite') {
            let finalQuery = query;
            if (query.toLowerCase().trim().startsWith('select') && !query.toLowerCase().includes('limit')) {
                finalQuery = `${query.replace(/;?\s*$/, '')} LIMIT ${limit};`;
            }
            
            const sqlite = spawn('sqlite3', [filePath || database, '-separator', '\t', finalQuery]);
            
            let stdout = '';
            let stderr = '';
            sqlite.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            sqlite.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            sqlite.on('close', (code: number) => {
                if (code === 0) {
                    const rows = stdout.split('\n').filter(l => l.trim()).map(line => line.split('\t'));
                    res.json({ success: true, rows, rowCount: rows.length });
                } else {
                    res.json({ success: false, error: stderr || 'Query failed' });
                }
            });
            
        } else if (type === 'mongodb') {
            const uri = connectionString || `mongodb://${user}:${password}@${host}:${port || 27017}/${database}`;
            const mongosh = spawn('mongosh', [uri, '--quiet', '--eval', query]);
            
            let stdout = '';
            let stderr = '';
            mongosh.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            mongosh.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
            
            mongosh.on('close', (code: number) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        const rows = Array.isArray(result) ? result : [result];
                        res.json({ success: true, rows, rowCount: rows.length });
                    } catch {
                        res.json({ success: true, rows: [{ result: stdout }], rowCount: 1 });
                    }
                } else {
                    res.json({ success: false, error: stderr || 'Query failed' });
                }
            });
        } else {
            res.json({ success: false, error: 'Unsupported database type' });
        }
    } catch (error: any) {
        res.json({ success: false, error: error.message });
    }
});

// Get table data with pagination
app.get('/api/db/data', async (req, res) => {
    const { connectionId, table, limit = 50, offset = 0 } = req.query;
    const conn = dbConnections.get(connectionId as string);
    
    if (!conn) {
        return res.json({ success: false, error: 'Connection not found' });
    }
    
    const { type } = conn.config;
    let query = '';
    
    if (type === 'mongodb') {
        query = `db.${table}.find().skip(${offset}).limit(${limit}).toArray()`;
    } else {
        query = `SELECT * FROM ${table} LIMIT ${limit} OFFSET ${offset};`;
    }
    
    // Reuse query endpoint logic
    req.body = { connectionId, query, limit };
    return res.redirect(307, '/api/db/query');
});

// ═══════════════════════════════════════════════════════════════════════════════
// Docker API Endpoints
// ═══════════════════════════════════════════════════════════════════════════════

import { spawn, exec } from 'child_process';

// Check if Docker is available
app.get('/api/docker/status', async (req, res) => {
    exec('docker info --format "{{.ServerVersion}}"', (error, stdout, stderr) => {
        if (error) {
            return res.json({ available: false, error: 'Docker is not running or not installed' });
        }
        res.json({ available: true, version: stdout.trim() });
    });
});

// List Docker images
app.get('/api/docker/images', async (req, res) => {
    exec('docker images --format "{{json .}}"', (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        try {
            const images = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
            res.json({ success: true, images });
        } catch (e) {
            res.json({ success: true, images: [] });
        }
    });
});

// List Docker containers
app.get('/api/docker/containers', async (req, res) => {
    const showAll = req.query.all === 'true' ? '-a' : '';
    exec(`docker ps ${showAll} --format "{{json .}}"`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        try {
            const containers = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
            res.json({ success: true, containers });
        } catch (e) {
            res.json({ success: true, containers: [] });
        }
    });
});

// Build Docker image
app.post('/api/docker/build', async (req, res) => {
    const { dockerfilePath, imageName, tag = 'latest', context = '.' } = req.body;
    
    if (!dockerfilePath || !imageName) {
        return res.json({ success: false, error: 'Missing dockerfilePath or imageName' });
    }
    
    const cmd = `docker build -f "${dockerfilePath}" -t ${imageName}:${tag} ${context}`;
    
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message, output: stdout });
        }
        res.json({ success: true, output: stdout + stderr });
    });
});

// Run Docker container
app.post('/api/docker/run', async (req, res) => {
    const { image, name, ports, env, detach = true, volumes } = req.body;
    
    if (!image) {
        return res.json({ success: false, error: 'Missing image name' });
    }
    
    let cmd = `docker run`;
    if (detach) cmd += ' -d';
    if (name) cmd += ` --name ${name}`;
    if (ports && Array.isArray(ports)) {
        ports.forEach((p: string) => cmd += ` -p ${p}`);
    }
    if (env && Array.isArray(env)) {
        env.forEach((e: string) => cmd += ` -e ${e}`);
    }
    if (volumes && Array.isArray(volumes)) {
        volumes.forEach((v: string) => cmd += ` -v ${v}`);
    }
    cmd += ` ${image}`;
    
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, containerId: stdout.trim() });
    });
});

// Stop Docker container
app.post('/api/docker/stop', async (req, res) => {
    const { containerId } = req.body;
    
    if (!containerId) {
        return res.json({ success: false, error: 'Missing containerId' });
    }
    
    exec(`docker stop ${containerId}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true });
    });
});

// Remove Docker container
app.post('/api/docker/rm', async (req, res) => {
    const { containerId, force = false } = req.body;
    
    if (!containerId) {
        return res.json({ success: false, error: 'Missing containerId' });
    }
    
    const forceFlag = force ? '-f' : '';
    exec(`docker rm ${forceFlag} ${containerId}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true });
    });
});

// Remove Docker image
app.post('/api/docker/rmi', async (req, res) => {
    const { imageId, force = false } = req.body;
    
    if (!imageId) {
        return res.json({ success: false, error: 'Missing imageId' });
    }
    
    const forceFlag = force ? '-f' : '';
    exec(`docker rmi ${forceFlag} ${imageId}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true });
    });
});

// Get container logs
app.get('/api/docker/logs/:containerId', async (req, res) => {
    const { containerId } = req.params;
    const { tail = 100 } = req.query;
    
    exec(`docker logs --tail ${tail} ${containerId}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, logs: stdout + stderr });
    });
});

// Docker login to registry
app.post('/api/docker/login', async (req, res) => {
    const { registry, username, password } = req.body;
    
    if (!username || !password) {
        return res.json({ success: false, error: 'Missing username or password' });
    }
    
    const registryArg = registry ? registry : '';
    // Use echo to pipe password to avoid it showing in process list
    exec(`echo "${password}" | docker login ${registryArg} -u ${username} --password-stdin`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, message: stdout });
    });
});

// Push image to registry
app.post('/api/docker/push', async (req, res) => {
    const { image } = req.body;
    
    if (!image) {
        return res.json({ success: false, error: 'Missing image name' });
    }
    
    exec(`docker push ${image}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, output: stdout });
    });
});

// Pull image from registry
app.post('/api/docker/pull', async (req, res) => {
    const { image } = req.body;
    
    if (!image) {
        return res.json({ success: false, error: 'Missing image name' });
    }
    
    exec(`docker pull ${image}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, output: stdout + stderr });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/extensions', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get('https://open-vsx.org/api/-/search', {
      params: {
        query: query || '',
        size: 20,
        sortBy: query ? 'relevance' : 'downloadCount',
        sortOrder: 'desc'
      }
    });
    // Return just the array of extensions
    res.json(response.data.extensions || []);
  } catch (error: any) {
    console.error('Open VSX proxy error:', error.message);
    res.status(500).json([]);
  }
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return res.status(404).json({ error: 'Not found.' });
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => console.log(`[Sai Backend] Logic link online: http://localhost:${PORT}`));
