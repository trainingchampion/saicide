import React from 'react';
import { Layout, Clock, ChevronRight, X, Folder } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    lastModified: string;
    files: number;
}

const MOCK_PROJECTS: Project[] = [
    { id: '1', name: 'sai-monorepo', description: 'Main S.AI internal development repository', lastModified: '2m ago', files: 142 },
    { id: '2', name: 'hyper-commerce-cloud', description: 'Next-gen e-commerce backend in Go', lastModified: '1h ago', files: 28 },
    { id: '3', name: 'visionary-nexus-ai', description: 'Computer vision research sandbox', lastModified: '1d ago', files: 12 },
    { id: '4', name: 'infra-nexus-core', description: 'Global Terraform infrastructure modules', lastModified: '3d ago', files: 45 },
];

interface SwitchProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectName: string) => void;
  currentProjectName: string;
}

const SwitchProjectModal: React.FC<SwitchProjectModalProps> = ({ isOpen, onClose, onSelect, currentProjectName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-6 w-full max-w-lg text-white border border-gray-700 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Layout size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold">Switch Project</h2>
                <p className="text-xs text-gray-500">Jump to another workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {MOCK_PROJECTS.map(project => {
            const isActive = project.name === currentProjectName;
            return (
              <button
                key={project.id}
                onClick={() => { onSelect(project.name); onClose(); }}
                disabled={isActive}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isActive 
                    ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20' 
                    : 'bg-gray-900/30 border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white group-hover:bg-gray-700'}`}>
                        <Folder size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isActive ? 'text-blue-400' : 'text-gray-200'}`}>{project.name}</span>
                            {isActive && <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Active</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{project.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-600 flex items-center gap-1 font-bold"><Clock size={10} /> {project.lastModified}</span>
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{project.files} Files</span>
                        </div>
                    </div>
                </div>
                {!isActive && <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-transform group-hover:translate-x-1" />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchProjectModal;
