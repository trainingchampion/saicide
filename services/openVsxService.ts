
import { Extension } from '../types';
import { FALLBACK_EXTENSIONS } from '../constants';

interface OpenVsxExtension {
    namespace: string;
    name: string;
    version: string;
    displayName?: string;
    description?: string;
    files?: {
        icon?: string;
    };
    statistics?: {
      downloadCount?: number;
      averageRating?: number;
    };
}

const formatDownloads = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const mapOpenVsxData = (extensions: OpenVsxExtension[]): Extension[] => {
    if (!extensions) return [];
    return extensions.map(ext => ({
        id: `${ext.namespace}.${ext.name}`,
        name: ext.displayName || ext.name,
        publisher: ext.namespace,
        description: ext.description || '',
        iconUrl: ext.files?.icon || '', 
        downloads: ext.statistics?.downloadCount ? formatDownloads(ext.statistics.downloadCount) : '0',
        rating: ext.statistics?.averageRating || 4.5,
        category: 'Extension',
        isRecommended: false
    }));
};

const searchExtensions = async (query: string): Promise<Extension[]> => {
    const searchQuery = query.trim();
    
    // 1. Try local proxy first (avoids CORS if backend is running)
    try {
        const url = `/api/extensions?query=${encodeURIComponent(searchQuery)}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                return mapOpenVsxData(data);
            }
        }
    } catch (error) {
        // Silent catch for proxy failure
    }

    // 2. Fallback to direct Open VSX API
    // Using the search endpoint which supports CORS and querying
    try {
        const params = new URLSearchParams({
            query: searchQuery,
            size: '20',
            sortBy: searchQuery ? 'relevance' : 'downloadCount',
            sortOrder: 'desc'
        });
        const url = `https://open-vsx.org/api/-/search?${params}`;
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.extensions)) {
                return mapOpenVsxData(data.extensions);
            }
        }
    } catch (error) {
        // Silent catch for direct API failure
    }

    // 3. Fallback to static data so the UI never breaks
    console.warn("Using fallback extensions due to API unavailability.");
    if (searchQuery) {
        return FALLBACK_EXTENSIONS.filter(e => 
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            e.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    return FALLBACK_EXTENSIONS;
};

export default {
    searchExtensions
};
