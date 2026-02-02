
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { 
    Database, 
    Table, 
    Play, 
    RefreshCw, 
    Plus, 
    Sparkles,
    Code,
    X,
    CheckCircle,
    XCircle,
    Loader2,
    Link,
    Unlink,
    Download,
    Eye,
    EyeOff,
    Columns,
    Terminal
} from 'lucide-react';
import aiService from '../services/geminiService';

interface DatabasePaneProps {
    onCollapse: () => void;
    activeModelId: string;
    onRunInTerminal?: (cmd: string) => void;
}

interface DBColumn {
    name: string;
    type: string;
    nullable: boolean;
}

interface Connection {
    id: string;
    name: string;
    type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
    connected: boolean;
    tables?: string[];
}

interface ConnectionConfig {
    type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
    name: string;
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
    connectionString: string;
    filePath: string;
}

const DB_TYPES = [
    { value: 'postgres', label: 'PostgreSQL', icon: '🐘', port: '5432', color: 'from-blue-600 to-cyan-600' },
    { value: 'mysql', label: 'MySQL', icon: '🐬', port: '3306', color: 'from-orange-600 to-amber-600' },
    { value: 'sqlite', label: 'SQLite', icon: '📦', port: '', color: 'from-emerald-600 to-green-600' },
    { value: 'mongodb', label: 'MongoDB', icon: '🍃', port: '27017', color: 'from-green-600 to-lime-600' },
];

