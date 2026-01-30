
import React, { useState } from 'react';
import { Copy, Check, ChevronsRight } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isAppPlan?: boolean;
  onInsertCode: (code: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isAppPlan, onInsertCode }) => {
  if (!content) return null;

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Split by code blocks first
  const blocks = content.split(/```/);

  // Simple inline parser for **bold** and `code`
  const parseInline = (text: string): React.ReactNode[] => {
    // Split by bold (**...**) and inline code (`...`)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono border ${isAppPlan ? 'bg-black/20 text-indigo-200 border-indigo-400/50' : 'bg-gray-800 text-cyan-300 border-gray-700'}`}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className={`space-y-3 text-sm leading-relaxed ${isAppPlan ? 'text-indigo-100' : 'text-gray-200'}`}>
      {blocks.map((block, index) => {
        if (index % 2 === 1) {
          // Code Block
          const firstLineBreak = block.indexOf('\n');
          const language = firstLineBreak > -1 ? block.substring(0, firstLineBreak).trim() : '';
          const code = firstLineBreak > -1 ? block.substring(firstLineBreak + 1) : block;
          
          const isCopied = copiedCode === code;

          return (
            <div key={index} className="bg-[#0d1117] rounded-md border border-gray-700 overflow-hidden my-2 relative group">
              <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onInsertCode(code)}
                  className="bg-black/30 backdrop-blur-sm text-gray-400 hover:text-white px-2 py-1 text-[10px] rounded-md border border-white/10 flex items-center gap-1 font-black uppercase tracking-wider"
                  title="Insert into Active File"
                >
                  <ChevronsRight size={12} /> Insert
                </button>
                <button
                  onClick={() => handleCopy(code)}
                  className="bg-black/30 backdrop-blur-sm text-gray-400 hover:text-white px-2 py-1 text-[10px] rounded-md border border-white/10 flex items-center gap-1 font-black uppercase tracking-wider"
                  title="Copy Code"
                >
                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {language && <div className="bg-[#161b22] px-3 py-1 text-xs text-gray-400 font-mono border-b border-gray-700 select-none">{language}</div>}
              <div className="p-3 overflow-x-auto">
                <code className="font-mono text-xs text-blue-300 whitespace-pre">{code}</code>
              </div>
            </div>
          );
        } else {
          // Text Block - split by lines to handle paragraphs/headers
          return (
            <div key={index}>
              {block.split('\n').map((line, lineIndex) => {
                if (!line.trim()) return <div key={lineIndex} className="h-2" />; // Spacer for empty lines
                
                const trimmedLine = line.trim();

                // Headers
                if (trimmedLine.startsWith('### ')) return <h4 key={lineIndex} className="font-bold text-base text-white mt-4 mb-2">{parseInline(trimmedLine.slice(4))}</h4>;
                if (trimmedLine.startsWith('## ')) return <h3 key={lineIndex} className="font-bold text-lg text-white mt-5 mb-2">{parseInline(trimmedLine.slice(3))}</h3>;
                if (trimmedLine.startsWith('# ')) return <h2 key={lineIndex} className="font-bold text-xl text-white mt-6 mb-3">{parseInline(trimmedLine.slice(2))}</h2>;
                
                // List items
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    return <div key={lineIndex} className="flex gap-2 ml-2"><span className={`${isAppPlan ? 'text-indigo-300' : 'text-gray-400'}`}>•</span><span>{parseInline(trimmedLine.slice(2))}</span></div>;
                }
                if (/^\d+\.\s/.test(trimmedLine)) {
                    const match = trimmedLine.match(/^(\d+)\.\s/);
                    const num = match ? match[1] : '1';
                    return <div key={lineIndex} className="flex gap-2 ml-2"><span className={`${isAppPlan ? 'text-indigo-300' : 'text-gray-400'}`}>{num}.</span><span>{parseInline(trimmedLine.replace(/^\d+\.\s/, ''))}</span></div>;
                }

                return <p key={lineIndex} className="mb-1 min-h-[1em]">{parseInline(line)}</p>;
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
