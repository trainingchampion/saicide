
import React, { useState, useEffect, useMemo } from 'react';
import { FileNode, GithubRepo } from '../../types';
import githubService from '../../services/githubService';
import { GitBranch, Plus, Lock, Globe } from 'lucide-react';

interface SaveToGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileStructure: FileNode;
  token: string | null;
  onSetToken: (token: string | null) => void;
  initialCommitMessage?: string;
}

type Status = 'idle' | 'token-needed' | 'loading-repos' | 'ready' | 'creating-repo' | 'pushing' | 'success' | 'error';

const SaveToGithubModal: React.FC<SaveToGithubModalProps> = ({ isOpen, onClose, fileStructure, token, onSetToken, initialCommitMessage }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');

  // Existing Repo State
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  
  // New Repo State
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Common State
  const [branchName, setBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('feat: initial commit from SAI');
  const [status, setStatus] = useState<Status>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAction, setLastAction] = useState<'fetch' | 'push' | null>(null);
  const [successUrl, setSuccessUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
        resetState();
        if (initialCommitMessage) {
            setCommitMessage(initialCommitMessage);
        }
        if (token) {
            fetchRepos();
        } else {
            setStatus('token-needed');
        }
    }
  }, [isOpen, token, initialCommitMessage]);

  const resetState = () => {
    setRepos([]);
    setSelectedRepo('');
    setActiveTab('existing');
    setNewRepoName('');
    setNewRepoDesc('');
    setIsPrivate(false);
    setBranchName('');
    setCommitMessage(initialCommitMessage || 'feat: initial commit from SAI');
    setStatus('idle');
    setErrorMessage('');
    setSuccessUrl('');
    setProgressMessage('');
    setTokenInput('');
    setLastAction(null);
  };

  const fetchRepos = async () => {
    if (!token) return;
    setStatus('loading-repos');
    setErrorMessage('');
    setLastAction('fetch');
    try {
      const userRepos = await githubService.getUserRepos(token);
      setRepos(userRepos);
      if (userRepos.length > 0) {
        setSelectedRepo(userRepos[0].full_name);
      }
      setStatus('ready');
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  };
  
  const handleTokenSubmit = () => {
    if(tokenInput.trim()){
        onSetToken(tokenInput.trim());
    }
  }

  const handlePush = async () => {
    if (!token) return;

    let targetRepoFullName = selectedRepo;
    let targetBaseBranch = 'main';

    setErrorMessage('');

    // Handle New Repo Creation logic first
    if (activeTab === 'create') {
        if (!newRepoName.trim()) {
            setErrorMessage('Repository name is required.');
            setStatus('error');
            return;
        }
        
        setStatus('creating-repo');
        setProgressMessage('Creating new repository...');
        
        try {
            const newRepo = await githubService.createRepo(token, newRepoName, newRepoDesc, isPrivate);
            targetRepoFullName = newRepo.full_name;
            targetBaseBranch = newRepo.default_branch || 'main';
            // Wait for GitHub to propagate the new repo
            await new Promise(r => setTimeout(r, 1500));
        } catch (error: any) {
            setErrorMessage(`Failed to create repository: ${error.message}`);
            setStatus('error');
            return;
        }
    } else {
        const repoData = repos.find(r => r.full_name === selectedRepo);
        if (!repoData) {
            setErrorMessage('Please select a repository.');
            setStatus('error');
            return;
        }
        targetRepoFullName = repoData.full_name;
        targetBaseBranch = repoData.default_branch;
    }

    if (!branchName.trim() || !commitMessage.trim()) {
      setErrorMessage('Branch name and commit message are required.');
      setStatus('error');
      return;
    }
    
    setStatus('pushing');
    setLastAction('push');
    
    try {
      const url = await githubService.createCommit(
        token,
        targetRepoFullName,
        targetBaseBranch,
        branchName,
        commitMessage,
        fileStructure,
        setProgressMessage
      );
      setSuccessUrl(url);
      setStatus('success');
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  const handleRetry = () => {
    if (lastAction === 'fetch') {
      fetchRepos();
    } else if (lastAction === 'push') {
      handlePush();
    } else {
      // Fallback
      resetState();
      if (token) {
        fetchRepos();
      } else {
        setStatus('token-needed');
      }
    }
  };
  
  const selectedRepoData = useMemo(() => {
    return repos.find(r => r.full_name === selectedRepo);
  }, [repos, selectedRepo]);

  // Auto-generate branch name based on project root folder name
  useEffect(() => {
    // Only auto-set if empty
    if (!branchName) {
        const sanitizedProjectName = fileStructure.name.replace(/[^a-zA-Z0-9-]/g, '-') || 'feature';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
        setBranchName(`${sanitizedProjectName}-${timestamp}`);
    }
  }, [fileStructure, branchName]);

  if (!isOpen) return null;
  
  const renderContent = () => {
    switch(status) {
        case 'token-needed':
            return (
                <div className="space-y-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Please provide a GitHub Personal Access Token with <code className="bg-black/30 px-1 rounded">repo</code> scope to continue.</p>
                     <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-accent)] hover:underline">How to create a token?</a>
                    <input
                        type="password"
                        value={tokenInput}
                        onChange={e => setTokenInput(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <button onClick={handleTokenSubmit} className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-2 rounded-lg text-sm">Set Token & Fetch Repos</button>
                    <button onClick={onClose} className="w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-white">Cancel</button>
                </div>
            );
        case 'loading-repos':
            return (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <svg className="animate-spin h-6 w-6 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">Fetching your repositories...</p>
                </div>
            );
        case 'ready':
             return (
                 <div className="space-y-4">
                     {/* Tabs */}
                     <div className="flex bg-black/20 p-1 rounded-lg">
                         <button 
                            onClick={() => setActiveTab('existing')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'existing' ? 'bg-[var(--color-background-hover)] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                         >
                             <GitBranch size={14} /> Existing Repo
                         </button>
                         <button 
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'create' ? 'bg-[var(--color-background-hover)] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                         >
                             <Plus size={14} /> Create New Repo
                         </button>
                     </div>

                     {activeTab === 'existing' ? (
                         <div>
                             <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Select Repository</label>
                             <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)} className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]">
                                 {repos.map(r => <option key={r.id} value={r.full_name}>{r.full_name}</option>)}
                             </select>
                             {selectedRepoData && <p className="text-xs text-gray-500 mt-1">Base branch: {selectedRepoData.default_branch}</p>}
                         </div>
                     ) : (
                         <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-gray-700/50">
                             <div>
                                 <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Repository Name</label>
                                 <input type="text" value={newRepoName} onChange={e => setNewRepoName(e.target.value)} placeholder="my-awesome-project" className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
                             </div>
                             <div>
                                 <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Description (Optional)</label>
                                 <input type="text" value={newRepoDesc} onChange={e => setNewRepoDesc(e.target.value)} placeholder="A short description..." className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
                             </div>
                             <div className="flex items-center gap-4">
                                 <label className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${!isPrivate ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-white' : 'border-gray-700 text-gray-400'}`}>
                                     <input type="radio" checked={!isPrivate} onChange={() => setIsPrivate(false)} className="hidden" />
                                     <Globe size={14} /> Public
                                 </label>
                                 <label className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${isPrivate ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-white' : 'border-gray-700 text-gray-400'}`}>
                                     <input type="radio" checked={isPrivate} onChange={() => setIsPrivate(true)} className="hidden" />
                                     <Lock size={14} /> Private
                                 </label>
                             </div>
                         </div>
                     )}

                      <div>
                         <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">New Branch Name</label>
                         <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
                     </div>
                      <div>
                         <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Commit Message</label>
                         <input type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
                     </div>
                     <button onClick={handlePush} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors shadow-lg">
                         {activeTab === 'create' ? 'Create Repo & Push' : 'Push to New Branch'}
                     </button>
                 </div>
             );
        case 'creating-repo':
        case 'pushing':
            return (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <svg className="animate-spin h-6 w-6 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">{progressMessage || 'Processing...'}</p>
                </div>
            );
        case 'success':
            return (
                <div className="text-center p-8">
                     <h3 className="text-lg font-bold text-green-400 mb-2">Success!</h3>
                     <p className="text-sm text-[var(--color-text-secondary)] mb-4">Your code has been pushed successfully.</p>
                     <a href={successUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-accent)] hover:underline break-all block mb-4">{successUrl}</a>
                     <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm">Close</button>
                </div>
            );
        case 'error':
            return (
                <div className="text-center p-8">
                     <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
                     <p className="text-sm text-red-400/80 bg-red-900/20 p-2 rounded-md break-words">{errorMessage}</p>
                     {errorMessage.toLowerCase().includes('token') && (
                         <button onClick={() => { onSetToken(null); resetState(); setStatus('token-needed'); }} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg text-sm">Change Token</button>
                     )}
                     <button onClick={handleRetry} className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg text-sm">Retry</button>
                     <button onClick={onClose} className="mt-2 w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-white">Cancel</button>
                </div>
            );
        default:
            return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-[#131b2c] rounded-2xl p-6 w-full max-w-lg text-white border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Save to GitHub</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            {renderContent()}
        </div>
    </div>
  );
};

export default SaveToGithubModal;
