
import React, { useState } from 'react';
import { AIModel } from '../types';
import { ICONS } from '../constants';
import { Key, ShieldCheck, Zap, ArrowRight, Save, X } from 'lucide-react';

interface ModelMarketplaceProps {
  models: AIModel[];
  activeModelId: string;
  apiKeys: { [key: string]: string };
  onSetActiveModel: (modelId: string) => void;
  onSaveApiKey: (modelId: string, key: string) => void;
  onCollapse: () => void;
}

const ProviderBadge: React.FC<{ provider: string }> = ({ provider }) => {
    const colors: Record<string, string> = {
        // Major Cloud Providers
        'Google': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Anthropic': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'OpenAI': 'bg-green-500/10 text-green-400 border-green-500/20',
        'xAI': 'bg-slate-400/10 text-slate-300 border-slate-400/20',
        'Meta': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Amazon': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Azure': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        
        // AI Labs
        'DeepSeek': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        'Mistral': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Cohere': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
        'AI21': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
        'Perplexity': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        
        // Inference Platforms
        'Groq': 'bg-red-500/10 text-red-400 border-red-500/20',
        'Together': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        
        // Local/Self-Hosted
        'Local': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        
        // Chinese AI Labs
        'Alibaba': 'bg-orange-600/10 text-orange-300 border-orange-600/20',
        'Kuaishou': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        'MiniMax': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Zhipu': 'bg-blue-600/10 text-blue-300 border-blue-600/20',
        'Baichuan': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        'Moonshot': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    const style = colors[provider] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    return (
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${style}`}>
            {provider}
        </span>
    );
};

const ModelCard: React.FC<{
  model: AIModel,
  isActive: boolean,
  apiKeySet: boolean,
  onSetActive: () => void,
  onSaveKey: (key: string) => void,
}> = ({ model, isActive, apiKeySet, onSetActive, onSaveKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  const handleSave = () => {
    onSaveKey(keyInput);
    setIsEditing(false);
    setKeyInput('');
  };

  const isManaged = model.provider === 'Google' && !isActive; // Placeholder for logic

  return (
    <div className={`group relative rounded-2xl p-4 transition-all duration-300 border ${
        isActive 
            ? 'bg-[#1e90ff08] border-[#1e90ff44] shadow-[0_0_20px_#1e90ff11]' 
            : 'bg-[#1c1c1e] border-white/5 hover:border-white/10'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{model.name}</h3>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1e90ff] animate-pulse" />}
          </div>
          <ProviderBadge provider={model.provider} />
        </div>
        {isActive && (
            <span className="text-[9px] font-black text-[#1e90ff] uppercase tracking-tighter bg-[#1e90ff11] px-2 py-0.5 rounded-full border border-[#1e90ff33]">Active</span>
        )}
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed mb-4 group-hover:text-gray-400 transition-colors">{model.description}</p>
      
      <div className="space-y-2">
        {isEditing ? (
          <div className="space-y-2 animate-fade-in">
            <div className="relative">
                <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Enter API Key...`}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-[#1e90ff]/50 transition-all font-mono"
                autoFocus
                />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 text-[10px] bg-[#1e90ff] hover:bg-[#1e90ffdd] text-white font-black uppercase tracking-widest py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Save size={12} /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="flex-1 text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <Key size={12} className={apiKeySet ? 'text-yellow-500' : 'text-gray-600'} />
              <span className={apiKeySet ? 'text-gray-400' : 'text-gray-600 italic'}>
                {apiKeySet ? '••••••••' : 'Key not set'}
              </span>
            </div>
            <button 
                onClick={() => setIsEditing(true)} 
                className="text-[10px] font-black uppercase text-[#1e90ff] hover:underline"
            >
              {apiKeySet ? 'Update' : 'Configure'}
            </button>
          </div>
        )}
      </div>

      {!isActive && !isEditing && (
        <button 
            onClick={onSetActive} 
            className="w-full mt-4 bg-white/[0.03] hover:bg-[#1e90ff11] hover:text-[#1e90ff] border border-white/5 hover:border-[#1e90ff33] text-gray-500 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px]"
        >
          <Zap size={12} /> Initialize Engine
        </button>
      )}
    </div>
  );
};

const ModelMarketplace: React.FC<ModelMarketplaceProps> = ({ models, activeModelId, apiKeys, onSetActiveModel, onSaveApiKey, onCollapse }) => {
  return (
    <div className="p-2 h-full flex flex-col bg-[#1c1c1e]">
        <div className="flex justify-between items-center p-3 flex-shrink-0 border-b border-white/5 mb-4">
            <div>
                <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">AI Models</h2>
                <p className="text-[9px] text-gray-600 font-bold uppercase mt-0.5">Select Your LLM</p>
            </div>
            <button onClick={onCollapse} className="text-gray-600 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all">
                {ICONS.COLLAPSE_LEFT}
            </button>
        </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-1 pb-6">
        {models.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            isActive={model.id === activeModelId}
            apiKeySet={!!apiKeys[model.id]}
            onSetActive={() => onSetActiveModel(model.id)}
            onSaveKey={(key) => onSaveApiKey(model.id, key)}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelMarketplace;
