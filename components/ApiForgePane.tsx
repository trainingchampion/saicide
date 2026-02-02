
import React, { useState } from 'react';
import { 
    Workflow, 
    Plus, 
    Trash2, 
    Send, 
    Code, 
    Sparkles, 
    RefreshCw, 
    Save, 
    FileJson, 
    Database, 
    X,
    Activity,
    Check,
    Play,
    Terminal,
    Radio,
    Clock
} from 'lucide-react';
import aiService from '../services/geminiService';
import { Panel } from '../types';

// Types for new API Client functionality
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
interface KeyValue {
    key: string;
    value: string;
    enabled: boolean;
}

// Types for original API Forge functionality
interface Endpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    description: string;
    requestSchema?: string;
    responseSchema?: string;
}

interface ApiStudioPaneProps {
  onCollapse: () => void;
  activeModelId: string;
  onSaveFile: (path: string, content: string) => void;
  onRunInTerminal: (command: string) => void;
  onPanelChange: (panel: Panel) => void;
}

const ApiStudioPane: React.FC<ApiStudioPaneProps> = (props) => {
    const [activeStudioTab, setActiveStudioTab] = useState<'client' | 'forge'>('client');

    const ForgeView = () => {
        const { onCollapse, activeModelId, onSaveFile, onRunInTerminal, onPanelChange } = props;
        const [endpoints, setEndpoints] = useState<Endpoint[]>([
            { id: '1', path: '/users', method: 'GET', description: 'Fetch all users' },
            { id: '2', path: '/users', method: 'POST', description: 'Register new user' }
        ]);
        const [isGenerating, setIsGenerating] = useState(false);
        const [generatedCode, setGeneratedCode] = useState<string | null>(null);
        const [targetLang, setTargetLang] = useState('Node.js (Express)');
        const [isSaved, setIsSaved] = useState(false);
    
        const addEndpoint = () => {
            setEndpoints([...endpoints, { id: Date.now().toString(), path: '/', method: 'GET', description: 'New endpoint' }]);
        };
    
        const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
            setEndpoints(endpoints.map(e => e.id === id ? { ...e, ...updates } : e));
        };
    
        const deleteEndpoint = (id: string) => {
            setEndpoints(endpoints.filter(e => e.id !== id));
        };
    
        const handleForge = async () => {
            setIsGenerating(true);
            setGeneratedCode(null);
            setIsSaved(false);
    
            try {
                const prompt = `Act as a senior backend architect. Generate a complete API implementation in ${targetLang} for the following endpoints: ${JSON.stringify(endpoints)}.
                Use best practices for error handling, middleware, and documentation. Return the code in a single markdown code block.`;
                
                const response = await aiService.getChatResponse({ prompt, modelId: activeModelId });
                const text = response.text || '';
                const codeMatch = text.match(/```(?:javascript|typescript|js|ts|go|py|python|rs)?\n([\s\S]*?)```/);
                setGeneratedCode(codeMatch ? codeMatch[1] : text || "Synthesis failed.");
            } catch (error) {
                console.error(error);
                setGeneratedCode("// Synthesis error. Verify API configuration.");
            } finally {
                setIsGenerating(false);
            }
        };
    
        const getFileExtension = () => {
            const lang = targetLang.toLowerCase();
            if (lang.includes('node')) return 'js';
            if (lang.includes('go')) return 'go';
            if (lang.includes('python')) return 'py';
            if (lang.includes('rust')) return 'rs';
            return 'txt';
        };
    
        const handleSave = () => {
            if (!generatedCode) return;
            const ext = getFileExtension();
            const fileName = `ApiImplementation_${Date.now()}.${ext}`;
            onSaveFile(`api/${fileName}`, generatedCode);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        };
    
        const handleRun = () => {
            if (!generatedCode) return;
            
            const ext = getFileExtension();
            const fileName = `api_forge_impl.${ext}`;
            const fullPath = `api/${fileName}`;
            
            onSaveFile(fullPath, generatedCode);
    
            let command = '';
            if (ext === 'js') {
                command = `node ${fullPath}`;
            } else if (ext === 'go') {
                command = `go run ${fullPath}`;
            } else if (ext === 'py') {
                command = `python ${fullPath}`;
            } else if (ext === 'rs') {
                command = `cargo run --manifest-path api/Cargo.toml`;
            }
            
            if (command) {
                onRunInTerminal(command);
                onPanelChange(Panel.TERMINAL);
            }
        };

        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Interface Design</h3>
                        <button onClick={addEndpoint} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-black uppercase">
                            <Plus size={14} /> Add Route
                        </button>
                    </div>

                    <div className="space-y-2">
                        {endpoints.map(ep => (
                            <div key={ep.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 group hover:border-cyan-500/30 transition-all shadow-inner">
                                <div className="flex items-center gap-3">
                                    <select 
                                        value={ep.method}
                                        onChange={(e) => updateEndpoint(ep.id, { method: e.target.value as any })}
                                        className={`bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none ${
                                            ep.method === 'GET' ? 'text-green-400' :
                                            ep.method === 'POST' ? 'text-yellow-400' :
                                            ep.method === 'PUT' ? 'text-blue-400' : 'text-red-400'
                                        }`}
                                    >
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        value={ep.path}
                                        onChange={(e) => updateEndpoint(ep.id, { path: e.target.value })}
                                        className="flex-1 bg-transparent border-b border-white/5 focus:border-cyan-500 outline-none text-xs font-mono text-gray-300"
                                    />
                                    <button onClick={() => deleteEndpoint(ep.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={ep.description}
                                    onChange={(e) => updateEndpoint(ep.id, { description: e.target.value })}
                                    placeholder="Endpoint description..."
                                    className="w-full bg-transparent text-[10px] text-gray-500 italic outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Synthesis Engine</label>
                        <select 
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-300 outline-none"
                        >
                            <option>Node.js (Express)</option>
                            <option>Go (Fiber)</option>
                            <option>Python (FastAPI)</option>
                            <option>Rust (Actix-web)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleForge}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-900/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isGenerating ? 'Forging...' : 'Synthesize API'}
                    </button>
                </section>

                {generatedCode && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                <Code size={12} className="text-cyan-400" /> Source Logic
                            </h3>
                            <div className="flex items-center gap-2">
                                <button onClick={handleSave} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                                    {isSaved ? <Check size={12} /> : <Save size={12} />}
                                    {isSaved ? 'Injected' : 'Save to Workspace'}
                                </button>
                                <button onClick={handleRun} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                    <Play size={12} /> Run in Terminal
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-[#0b0c10] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                             <pre className="p-4 text-[11px] font-mono text-cyan-100/70 overflow-x-auto custom-scrollbar leading-relaxed">
                                <code>{generatedCode}</code>
                             </pre>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const ClientView = () => {
        const [method, setMethod] = useState<HttpMethod>('GET');
        const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
        const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
        const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');
        const [params, setParams] = useState<KeyValue[]>([{ key: '', value: '', enabled: true }]);
        const [headers, setHeaders] = useState<KeyValue[]>([{ key: 'Content-Type', value: 'application/json', enabled: true }, { key: '', value: '', enabled: true }]);
        const [body, setBody] = useState('{\n  \n}');
        const [isLoading, setIsLoading] = useState(false);
        const [response, setResponse] = useState<{ status?: number; statusText?: string; time?: number; size?: string; data?: any; headers?: Record<string, string>; } | null>(null);
        const [requestHistory, setRequestHistory] = useState<{method: HttpMethod; url: string; timestamp: number}[]>([]);
        const [useProxy, setUseProxy] = useState(false);

        const handleKeyValueChange = (list: KeyValue[], setList: React.Dispatch<React.SetStateAction<KeyValue[]>>, index: number, field: 'key' | 'value', newValue: string) => {
            const newList = [...list];
            newList[index][field] = newValue;
            if (index === newList.length - 1 && (newList[index].key || newList[index].value)) {
                newList.push({ key: '', value: '', enabled: true });
            }
            setList(newList);
        };

        const handleSend = async () => {
            if (!url) return;
            setIsLoading(true);
            setResponse(null);
            const startTime = performance.now();
            try {
                const targetUrl = url.startsWith('http') ? url : `https://${url}`;
                const urlObj = new URL(targetUrl);
                params.forEach(p => { if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value); });
                
                const headerObj: Record<string, string> = {};
                headers.forEach(h => { if (h.enabled && h.key) headerObj[h.key] = h.value; });
                
                const options: RequestInit = { method, headers: headerObj };
                if (method !== 'GET' && method !== 'DELETE') options.body = body;
                
                // Use CORS proxy if enabled
                const fetchUrl = useProxy ? `https://api.allorigins.win/raw?url=${encodeURIComponent(urlObj.toString())}` : urlObj.toString();
                
                const res = await fetch(fetchUrl, options);
                const endTime = performance.now();
                
                // Collect response headers
                const responseHeaders: Record<string, string> = {};
                res.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                
                let data;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) data = await res.json();
                else data = await res.text();
                const size = new Blob([typeof data === 'string' ? data : JSON.stringify(data)]).size;
                
                setResponse({ 
                    status: res.status, 
                    statusText: res.statusText, 
                    time: Math.round(endTime - startTime), 
                    size: size > 1024 ? (size / 1024).toFixed(2) + ' KB' : size + ' B', 
                    data,
                    headers: responseHeaders
                });
                
                // Add to history
                setRequestHistory(prev => [
                    { method, url: urlObj.toString(), timestamp: Date.now() },
                    ...prev.slice(0, 9) // Keep last 10
                ]);
            } catch (error: any) {
                const endTime = performance.now();
                setResponse({ 
                    status: 0, 
                    statusText: 'Error', 
                    time: Math.round(endTime - startTime), 
                    size: '0 B', 
                    data: { 
                        error: error.message,
                        hint: error.message.includes('CORS') || error.message.includes('Failed to fetch') 
                            ? 'Try enabling the CORS Proxy option above' 
                            : 'Check the URL and try again'
                    } 
                });
            } finally {
                setIsLoading(false);
            }
        };

        const loadFromHistory = (item: {method: HttpMethod; url: string}) => {
            setMethod(item.method);
            setUrl(item.url);
        };

        return (
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-3 bg-[var(--color-background-secondary)] border-b border-white/5 space-y-2">
                    <div className="flex gap-2">
                        <select value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)} className={`bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-black focus:outline-none ${method === 'GET' ? 'text-green-400' : method === 'POST' ? 'text-yellow-400' : method === 'PUT' ? 'text-blue-400' : method === 'DELETE' ? 'text-red-400' : 'text-purple-400'}`}>
                            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="https://api.example.com/v1" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)] font-mono text-gray-300"/>
                        <button onClick={handleSend} disabled={isLoading || !url} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Send
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-[10px] text-gray-500 cursor-pointer">
                            <input type="checkbox" checked={useProxy} onChange={(e) => setUseProxy(e.target.checked)} className="h-3 w-3 rounded bg-gray-700 border-gray-600 accent-[var(--color-accent)]"/>
                            <span>CORS Proxy</span>
                            <span className="text-[9px] text-gray-600">(for APIs without CORS headers)</span>
                        </label>
                        {requestHistory.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-600">Recent:</span>
                                {requestHistory.slice(0, 3).map((item, i) => (
                                    <button key={i} onClick={() => loadFromHistory(item)} className={`text-[9px] px-2 py-0.5 rounded border border-white/10 hover:border-white/30 transition-all ${item.method === 'GET' ? 'text-green-400' : item.method === 'POST' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                        {item.method} {new URL(item.url).pathname.slice(0, 15)}...
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex px-3 bg-[#0f111a] border-b border-white/5 flex-shrink-0">
                    {['Params', 'Headers', 'Body'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab.toLowerCase() as any)} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.toLowerCase() ? 'border-[var(--color-accent)] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{tab}</button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Key-Value Editor Component */}
                    {(activeTab === 'params' || activeTab === 'headers') && (
                        <div className="space-y-2">
                            { (activeTab === 'params' ? params : headers).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 group">
                                    <input type="checkbox" checked={item.enabled} onChange={() => {
                                        const list = activeTab === 'params' ? params : headers;
                                        const setList = activeTab === 'params' ? setParams : setHeaders;
                                        const newList = [...list];
                                        newList[index].enabled = !newList[index].enabled;
                                        setList(newList);
                                    }} className="h-3.5 w-3.5 rounded bg-gray-700 border-gray-600 accent-[var(--color-accent)]"/>
                                    <input type="text" placeholder="Key" value={item.key} onChange={(e) => handleKeyValueChange((activeTab === 'params' ? params : headers), (activeTab === 'params' ? setParams : setHeaders), index, 'key', e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[var(--color-accent)] outline-none" />
                                    <input type="text" placeholder="Value" value={item.value} onChange={(e) => handleKeyValueChange((activeTab === 'params' ? params : headers), (activeTab === 'params' ? setParams : setHeaders), index, 'value', e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[var(--color-accent)] outline-none" />
                                    <button onClick={() => {
                                        const list = activeTab === 'params' ? params : headers;
                                        const setList = activeTab === 'params' ? setParams : setHeaders;
                                        if (list.length > 1) setList(list.filter((_, i) => i !== index));
                                    }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'body' && <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{\n  "key": "value"\n}' className="w-full h-full bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 focus:border-[var(--color-accent)] outline-none resize-none min-h-[120px]" />}
                </div>

                <div className="h-2/5 border-t border-white/5 flex flex-col min-h-[200px]">
                    <div className="flex justify-between items-center py-2 px-4 border-b border-white/5 bg-[#0f111a]">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Response</h3>
                            {response && (
                                <div className="flex gap-1">
                                    <button onClick={() => setResponseTab('body')} className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${responseTab === 'body' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Body</button>
                                    <button onClick={() => setResponseTab('headers')} className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${responseTab === 'headers' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Headers ({response.headers ? Object.keys(response.headers).length : 0})</button>
                                </div>
                            )}
                        </div>
                        {response && <div className="flex gap-4 text-[9px] font-black uppercase"><span className={`flex items-center gap-1 ${response.status && response.status < 300 ? 'text-emerald-400' : response.status && response.status < 400 ? 'text-yellow-400' : 'text-rose-400'}`}>{response.status} {response.statusText}</span><span className="text-gray-500 flex items-center gap-1"><Clock size={10}/> {response.time}ms</span><span className="text-gray-500 flex items-center gap-1"><Database size={10}/> {response.size}</span></div>}
                    </div>
                    <div className="flex-1 bg-black/20 relative overflow-hidden">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCw className="animate-spin text-emerald-400" size={24} />
                            </div>
                        ) : response ? (
                            responseTab === 'body' ? (
                                <pre className="p-4 text-[11px] font-mono h-full overflow-auto text-emerald-100/80 custom-scrollbar">
                                    {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
                                </pre>
                            ) : (
                                <div className="p-4 h-full overflow-auto custom-scrollbar">
                                    <table className="w-full text-[11px]">
                                        <tbody>
                                            {response.headers && Object.entries(response.headers).map(([key, value]) => (
                                                <tr key={key} className="border-b border-white/5">
                                                    <td className="py-2 pr-4 text-cyan-400 font-semibold whitespace-nowrap">{key}</td>
                                                    <td className="py-2 text-gray-300 font-mono break-all">{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-xs gap-2">
                                <Send size={24} className="opacity-30" />
                                <span>Enter a URL and click Send to make a request</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-[#0b0e14] text-white">
            <div className="p-4 border-b border-white/5 bg-[#0f111a] flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Workflow size={18} className="text-cyan-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">API Studio</h2>
                </div>
                <button onClick={props.onCollapse} className="text-gray-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex bg-black/20 p-1 mx-4 mt-4 rounded-xl border border-white/5 flex-shrink-0">
                <button onClick={() => setActiveStudioTab('client')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeStudioTab === 'client' ? 'bg-white/5 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}>
                    <Radio size={12} /> Client
                </button>
                <button onClick={() => setActiveStudioTab('forge')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeStudioTab === 'forge' ? 'bg-white/5 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}>
                    <Sparkles size={12} /> Forge
                </button>
            </div>
            
            {activeStudioTab === 'client' ? <ClientView /> : <ForgeView />}

        </div>
    );
};

export default ApiStudioPane;
