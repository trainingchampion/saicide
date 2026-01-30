
import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, RefreshCw, Check } from 'lucide-react';
import aiService from '../../services/geminiService';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFileContent?: string;
  activeFileName?: string;
  activeModelId?: string;
}

const AiSuggestionModal: React.FC<AiSuggestionModalProps> = ({ isOpen, onClose, activeFileContent, activeFileName, activeModelId }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && activeFileName) {
        fetchSuggestions();
    } else {
        setSuggestions([]);
    }
  }, [isOpen, activeFileName]);

  const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
          const results = await aiService.getCodeSuggestions(
              activeFileContent || '', 
              activeFileName || 'unknown', 
              activeModelId || 'gemini-2.5-flash'
          );
          setSuggestions(results);
      } catch (error) {
          setSuggestions(["Unable to fetch suggestions. Please try again later."]);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-6 w-full max-w-lg text-white border border-gray-700 shadow-xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    AI Suggestions
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Smart suggestions for <span className="font-mono text-cyan-300">{activeFileName}</span>
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <svg className="animate-spin h-8 w-8 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-sm text-gray-400">Analyzing code & generating ideas...</p>
                </div>
            ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors group">
                        <div className="flex justify-between items-start gap-3">
                            <p className="text-sm text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">{suggestion}</p>
                            <button 
                                onClick={() => handleCopy(suggestion, index)}
                                className="text-gray-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 flex-shrink-0"
                                title="Copy to clipboard"
                            >
                                {copiedIndex === index ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No suggestions found.
                </div>
            )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
            <button 
                onClick={fetchSuggestions} 
                disabled={isLoading}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                Regenerate
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionModal;
