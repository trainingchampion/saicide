import React, { useState, useEffect } from 'react';
import { Integration } from '../../types';

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onConnect: (id: string, config: any) => void;
}

const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({ isOpen, onClose, integration, onConnect }) => {
  const [formData, setFormData] = useState<{[key: string]: string}>({});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isOpen && integration) {
      setFormData({});
      setIsConnecting(false);
    }
  }, [isOpen, integration]);

  if (!isOpen || !integration) return null;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      onConnect(integration.id, formData);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-lg text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg">
                {integration.icon}
             </div>
             <h2 className="text-2xl font-bold">Connect {integration.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-6 text-sm">{integration.description}</p>

        <div className="space-y-4">
          {integration.configFields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-300 block mb-2">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.key] || ''}
                onChange={e => handleInputChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label}`}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Cancel</button>
          <button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold disabled:bg-gray-600 disabled:cursor-wait flex items-center"
          >
            {isConnecting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isConnecting ? 'Connecting...' : 'Connect Integration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigModal;
