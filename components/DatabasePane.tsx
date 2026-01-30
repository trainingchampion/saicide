
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { 
    Database, 
    Table, 
    Play, 
    RefreshCw, 
    Plus, 
    Server, 
    Search,
    Sparkles,
    Trash2,
    Code,
    Filter
} from 'lucide-react';
import aiService from '../services/geminiService';

interface DatabasePaneProps {
  onCollapse: () => void;
  activeModelId: string;
}

interface DBTable {
    name: string;
    columns: string[];
    data: any[];
}

interface Connection {
    id: string;
    name: string;
    type: 'postgres' | 'mysql' | 'mongodb' | 'redis';
    status: 'connected' | 'disconnected';
    tables: DBTable[];
}

const INITIAL_MOCK_DATA: DBTable[] = [
    {
        name: 'users',
        columns: ['id', 'name', 'email', 'role', 'created_at'],
        data: [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', created_at: '2023-01-15' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', created_at: '2023-02-20' },
            { id: 3, name: 'Charlie Kim', email: 'charlie@example.com', role: 'user', created_at: '2023-03-10' },
        ]
    },
    {
        name: 'products',
        columns: ['id', 'title', 'price', 'stock', 'category'],
        data: [
            { id: 101, title: 'Wireless Headphones', price: 99.99, stock: 45, category: 'Electronics' },
            { id: 102, title: 'Ergonomic Chair', price: 199.50, stock: 12, category: 'Furniture' },
        ]
    }
];

