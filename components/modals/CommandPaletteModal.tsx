
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Command } from '../../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  onAskOracle?: (query: string) => void;
}

const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, commands, onAskOracle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredCommands = useMemo(() => commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
  ), [commands, searchTerm]);

  const showOracle = searchTerm.length > 2 && filteredCommands.length === 0 && onAskOracle;

  const allItems = useMemo(() => {
      const items: (Command | { isOracle: boolean, label: string })[] = [...filteredCommands];
      if (showOracle) {
          items.push({ isOracle: true, label: `Ask AI Oracle: "${searchTerm}"` });
      }
      return items;
  }, [filteredCommands, showOracle, searchTerm]);

  const groupedCommands = useMemo(() => {
      if (showOracle) return {};
      return filteredCommands.reduce((acc, cmd) => {
          (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
          return acc;
      }, {} as Record<string, Command[]>);
  }, [filteredCommands, showOracle]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = allItems[activeIndex];
        if (item) {
          if ('isOracle' in item && item.isOracle) {
              onAskOracle?.(searchTerm);
          } else if ('action' in item) {
              (item as Command).action();
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, activeIndex, onClose, searchTerm, onAskOracle]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [activeIndex]);

  if (!isOpen) return null;

  let currentIndex = -1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center pt-20" onClick={onClose}>
      <div 
        className="bg-[#1e2227] w-full max-w-2xl rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[60vh] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-3 border-b border-[var(--color-border)] flex-shrink-0">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setActiveIndex(0); }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
          />
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {allItems.length > 0 ? (
            showOracle ? (
                <div
                    ref={el => itemRefs.current[0] = el}
                    onClick={() => { onAskOracle?.(searchTerm); onClose(); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm bg-[var(--color-accent)]/20 text-white`}
                >
                    <span className="text-yellow-400"><Sparkles size={16} /></span>
                    <span>Ask AI Oracle: "{searchTerm}"</span>
                </div>
            ) : (
                (Object.entries(groupedCommands) as [string, Command[]][]).map(([category, cmds]) => (
                    <div key={category} className="mb-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase px-3 py-1">{category}</h3>
                        {cmds.map(cmd => {
                            currentIndex++;
                            const index = currentIndex;
                            const isSelected = index === activeIndex;
                            return (
                                <div
                                    key={cmd.id}
                                    ref={el => itemRefs.current[index] = el}
                                    onClick={() => { cmd.action(); onClose(); }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm ${isSelected ? 'bg-[var(--color-accent)]/20 text-white' : 'text-gray-300 hover:bg-white/5'}`}
                                >
                                    <span className="text-gray-400">{cmd.icon}</span>
                                    <span>{cmd.label}</span>
                                </div>
                            );
                        })}
                    </div>
                ))
            )
          ) : (
            <div className="text-center p-8 text-gray-500">
              No commands found for "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
