
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
    Search, 
    Sparkles, 
    Clock, 
    Zap, 
    FileText, 
    Settings, 
    Terminal, 
    GitBranch, 
    Folder,
    Command,
    ArrowRight,
    CornerDownLeft,
    ArrowUp,
    ArrowDown,
    X,
    Layout,
    Hammer,
    Users,
    HelpCircle,
    Layers
} from 'lucide-react';
import { Command as CommandType } from '../../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandType[];
  onAskOracle?: (query: string) => void;
}

// Quick action shortcuts that appear when search is empty
const QUICK_ACTIONS = [
    { id: 'file', prefix: '>', label: 'Go to File', description: 'Search files by name', icon: <FileText size={14} /> },
    { id: 'cmd', prefix: ':', label: 'Run Command', description: 'Execute editor commands', icon: <Terminal size={14} /> },
    { id: 'git', prefix: '@', label: 'Git Actions', description: 'Source control operations', icon: <GitBranch size={14} /> },
    { id: 'settings', prefix: '#', label: 'Settings', description: 'Change preferences', icon: <Settings size={14} /> },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'File': <FileText size={12} />,
    'View': <Layout size={12} />,
    'AI': <Sparkles size={12} />,
    'Git': <GitBranch size={12} />,
    'Terminal': <Terminal size={12} />,
    'Settings': <Settings size={12} />,
    'Panel': <Layers size={12} />,
    'Project': <Folder size={12} />,
    'Tools': <Hammer size={12} />,
    'Collaboration': <Users size={12} />,
    'Help': <HelpCircle size={12} />,
};

