
import React, { useState, useMemo } from 'react';
import { AIModel } from '../../types';
import { AI_MODELS_DATA, IMAGE_MODELS_DATA, AUDIO_MODELS_DATA, VIDEO_MODELS_DATA } from '../../constants';
import { Search, Key, Check, Zap, Image as ImageIcon, Video, Mic, MessageSquare, X, ShieldCheck, Globe, Save } from 'lucide-react';

interface ModelMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: { [key: string]: string };
  onSaveApiKey: (modelId: string, key: string) => void;
  activeModelId: string;
  onSetActiveModel: (modelId: string) => void;
}

type Category = 'All' | 'Chat' | 'Image' | 'Video' | 'Audio';

const ProviderBadge: React.FC<{ provider: string }> = ({ provider }) => {
    const colors: Record<string, string> = {
        'Google': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Anthropic': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'OpenAI': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Meta': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'DeepSeek': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        'Kuaishou': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        'MiniMax': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    const style = colors[provider] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${style}`}>
            {provider}
        </span>
    );
};

const ModelMarketplaceModal: React.FC<ModelMarketplaceModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveApiKey,
  activeModelId,
  onSetActiveModel,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');

  const allModels = useMemo(() => [
    ...AI_MODELS_DATA.map(m => ({ ...m, type: 'Chat' as const })),
    ...IMAGE_MODELS_DATA.map(m => ({ ...m, type: 'Image' as const })),
    ...VIDEO_MODELS_DATA.map(m => ({ ...m, type: 'Video' as const })),
    ...AUDIO_MODELS_DATA.map(m => ({ ...m, type: 'Audio' as const }))
  ], []);

  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      const matchesCategory = activeCategory === 'All' || model.type === activeCategory;
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allModels, activeCategory, searchQuery]);

  const handleStartEditKey = (modelId: string, currentKey: string) => {
    setEditingKeyId(modelId);
    setTempKey(currentKey || '');
  };

  const handleSaveKey = (modelId: string) => {
    onSaveApiKey(modelId, tempKey);
    setEditingKeyId(null);
    setTempKey('');
  };

  if (!isOpen) return null;

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Engines', icon: <Zap className="w-4 h-4" /> },
    { id: 'Chat', label: 'Reasoning', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'Image', label: 'Visuals', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'Video', label: 'Motion', icon: <Video className="w-4 h-4" /> },
    { id: 'Audio', label: 'Voice', icon: <Mic className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] animate-fade-in p-4" onClick={onClose}>
      <div 
        className="bg-[#0b0e14] rounded-[2.5rem] w-full max-w-6xl h-[85vh] border border-white/5 shadow-2xl flex flex-col overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              Neural <span className="text-[#1e90ff]">Registry</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Configure and initialize decentralized intelligence for your workspace.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-gray-500 border-r border-white/10 pr-4">
                <ShieldCheck size={14} className="text-emerald-500" /> End-to-end encrypted keys
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/5">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-black/20 border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Find an engine..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#1e90ff]/50 transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-2">Synthesis Modes</h3>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-[#1e90ff] text-white shadow-xl shadow-[#1e90ff11]' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-auto p-4 bg-[#1e90ff08] border border-[#1e90ff22] rounded-2xl">
                <p className="text-[10px] font-black text-[#1e90ff] uppercase tracking-widest mb-1">Quota Usage</p>
                <div className="h-1 w-full bg-black/40 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#1e90ff] w-[45%]" />
                </div>
                <p className="text-[9px] text-gray-600 font-bold uppercase mt-2">4.5M / 10M Tokens</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex-1 bg-[#0b0e14] p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map((model) => {
                const isActive = activeModelId === model.id;
                const hasKey = !!apiKeys[model.id];
                const isEditing = editingKeyId === model.id;

                return (
                  <div 
                    key={model.id} 
                    className={`group relative bg-[#131313] border rounded-3xl p-6 flex flex-col h-full transition-all duration-500 hover:shadow-2xl ${
                      isActive ? 'border-[#1e90ff] ring-1 ring-[#1e90ff]/20 shadow-[0_0_40px_#1e90ff08]' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-white text-base tracking-tight mb-2">{model.name}</h3>
                        <ProviderBadge provider={model.provider} />
                      </div>
                      {model.type === 'Chat' && isActive && (
                        <div className="flex items-center gap-2 bg-[#1e90ff11] text-[#1e90ff] text-[10px] font-black px-3 py-1 rounded-full border border-[#1e90ff22]">
                          <Check size={12} strokeWidth={3} /> ACTIVE
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed mb-8 flex-1 font-medium group-hover:text-gray-400 transition-colors">
                      {model.description}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      {/* API Key Management */}
                      <div className="bg-black/30 rounded-2xl p-3 border border-white/5 transition-all group-hover:border-white/10 shadow-inner">
                        {isEditing ? (
                          <div className="flex flex-col gap-3 animate-fade-in">
                            <input
                              type="password"
                              value={tempKey}
                              onChange={e => setTempKey(e.target.value)}
                              placeholder="sk-..."
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]/50 font-mono"
                              autoFocus
                            />
                            <div className="flex gap-2">
                                <button onClick={() => handleSaveKey(model.id)} className="flex-1 bg-[#1e90ff] hover:bg-[#1e90ffdd] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 transition-all">
                                    <Save size={12} /> Save
                                </button>
                                <button onClick={() => setEditingKeyId(null)} className="flex-1 bg-white/5 text-gray-500 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white/10 transition-all">
                                    Cancel
                                </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${hasKey ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-600'}`}>
                                    <Key size={14} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Access Key</p>
                                    <p className={`text-xs font-mono font-bold mt-0.5 ${hasKey ? 'text-gray-400' : 'text-gray-700 italic'}`}>
                                        {hasKey ? '••••••••••••••••' : 'Unconfigured'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleStartEditKey(model.id, apiKeys[model.id])}
                                className="p-2 hover:bg-white/5 rounded-xl text-[var(--color-accent)] transition-all group-hover:scale-110"
                                title="Update Credentials"
                            >
                              <Save size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Engine Action */}
                      {model.type === 'Chat' && (
                        <button
                          onClick={() => onSetActiveModel(model.id)}
                          disabled={isActive}
                          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                            isActive
                              ? 'bg-white/5 text-gray-600 cursor-default opacity-50'
                              : 'bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          {isActive ? 'Current engine' : 'Initialize engine'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 pt-20">
                <Globe className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-sm font-bold uppercase tracking-widest">No matching registry entries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelMarketplaceModal;
