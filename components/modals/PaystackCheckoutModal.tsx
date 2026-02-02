import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { TeamMember } from '../../types';
// Added missing RefreshCw import
import { Eye, EyeOff, Globe, CreditCard, CheckCircle2, RefreshCw } from 'lucide-react';

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: TeamMember) => void;
}

// Configuration
const PAYSTACK_PUBLIC_KEY = 'pk_live_ed60e4f4795819681d9d81227a608c66a60c2a48';
const PRICE_USD = 20;
const CONVERSION_RATE = 1600; // 1 USD to NGN
const PRICE_NGN = PRICE_USD * CONVERSION_RATE;

const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  
  useEffect(() => {
    if (!isOpen) {
      setName(''); 
      setEmail(''); 
      setPassword(''); 
      setShowPassword(false); 
      setError(''); 
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { 
      setError("All fields are required."); 
      return; 
    }
    setError('');
    setIsLoading(true);

    // Paystack amounts are in the smallest currency unit
    // USD: cents (amount * 100)
    // NGN: kobo (amount * 100)
    const amount = (currency === 'USD' ? PRICE_USD : PRICE_NGN) * 100;

    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount,
      currency: currency,
      ref: `sai-pro-${Date.now()}`,
      onClose: () => setIsLoading(false),
      callback: async (response: { reference: string }) => {
        try {
          const verification = await authService.verifyPaystackTransaction(response.reference);
          if (!verification.status || (verification.data && verification.data.status !== 'success')) {
             throw new Error("Payment verification failed. Please contact support.");
          }
          const proUser = await authService.createProUser(name, email, password);
          onSuccess(proUser);
          onClose();
        } catch (err: any) {
          setError(err.message || 'Checkout failed.');
          setIsLoading(false);
        }
      }
    });
    handler.openIframe();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] animate-fade-in" onClick={onClose}>
      <div className="bg-[#0b0e14] rounded-[2.5rem] w-full max-w-xl text-white border border-white/10 shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 rounded-2xl mb-4 border border-blue-500/20 shadow-lg">
                <CreditCard className="text-blue-400" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Upgrade to Pro</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Access unlimited deployments, security sentinel, and high-intelligence reasoning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Pricing Details */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-inner">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Subscription Fee</span>
                <div className="flex flex-col gap-1">
                    <p className="text-4xl font-black text-white">${PRICE_USD.toFixed(2)} <span className="text-xs text-gray-500 font-bold tracking-normal uppercase">USD</span></p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-4 bg-white/10" />
                        <p className="text-sm font-bold text-gray-400">or ₦{PRICE_NGN.toLocaleString()}.00 <span className="text-[10px] text-gray-600 font-black uppercase">NGN</span></p>
                        <div className="h-px w-4 bg-white/10" />
                    </div>
                </div>
                <div className="mt-6 flex bg-black/40 p-1 rounded-xl border border-white/5 w-full">
                    <button 
                        onClick={() => setCurrency('USD')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Pay in USD
                    </button>
                    <button 
                        onClick={() => setCurrency('NGN')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${currency === 'NGN' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Pay in NGN
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Chen" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all shadow-inner" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@sai.sh" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all shadow-inner" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm focus:border-blue-500/50 outline-none transition-all shadow-inner" 
                            required 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </form>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-shake">
                {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
              <button 
                onClick={handleSubmit} 
                disabled={isLoading} 
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                    <>
                        <RefreshCw size={18} className="animate-spin" /> 
                        Linking to Secure Vault...
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={18} fill="currentColor" className="text-black" />
                        Complete Pro Activation
                    </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-6 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><Globe size={10} /> Secure Checkout</div>
                  <div className="flex items-center gap-1.5"><CreditCard size={10} /> Powered by Paystack</div>
              </div>
          </div>
        </div>

        <button 
            onClick={onClose}
            className="p-6 text-center text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors border-t border-white/5 bg-white/[0.01]"
        >
            Decentralize and Go Back
        </button>
      </div>
    </div>
  );
};

export default PaystackCheckoutModal;