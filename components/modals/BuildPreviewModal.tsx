
import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Play, 
    CheckCircle, 
    X, 
    FileCode, 
    Box, 
    File, 
    HardDrive, 
    Cloud, 
    Server, 
    Container, 
    RefreshCw, 
    GitBranch, 
    Rocket,
    ArrowRight,
    Search
} from 'lucide-react';
import { FileNode } from '../../types';

interface BuildPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunBuild: () => void;
  onOpenGit: () => void;
  onOpenDeploy: () => void;
  activeFile: FileNode | null;
}

type BuildDestination = 'local' | 'docker' | 'gcr' | 'ecr' | 'acr';

const BuildPreviewModal: React.FC<BuildPreviewModalProps> = ({ isOpen, onClose, onRunBuild, onOpenGit, onOpenDeploy, activeFile }) => {
  const [buildTarget, setBuildTarget] = useState<'project' | 'file'>('project');
  const [destination, setDestination] = useState<BuildDestination>('local');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsBuilding(false);
      setBuildResult(null);
      setDestination('local');
      if (activeFile && (activeFile.name === 'Dockerfile' || activeFile.name.endsWith('.go') || activeFile.name.endsWith('.rs'))) {
          setBuildTarget('file');
      } else {
          setBuildTarget('project');
      }
    }
  }, [isOpen, activeFile]);

  useEffect(() => {
      if (buildTarget === 'project') {
          switch (destination) {
              case 'docker': setBuildCommand('docker build -t my-app:latest .'); break;
              case 'gcr': setBuildCommand('gcloud builds submit --tag gcr.io/my-project/my-app .'); break;
              default: setBuildCommand('npm run build'); break;
          }
      } else if (activeFile) {
          const name = activeFile.name.toLowerCase();
          if (name.endsWith('.ts') || name.endsWith('.tsx')) setBuildCommand(`tsc ${activeFile.name}`);
          else setBuildCommand(`echo "Processing ${activeFile.name}..."`);
      }
  }, [buildTarget, activeFile, destination]);

  const handleBuild = () => {
    setIsBuilding(true);
    setBuildResult(null);
    setTimeout(() => {
        setIsBuilding(false);
        setBuildResult('success');
        onRunBuild();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-3xl p-8 w-full max-w-lg text-white border border-white/10 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl text-cyan-400">
                <Settings size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight">Build Control</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Workspace Synthesis Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setBuildTarget('project')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${buildTarget === 'project' ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                >
                    <Box size={20} className={buildTarget === 'project' ? 'text-cyan-400' : 'text-gray-600'} />
                    <div className="text-left">
                        <p className="text-sm font-bold">Project</p>
                        <p className="text-[10px] text-gray-500">Root Synthesis</p>
                    </div>
                </button>
                <button 
                    onClick={() => setBuildTarget('file')}
                    disabled={!activeFile}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${!activeFile ? 'opacity-30 grayscale cursor-not-allowed' : buildTarget === 'file' ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                >
                    <FileCode size={20} className={buildTarget === 'file' ? 'text-cyan-400' : 'text-gray-600'} />
                    <div className="text-left min-w-0">
                        <p className="text-sm font-bold">Active File</p>
                        <p className="text-[10px] text-gray-500 truncate">{activeFile ? activeFile.name : 'No file open'}</p>
                    </div>
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Destination</label>
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    {[
                        { id: 'local', icon: <HardDrive size={14}/>, label: 'Local' },
                        { id: 'docker', icon: <Container size={14}/>, label: 'Docker' },
                        { id: 'gcr', icon: <Cloud size={14}/>, label: 'Cloud' }
                    ].map(dest => (
                        <button
                            key={dest.id}
                            onClick={() => setDestination(dest.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${destination === dest.id ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            {dest.icon} {dest.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Generated Command</label>
                <div className="bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-xs text-emerald-400 shadow-inner break-all">
                    $ {buildCommand}
                </div>
            </div>

            {buildResult === 'success' ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-400">Synthesis Complete. Log data streamed to terminal.</span>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Next Logical Steps</p>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => { onOpenGit(); onClose(); }}
                                className="w-full p-4 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <GitBranch size={18} className="text-blue-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-200">Commit to Repository</p>
                                        <p className="text-[10px] text-gray-500">Version these build artifacts</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </button>
                            
                            <button 
                                onClick={() => { onOpenDeploy(); onClose(); }}
                                className="w-full p-4 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Rocket size={18} className="text-purple-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-200">Deploy to Cloud</p>
                                        <p className="text-[10px] text-gray-500">Initiate global provisioning</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-4">
                    <button 
                        onClick={handleBuild}
                        disabled={isBuilding}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-cyan-900/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isBuilding ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                        {isBuilding ? 'Running Build...' : 'Execute Synthesis'}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BuildPreviewModal;
