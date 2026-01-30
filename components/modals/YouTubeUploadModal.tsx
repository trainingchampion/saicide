import React, { useState, useEffect } from 'react';
import youtubeService, { YouTubeUploadMetadata } from '../../services/youtubeService';
import { ICONS } from '../../constants';
import { PostPreviewProps } from './PostPreviewModal';

interface YouTubeUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    mediaType: 'video' | 'audio' | 'image';
    defaultTitle?: string;
    onPostComplete: (data: Omit<PostPreviewProps, 'isOpen' | 'onClose'>) => void;
}

const YouTubeUploadModal: React.FC<YouTubeUploadModalProps> = ({ isOpen, onClose, mediaUrl, mediaType, defaultTitle, onPostComplete }) => {
    const [title, setTitle] = useState(defaultTitle || '');
    const [channelName, setChannelName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
    const [tags, setTags] = useState('');
    
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(defaultTitle || `Generated ${mediaType} - S.AI`);
            setDescription(`Created with S.AI Cloud Studio using GenAI.\n\n#AI #Generated #${mediaType}`);
            setTags('ai, generated, cloud-studio');
            setPrivacy('public');
            setChannelName('');
            setIsUploading(false);
            setProgress(0);
            setStatusMessage('');
        }
    }, [isOpen, defaultTitle, mediaType]);

    const handleUpload = async () => {
        if (!title.trim() || !channelName.trim()) return;
        setIsUploading(true);
        
        try {
            const metadata: YouTubeUploadMetadata = {
                title,
                channelName,
                description,
                privacy,
                tags: tags.split(',').map(t => t.trim()),
            };

            const url = await youtubeService.uploadMedia(mediaUrl, mediaType, metadata, (prog, msg) => {
                setProgress(prog);
                setStatusMessage(msg);
            });
            
            // Trigger the post preview modal in the parent
            onPostComplete({
                platform: 'youtube',
                mediaUrl,
                mediaType,
                title,
                destination: channelName,
            });
            onClose(); // Close this modal

        } catch (error) {
            setStatusMessage('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-2xl text-white border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        {ICONS.YOUTUBE}
                        Upload to YouTube
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                            {mediaType === 'video' && <video src={mediaUrl} controls className="w-full h-full object-contain" />}
                            {mediaType === 'image' && <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain" />}
                            {mediaType === 'audio' && (
                                <div className="text-center p-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                    </div>
                                    <audio src={mediaUrl} controls className="w-full" />
                                    <p className="text-xs text-gray-400 mt-2">Will be converted to video</p>
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
                                    <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={isUploading}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">YouTube Channel</label>
                            <input
                                type="text"
                                value={channelName}
                                onChange={e => setChannelName(e.target.value)}
                                disabled={isUploading}
                                placeholder="e.g., My Awesome Channel"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                disabled={isUploading}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Visibility</label>
                            <select
                                value={privacy}
                                onChange={e => setPrivacy(e.target.value as any)}
                                disabled={isUploading}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            >
                                <option value="public">Public</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !title.trim() || !channelName.trim()}
                            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Video'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YouTubeUploadModal;
