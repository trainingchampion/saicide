import React, { useState } from 'react';
import { X, Check, Zap, ShieldCheck, Rocket, Globe, CreditCard, RefreshCw, Star } from 'lucide-react';
import paystackService, { PLANS, Plan } from '../../services/paystackService';
import { TeamMember } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  onUpgradeSuccess: (newPlan: 'Pro' | 'Enterprise') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, currentUser, onUpgradeSuccess }) => {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<'pro' | 'enterprise'>('pro');

  if (!isOpen) return null;

  const handlePay = () => {
    const plan = PLANS.find(p => p.id === selectedPlanId)!;
    setIsProcessing(true);

    paystackService.initializePayment({
      email: currentUser.email,
      amountUSD: plan.priceUSD,
      currency: currency,
      metadata: {
        planId: plan.id,
        userId: currentUser.id
      },
      onSuccess: async (ref) => {
        const verified = await paystackService.verifyTransaction(ref);
        if (verified) {
          onUpgradeSuccess(plan.name as 'Pro' | 'Enterprise');
          onClose();
        }
        setIsProcessing(false);
      },
      onCancel: () => {
        setIsProcessing(false);
      }
    });
  };

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId)!;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[#0b0e14] rounded-[2.5rem] w-full max-w-4xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative h-full max-h-[700px]" onClick={e => e.stopPropagation()}>
        
        {/* Left: Plan Selector */}
        <div className="w-full md:w-1/2 bg-[#0f111a] border-r border-white/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Choose Your Path</h2>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setCurrency('USD')} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>USD</button>
                    <button onClick={() => setCurrency('NGN')} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'NGN' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>NGN</button>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {PLANS.filter(p => p.id !== 'hobby').map(plan => (
                    <button 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id as 'pro' | 'enterprise')}
                        className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${
                            selectedPlanId === plan.id 
                            ? 'bg-blue-600/10 border-blue-500 shadow-xl' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-black text-lg text-white">{plan.name}</h3>
                            {selectedPlanId === plan.id && <div className="p-1 bg-blue-500 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black text-white">
                                {currency === 'USD' ? `$${plan.priceUSD}` : `₦${(plan.priceUSD * 1600).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-gray-500 font-bold">/ MONTHLY</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <Zap size={12} fill="currentColor" /> {plan.tokens} Tokens included
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-500">
                <Globe size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Prices adjusted for regional parity. Secure payment processing powered by Paystack.
                </p>
            </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="w-full md:w-1/2 p-10 flex flex-col relative overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors">
                <X size={20} />
            </button>

            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-10">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 block">Confirm Upgrade</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter">{selectedPlan.name} Studio</h2>
                </div>

                <div className="space-y-6 mb-12">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Capabilities</h4>
                    <div className="space-y-3">
                        {selectedPlan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                <span className="text-sm text-gray-300 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CreditCard size={20} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Due Today</span>
                        </div>
                        <span className="text-lg font-black text-white">
                            {currency === 'USD' ? `$${selectedPlan.priceUSD}.00` : `₦${(selectedPlan.priceUSD * 1600).toLocaleString()}.00`}
                        </span>
                    </div>

                    <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full py-5 bg-white text-black rounded-[20px] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Synchronizing Bank...
                            </>
                        ) : (
                            <>
                                <Rocket size={18} fill="currentColor" />
                                Activate Neural Link
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        <ShieldCheck size={12} /> PCI-DSS Level 1 Secure
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;