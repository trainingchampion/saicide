import React, { useState, useEffect, useRef } from 'react';
import { 
    Globe, 
    RefreshCw, 
    ArrowLeft, 
    ArrowRight, 
    Smartphone, 
    Monitor,
    ExternalLink,
    X,
    FolderOpen,
    Zap,
    AlertCircle,
    Maximize2
} from 'lucide-react';
import { FileNode } from '../types';

interface PreviewPaneProps {
  onCollapse: () => void;
  fileStructure: FileNode;
}

// Helper to flatten the file tree with full paths, ignoring the root container name
const flattenFiles = (node: FileNode, path = ''): Record<string, string> => {
    let files: Record<string, string> = {};
    
    if (node.type === 'file') {
        files[path] = node.content || '';
    } else if (node.children) {
        node.children.forEach(child => {
            const nextPath = path ? `${path}/${child.name}` : child.name;
            Object.assign(files, flattenFiles(child, nextPath));
        });
    }
    return files;
};

const PreviewPane: React.FC<PreviewPaneProps> = ({ onCollapse, fileStructure }) => {
    const [url, setUrl] = useState('http://localhost:3000');
    const [iframeSrc, setIframeSrc] = useState<string>('');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [loading, setLoading] = useState(false);
    const [currentProject, setCurrentProject] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const compileLocalProject = () => {
        const allFiles = flattenFiles(fileStructure);
        const filePaths = Object.keys(allFiles);
        
        let entryPoint = filePaths.find(f => f.endsWith('index.html') && f.split('/').length > 1 && !f.includes('alphabet-explorer'))
            || filePaths.find(f => f.endsWith('index.html'))
            || filePaths.find(f => f.endsWith('.html'));

        if (!entryPoint || !allFiles[entryPoint]) {
            return `data:text/html,<html><body style="background:#080a0f;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:40px;">
                <div style="animation: fadeIn 0.5s ease-out;">
                    <div style="font-size:64px;margin-bottom:24px;">🔭</div>
                    <h2 style="color:#67e8f9;margin-bottom:12px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;font-size:14px;">Runtime Offline</h2>
                    <p style="color:#9ca3af;font-size:13px;max-width:320px;line-height:1.6;margin:0 auto;">Opal synthesis engine is ready, but no entry-point (index.html) was detected in the active workspace.</p>
                </div>
            </body></html>`;
        }

        const basePath = entryPoint.includes('/') ? entryPoint.substring(0, entryPoint.lastIndexOf('/')) : '';
        const projectFolderName = entryPoint.includes('/') ? entryPoint.split('/')[0] : 'root';
        setCurrentProject(projectFolderName);

        let bundledHtml = allFiles[entryPoint];

        const resolveContent = (src: string) => {
            if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) return null;
            const cleanSrc = src.replace(/^\.\//, '').replace(/^\//, '');
            const targetPath = basePath ? `${basePath}/${cleanSrc}` : cleanSrc;
            if (allFiles[targetPath]) return allFiles[targetPath];
            const fileName = cleanSrc.split('/').pop();
            const fuzzyMatch = filePaths.find(p => p.startsWith(basePath) && p.endsWith(fileName!));
            return fuzzyMatch ? allFiles[fuzzyMatch] : null;
        };

        bundledHtml = bundledHtml.replace(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/gi, (match, href) => {
            const content = resolveContent(href);
            return content ? `<style data-source="${href}">${content}</style>` : match;
        });

        bundledHtml = bundledHtml.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
            const content = resolveContent(src);
            return content ? `<script type="module" data-source="${src}">${content}</script>` : match;
        });

        const runtimeScripts = `
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                window.onerror = function(msg, url, line, col, error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.style.position = 'fixed';
                    errorDiv.style.bottom = '10px';
                    errorDiv.style.left = '10px';
                    errorDiv.style.right = '10px';
                    errorDiv.style.padding = '15px';
                    errorDiv.style.background = '#fee2e2';
                    errorDiv.style.color = '#991b1b';
                    errorDiv.style.borderRadius = '8px';
                    errorDiv.style.fontFamily = 'monospace';
                    errorDiv.style.fontSize = '12px';
                    errorDiv.style.zIndex = '9999';
                    errorDiv.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                    errorDiv.innerHTML = '<strong>Runtime Error:</strong><br>' + msg + ' (Line: ' + line + ')';
                    document.body.appendChild(errorDiv);
                    return false;
                };
            </script>
        `;

        if (bundledHtml.includes('</head>')) {
            bundledHtml = bundledHtml.replace('</head>', `${runtimeScripts}</head>`);
        } else {
            bundledHtml = runtimeScripts + bundledHtml;
        }

        const blob = new Blob([bundledHtml], { type: 'text/html' });
        return URL.createObjectURL(blob);
    };

    const loadUrl = () => {
        setLoading(true);
        if (iframeSrc.startsWith('blob:')) {
            URL.revokeObjectURL(iframeSrc);
        }

        if (url.includes('localhost') || url.includes('3000')) {
            try {
                const blobUrl = compileLocalProject();
                setIframeSrc(blobUrl);
            } catch (e) {
                console.error("Compilation failed", e);
            }
            setTimeout(() => setLoading(false), 300); 
        } else {
            let targetUrl = url;
            if (!url.startsWith('http')) targetUrl = `https://${url}`;
            setIframeSrc(targetUrl);
            setTimeout(() => setLoading(false), 1200); 
        }
    };

    useEffect(() => {
        loadUrl();
        return () => {
            if (iframeSrc.startsWith('blob:')) {
                URL.revokeObjectURL(iframeSrc);
            }
        };
    }, [fileStructure]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') loadUrl();
    };

    const handleOpenExternal = () => {
        if (url.includes('localhost') || url.includes('3000')) {
            // Launch the dedicated full-page standalone preview route
            window.open(`${window.location.origin}${window.location.pathname}#preview=true`, '_blank');
        } else {
            let targetUrl = url;
            if (!url.startsWith('http')) targetUrl = `https://${url}`;
            window.open(targetUrl, '_blank');
        }
    };

    return (
        <div className="p-0 h-full flex flex-col bg-[#080a0f] text-white relative">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-4 h-12 flex-shrink-0 border-b border-white/5 bg-[#0b0e14]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-cyan-400 fill-current" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Synthesis</h2>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    
                    {currentProject && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                            <FolderOpen size={10} className="text-cyan-400" />
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter">{currentProject}</span>
                        </div>
                    )}

                    <div className="flex items-center bg-black/40 rounded-lg border border-white/5 px-2 py-0.5 gap-2">
                        <button onClick={() => setViewMode('mobile')} className={`p-1 rounded transition-colors ${viewMode === 'mobile' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-white'}`}><Smartphone size={14} /></button>
                        <button onClick={() => setViewMode('desktop')} className={`p-1 rounded transition-colors ${viewMode === 'desktop' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-white'}`}><Monitor size={14} /></button>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleOpenExternal} className="p-1.5 text-gray-500 hover:text-cyan-400 transition-all hover:bg-white/5 rounded-lg" title="Open Full Page Synthesis">
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={onCollapse} className="text-gray-500 hover:text-white p-1.5 transition-all transform active:scale-90"><X size={18} /></button>
                </div>
            </div>

            {/* Address Bar Area */}
            <div className="px-4 py-2 bg-[#0b0e14] border-b border-white/5 flex items-center gap-3">
                <div className="flex gap-1">
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors"><ArrowLeft size={16} /></button>
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors"><ArrowRight size={16} /></button>
                    <button onClick={loadUrl} className="p-1.5 text-gray-600 hover:text-cyan-400 transition-colors"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
                </div>
                <div className="flex-1 flex items-center bg-[#161b22] border border-white/5 rounded-xl px-4 py-1.5 relative group shadow-inner">
                    <Globe size={12} className="text-gray-500 mr-2" />
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none text-xs text-gray-400 focus:outline-none font-mono focus:text-white"
                    />
                    <button onClick={handleOpenExternal} className="ml-2 text-gray-600 hover:text-cyan-400 transition-colors" title="Open in new window"><ExternalLink size={14} /></button>
                </div>
            </div>

            {/* Viewport Area */}
            <div className="flex-1 bg-[#12141a] relative overflow-hidden flex justify-center items-center p-6">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                
                <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] bg-white overflow-hidden relative ${
                        viewMode === 'mobile' 
                            ? 'w-[375px] h-[700px] rounded-[3rem] ring-8 ring-gray-900' 
                            : 'w-full h-full rounded-2xl'
                    }`}
                >
                    {viewMode === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-20" />}
                    
                    <iframe 
                        ref={iframeRef}
                        src={iframeSrc}
                        className="w-full h-full border-none"
                        title="Live Runtime"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                </div>
                
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#080a0f]/60 backdrop-blur-sm z-30 animate-fade-in">
                        <div className="flex flex-col items-center bg-[#161b22] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl scale-110">
                            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 animate-pulse">Syncing Neural Buffers</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewPane;