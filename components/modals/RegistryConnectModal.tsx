import React, { useState } from 'react';
import { Globe, User, Key, Check, X, Server, Eye, EyeOff } from 'lucide-react';

interface RegistryConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (registry: { name: string; url: string; username: string; provider: string }) => void;
}

const PROVIDERS = [
    { id: 'dockerhub', name: 'Docker Hub', url: 'https://index.docker.io/v1/', icon: '🐳' },
    { id: 'github', name: 'GitHub Container Registry', url: 'ghcr.io', icon: '🐙' },
    { id: 'gitlab', name: 'GitLab Registry', url: 'registry.gitlab.com', icon: '🦊' },
    { id: 'aws', name: 'AWS ECR', url: 'aws_account_id.dkr.ecr.region.amazonaws.com', icon: '☁️' },
    { id: 'azure', name: 'Azure ACR', url: 'myregistry.azurecr.io', icon: '🟦' },
    { id: 'custom', name: 'Custom Registry', url: '', icon: '🌐' },
];

const RegistryConnectModal: React.FC<RegistryConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
    const [provider, setProvider] = useState(PROVIDERS[0].id);
    const [url, setUrl] = useState(PROVIDERS[0].url);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProviderId = e.target.value;
        setProvider(newProviderId);
        const prov = PROVIDERS.find(p => p.id === newProviderId);
        if (prov && prov.id !== 'custom') {
            setUrl(prov.url);
        } else {
            setUrl('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password || !url) {
            setError('All fields are required.');
            return;
        }

        setIsConnecting(true);

        try {
            // Simulate API call to verify credentials
            await new Promise(res => setTimeout(res, 1500));
            
            // In a real app, you'd verify here. For now, assume success if not 'fail'.
            if(username.toLowerCase() === 'fail') throw new Error('Authentication failed');
            
            const selectedProvider = PROVIDERS.find(p => p.id === provider);
            
            onConnect({
                name: selectedProvider?.name || 'Custom Registry',
                url,
                username,
                provider
            });
            onClose();
            // Reset form
            setUsername('');
            setPassword('');
            setShowPassword(false);
        } catch (err) {
            setError('Failed to connect. Please check your credentials.');
        } finally {
            setIsConnecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-md text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Server size={24} className="text-[var(--color-accent)]" />
                        Connect Registry
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Provider</label>
                        <select 
                            value={provider}
                            onChange={handleProviderChange}
                            className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                        >
                            {PROVIDERS.map(p => (
                                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Registry URL</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500"><Globe size={16} /></span>
                            <input
                                type="text"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="e.g. https://index.docker.io/v1/"
                                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono text-gray-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500"><User size={16} /></span>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Password / Access Token</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500"><Key size={16} /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Secret"
                                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg pl-9 pr-11 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono text-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">We recommend using a Personal Access Token (PAT).</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <X size={14} /> {error}
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isConnecting}
                            className="px-6 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Check size={16} /> Connect
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistryConnectModal;
