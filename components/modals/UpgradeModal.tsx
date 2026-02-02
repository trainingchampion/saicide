
import React from 'react';
import { Zap, Check, X, Star, ShieldCheck, Rocket, Clapperboard, Network, Globe, Radio } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName?: string;
}

const PRO_FEATURES = [
  { icon: <Rocket size={16} className="text-blue-400" />, text: "Unlimited Cloud Deployments" },
  { icon: <Globe size={16} className="text-cyan-400" />, text: "Live Preview Browser" },
  { icon: <Radio size={16} className="text-emerald-400" />, text: "Full-Featured API Client" },
  { icon: <ShieldCheck size={16} className="text-green-400" />, text: "Security Governance & Policies" },
  { icon: <Clapperboard size={16} className="text-purple-400" />, text: "Creator Studio AI Tools" },
  { icon: <Network size={16} className="text-orange-400" />, text: "Architecture Whiteboard" },
  { icon: <Zap size={16} className="text-yellow-400" />, text: "Gemini 3 Pro Reasoning" },
];

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, featureName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-[2rem] w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center relative">
          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
          
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Star className="text-white fill-current" size={32} />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">
            Unlock {featureName || 'Neural'} Studio
          </h2>
          <p className="text-gray-400 text-lg">
            This tool is part of our professional suite.
          </p>
        </div>

        <div className="px-8 pb-4 space-y-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Included in Pro Plan</h3>
            <div className="grid grid-cols-1 gap-4">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 pt-4 flex flex-col gap-4">
          <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            Upgrade to Pro for $20/mo
          </button>
          <p className="text-center text-[10px] text-gray-600">
            Secure payment via Paystack. Cancel anytime. <br/>
            Need a team plan? <a href="#" className="text-blue-400 underline">Contact Enterprise Sales</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
