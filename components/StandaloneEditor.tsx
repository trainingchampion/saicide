
import React, { useState, useEffect, useRef } from 'react';
import { FileNode } from '../types';
import EditorPane, { EditorPaneRef } from './EditorPane';
import { THEMES } from '../themes';

const StandaloneEditor: React.FC = () => {
    const [file, setFile] = useState<FileNode | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('sai_theme') || 'S.AI Default');
    const [terminalHeight, setTerminalHeight] = useState(250);
    const editorRef = useRef<EditorPaneRef>(null);

    useEffect(() => {
        // Read from hash instead of search params to avoid 404s
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const key = params.get('popoutKey');
        
        if (key) {
            try {
                const fileData = localStorage.getItem(key);
                if (fileData) {
                    const parsedFile = JSON.parse(fileData) as FileNode;
                    setFile(parsedFile);
                    document.title = `${parsedFile.name} - SAI Editor`;
                    // Note: We don't remove the key immediately so refreshes work
                } else {
                    setFile({ name: "Session Expired", type: 'file', content: "File data not found in local storage. Please try popping out the file again." });
                }
            } catch (e) {
                console.error("Failed to load popped-out file:", e);
                setFile({ name: "Error", type: 'file', content: `Critical Error: ${e instanceof Error ? e.message : 'Unknown'}` });
            }
        }
    }, []);

    useEffect(() => {
        const selectedTheme = THEMES.find(t => t.name === theme) || THEMES[0];
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value as string);
        });
    }, [theme]);

    const handleFileUpdate = (content: string) => {
        setFile(prev => prev ? { ...prev, content } : null);
    };

    if (!file) {
        return (
            <div className="w-screen h-screen bg-[#0b0e14] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Loading Neural Buffer...</span>
            </div>
        );
    }
    
    const standaloneFileStructure: FileNode = {
        name: 'standalone-workspace',
        type: 'folder',
        children: [file]
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-[var(--color-background)]">
            <EditorPane
                ref={editorRef}
                file={file}
                onFileUpdate={handleFileUpdate}
                onCloseFile={() => window.close()}
                onUndo={() => {}}
                onRedo={() => {}}
                appEvents={[]}
                onClearEvents={() => {}}
                onGoToFile={() => {}}
                onOpenChat={() => alert("Chat is restricted in standalone mode.")}
                onOpenSettings={() => {}}
                onStartDebugging={() => {}}
                onCloneRepo={() => {}}
                onChangePanel={() => {}}
                onNewFile={() => {}}
                fontSize={'14'}
                wordWrap={'off'}
                keymap={'vscode'}
                vimMode={false}
                isMac={/Mac|iPod|iPhone|iPad/.test(navigator.platform)}
                onOpenCommandPalette={() => {}}
                collaborationState={{}}
                teamMembers={[]}
                currentUser={null}
                fileStructure={standaloneFileStructure}
                setFileStructure={() => {}}
                canEdit={true}
                terminalHeight={terminalHeight}
                onTerminalResize={setTerminalHeight}
                policies={[]}
                securityIssues={[]}
                installedExtensions={[]}
                onGetSuggestions={() => {}}
                onClearProblems={() => {}}
                onValidateCommand={() => ({ allowed: true })}
                diffData={null}
                onCloseDiff={() => {}}
                onReturnToSetup={() => {}}
            />
        </div>
    );
};

export default StandaloneEditor;
