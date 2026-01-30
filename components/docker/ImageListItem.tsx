import React from 'react';
import { DockerImage } from '../../types';

const RunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;

interface ImageListItemProps {
  image: DockerImage;
  onRun: () => void;
}

const ImageListItem: React.FC<ImageListItemProps> = ({ image, onRun }) => {
  return (
    <div className="bg-[var(--color-background-tertiary)] rounded-lg p-3 text-sm transition-all hover:bg-[var(--color-background-hover)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)]">
      <div className="flex justify-between items-center">
        <p className="font-semibold font-mono text-cyan-300 truncate">{`${image.repository}:${image.tag}`}</p>
        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{image.size}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{`ID: ${image.id.slice(7, 15)}... | Created ${image.created}`}</p>
       <div className="mt-2 pt-2 border-t border-gray-600/50 flex justify-end">
          <button onClick={onRun} className="flex items-center text-green-400 hover:text-green-300 text-xs font-semibold px-2 py-1 rounded-md hover:bg-gray-600/50">
            <RunIcon />
            <span>Run</span>
          </button>
       </div>
    </div>
  );
};

export default ImageListItem;