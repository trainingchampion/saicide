
import React, { useState, useMemo, useEffect } from 'react';
import { Extension } from '../types';
import { ICONS } from '../constants';
import openVsxService from '../services/openVsxService';
import { Search, Filter, MoreHorizontal, Settings, ChevronDown, ChevronRight, Star, Download, Loader2 } from 'lucide-react';

interface ExtensionsPaneProps {
  installedExtensions: Extension[];
  onInstall: (extension: Extension) => void;
  onUninstall: (extensionId: string) => void;
  onCollapse: () => void;
}

const CollapsibleSection: React.FC<{
    title: string;
    count: number;
    children: React.ReactNode;
    isLoading?: boolean;
}> = ({ title, count, children, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="mb-4">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-md"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">{count}</span>
                </div>
            </button>
            {isExpanded && <div className="mt-2 space-y-1">{children}</div>}
        </div>
    );
};

const ExtensionListItem: React.FC<{
    extension: Extension;
    isInstalled: boolean;
    onInstall: () => void;
    onUninstall: () => void;
}> = ({ extension, isInstalled, onInstall, onUninstall }) => {
  const publisherId = extension.id.split('.')[0];
  
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-[var(--color-background-tertiary)]/50 transition-colors rounded-lg group">
      {extension.iconUrl ? (
        <img src={extension.iconUrl} alt={extension.name} className="w-12 h-12 rounded-md object-cover bg-gray-800 flex-shrink-0" onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(extension.name)}&background=374151&color=fff&size=48`;
        }} />
      ) : (
        <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-400 flex-shrink-0">
            {extension.name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate text-base">{extension.name}</h3>
        <p className="text-sm text-gray-400 mt-1 truncate">{extension.description}</p>
        <span className="text-xs text-gray-500 mt-2 block">{publisherId}</span>
      </div>
      <div className="ml-4 flex-shrink-0">
        {isInstalled ? (
            <button className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-full" title="Manage extension">
                <Settings size={16} />
            </button>
        ) : (
            <button
                onClick={onInstall}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-md transition-colors"
            >
                Install
            </button>
        )}
      </div>
    </div>
  );
};

const ExtensionsPane: React.FC<ExtensionsPaneProps> = ({ installedExtensions, onInstall, onUninstall, onCollapse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Extension[]>([]);
  const [recommended, setRecommended] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);

  const installedIds = useMemo(() => new Set(installedExtensions.map(e => e.id)), [installedExtensions]);

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoadingRecommended(true);
      try {
        const results = await openVsxService.searchExtensions(''); // Fetch popular
        setRecommended(results.slice(0, 5).map(r => ({ ...r, isRecommended: true })));
      } catch (e) { console.error(e); }
      finally { setIsLoadingRecommended(false); }
    };
    fetchRecommended();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await openVsxService.searchExtensions(searchTerm);
        if (isMounted) setSearchResults(results);
      } catch (error) { console.error(error); }
      finally { if (isMounted) setIsLoading(false); }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => { isMounted = false; clearTimeout(debounce); };
  }, [searchTerm]);

  const filteredInstalled = useMemo(() => {
    if (!searchTerm) return installedExtensions;
    return installedExtensions.filter(
      ext => ext.name.toLowerCase().includes(searchTerm.toLowerCase()) || ext.publisher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [installedExtensions, searchTerm]);

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white px-1">Extensions</h2>
        <div className="flex items-center gap-1">
            <button onClick={() => alert('More actions: Sort by installs, filter, etc.')} title="More Actions" className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-all">
                <MoreHorizontal size={16} />
            </button>
            <button onClick={() => alert('Extension settings: Auto-update, etc.')} title="Settings" className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-all">
                <Settings size={16} />
            </button>
        </div>
      </div>
      
      <div className="relative px-2 pb-2">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
            <Search size={16} />
        </span>
        <input 
            type="text"
            placeholder="Search Extensions in Marketplace"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-gray-500"
        />
        <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white">
            <Filter size={16} />
        </button>
      </div>
      
      <div className="mt-1 px-2 text-[11px] text-[var(--color-text-secondary)]">
        By default, S.AI uses <a href="https://open-vsx.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Open VSX</a>. This can be changed in settings.
      </div>

      <div className="flex-1 overflow-y-auto p-2 mt-2 custom-scrollbar">
        {searchTerm ? (
            <>
                {filteredInstalled.length > 0 && (
                    <CollapsibleSection title="Installed" count={filteredInstalled.length}>
                        {filteredInstalled.map(ext => (
                            <ExtensionListItem
                                key={ext.id}
                                extension={ext}
                                isInstalled={true}
                                onInstall={() => onInstall(ext)}
                                onUninstall={() => onUninstall(ext.id)}
                            />
                        ))}
                    </CollapsibleSection>
                )}
                <CollapsibleSection title="Marketplace" count={searchResults.length} isLoading={isLoading}>
                    {searchResults.map(ext => (
                        <ExtensionListItem
                            key={ext.id}
                            extension={ext}
                            isInstalled={installedIds.has(ext.id)}
                            onInstall={() => onInstall(ext)}
                            onUninstall={() => onUninstall(ext.id)}
                        />
                    ))}
                    {!isLoading && searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">No results found.</div>
                    )}
                </CollapsibleSection>
            </>
        ) : (
            <>
                <CollapsibleSection title="Installed" count={installedExtensions.length}>
                    {installedExtensions.length > 0 ? (
                        installedExtensions.map(ext => (
                            <ExtensionListItem
                                key={ext.id}
                                extension={ext}
                                isInstalled={true}
                                onInstall={() => onInstall(ext)}
                                onUninstall={() => onUninstall(ext.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-xs italic">No extensions installed.</div>
                    )}
                </CollapsibleSection>

                <CollapsibleSection title="Recommended" count={recommended.length} isLoading={isLoadingRecommended}>
                    {recommended.map(ext => (
                        <ExtensionListItem
                            key={ext.id}
                            extension={ext}
                            isInstalled={installedIds.has(ext.id)}
                            onInstall={() => onInstall(ext)}
                            onUninstall={() => onUninstall(ext.id)}
                        />
                    ))}
                </CollapsibleSection>
            </>
        )}
      </div>
    </div>
  );
};

export default ExtensionsPane;
