
import React, { useState, useEffect } from 'react';
import socialMediaService, { SocialMediaUploadMetadata } from '../../services/socialMediaService';
import { ICONS } from '../../constants';
import { PostPreviewProps } from './PostPreviewModal';
import { Info } from 'lucide-react';

interface SocialMediaUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    mediaType: 'video' | 'audio' | 'image';
    platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
    defaultTitle?: string;
    onPostComplete: (data: Omit<PostPreviewProps, 'isOpen' | 'onClose'>) => void;
}

const SocialMediaUploadModal: React.FC<SocialMediaUploadModalProps> = ({ isOpen, onClose, mediaUrl, mediaType, platform, defaultTitle, onPostComplete }) => {
    const [title, setTitle] = useState(defaultTitle || '');
    const [caption, setCaption] = useState('');
    const [destination, setDestination] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private' | 'friends'>('public');
    const [tags, setTags] = useState('');
    
    // Credentials for Real API
    const [accessToken, setAccessToken] = useState('');
    const [accountId, setAccountId] = useState('');
    const [useRealApi, setUseRealApi] = useState(false);
    
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(defaultTitle || `Generated ${mediaType} - S.AI`);
            setCaption(`Created with S.AI Cloud Studio using GenAI.\n\n#AI #Generated #${mediaType}`);
            setTags('ai, generated, cloud-studio');
            setPrivacy('public');
            setDestination('');
            setIsUploading(false);
            setProgress(0);
            setStatusMessage('');
            setError('');
            
            // Load saved creds if available (simple implementation)
            const savedToken = localStorage.getItem('ig_access_token');
            const savedId = localStorage.getItem('ig_account_id');
            if (savedToken) setAccessToken(savedToken);
            if (savedId) setAccountId(savedId);
            setUseRealApi(!!(savedToken && savedId && platform === 'instagram'));
        }
    }, [isOpen, defaultTitle, mediaType, platform]);

    const handleUpload = async () => {
        if (!destination.trim() && !useRealApi) return;
        if (useRealApi && (!accessToken || !accountId)) {
            setError("Access Token and Account ID are required for real posting.");
            return;
        }

        setIsUploading(true);
        setError('');
        
        try {
            // Save creds for convenience
            if (useRealApi && platform === 'instagram') {
                localStorage.setItem('ig_access_token', accessToken);
                localStorage.setItem('ig_account_id', accountId);
            }

            const metadata: SocialMediaUploadMetadata = {
                title,
                caption,
                destination: useRealApi ? 'Instagram API' : destination,
                privacy,
                tags: tags.split(',').map(t => t.trim()),
                accessToken: useRealApi ? accessToken : undefined,
                accountId: useRealApi ? accountId : undefined,
            };

            const url = await socialMediaService.uploadMedia(mediaUrl, mediaType, platform, metadata, (prog, msg) => {
                setProgress(prog);
                setStatusMessage(msg);
            });
            
            onPostComplete({
                platform,
                mediaUrl,
                mediaType,
                title: title || caption,
                destination: useRealApi ? 'Real Instagram Account' : destination,
                isReal: useRealApi
            });
            onClose();

        } catch (error: any) {
            setError(error.message || 'Upload failed. Please try again.');
            setStatusMessage('Failed.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    const platformIcon = 
        platform === 'youtube' ? ICONS.YOUTUBE :
        platform === 'tiktok' ? ICONS.TIKTOK :
        platform === 'facebook' ? ICONS.FACEBOOK :
        ICONS.INSTAGRAM;

    const platformColor =
        platform === 'youtube' ? 'text-red-500' :
        platform === 'tiktok' ? 'text-white' :
        platform === 'facebook' ? 'text-blue-500' :
        'text-pink-500';
    
    const buttonClass = 
        platform === 'youtube' ? 'bg-red-600 hover:bg-red-700' :
        platform === 'tiktok' ? 'bg-gray-700 hover:bg-gray-600' :
        platform === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' :
        'bg-pink-600 hover:bg-pink-700';

    const ringClass =
        platform === 'youtube' ? 'focus:ring-red-600' :
        platform === 'tiktok' ? 'focus:ring-gray-600' :
        platform === 'facebook' ? 'focus:ring-blue-600' :
        'focus:ring-pink-500';

    const destinationLabel =
        platform === 'facebook' ? 'Facebook Page / Profile' :
        platform === 'instagram' ? 'Instagram Profile' :
        platform === 'tiktok' ? 'TikTok Profile' :
        'Destination Profile';
        
    const destinationPlaceholder = 
        platform === 'facebook' ? 'e.g., S.AI Official' :
        platform === 'instagram' ? 'e.g., @sai_studio' :
        platform === 'tiktok' ? 'e.g., @sai.official' :
        'Enter profile name';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-2xl text-white border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3 capitalize">
                        <span className={platformColor}>{platformIcon}</span>
                        Upload to {platform}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden relative">
                            {mediaType === 'video' && <video src={mediaUrl} controls className="w-full h-full object-contain" />}
                            {mediaType === 'image' && <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain" />}
                            {mediaType === 'audio' && (
                                <div className="text-center p-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                    </div>
                                    <audio src={mediaUrl} controls className="w-full" />
                                    <p className="text-xs text-gray-400 mt-2">Visualizer will be added for video platforms</p>
                                </div>
                            )}
                            
                            {/* Warning for Local Files on Real API */}
                            {useRealApi && (mediaUrl.startsWith('blob:') || mediaUrl.startsWith('data:')) && (
                                <div className="absolute top-2 left-2 right-2 bg-yellow-500/90 text-black text-[10px] p-2 rounded font-bold flex items-start gap-1">
                                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                                    <span>Instagram API requires a public URL. Local/Generated files may fail unless hosted.</span>
                                </div>
                            )}
                        </div>
                        {isUploading && (
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{statusMessage}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-300 ${platform === 'youtube' ? 'bg-red-600' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {platform === 'instagram' && (
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-white flex items-center gap-1">
                                        Enable Real Publishing API
                                    </label>
                                    <input 
                                        type="checkbox" 
                                        checked={useRealApi} 
                                        onChange={(e) => setUseRealApi(e.target.checked)} 
                                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 accent-pink-500"
                                    />
                                </div>
                                
                                {useRealApi && (
                                    <div className="space-y-2 mt-3 animate-fade-in">
                                        <div>
                                            <label className="text-[10px] text-gray-400 block mb-1">Instagram Business Account ID</label>
                                            <input
                                                type="text"
                                                value={accountId}
                                                onChange={e => setAccountId(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-pink-500 outline-none"
                                                placeholder="17841..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 block mb-1">User Access Token</label>
                                            <input
                                                type="password"
                                                value={accessToken}
                                                onChange={e => setAccessToken(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-pink-500 outline-none"
                                                placeholder="EAAG..."
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500 mt-1">Requires 'instagram_content_publish' permission.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!useRealApi && (
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">{destinationLabel}</label>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    disabled={isUploading}
                                    placeholder={destinationPlaceholder}
                                    className={`w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringClass}`}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">{platform === 'youtube' ? 'Description' : 'Caption'}</label>
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                rows={platform === 'youtube' ? 4 : 5}
                                disabled={isUploading}
                                placeholder="Write a catchy caption..."
                                className={`w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${ringClass}`}
                            />
                        </div>
                        
                        {!useRealApi && (
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">Visibility</label>
                                <select
                                    value={privacy}
                                    onChange={e => setPrivacy(e.target.value as any)}
                                    disabled={isUploading}
                                    className={`w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringClass}`}
                                >
                                    <option value="public">Public</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || (!destination.trim() && !useRealApi)}
                            className={`w-full px-4 py-2 rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonClass}`}
                        >
                            {isUploading ? 'Uploading...' : (useRealApi ? 'Publish via API' : 'Simulate Publish')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaUploadModal;
