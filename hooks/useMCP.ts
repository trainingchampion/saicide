
import { useState, useEffect, useCallback } from 'react';
import { MCPServer } from '../types';
import mcpClientService, { Tool } from '../services/mcpClientService';

export const useMCP = () => {
    const [servers, setServers] = useState<MCPServer[]>([]);
    const [connections, setConnections] = useState<Record<string, { tools: Tool[], status: 'connected' | 'disconnected' }>>({});
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refreshServers = useCallback(async () => {
        const available = await mcpClientService.getAvailableServers();
        setServers(available);
    }, []);

    // Initial load
    useEffect(() => {
        refreshServers();
    }, [refreshServers]);

    const connectServer = useCallback(async (serverId: string, config?: Record<string, any>) => {
        setIsConnecting(serverId);
        setError(null);
        try {
            const success = await mcpClientService.connect(serverId, config);
            if (success) {
                const tools = await mcpClientService.listTools(serverId);
                
                setServers(prev => prev.map(s => s.id === serverId ? { ...s, status: 'connected' } : s));
                setConnections(prev => ({
                    ...prev,
                    [serverId]: { status: 'connected', tools }
                }));
            } else {
                throw new Error('Connection failed - check backend logs');
            }
        } catch (err: any) {
            setError(err.message);
            setServers(prev => prev.map(s => s.id === serverId ? { ...s, status: 'error' } : s));
        } finally {
            setIsConnecting(null);
        }
    }, []);

    const disconnectServer = useCallback(async (serverId: string) => {
        try {
            await mcpClientService.disconnect(serverId);
            setServers(prev => prev.map(s => s.id === serverId ? { ...s, status: 'disconnected' } : s));
            setConnections(prev => {
                const next = { ...prev };
                delete next[serverId];
                return next;
            });
        } catch (err) {
            console.error(err);
        }
    }, []);

    const callTool = useCallback(async (serverId: string, toolName: string, args: any) => {
        return await mcpClientService.callTool(serverId, toolName, args);
    }, []);

    const readResource = useCallback(async (serverId: string, uri: string) => {
        return await mcpClientService.readResource(serverId, uri);
    }, []);

    return {
        servers,
        connections,
        isConnecting,
        error,
        connectServer,
        disconnectServer,
        callTool,
        readResource,
        refreshServers
    };
};
