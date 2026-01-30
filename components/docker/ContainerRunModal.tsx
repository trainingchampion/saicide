import React, { useState, useEffect } from 'react';
import { DockerImage } from '../../types';

interface ContainerRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (name: string, ports: string) => void;
  image: DockerImage | null;
}

const ContainerRunModal: React.FC<ContainerRunModalProps> = ({ isOpen, onClose, onRun, image }) => {
  const [name, setName] = useState('');
  const [ports, setPorts] = useState('');

  useEffect(() => {
    if (image) {
      const repoName = image.repository.split('/').pop() || 'container';
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      setName(`${repoName}-${randomSuffix}`);
    }
    setPorts('');
  }, [image]);

  if (!isOpen || !image) return null;

  const handleRun = () => {
    onRun(name, ports);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg text-gray-200 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Run Container from Image</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Image: <span className="font-mono text-cyan-300">{`${image.repository}:${image.tag}`}</span></p>
              <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Container Name</label>
                  <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., web-server-1"
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm"
                  />
              </div>
               <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Port Mapping (optional)</label>
                  <input 
                      type="text" 
                      value={ports}
                      onChange={e => setPorts(e.target.value)}
                      placeholder="e.g., 8080:80"
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Host Port : Container Port</p>
              </div>
              <button onClick={handleRun} disabled={!name.trim()} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg text-sm disabled:bg-gray-600">
                  Run Container
              </button>
            </div>
        </div>
    </div>
  );
};

export default ContainerRunModal;
