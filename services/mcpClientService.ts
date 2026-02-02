import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { MCPServer } from '../types';

/**
 * Real MCP Client Service using @modelcontextprotocol/sdk
 * Connects to the Node.js backend bridge via SSE.
 */

export interface Tool {
    name: string;
    description?: string;
    inputSchema: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
    };
}

class MCPClientService {
    private clients = new Map<string, Client>();

    async getAvailableServers(): Promise<MCPServer[]> {
        try {
            const res = await fetch('/api/mcp/available');
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            // Silently return empty list if backend bridge is missing or errors
            console.warn("[Sai MCP] Bridge unavailable. Fallback to empty server list.");
            return [];
        }
    }

    async connect(serverId: string, config?: Record<string, any>): Promise<boolean> {
        if (this.clients.has(serverId)) return true;

        try {
            const sseUrl = new URL(`${window.location.origin}/api/mcp/sse`);
            sseUrl.searchParams.append('serverId', serverId);
            
            const transport = new SSEClientTransport(sseUrl);

            const client = new Client(
                { name: "sai-ide-client", version: "1.0.0" },
                { capabilities: { tools: {}, resources: {} } }
            );

            await client.connect(transport);
            this.clients.set(serverId, client);
            
            console.log(`[Sai MCP] Successfully connected to real server: ${serverId}`);
            return true;
        } catch (error) {
            console.error(`[Sai MCP] Failed to connect to ${serverId}:`, error);
            return false;
        }
    }

    async disconnect(serverId: string): Promise<boolean> {
        const client = this.clients.get(serverId);
        if (client) {
            try {
                await fetch('/api/mcp/disconnect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serverId })
                });
            } catch (e) {}
            this.clients.delete(serverId);
            return true;
        }
        return false;
    }

    async listTools(serverId: string): Promise<Tool[]> {
        const client = this.clients.get(serverId);
        if (!client) return [];

        try {
            const response = await client.listTools();
            return response.tools.map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema as any
            }));
        } catch (error) {
            console.error(`[Sai MCP] Error listing tools for ${serverId}:`, error);
            return [];
        }
    }

    async callTool(serverId: string, toolName: string, args: Record<string, any>): Promise<any> {
        const client = this.clients.get(serverId);
        if (!client) throw new Error(`Server ${serverId} not connected`);

        try {
            return await client.callTool({
                name: toolName,
                arguments: args
            });
        } catch (error) {
            console.error(`[Sai MCP] Tool execution error:`, error);
            throw error;
        }
    }

    async readResource(serverId: string, uri: string): Promise<any> {
        const client = this.clients.get(serverId);
        if (!client) throw new Error(`Server ${serverId} not connected`);

        try {
            return await client.readResource({ uri });
        } catch (error) {
            console.error(`[Sai MCP] Resource read error:`, error);
            throw error;
        }
    }
}

export default new MCPClientService();