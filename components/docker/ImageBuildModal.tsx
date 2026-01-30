import React, { useState, useEffect } from 'react';
import { DockerImage } from '../../types';

interface ImageBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildComplete: (newImage: DockerImage) => void;
}

const ImageBuildModal: React.FC<ImageBuildModalProps> = ({ isOpen, onClose, onBuildComplete }) => {
  const [newImageTag, setNewImageTag] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [hasBuilt, setHasBuilt] = useState(false);

  useEffect(() => {
    // Reset state when modal is closed
    if (!isOpen) {
        setTimeout(() => {
            setNewImageTag('');
            setIsBuilding(false);
            setBuildLog([]);
            setHasBuilt(false);
        }, 300); // delay to allow for closing animation
    }
  }, [isOpen]);

  const handleStartBuild = () => {
    if (!newImageTag.trim()) return;
    setIsBuilding(true);
    setBuildLog([]);
    setHasBuilt(true);
    const logs = [
        'Step 1/6 : FROM node:18-alpine', ' ---> d8f9...',
        'Step 2/6 : WORKDIR /app', ' ---> Running in 1234...', ' ---> d8f9...',
        'Step 3/6 : COPY package*.json ./', ' ---> d8f9...',
        'Step 4/6 : RUN npm install', ' ---> Running in 5678...', ' ---> d8f9...',
        'Step 5/6 : COPY . .', ' ---> d8f9...',
        'Step 6/6 : CMD ["npm", "start"]', ' ---> d8f9...',
        `Successfully tagged ${newImageTag}`,
    ];

    let i = 0;
    const interval = setInterval(() => {
        setBuildLog(prev => [...prev, logs[i]]);
        i++;
        if (i >= logs.length) {
            clearInterval(interval);
            setIsBuilding(false);
            const newImage: DockerImage = {
                id: `sha256:${Math.random().toString(16).substring(2, 11)}`,
                repository: newImageTag.split(':')[0],
                tag: newImageTag.split(':')[1] || 'latest',
                size: `${Math.floor(200 + Math.random() * 50)}MB`,
                created: 'Just now',
            };
            onBuildComplete(newImage);
        }
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl text-gray-200 border border-gray-700 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Build Docker Image</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            {!hasBuilt ? (
                 <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1">Image Tag</label>
                        <input 
                            type="text" 
                            value={newImageTag}
                            onChange={e => setNewImageTag(e.target.value)}
                            placeholder="e.g., my-app:latest"
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm"
                        />
                    </div>
                    <button onClick={handleStartBuild} disabled={!newImageTag.trim()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm disabled:bg-gray-600">
                        Start Build
                    </button>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                        {isBuilding && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isBuilding ? 'Building...' : 'Build Finished'}
                    </h3>
                    <pre className="bg-gray-900 rounded p-3 text-xs font-mono flex-1 overflow-y-auto">
                        {buildLog.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
                    </pre>
                    {!isBuilding && <button onClick={onClose} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg text-sm">Close</button>}
                </div>
            )}
        </div>
    </div>
  );
};

export default ImageBuildModal;