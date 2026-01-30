
import React, { useState } from 'react';
import { X, Github, Globe, Heart, Info, Code2, Cpu } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full"></div>

        <div className="p-8 text-center relative z-10">
          <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>

          <div className="w-20 h-20 bg-[var(--color-background)] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
             <span className="font-michroma text-xl font-bold text-[var(--color-success)] tracking-tighter">SAI</span>
             <div className="absolute -bottom-2 -right-2 bg-[var(--color-accent)] text-white p-1.5 rounded-xl shadow-lg">
                <Cpu size={14} />
             </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tighter font-michroma uppercase">Sai IDE</h2>
          <p className="text-[var(--color-accent)] font-michroma text-[9px] uppercase tracking-[0.3em] font-bold">Version 1.0.0-PRO</p>
          
          <div className="mt-8 space-y-4">
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              The next-generation AI-native Cloud IDE. 
              Code. Collaborate. Create.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Architecture</h4>
                    <p className="text-xs font-bold text-gray-200">Sai Engine v1</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Runtime</h4>
                    <p className="text-xs font-bold text-gray-200">Universal Shell 3.0</p>
                </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-4">
                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all">
                    <Github size={20} />
                </button>
                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all">
                    <Globe size={20} />
                </button>
                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all">
                    <Info size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                Made with <Heart size={10} className="text-red-500 fill-current" /> by <span className="text-gray-400">SSlabs</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all active:scale-95"
            >
                Back to Workspace
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