const DatabasePane: React.FC<DatabasePaneProps> = ({ onCollapse, activeModelId, onRunInTerminal }) => {
    // State
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activeConnectionId, setActiveConnectionId] = useState<string>('');
    const [activeTableName, setActiveTableName] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'data' | 'sql' | 'schema'>('data');
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    
    // Query state
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM ');
    const [queryResult, setQueryResult] = useState<{ rows: any[]; columns?: string[]; error?: string } | null>(null);
    const [isQuerying, setIsQuerying] = useState(false);
    
    // Table data state
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableColumns, setTableColumns] = useState<DBColumn[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    // Connection form state
    const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
        type: 'postgres',
        name: '',
        host: 'localhost',
        port: '5432',
        database: '',
        user: '',
        password: '',
        connectionString: '',
        filePath: ''
    });
    const [useConnectionString, setUseConnectionString] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // AI generation state
    const [isGenerating, setIsGenerating] = useState(false);

    const activeConnection = connections.find(c => c.id === activeConnectionId);

    // Fetch connections on mount
    useEffect(() => {
        fetchConnections();
    }, []);

    // Fetch table data when table changes
    useEffect(() => {
        if (activeConnectionId && activeTableName && activeTab === 'data') {
            fetchTableData();
        }
    }, [activeConnectionId, activeTableName, activeTab]);

    // Fetch table schema when tab changes
    useEffect(() => {
        if (activeConnectionId && activeTableName && activeTab === 'schema') {
            fetchTableSchema();
        }
    }, [activeConnectionId, activeTableName, activeTab]);

    const fetchConnections = async () => {
        try {
            const res = await fetch('/api/db/connections');
            const data = await res.json();
            setConnections(data);
            if (data.length > 0 && !activeConnectionId) {
                setActiveConnectionId(data[0].id);
                fetchTables(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        }
    };

    const fetchTables = async (connectionId: string) => {
        try {
            const res = await fetch(`/api/db/tables?connectionId=${connectionId}`);
            const data = await res.json();
            if (data.success && data.tables) {
                setConnections(prev => prev.map(c => 
                    c.id === connectionId ? { ...c, tables: data.tables } : c
                ));
                if (data.tables.length > 0) {
                    setActiveTableName(data.tables[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        }
    };

    const fetchTableData = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch('/api/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: activeConnectionId,
                    query: activeConnection?.type === 'mongodb' 
                        ? `db.${activeTableName}.find().limit(50).toArray()`
                        : `SELECT * FROM ${activeTableName} LIMIT 50;`
                })
            });
            const data = await res.json();
            if (data.success) {
                setTableData(data.rows || []);
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.error('Failed to fetch table data:', error);
            setTableData([]);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchTableSchema = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch(`/api/db/schema?connectionId=${activeConnectionId}&table=${activeTableName}`);
            const data = await res.json();
            if (data.success) {
                setTableColumns(data.columns || []);
            }
        } catch (error) {
            console.error('Failed to fetch schema:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await fetch('/api/db/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connectionConfig)
            });
            const data = await res.json();
            setTestResult({ success: data.success, message: data.message || data.error });
        } catch (error: any) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setIsTesting(false);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const res = await fetch('/api/db/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...connectionConfig,
                    name: connectionConfig.name || `${connectionConfig.type}://${connectionConfig.host || connectionConfig.filePath}`
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchConnections();
                setActiveConnectionId(data.connectionId);
                fetchTables(data.connectionId);
                setShowConnectionModal(false);
                resetConnectionForm();
            }
        } catch (error) {
            console.error('Connection failed:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        try {
            await fetch('/api/db/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId })
            });
            setConnections(prev => prev.filter(c => c.id !== connectionId));
            if (activeConnectionId === connectionId) {
                setActiveConnectionId('');
                setActiveTableName('');
            }
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    const handleRunQuery = async () => {
        if (!sqlQuery.trim() || !activeConnectionId) return;
        
        setIsQuerying(true);
        setQueryResult(null);
        
        try {
            const res = await fetch('/api/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: activeConnectionId,
                    query: sqlQuery
                })
            });
            const data = await res.json();
            
            if (data.success) {
                setQueryResult({ rows: data.rows || [], columns: data.columns });
            } else {
                setQueryResult({ rows: [], error: data.error });
            }
        } catch (error: any) {
            setQueryResult({ rows: [], error: error.message });
        } finally {
            setIsQuerying(false);
        }
    };

    const handleGenerateSeedData = async () => {
        if (!activeTableName || tableColumns.length === 0) return;
        setIsGenerating(true);
        try {
            const columnInfo = tableColumns.map(c => `${c.name} (${c.type})`).join(', ');
            const prompt = `Generate 5 realistic INSERT statements for a ${activeConnection?.type} table named "${activeTableName}" with columns: ${columnInfo}. 
            Return ONLY valid SQL INSERT statements, one per line. No markdown.`;
            
            const response = await aiService.getChatResponse({ prompt, modelId: activeModelId });
            const statements = (response.text || '').replace(/```sql|```/g, '').trim();
            
            // Execute the INSERT statements
            for (const stmt of statements.split('\n').filter(s => s.trim().startsWith('INSERT'))) {
                await fetch('/api/db/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        connectionId: activeConnectionId,
                        query: stmt
                    })
                });
            }
            
            // Refresh table data
            fetchTableData();
        } catch (error) {
            console.error("Failed to generate seed data", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQuery = async () => {
        const tables = activeConnection?.tables?.join(', ') || activeTableName;
        const prompt = `Write a SQL query for ${activeConnection?.type} to: [describe what you want]. Available tables: ${tables}`;
        setSqlQuery(prompt);
    };

    const resetConnectionForm = () => {
        setConnectionConfig({
            type: 'postgres',
            name: '',
            host: 'localhost',
            port: '5432',
            database: '',
            user: '',
            password: '',
            connectionString: '',
            filePath: ''
        });
        setTestResult(null);
        setUseConnectionString(false);
    };

    const exportAsCSV = () => {
        if (tableData.length === 0) return;
        
        const headers = Object.keys(tableData[0] || {}).join(',');
        const rows = tableData.map(row => 
            Object.values(row).map(v => `"${v}"`).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTableName}.csv`;
        a.click();
    };

    const selectedDbType = DB_TYPES.find(t => t.value === connectionConfig.type);

    return (
        <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
            {/* Header */}
            <div className="flex justify-between items-center p-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Database Manager</h2>
                    {connections.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                            {connections.length} connected
                        </span>
                    )}
                </div>
                <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    {ICONS.COLLAPSE_LEFT}
                </button>
            </div>

            {/* Connection Selector */}
            <div className="px-2 mb-2 flex gap-2">
                <div className="relative flex-1">
                    <select 
                        value={activeConnectionId}
                        onChange={(e) => {
                            setActiveConnectionId(e.target.value);
                            fetchTables(e.target.value);
                        }}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] appearance-none"
                    >
                        <option value="">Select connection...</option>
                        {connections.map(c => (
                            <option key={c.id} value={c.id}>
                                {DB_TYPES.find(t => t.value === c.type)?.icon} {c.name}
                            </option>
                        ))}
                    </select>
                    <Database size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button 
                    onClick={() => setShowConnectionModal(true)}
                    className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all"
                    title="New Connection"
                >
                    <Plus size={16} />
                </button>
                {activeConnectionId && (
                    <button 
                        onClick={() => handleDisconnect(activeConnectionId)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Disconnect"
                    >
                        <Unlink size={16} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeConnection ? (
                    <>
                        {/* Table List & Tabs */}
                        <div className="px-2 pb-2 border-b border-[var(--color-border)]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">
                                    {activeConnection.type === 'mongodb' ? 'Collections' : 'Tables'}
                                </span>
                                <button 
                                    onClick={() => fetchTables(activeConnectionId)}
                                    className="p-1 text-gray-500 hover:text-white rounded"
                                    title="Refresh"
                                >
                                    <RefreshCw size={12} />
                                </button>
                            </div>
                            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                {activeConnection.tables?.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setActiveTableName(t); setActiveTab('data'); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                                            activeTableName === t 
                                                ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Table size={12} /> {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        {activeTableName && (
                            <div className="flex items-center gap-1 px-2 py-2 border-b border-[var(--color-border)]">
                                {['data', 'schema', 'sql'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === tab 
                                                ? 'bg-white/10 text-white' 
                                                : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {tab === 'data' && <Eye size={12} className="inline mr-1.5" />}
                                        {tab === 'schema' && <Columns size={12} className="inline mr-1.5" />}
                                        {tab === 'sql' && <Code size={12} className="inline mr-1.5" />}
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Panel Content */}
                        <div className="flex-1 bg-[var(--color-background)] p-3 overflow-hidden flex flex-col">
                            {/* Data Tab */}
                            {activeTab === 'data' && activeTableName ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {isLoadingData ? 'Loading...' : `${tableData.length} rows`}
                                            </span>
                                            <button 
                                                onClick={fetchTableData}
                                                className="p-1 hover:bg-white/5 rounded text-gray-400"
                                            >
                                                <RefreshCw size={12} className={isLoadingData ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={exportAsCSV}
                                                disabled={tableData.length === 0}
                                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded disabled:opacity-50"
                                            >
                                                <Download size={12} /> CSV
                                            </button>
                                            <button 
                                                onClick={handleGenerateSeedData}
                                                disabled={isGenerating || tableColumns.length === 0}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                {isGenerating ? 'Generating...' : 'AI Seed Data'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-auto border border-[var(--color-border)] rounded-lg">
                                        {isLoadingData ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="animate-spin text-cyan-400" size={24} />
                                            </div>
                                        ) : tableData.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                                <Table size={32} className="mb-2 opacity-50" />
                                                <span className="text-sm">No data in table</span>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-[var(--color-background-secondary)] sticky top-0 z-10">
                                                    <tr>
                                                        {Array.isArray(tableData[0]) ? (
                                                            tableData[0].map((_, idx) => (
                                                                <th key={idx} className="p-2 font-semibold text-gray-300 border-b border-[var(--color-border)] whitespace-nowrap">
                                                                    col_{idx}
                                                                </th>
                                                            ))
                                                        ) : (
                                                            Object.keys(tableData[0] || {}).map(col => (
                                                                <th key={col} className="p-2 font-semibold text-gray-300 border-b border-[var(--color-border)] whitespace-nowrap">
                                                                    {col}
                                                                </th>
                                                            ))
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--color-border)]">
                                                    {tableData.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-white/[0.02] group">
                                                            {Array.isArray(row) ? (
                                                                row.map((val, colIdx) => (
                                                                    <td key={colIdx} className="p-2 text-gray-400 whitespace-nowrap max-w-[200px] truncate">
                                                                        {val?.toString() || <span className="text-gray-600 italic">null</span>}
                                                                    </td>
                                                                ))
                                                            ) : (
                                                                Object.values(row).map((val: any, colIdx) => (
                                                                    <td key={colIdx} className="p-2 text-gray-400 whitespace-nowrap max-w-[200px] truncate">
                                                                        {val?.toString() || <span className="text-gray-600 italic">null</span>}
                                                                    </td>
                                                                ))
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            ) : activeTab === 'schema' && activeTableName ? (
                                /* Schema Tab */
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-gray-500">
                                            {tableColumns.length} columns
                                        </span>
                                        <button 
                                            onClick={fetchTableSchema}
                                            className="p-1 hover:bg-white/5 rounded text-gray-400"
                                        >
                                            <RefreshCw size={12} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-auto">
                                        {isLoadingData ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="animate-spin text-cyan-400" size={24} />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {tableColumns.map((col, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center text-cyan-400">
                                                            <Columns size={14} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-white">{col.name}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase">{col.type}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {col.nullable && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                                                                    nullable
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : activeTab === 'sql' ? (
                                /* SQL Console Tab */
                                <div className="flex flex-col h-full gap-3">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Query Editor</label>
                                            <button
                                                onClick={handleGenerateQuery}
                                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-purple-400 hover:bg-purple-500/10 rounded"
                                            >
                                                <Sparkles size={10} /> AI Generate
                                            </button>
                                        </div>
                                        <textarea 
                                            value={sqlQuery}
                                            onChange={e => setSqlQuery(e.target.value)}
                                            className="flex-1 bg-[#0d0d0d] border border-[var(--color-border)] rounded-lg p-3 font-mono text-sm text-green-400 focus:outline-none focus:border-cyan-500/50 resize-none"
                                            placeholder={activeConnection?.type === 'mongodb' ? 'db.collection.find({})' : 'SELECT * FROM ...'}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                    handleRunQuery();
                                                }
                                            }}
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-600">⌘ + Enter to run</span>
                                            <button 
                                                onClick={handleRunQuery}
                                                disabled={isQuerying || !sqlQuery.trim()}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-lg shadow-lg disabled:opacity-50"
                                            >
                                                {isQuerying ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                                                Run Query
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1/2 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Results</label>
                                            {queryResult?.rows && queryResult.rows.length > 0 && (
                                                <span className="text-[10px] text-gray-500">{queryResult.rows.length} row(s)</span>
                                            )}
                                        </div>
                                        <div className="flex-1 bg-[#0d0d0d] border border-[var(--color-border)] rounded-lg p-2 overflow-auto font-mono text-xs">
                                            {queryResult ? (
                                                queryResult.error ? (
                                                    <div className="text-red-400 flex items-start gap-2">
                                                        <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                        <pre className="whitespace-pre-wrap">{queryResult.error}</pre>
                                                    </div>
                                                ) : queryResult.rows.length === 0 ? (
                                                    <div className="text-emerald-400 flex items-center gap-2">
                                                        <CheckCircle size={14} />
                                                        Query executed successfully (0 rows)
                                                    </div>
                                                ) : (
                                                    <pre className="text-gray-300 whitespace-pre-wrap">
                                                        {JSON.stringify(queryResult.rows, null, 2)}
                                                    </pre>
                                                )
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-gray-600 italic">
                                                    Run a query to see results
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <Table size={32} className="mb-2 opacity-50" />
                                    <span className="text-sm">Select a table to view data</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-4 text-cyan-400">
                            <Database size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Connect to Database</h3>
                        <p className="text-sm text-gray-400 mb-6 max-w-xs">
                            Connect to PostgreSQL, MySQL, SQLite, or MongoDB to explore tables, run queries, and manage data.
                        </p>
                        <button 
                            onClick={() => setShowConnectionModal(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
                        >
                            <Plus size={14} className="inline mr-2" />
                            New Connection
                        </button>
                        
                        {/* CLI Hint */}
                        <div className="mt-8 p-4 bg-white/[0.02] rounded-xl border border-white/5 max-w-sm">
                            <div className="text-[10px] uppercase text-gray-600 font-semibold mb-2">Prerequisites</div>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>• PostgreSQL: <code className="text-cyan-400">psql</code> client</p>
                                <p>• MySQL: <code className="text-cyan-400">mysql</code> client</p>
                                <p>• SQLite: <code className="text-cyan-400">sqlite3</code></p>
                                <p>• MongoDB: <code className="text-cyan-400">mongosh</code></p>
                            </div>
                            {onRunInTerminal && (
                                <button
                                    onClick={() => onRunInTerminal('which psql mysql sqlite3 mongosh 2>/dev/null || echo "Install missing clients"')}
                                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg transition-all"
                                >
                                    <Terminal size={12} /> Check Installed Clients
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Connection Modal */}
            {showConnectionModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setShowConnectionModal(false); resetConnectionForm(); }} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[85vh] overflow-y-auto bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl z-50">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-[#12141a] px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedDbType?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center text-xl`}>
                                    {selectedDbType?.icon || '🗄️'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">New Connection</h3>
                                    <p className="text-xs text-gray-500">Connect to a database</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowConnectionModal(false); resetConnectionForm(); }}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Database Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Database Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {DB_TYPES.map(db => (
                                        <button
                                            key={db.value}
                                            onClick={() => setConnectionConfig(prev => ({ 
                                                ...prev, 
                                                type: db.value as any,
                                                port: db.port
                                            }))}
                                            className={`p-3 rounded-xl border transition-all ${
                                                connectionConfig.type === db.value
                                                    ? `bg-gradient-to-br ${db.color} border-transparent text-white`
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{db.icon}</div>
                                            <div className="text-[10px] font-semibold">{db.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Connection Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Connection Name</label>
                                <input
                                    type="text"
                                    value={connectionConfig.name}
                                    onChange={e => setConnectionConfig(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="My Database"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>

                            {/* SQLite: File Path */}
                            {connectionConfig.type === 'sqlite' ? (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Database File Path</label>
                                    <input
                                        type="text"
                                        value={connectionConfig.filePath}
                                        onChange={e => setConnectionConfig(prev => ({ ...prev, filePath: e.target.value }))}
                                        placeholder="/path/to/database.db"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Connection String Toggle */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Connection Method</label>
                                        <button
                                            onClick={() => setUseConnectionString(!useConnectionString)}
                                            className="text-xs text-cyan-400 hover:text-cyan-300"
                                        >
                                            {useConnectionString ? 'Use Form' : 'Use Connection String'}
                                        </button>
                                    </div>

                                    {useConnectionString ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={connectionConfig.connectionString}
                                                onChange={e => setConnectionConfig(prev => ({ ...prev, connectionString: e.target.value }))}
                                                placeholder={
                                                    connectionConfig.type === 'postgres' 
                                                        ? 'postgresql://user:password@host:5432/database'
                                                        : connectionConfig.type === 'mongodb'
                                                        ? 'mongodb://user:password@host:27017/database'
                                                        : 'mysql://user:password@host:3306/database'
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Host & Port */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Host</label>
                                                    <input
                                                        type="text"
                                                        value={connectionConfig.host}
                                                        onChange={e => setConnectionConfig(prev => ({ ...prev, host: e.target.value }))}
                                                        placeholder="localhost"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Port</label>
                                                    <input
                                                        type="text"
                                                        value={connectionConfig.port}
                                                        onChange={e => setConnectionConfig(prev => ({ ...prev, port: e.target.value }))}
                                                        placeholder="5432"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Database */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Database</label>
                                                <input
                                                    type="text"
                                                    value={connectionConfig.database}
                                                    onChange={e => setConnectionConfig(prev => ({ ...prev, database: e.target.value }))}
                                                    placeholder="mydb"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                />
                                            </div>

                                            {/* Username */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Username</label>
                                                <input
                                                    type="text"
                                                    value={connectionConfig.user}
                                                    onChange={e => setConnectionConfig(prev => ({ ...prev, user: e.target.value }))}
                                                    placeholder="postgres"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={connectionConfig.password}
                                                        onChange={e => setConnectionConfig(prev => ({ ...prev, password: e.target.value }))}
                                                        placeholder="••••••••"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                    />
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Test Result */}
                            {testResult && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                                    testResult.success 
                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                    {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    <span className="text-sm">{testResult.message}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                                >
                                    {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                                    Test Connection
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-lg shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DatabasePane;