const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, commands, onAskOracle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [mode, setMode] = useState<'commands' | 'files' | 'git' | 'settings'>('commands');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load recent commands from localStorage
  useEffect(() => {
      const saved = localStorage.getItem('sai_recent_commands');
      if (saved) {
          try { setRecentCommands(JSON.parse(saved)); } catch {}
      }
  }, []);

  // Save command to recents
  const saveToRecents = useCallback((cmdId: string) => {
      setRecentCommands(prev => {
          const updated = [cmdId, ...prev.filter(id => id !== cmdId)].slice(0, 5);
          localStorage.setItem('sai_recent_commands', JSON.stringify(updated));
          return updated;
      });
  }, []);

  // Handle mode switching with prefixes
  useEffect(() => {
      if (searchTerm.startsWith('>')) {
          setMode('files');
      } else if (searchTerm.startsWith('@')) {
          setMode('git');
      } else if (searchTerm.startsWith('#')) {
          setMode('settings');
      } else {
          setMode('commands');
      }
  }, [searchTerm]);

  const actualSearchTerm = useMemo(() => {
      if (searchTerm.startsWith('>') || searchTerm.startsWith('@') || searchTerm.startsWith('#') || searchTerm.startsWith(':')) {
          return searchTerm.slice(1).trim();
      }
      return searchTerm;
  }, [searchTerm]);

  const filteredCommands = useMemo(() => {
      let cmds = commands;
      
      // Filter by mode
      if (mode === 'git') {
          cmds = cmds.filter(cmd => cmd.category.toLowerCase().includes('git') || cmd.category.toLowerCase().includes('source'));
      } else if (mode === 'settings') {
          cmds = cmds.filter(cmd => cmd.category.toLowerCase().includes('setting') || cmd.label.toLowerCase().includes('setting') || cmd.label.toLowerCase().includes('config'));
      } else if (mode === 'files') {
          cmds = cmds.filter(cmd => cmd.category.toLowerCase().includes('file') || cmd.label.toLowerCase().includes('file') || cmd.label.toLowerCase().includes('open'));
      }

      // Then filter by search term
      return cmds.filter(cmd => 
          cmd.label.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
          cmd.category.toLowerCase().includes(actualSearchTerm.toLowerCase())
      );
  }, [commands, actualSearchTerm, mode]);

  // Get recent command objects
  const recentCommandObjects = useMemo(() => {
      return recentCommands
          .map(id => commands.find(c => c.id === id))
          .filter(Boolean) as CommandType[];
  }, [recentCommands, commands]);

  const showOracle = actualSearchTerm.length > 2 && filteredCommands.length === 0 && onAskOracle;

  const allItems = useMemo(() => {
      const items: (CommandType | { isOracle: boolean, label: string })[] = [...filteredCommands];
      if (showOracle) {
          items.push({ isOracle: true, label: `Ask AI Oracle: "${actualSearchTerm}"` });
      }
      return items;
  }, [filteredCommands, showOracle, actualSearchTerm]);

  const groupedCommands = useMemo(() => {
      if (showOracle) return {};
      return filteredCommands.reduce((acc, cmd) => {
          (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
          return acc;
      }, {} as Record<string, CommandType[]>);
  }, [filteredCommands, showOracle]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
      setMode('commands');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % Math.max(1, allItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = allItems[activeIndex];
        if (item) {
          if ('isOracle' in item && item.isOracle) {
              onAskOracle?.(actualSearchTerm);
          } else if ('action' in item) {
              saveToRecents((item as CommandType).id);
              (item as CommandType).action();
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through modes
        const modes = ['commands', 'files', 'git', 'settings'] as const;
        const currentModeIndex = modes.indexOf(mode);
        const nextMode = modes[(currentModeIndex + 1) % modes.length];
        const prefixes = { commands: '', files: '>', git: '@', settings: '#' };
        setSearchTerm(prefixes[nextMode]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, activeIndex, onClose, actualSearchTerm, onAskOracle, mode, saveToRecents]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [activeIndex]);

  if (!isOpen) return null;

  let currentIndex = -1;
  const showQuickActions = !searchTerm && !actualSearchTerm;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center pt-16" onClick={onClose}>
      <div 
        className="bg-[#161b22] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[70vh] animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Search */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 flex-shrink-0 bg-[#1c2128]">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setActiveIndex(0); }}
              placeholder="Type a command or search..."
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-base"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            )}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-[#161b22]">
            {[
                { id: 'commands', label: 'Commands', prefix: '' },
                { id: 'files', label: 'Files', prefix: '>' },
                { id: 'git', label: 'Git', prefix: '@' },
                { id: 'settings', label: 'Settings', prefix: '#' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setSearchTerm(tab.prefix)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        mode === tab.id 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                    {tab.prefix && <span className="mr-1 font-mono text-gray-600">{tab.prefix}</span>}
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {/* Quick Actions when empty */}
          {showQuickActions && (
              <div className="p-4">
                  {/* Recent Commands */}
                  {recentCommandObjects.length > 0 && (
                      <div className="mb-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3 px-2">
                              <Clock size={12} />
                              <span>Recent</span>
                          </div>
                          <div className="space-y-1">
                              {recentCommandObjects.map((cmd, idx) => {
                                  currentIndex++;
                                  const index = currentIndex;
                                  const isSelected = index === activeIndex;
                                  return (
                                      <div
                                          key={cmd.id}
                                          ref={el => itemRefs.current[index] = el}
                                          onClick={() => { saveToRecents(cmd.id); cmd.action(); onClose(); }}
                                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                              isSelected 
                                                  ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                                                  : 'text-gray-300 hover:bg-white/5 border border-transparent'
                                          }`}
                                      >
                                          <span className="text-gray-400">{cmd.icon}</span>
                                          <span className="flex-1">{cmd.label}</span>
                                          <span className="text-[10px] text-gray-600">{cmd.category}</span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* Quick Actions */}
                  <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3 px-2">
                          <Zap size={12} />
                          <span>Quick Actions</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          {QUICK_ACTIONS.map(action => (
                              <button
                                  key={action.id}
                                  onClick={() => setSearchTerm(action.prefix)}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group"
                              >
                                  <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                                      {action.icon}
                                  </div>
                                  <div>
                                      <div className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                          {action.label}
                                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded font-mono text-gray-500">{action.prefix}</span>
                                      </div>
                                      <div className="text-[10px] text-gray-500">{action.description}</div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* Search Results */}
          {!showQuickActions && allItems.length > 0 && (
            <div className="p-2">
              {showOracle ? (
                  <div
                      ref={el => itemRefs.current[0] = el}
                      onClick={() => { onAskOracle?.(actualSearchTerm); onClose(); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-white mx-2"
                  >
                      <span className="p-2 rounded-lg bg-yellow-500/20"><Sparkles size={16} className="text-yellow-400" /></span>
                      <div>
                          <div className="font-semibold">Ask AI Oracle</div>
                          <div className="text-xs text-gray-400">"{actualSearchTerm}"</div>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-yellow-400" />
                  </div>
              ) : (
                  (Object.entries(groupedCommands) as [string, CommandType[]][]).map(([category, cmds]) => (
                      <div key={category} className="mb-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase px-3 py-2 tracking-wider">
                              {CATEGORY_ICONS[category] || <Folder size={12} />}
                              <span>{category}</span>
                              <span className="ml-1 text-gray-700">({cmds.length})</span>
                          </div>
                          {cmds.map(cmd => {
                              currentIndex++;
                              const index = currentIndex;
                              const isSelected = index === activeIndex;
                              return (
                                  <div
                                      key={cmd.id}
                                      ref={el => itemRefs.current[index] = el}
                                      onClick={() => { saveToRecents(cmd.id); cmd.action(); onClose(); }}
                                      className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl cursor-pointer transition-all ${
                                          isSelected 
                                              ? 'bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                                              : 'text-gray-300 hover:bg-white/5 border border-transparent'
                                      }`}
                                  >
                                      <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>
                                          {cmd.icon}
                                      </span>
                                      <span className="flex-1 font-medium">{cmd.label}</span>
                                      {cmd.shortcut && (
                                          <span className="text-[10px] px-2 py-1 bg-white/10 rounded-md font-mono text-gray-500">
                                              {cmd.shortcut}
                                          </span>
                                      )}
                                      {isSelected && !cmd.shortcut && (
                                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                              <CornerDownLeft size={10} /> to run
                                          </span>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  ))
              )}
            </div>
          )}

          {/* No Results */}
          {!showQuickActions && allItems.length === 0 && (
            <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Search size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No commands found</p>
                <p className="text-xs text-gray-600">Try a different search term or use a prefix like <code className="px-1 bg-white/10 rounded">&gt;</code> <code className="px-1 bg-white/10 rounded">@</code> <code className="px-1 bg-white/10 rounded">#</code></p>
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#0d1117] text-xs text-gray-500">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono"><ArrowUp size={10} /></span>
                    <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono"><ArrowDown size={10} /></span>
                    <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono"><CornerDownLeft size={10} /></span>
                    <span>Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[9px]">Tab</span>
                    <span>Switch Mode</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[9px]">Esc</span>
                <span>Close</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
