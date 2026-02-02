import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, Download, Check, X, Terminal, Loader } from 'lucide-react';

interface CloneRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (url: string) => void;
}

const CloneRepoModal: React.FC<CloneRepoModalProps> = ({ isOpen, onClose, onClone }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRepoUrl('');
      setIsCloning(false);
      setLogs([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleClone = async () => {
    if (!repoUrl.trim()) return;
    
    setIsCloning(true);
    setLogs([]);

    const steps = [
      `Cloning into '${repoUrl.split('/').pop()?.replace('.git', '') || 'project'}'...`,
      'remote: Enumerating objects: 142, done.',
      'remote: Counting objects: 100% (142/142), done.',
      'remote: Compressing objects: 100% (98/98), done.',
      'Receiving objects: 100% (142/142), 1.24 MiB | 4.56 MiB/s, done.',
      'Resolving deltas: 100% (45/45), done.',
      'Checking connectivity... done.'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
      setLogs(prev => [...prev, steps[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    onClone(repoUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-lg text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <GitBranch className="text-cyan-400" />
            Clone Repository
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {!isCloning ? (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Repository URL</label>
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-cyan-100"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleClone}
                disabled={!repoUrl.trim()}
                className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                Clone
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0f1117] rounded-lg border border-gray-800 p-4 font-mono text-xs h-48 overflow-y-auto shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 text-gray-300">
                  <span className="text-green-500 mr-2">$</span>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            <div className="flex items-center justify-center text-sm text-gray-400 gap-2 animate-pulse">
                <Loader size={14} className="animate-spin" />
                Cloning repository...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloneRepoModal;
