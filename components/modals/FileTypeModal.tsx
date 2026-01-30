
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Upload } from 'lucide-react';
import { FILE_TYPES } from '../../constants';

interface FileTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (extension: string, defaultName?: string) => void;
  onUpload?: (name: string, content: string) => void;
}

const FileTypeModal: React.FC<FileTypeModalProps> = ({ isOpen, onClose, onSelect, onUpload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredTypes = useMemo(() => FILE_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.extension.toLowerCase().includes(searchTerm.toLowerCase())
  ), [searchTerm]);

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
        setActiveIndex(prev => (prev + 1) % filteredTypes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredTypes.length) % filteredTypes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const type = filteredTypes[activeIndex];
        if (type) {
          onSelect(type.extension, type.filename);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTypes, activeIndex, onClose, onSelect]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [activeIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const content = ev.target?.result as string;
          if (onUpload) {
              onUpload(file.name, content);
              onClose();
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center pt-20" onClick={onClose}>
      <div 
        className="bg-[#1e2227] w-full max-w-xl rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[60vh] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-3 border-b border-[var(--color-border)] flex-shrink-0">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setActiveIndex(0); }}
            placeholder="Select file type or search..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
          />
        </div>
        
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {filteredTypes.length > 0 ? (
            filteredTypes.map((type, index) => {
                const isSelected = index === activeIndex;
                return (
                    <div
                        key={index}
                        ref={el => itemRefs.current[index] = el}
                        onClick={() => { onSelect(type.extension, type.filename); onClose(); }}
                        className={`flex items-center justify-between px-4 py-3 rounded-md cursor-pointer text-sm transition-colors ${isSelected ? 'bg-[var(--color-accent)]/20' : 'hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-gray-400">{type.icon}</div>
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{type.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{type.description}</span>
                            {type.extension && (
                                <span className="text-xs font-mono text-gray-600 bg-black/20 px-1.5 py-0.5 rounded">
                                    .{type.extension}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })
          ) : (
            <div className="text-center p-8 text-gray-500">
              No file types found.
            </div>
          )}
        </div>

        {onUpload && (
            <div className="p-2 border-t border-[var(--color-border)] bg-[#161b22]">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] text-sm text-gray-300 hover:text-white transition-colors border border-[var(--color-border)] border-dashed"
                >
                    <Upload size={16} />
                    <span>Upload File from Computer</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FileTypeModal;
