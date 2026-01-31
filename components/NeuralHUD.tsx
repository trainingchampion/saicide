import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Zap, Radio, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralHUD: React.FC<{ status: 'idle' | 'executing' | 'thinking' }> = ({ status }) => {
    const [pulse, setPulse] = useState(0);
    const [latency, setLatency] = useState(12);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(Math.random() * 100);
            setLatency(Math.floor(Math.random() * 15) + 5);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-20 right-8 z-[250] pointer-events-none select-none hidden lg:block">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-4 items-end"
            >
                {/* Neural Sync Meter */}
                <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 w-48 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 py-1">Neural Synapse</span>
                        <Radio size={12} className={status === 'executing' ? 'text-emerald-400 animate-pulse' : 'text-gray-600'} />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full bg-gradient-to-r ${status === 'thinking' ? 'from-purple-500 to-cyan-500' : 'from-cyan-500 to-emerald-500'}`}
                                animate={{ width: `${pulse}%` }}
                                transition={{ type: 'spring', stiffness: 50 }}
                            />
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="text-[8px] font-mono text-gray-500 uppercase">Latency</div>
                            <div className="text-xs font-mono text-cyan-400">{latency}ms</div>
                        </div>
                    </div>
                </div>

                {/* System Activity Hub */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1 group">
                        <Cpu size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-[8px] font-black text-gray-600 uppercase">Core</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1 group">
                        <Activity size={14} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                        <span className="text-[8px] font-black text-gray-600 uppercase">HEART</span>
                    </div>
                </div>

                {/* Active Protocol */}
                <AnimatePresence>
                    {status !== 'idle' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 flex items-center gap-3 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                            <Zap size={12} className="text-cyan-400 animate-bounce" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                {status === 'thinking' ? 'Deep Synthesis' : 'Logic Injection'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default NeuralHUD;
