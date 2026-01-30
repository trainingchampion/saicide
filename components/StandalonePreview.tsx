
import React, { useState, useEffect } from 'react';
import PreviewPane from './PreviewPane';
import { FileNode } from '../types';
import { THEMES } from '../themes';

const StandalonePreview: React.FC = () => {
    const [fileStructure, setFileStructure] = useState<FileNode | null>(null);
    const [theme] = useState(localStorage.getItem('sai_theme') || 'S.AI Default');

    useEffect(() => {
        document.title = "SAI Live Preview";
        
        // Initial load
        const loadFS = () => {
            const saved = localStorage.getItem('sai_workspace_fs');
            if (saved) {
                try {
                    setFileStructure(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to sync workspace", e);
                }
            }
        };

        loadFS();

        // Listen for updates from the main window
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sai_workspace_fs') {
                loadFS();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const selectedTheme = THEMES.find(t => t.name === theme) || THEMES[0];
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value as string);
        });
    }, [theme]);

    if (!fileStructure) {
        return (
            <div className="w-screen h-screen bg-[#0b0e14] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Syncing Workspace...</span>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[var(--color-background)]">
            <PreviewPane 
                onCollapse={() => window.close()} 
                fileStructure={fileStructure} 
            />
        </div>
    );
};

export default StandalonePreview;
