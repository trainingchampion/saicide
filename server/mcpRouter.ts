import express from 'express';
import { spawn, ChildProcessByStdio } from 'child_process';
import { Readable, Writable } from 'stream';
// Added: Explicitly import process to resolve type issues and provide 'cwd()' method
import process from 'process';

const router = express.Router();

interface MCPSession {
    // Fixed: Renamed 'process' to 'childProcess' to prevent conflict with Node's global process object
    childProcess: ChildProcessByStdio<Writable, Readable, Readable>;
    sseResponse?: express.Response;
}

const activeSessions = new Map<string, MCPSession>();

// Configured servers that can be spawned
const SERVER_CONFIGS: Record<string, { command: string, args: string[] }> = {
    '@modelcontextprotocol/server-filesystem': {
        command: 'npx',
        // Fixed: process.cwd() is now correctly resolved from the imported process module
        args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()]
    },
    '@modelcontextprotocol/server-github': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github']
    },
    '@modelcontextprotocol/server-memory': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory']
    }
};

router.get('/available', (req, res) => {
    res.json(Object.keys(SERVER_CONFIGS).map(id => ({
        id,
        name: id.split('/').pop()?.replace('server-', '') || id,
        status: activeSessions.has(id) ? 'connected' : 'disconnected'
    })));
});

router.get('/sse', (req, res) => {
    const serverId = req.query.serverId as string;
    if (!serverId || !SERVER_CONFIGS[serverId]) {
        return res.status(400).send('Invalid serverId');
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`[MCP Bridge] Initializing SSE session for ${serverId}`);

    let session = activeSessions.get(serverId);

    if (!session) {
        const config = SERVER_CONFIGS[serverId];
        const child = spawn(config.command, config.args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env }
        }) as ChildProcessByStdio<Writable, Readable, Readable>;

        // Fixed: Using renamed property 'childProcess'
        session = { childProcess: child, sseResponse: res };
        activeSessions.set(serverId, session);

        child.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter((l: string) => l.trim());
            lines.forEach((line: string) => {
                res.write(`event: message\ndata: ${line}\n\n`);
            });
        });

        child.stderr.on('data', (data) => {
            console.error(`[MCP Server ${serverId}] STDERR: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`[MCP Bridge] Server ${serverId} exited with code ${code}`);
            activeSessions.delete(serverId);
            res.end();
        });
    } else {
        session.sseResponse = res;
    }

    req.on('close', () => {
        console.log(`[MCP Bridge] SSE connection closed for ${serverId}`);
        if (session) session.sseResponse = undefined;
    });
});

router.post('/message', (req, res) => {
    const serverId = req.query.serverId as string;
    const message = req.body;

    const session = activeSessions.get(serverId);
    if (!session) {
        return res.status(404).send('No active session for this server');
    }

    console.log(`[MCP Bridge] Forwarding message to ${serverId}`);
    // Fixed: Using renamed property 'childProcess'
    session.childProcess.stdin.write(JSON.stringify(message) + '\n');
    res.status(202).send('Accepted');
});

router.post('/disconnect', (req, res) => {
    const serverId = req.body.serverId;
    const session = activeSessions.get(serverId);
    if (session) {
        // Fixed: Using renamed property 'childProcess'
        session.childProcess.kill();
        activeSessions.delete(serverId);
        res.json({ status: 'disconnected' });
    } else {
        res.status(404).json({ error: 'Server not running' });
    }
});

export default router;