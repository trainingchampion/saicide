const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

// Try to load node-pty for real terminal support
let pty;
try {
  pty = require('node-pty');
  console.log('node-pty loaded successfully - real terminal support enabled');
} catch (e) {
  console.warn('node-pty not available - terminal will run in browser mode');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/socket.io/'
});

const PORT = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Log startup info
console.log('Starting Sai Production Server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('distPath:', distPath);
console.log('distPath exists:', fs.existsSync(distPath));
console.log('index.html exists:', fs.existsSync(indexPath));
console.log('node-pty available:', !!pty);

if (fs.existsSync(distPath)) {
  console.log('dist contents:', fs.readdirSync(distPath));
}

// Middleware
app.use(express.json({ limit: '50mb' }));

// Health check - FIRST route
app.get('/health', (req, res) => res.status(200).send('OK'));

// API endpoint to get available shells
app.get('/api/terminal/shells', (req, res) => {
  const platform = os.platform();
  const shells = [];
  
  if (platform === 'linux' || platform === 'darwin') {
    shells.push(
      { id: 'sh', name: 'Shell', available: true },
      { id: 'bash', name: 'Bash', available: fs.existsSync('/bin/bash') },
      { id: 'zsh', name: 'Zsh', available: fs.existsSync('/bin/zsh') }
    );
  } else {
    shells.push(
      { id: 'powershell', name: 'PowerShell', available: true },
      { id: 'cmd', name: 'Command Prompt', available: true }
    );
  }
  
  res.json({ platform, shells, ptyAvailable: !!pty });
});

// Block dev files
app.use((req, res, next) => {
  const blocked = ['/index.tsx', '/index.ts', '/src/', '/components/', '/services/'];
  if (blocked.some(b => req.path.startsWith(b))) {
    return res.status(404).send('Not found');
  }
  next();
});

// Serve static files
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
}

// SPA fallback
app.get('/{*path}', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Application not built');
  }
});

// Socket.io terminal handling
io.on('connection', (socket) => {
  console.log('[Terminal] Client connected:', socket.id);
  
  let ptyProcess = null;
  
  if (pty) {
    try {
      // Get shell based on platform
      const shell = process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/sh');
      const shellArgs = process.platform === 'win32' ? [] : ['--login'];
      
      ptyProcess = pty.spawn(shell, shellArgs, {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || '/tmp',
        env: { ...process.env, TERM: 'xterm-256color' }
      });
      
      console.log('[Terminal] PTY spawned for:', socket.id);
      
      ptyProcess.onData((data) => {
        socket.emit('output', data);
      });
      
      ptyProcess.onExit(({ exitCode, signal }) => {
        console.log('[Terminal] Process exited:', exitCode, signal);
        socket.emit('exit', { exitCode, signal });
      });
      
    } catch (err) {
      console.error('[Terminal] Failed to spawn PTY:', err.message);
      socket.emit('output', '\r\nTerminal unavailable in this environment.\r\n');
    }
  } else {
    socket.emit('output', '\r\nBrowser terminal mode - real shell not available.\r\n');
  }
  
  socket.on('input', (data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });
  
  socket.on('resize', ({ cols, rows }) => {
    if (ptyProcess) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (e) {
        // Ignore resize errors
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('[Terminal] Client disconnected:', socket.id);
    if (ptyProcess) {
      try {
        ptyProcess.kill();
      } catch (e) {
        // Ignore
      }
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server error');
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sai Backend] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[Sai Backend] Terminal support: ${pty ? 'ENABLED' : 'BROWSER ONLY'}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
