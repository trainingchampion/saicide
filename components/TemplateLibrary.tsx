
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  Heart, 
  Sparkles, 
  Users,
  LayoutTemplate,
  ArrowLeft,
  Wand2,
  Terminal,
  Zap,
  Globe,
  Filter
} from 'lucide-react';
import { PromptTemplate } from '../types';
import { MOCK_PROMPT_TEMPLATES } from '../constants';

interface PromptLibraryProps {
  onSelect: (template: PromptTemplate) => void;
  onBack: () => void;
}

const BackgroundDoodles = () => (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10">
        <svg className="absolute top-0 right-0 w-[800px] h-[800px] text-blue-500/20 animate-subtle-rotate" viewBox="0 0 100 100">
             <path d="M50 0 A50 50 0 0 1 100 50 L50 50 Z" fill="currentColor" />
             <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-[600px] h-[600px] text-purple-500/20 animate-subtle-rotate" style={{ animationDirection: 'reverse' }} viewBox="0 0 100 100">
             <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
             <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    </div>
);

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelect, onBack }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Apps', 'Games', 'Landing Pages', 'Dashboards', 'Cloud/API'];

  const filteredTemplates = useMemo(() => {
    return MOCK_PROMPT_TEMPLATES.filter(tpl => {
      const matchesCategory = activeCategory === 'All' || tpl.category === activeCategory;
      const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfcfc] text-slate-900 overflow-hidden animate-fade-in relative">
      <BackgroundDoodles />
      
      {/* Header */}
      <div className="flex flex-col gap-6 px-8 md:px-12 py-8 flex-shrink-0 relative z-10 bg-white/50 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button onClick={onBack} className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all text-slate-500 hover:text-slate-900 shadow-sm hover:shadow-md active:scale-95">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <LayoutTemplate size={28} className="text-blue-600" />
                        Prompt Library
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Select a neural blueprint to jumpstart your synthesis.</p>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
                <div className="relative group">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search blueprints..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-72 font-medium shadow-sm outline-none"
                    />
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeCategory === cat 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform scale-105' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
          
          {/* AI Generator Card */}
          <div 
             className="group relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/20 overflow-hidden cursor-pointer min-h-[360px] border border-white/10"
             onClick={() => alert("AI Custom Synthesis triggered")}
          >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/20">
                      <Wand2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Custom Synthesis</h3>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed mb-8 max-w-[200px]">
                      Describe your dream architecture and let S.AI build it from scratch.
                  </p>
                  <button className="px-6 py-3 bg-white text-blue-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-transform group-hover:translate-y-[-2px] active:translate-y-0">
                      Start Empty
                  </button>
              </div>
          </div>

          {filteredTemplates.map(tpl => (
            <div 
                key={tpl.id}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 relative"
            >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={tpl.previewImage} 
                        alt={tpl.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"></div>
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                        {tpl.category}
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                         <div className="flex items-center gap-2 mb-1">
                            {tpl.price === 'Free' ? <Globe size={12} className="text-emerald-400" /> : <Zap size={12} className="text-amber-400" />}
                            <span className={`text-[10px] font-bold uppercase ${tpl.price === 'Free' ? 'text-emerald-400' : 'text-amber-400'}`}>{tpl.price}</span>
                         </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-slate-800 text-lg mb-2 leading-tight group-hover:text-blue-600 transition-colors">{tpl.title}</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3 mb-4 flex-1">
                        {tpl.description}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                             <img src={tpl.author.avatar} alt={tpl.author.name} className="w-6 h-6 rounded-full border border-slate-200" />
                             <span className="text-[11px] font-bold text-slate-600 truncate max-w-[80px]">{tpl.author.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                             <div className="flex items-center gap-1 text-[10px] font-bold"><Users size={12} /> {tpl.stats.views}</div>
                             <div className="flex items-center gap-1 text-[10px] font-bold"><Heart size={12} /> {tpl.stats.likes}</div>
                        </div>
                    </div>
                </div>
                
                {/* Hover Action */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center z-20">
                    <Sparkles size={32} className="text-cyan-400 mb-4 animate-pulse" />
                    <p className="text-white text-sm font-bold italic mb-6">"{tpl.prompt.substring(0, 80)}..."</p>
                    <button 
                        onClick={() => onSelect(tpl)}
                        className="w-full bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-cyan-50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Zap size={14} fill="currentColor" className="text-amber-500" /> Use Template
                    </button>
                </div>
            </div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 opacity-50 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <Filter size={32} className="text-slate-400" />
                </div>
                <p className="text-xl font-black text-slate-800">No matching blueprints</p>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">Try adjusting your filters or search query to find what you're looking for.</p>
                <button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} className="mt-6 text-blue-600 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary;
