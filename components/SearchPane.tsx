
import React, { useState } from 'react';
import { ICONS } from '../constants';
// Added X to the imports from lucide-react to fix the error on line 88
import { Search, ArrowRight, CaseSensitive, FileText, MoreHorizontal, ChevronDown, ChevronRight, Hash, X, RefreshCw } from 'lucide-react';

interface SearchPaneProps {
  onCollapse: () => void;
}

const SearchPane: React.FC<SearchPaneProps> = ({ onCollapse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isReplaceVisible, setIsReplaceVisible] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);

  // Mock results for visualization
  const mockResults = searchQuery ? [
    { file: 'src/App.tsx', matches: 3, line: 12, text: 'const App = () => { return <CloudStudio />; }', folder: 'src' },
    { file: 'src/components/Header.tsx', matches: 1, line: 45, text: 'export default Header;', folder: 'src/components' },
    { file: 'src/types.ts', matches: 5, line: 8, text: 'export enum Panel { FILES, SEARCH, ...', folder: 'src' },
  ] : [];

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-widest">Search</h2>
        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="px-2 pb-2 space-y-2 flex-shrink-0">
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search terms" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131b2c] border border-white/5 rounded-lg py-2 pl-3 pr-24 text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder-gray-600 shadow-inner"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-black/40 rounded-md p-1 border border-white/5">
                <button 
                    title="Match Case" 
                    onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                    className={`p-1 rounded transition-colors ${isCaseSensitive ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <CaseSensitive size={14}/>
                </button>
                <button 
                    title="Whole Word" 
                    onClick={() => setIsWholeWord(!isWholeWord)}
                    className={`p-1 rounded transition-colors ${isWholeWord ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <span className="text-[10px] font-black leading-none">" "</span>
                </button>
            </div>
        </div>
        
        {isReplaceVisible && (
            <div className="relative flex gap-2 animate-fade-in">
                <input 
                    type="text" 
                    placeholder="Replace with" 
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="flex-1 bg-[#131b2c] border border-white/5 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder-gray-600 shadow-inner"
                />
                <button 
                    title="Replace All"
                    onClick={() => alert('Synthesis running: Batch replacement active.')}
                    className="px-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg shadow-lg active:scale-95 transition-all"
                >
                    <ArrowRight size={14} />
                </button>
            </div>
        )}

        <div className="flex items-center justify-between px-1">
            <button 
                onClick={() => setIsReplaceVisible(!isReplaceVisible)} 
                className={`text-[9px] font-black uppercase transition-colors flex items-center gap-1 ${isReplaceVisible ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-400'}`}
            >
                {isReplaceVisible ? 'Hide Synthesis' : 'Open Synthesis Replace'}
            </button>
            <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-white" title="Refresh Search"><RefreshCw size={12} /></button>
                <button className="text-gray-500 hover:text-white" title="Clear Results"><X size={12} /></button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 mt-4 custom-scrollbar">
        {searchQuery ? (
            <div className="space-y-4">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <span>{mockResults.length} files found</span>
                    <span className="text-cyan-500">Indexed</span>
                </div>
                
                <div className="space-y-3">
                    {mockResults.map((res, i) => (
                        <div key={i} className="group">
                            <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/5 shadow-sm">
                                <ChevronDown size={14} className="text-gray-600" />
                                <FileText size={14} className="text-blue-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-300 truncate">{res.file.split('/').pop()}</p>
                                    <p className="text-[9px] text-gray-600 font-mono truncate">{res.folder}</p>
                                </div>
                                <span className="text-[10px] font-black bg-white/5 text-gray-500 px-2 py-0.5 rounded-full border border-white/5">{res.matches}</span>
                            </div>
                            <div className="ml-8 pl-3 border-l border-white/5 mt-1 space-y-1">
                                <div className="py-2 hover:bg-white/5 cursor-pointer rounded-lg px-2 group/match border border-transparent hover:border-white/5 transition-all">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Hash size={10} className="text-gray-700" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Line {res.line}</span>
                                    </div>
                                    <p className="text-[11px] font-mono text-gray-400 whitespace-pre overflow-hidden">
                                        {res.text.split(searchQuery).map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && <span className="bg-cyan-500/30 text-cyan-100 px-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.3)]">{searchQuery}</span>}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 px-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                    <Search size={32} strokeWidth={1} className="text-gray-400" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Awaiting Run</p>
                <p className="text-[10px] mt-2 leading-relaxed">Enter terms to perform a high-fidelity workspace search.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchPane;
