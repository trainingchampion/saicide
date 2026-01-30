import React from 'react';
import { DockerContainer, ContainerStatus } from '../../types';

const getStatusIndicatorClass = (status: ContainerStatus) => {
    switch(status) {
        case ContainerStatus.RUNNING: return 'bg-green-500';
        case ContainerStatus.STOPPED: return 'bg-gray-500';
        case ContainerStatus.EXITED: return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2h1.102L5 15.111A2 2 0 006.898 17h6.204a2 2 0 001.996-1.889L15 6h1a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>;

interface ContainerListItemProps {
  container: DockerContainer;
  onAction: (id: string, action: 'start' | 'stop' | 'remove') => void;
}

const ContainerListItem: React.FC<ContainerListItemProps> = ({ container, onAction }) => {
  return (
    <div className="bg-[var(--color-background-tertiary)] rounded-lg p-3 text-sm transition-all hover:bg-[var(--color-background-hover)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)]">
        <div className="flex justify-between items-center">
            <p className="font-semibold font-mono text-white truncate">{container.name}</p>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusIndicatorClass(container.status)}`}></span>
                <span className="text-xs font-medium">{container.status}</span>
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-1 font-mono truncate">{container.image}</p>
        <p className="text-xs text-gray-500 mt-1">{`ID: ${container.id.slice(0, 12)}... | Ports: ${container.ports || 'N/A'}`}</p>
        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-600/50">
            {container.status !== ContainerStatus.RUNNING ? (
                <button onClick={() => onAction(container.id, 'start')} className="flex items-center space-x-1 text-green-400 hover:text-green-300 text-xs font-semibold">
                    <PlayIcon /> <span>Start</span>
                </button>
            ) : (
                <button onClick={() => onAction(container.id, 'stop')} className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-xs font-semibold">
                    <StopIcon /> <span>Stop</span>
                </button>
            )}
            <button onClick={() => onAction(container.id, 'remove')} className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-xs font-semibold">
                <TrashIcon /> <span>Remove</span>
            </button>
        </div>
    </div>
  );
};

export default ContainerListItem;