const DatabasePane: React.FC<DatabasePaneProps> = ({ onCollapse, activeModelId }) => {
    const [connections, setConnections] = useState<Connection[]>([
        { id: '1', name: 'Production DB (AWS RDS)', type: 'postgres', status: 'connected', tables: INITIAL_MOCK_DATA },
        { id: '2', name: 'Cache (Redis)', type: 'redis', status: 'disconnected', tables: [] }
    ]);
    const [activeConnectionId, setActiveConnectionId] = useState<string>('1');
    const [activeTableName, setActiveTableName] = useState<string>('users');
    const [activeTab, setActiveTab] = useState<'data' | 'sql'>('data');
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users WHERE role = "admin";');
    const [sqlResult, setSqlResult] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const activeConnection = connections.find(c => c.id === activeConnectionId);
    const activeTable = activeConnection?.tables.find(t => t.name === activeTableName);

    const handleRunSQL = () => {
        // Mock SQL runner - simple keyword matching for demo
        if (!activeConnection || !sqlQuery) return;
        
        let result = [];
        if (sqlQuery.toLowerCase().includes('users')) {
            const usersTable = activeConnection.tables.find(t => t.name === 'users');
            if (usersTable) {
                if (sqlQuery.includes('admin')) {
                    result = usersTable.data.filter(u => u.role === 'admin');
                } else {
                    result = usersTable.data;
                }
            }
        } else if (sqlQuery.toLowerCase().includes('products')) {
             const prodTable = activeConnection.tables.find(t => t.name === 'products');
             if (prodTable) result = prodTable.data;
        } else {
            result = [{ error: "Table not found or syntax error in mock runner." }];
        }
        setSqlResult(result);
    };

    const handleGenerateSeedData = async () => {
        if (!activeTable) return;
        setIsGenerating(true);
        try {
            const prompt = `Generate 5 realistic records for a database table named "${activeTable.name}" with columns: ${activeTable.columns.join(', ')}. 
            Return ONLY a valid JSON array of objects. No markdown.`;
            
            const response = await aiService.getChatResponse({ prompt, modelId: activeModelId });
            const jsonStr = response.text.replace(/```json|```/g, '').trim();
            const newData = JSON.parse(jsonStr);
            
            if (Array.isArray(newData)) {
                // Update table data
                setConnections(prev => prev.map(conn => {
                    if (conn.id === activeConnectionId) {
                        return {
                            ...conn,
                            tables: conn.tables.map(tbl => {
                                if (tbl.name === activeTableName) {
                                    // Assign new IDs roughly
                                    const maxId = Math.max(...tbl.data.map((d: any) => d.id || 0), 0);
                                    const processedNewData = newData.map((d, i) => ({ ...d, id: maxId + i + 1 }));
                                    return { ...tbl, data: [...tbl.data, ...processedNewData] };
                                }
                                return tbl;
                            })
                        };
                    }
                    return conn;
                }));
            }
        } catch (error) {
            console.error("Failed to generate seed data", error);
            alert("Failed to generate data. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
            <div className="flex justify-between items-center p-2 flex-shrink-0">
                <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Database Manager</h2>
                <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    {ICONS.COLLAPSE_LEFT}
                </button>
            </div>

            {/* Connection Selector */}
            <div className="px-2 mb-2">
                <div className="relative">
                    <select 
                        value={activeConnectionId}
                        onChange={(e) => setActiveConnectionId(e.target.value)}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] appearance-none"
                    >
                        {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Server size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeConnection?.status === 'connected' ? (
                    <>
                        {/* Table List & Tabs */}
                        <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--color-border)]">
                            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                {activeConnection.tables.map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => { setActiveTableName(t.name); setActiveTab('data'); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition-colors ${activeTableName === t.name && activeTab === 'data' ? 'bg-[var(--color-background)] text-white border-t border-x border-[var(--color-border)]' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        <Table size={12} /> {t.name}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setActiveTab('sql')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition-colors ${activeTab === 'sql' ? 'bg-[var(--color-background)] text-white border-t border-x border-[var(--color-border)]' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Code size={12} /> SQL Console
                                </button>
                            </div>
                            <button onClick={() => alert('Add new table')} className="p-1 hover:bg-[var(--color-background-tertiary)] rounded text-gray-400"><Plus size={14} /></button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 bg-[var(--color-background)] p-3 overflow-hidden flex flex-col">
                            {activeTab === 'data' && activeTable ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{activeTable.data.length} records</span>
                                            <button className="p-1 hover:bg-[var(--color-background-tertiary)] rounded text-gray-400"><Filter size={12} /></button>
                                            <button className="p-1 hover:bg-[var(--color-background-tertiary)] rounded text-gray-400"><RefreshCw size={12} /></button>
                                        </div>
                                        <button 
                                            onClick={handleGenerateSeedData}
                                            disabled={isGenerating}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-md transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {isGenerating ? 'Generating...' : 'Seed Data'}
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-auto border border-[var(--color-border)] rounded-md">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-[var(--color-background-secondary)] sticky top-0 z-10">
                                                <tr>
                                                    {activeTable.columns.map(col => (
                                                        <th key={col} className="p-2 font-semibold text-gray-300 border-b border-[var(--color-border)] whitespace-nowrap">
                                                            {col}
                                                        </th>
                                                    ))}
                                                    <th className="p-2 border-b border-[var(--color-border)] w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--color-border)]">
                                                {activeTable.data.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-[var(--color-background-tertiary)] group">
                                                        {activeTable.columns.map(col => (
                                                            <td key={col} className="p-2 text-gray-400 whitespace-nowrap max-w-[150px] truncate">
                                                                {row[col]}
                                                            </td>
                                                        ))}
                                                        <td className="p-2 text-right">
                                                            <button className="text-gray-600 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : activeTab === 'sql' ? (
                                <div className="flex flex-col h-full gap-3">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Query Editor</label>
                                        <textarea 
                                            value={sqlQuery}
                                            onChange={e => setSqlQuery(e.target.value)}
                                            className="flex-1 bg-[#1e1e1e] border border-[var(--color-border)] rounded-md p-3 font-mono text-sm text-green-400 focus:outline-none focus:border-[var(--color-accent)] resize-none"
                                            placeholder="SELECT * FROM..."
                                        />
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={handleRunSQL}
                                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-md shadow-lg"
                                            >
                                                <Play size={12} fill="currentColor" /> Run Query
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1/2 flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Results</label>
                                        <div className="flex-1 bg-[#1e1e1e] border border-[var(--color-border)] rounded-md p-2 overflow-auto font-mono text-xs">
                                            {sqlResult ? (
                                                <pre className="text-gray-300">
                                                    {JSON.stringify(sqlResult, null, 2)}
                                                </pre>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-gray-600 italic">
                                                    Run a query to see results
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    Select a table to view data
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="w-16 h-16 bg-[var(--color-background-tertiary)] rounded-full flex items-center justify-center mb-4 text-gray-500">
                            <Database size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Connect to Database</h3>
                        <p className="text-sm text-gray-400 mb-6">Connect to a remote database to explore tables, run queries, and manage data.</p>
                        <button className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold rounded-md">
                            New Connection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabasePane;
