
import React, { useState, useEffect } from 'react';

const PROVIDER_CONFIG: { [key: string]: { label: string, placeholder: string, command: string } } = {
    'AWS': { label: 'Access Key ID', placeholder: 'Enter your Access Key ID', command: 'aws configure' },
    'Azure': { label: 'Subscription ID', placeholder: 'Enter your Subscription ID', command: 'az login' },
    'GCP': { label: 'Project ID', placeholder: 'Enter your GCP Project ID', command: 'gcloud auth login' },
    'Oracle Cloud': { label: 'Tenancy OCID', placeholder: 'Enter your Tenancy OCID', command: 'oci setup config' },
    'DigitalOcean': { label: 'Personal Access Token', placeholder: 'Enter your PAT', command: 'doctl auth init' },
    'Custom': { label: 'API Endpoint', placeholder: 'Enter your custom API endpoint', command: 'ssh user@hostname' },
};

interface ConnectCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  onConnect: (id: string) => void;
}

const ConnectCloudModal: React.FC<ConnectCloudModalProps> = ({ isOpen, onClose, providerName, onConnect }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const config = PROVIDER_CONFIG[providerName] || PROVIDER_CONFIG['Custom'];

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!inputValue.trim()) {
            setError(`${config.label} is required to connect.`);
            return;
        }
        
        // Simulate validation delay
        onConnect(inputValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-lg text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Connect to {providerName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">{config.label} <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => {
                                setInputValue(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder={config.placeholder}
                            className={`w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'}`}
                        />
                        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                    </div>
                    <div className="text-center text-gray-500 text-sm flex items-center gap-4">
                       <hr className="flex-1 border-gray-700" />
                       OR
                       <hr className="flex-1 border-gray-700" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">Use Terminal Command</label>
                        <pre className="bg-black/50 p-3 rounded-lg text-sm text-cyan-300 font-mono"><code>{config.command}</code></pre>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold">Connect</button>
                </div>
            </div>
        </div>
    );
};

export default ConnectCloudModal;
