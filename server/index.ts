
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os';
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
    console.warn("node-pty not found or failed to load. Terminal features will be simulated.");
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

// Shell configuration
const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');

io.on('connection', (socket) => {
  console.log('[Terminal] Client connected to socket session');
  
  if (pty) {
      try {
        const ptyProcess = pty.spawn(shell, [], { 
            name: 'xterm-256color', 
            cols: 80, 
            rows: 24, 
            cwd: os.homedir(), 
            env: {
                ...process.env,
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            }
        });
        
        ptyProcess.onData((data: string) => socket.emit('output', data));
        
        socket.on('input', (data: string) => {
            if (ptyProcess) ptyProcess.write(data);
        });

        socket.on('resize', ({ cols, rows }: { cols: number, rows: number }) => {
            if (ptyProcess) ptyProcess.resize(cols, rows);
        });
        
        socket.on('disconnect', () => {
            console.log('[Terminal] Session disconnected');
            try {
                ptyProcess.kill();
            } catch (e) {
                // Ignore kill errors
            }
        });

        // Initial welcome message from backend
        socket.emit('output', '\x1b[1;32m[Sai Kernel] Backend session initialized.\x1b[0m\r\n');
      } catch (err) {
        console.error('[Terminal] PTY Spawn Error:', err);
        socket.emit('output', '\r\n\x1b[31mError: Failed to initialize terminal session on backend.\x1b[0m\r\n');
      }
  } else {
      socket.emit('output', '\r\n\x1b[33m[Warning] Server running without node-pty. Using Frontend Simulation Mode.\x1b[0m\r\n');
  }
});

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
