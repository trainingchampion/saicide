
import React, { useState } from 'react';
import { TeamMember, IdentityTab } from '../../types';
import { 
    User, 
    CreditCard, 
    Shield, 
    X, 
    CheckCircle2, 
    Zap, 
    Clock, 
    ShieldCheck, 
    Lock, 
    Smartphone, 
    Key, 
    Mail, 
    Briefcase,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    FileText
} from 'lucide-react';

interface IdentityDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: TeamMember;
    initialTab?: IdentityTab;
}

const IdentityDashboardModal: React.FC<IdentityDashboardModalProps> = ({ isOpen, onClose, user, initialTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState<IdentityTab>(initialTab);

    if (!isOpen) return null;

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
        { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
        { id: 'security', label: 'Privacy & Security', icon: <Shield size={18} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] animate-fade-in p-4" onClick={onClose}>
            <div 
                className="bg-[#0f1117] w-full max-w-4xl h-[70vh] rounded-2xl border border-white/5 shadow-2xl flex overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Sidebar Navigation */}
                <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col p-4">
                    <div className="mb-8 flex items-center gap-4 px-2">
                        <div className="relative group cursor-pointer">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/10">
                                {user.initials}
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[9px] font-black uppercase">EDIT</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl text-white font-bold truncate">{user.name}</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as IdentityTab)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
                            <Zap size={12} className="text-yellow-400" />
                            Neural Quota
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-[var(--color-accent)] h-full w-[65%]" />
                        </div>
                        <p className="text-[10px] text-gray-500">6.5M / 10M Tokens used</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/10">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-4">
                            {activeTab} Settings
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl space-y-8 animate-fade-in">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-4xl font-black text-white relative group cursor-pointer shadow-2xl">
                                            {user.initials}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                                                <p className="text-[10px] font-black uppercase">Edit</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-white mb-1">Public Identity</h4>
                                            <p className="text-sm text-gray-500">Update your avatar and neural display name.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <User size={10} /> Full Name
                                            </label>
                                            <input type="text" defaultValue={user.name} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--color-accent)] outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Mail size={10} /> Neural Email
                                            </label>
                                            <input type="email" defaultValue={user.email} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white opacity-50 cursor-not-allowed outline-none" disabled />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Briefcase size={10} /> Professional Role
                                            </label>
                                            <input type="text" defaultValue={user.role} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--color-accent)] outline-none" />
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all">Save Changes</button>
                                </section>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="max-w-2xl space-y-8 animate-fade-in">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 block">Active Plan</span>
                                                <h4 className="text-3xl font-black text-white">{user.plan} Studio</h4>
                                            </div>
                                            <CheckCircle2 className="text-cyan-400" size={32} />
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-300">
                                            <div className="flex items-center gap-2"><Clock size={16} /> Renews Oct 24, 2025</div>
                                            <div className="flex items-center gap-2"><CreditCard size={16} /> •••• 4242</div>
                                        </div>
                                    </div>
                                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-cyan-400 transform rotate-12">
                                        <Zap size={140} fill="currentColor" />
                                    </div>
                                </div>

                                <section className="space-y-4">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Transaction Records</h4>
                                    <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-white transition-colors">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-300 group-hover:text-white">Neural IDE Pro - Monthly</p>
                                                        <p className="text-[10px] text-gray-500">Sept {24 - i}, 2025</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-white">$20.00</span>
                                                    <ExternalLink size={14} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="max-w-2xl space-y-8 animate-fade-in">
                                <section className="space-y-4">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="text-green-500" size={16} /> Data Sovereignty
                                    </h4>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-200">Two-Factor Authentication</p>
                                                <p className="text-xs text-gray-500">Protect your neural projects with biometrics.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-green-500/20 rounded-full p-1 flex items-center justify-end">
                                            <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Key className="text-orange-500" size={16} /> Credentials
                                    </h4>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
                                            <div className="flex items-center gap-4">
                                                <Lock size={18} className="text-gray-500" />
                                                <span className="text-sm font-bold text-gray-300">Change Studio Password</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
                                            <div className="flex items-center gap-4">
                                                <Shield size={18} className="text-gray-500" />
                                                <span className="text-sm font-bold text-gray-300">Active Session Explorer</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                </section>

                                <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 flex gap-4">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <div>
                                        <h5 className="text-sm font-bold text-red-400">Account Erasure</h5>
                                        <p className="text-xs text-red-300/60 mt-1 mb-3">Permanently delete your profile and all associated neural artifacts. This action is irreversible.</p>
                                        <button className="text-[10px] font-black uppercase text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Delete Identity</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdentityDashboardModal;
