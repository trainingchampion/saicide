import React from 'react';
import { Youtube, Instagram, Facebook, CheckCircle, X, ExternalLink } from 'lucide-react';

export interface PostPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
    mediaUrl: string;
    mediaType: 'video' | 'image' | 'audio';
    title: string;
    destination: string; // Channel name or profile
    isReal?: boolean;
}

const PostPreviewModal: React.FC<PostPreviewProps> = ({ isOpen, onClose, platform, mediaUrl, mediaType, title, destination, isReal }) => {
    if (!isOpen) return null;

    const platformDetails = {
        youtube: { icon: <Youtube className="w-6 h-6 text-red-500" />, name: "YouTube" },
        instagram: { icon: <Instagram className="w-6 h-6 text-pink-500" />, name: "Instagram" },
        facebook: { icon: <Facebook className="w-6 h-6 text-blue-500" />, name: "Facebook" },
        tiktok: { icon: <span className="font-bold text-xl">TikTok</span>, name: "TikTok" },
    }[platform];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-[#1e2227] rounded-2xl w-full max-w-lg text-white border border-gray-700 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#131b2c] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        {platformDetails.icon}
                        <h2 className="text-lg font-bold text-white">
                           {isReal ? 'Post Published' : 'Post Preview'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-2 text-green-400 mb-4">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Successfully {isReal ? 'published' : 'posted'} to {platformDetails.name}!</span>
                    </div>

                    <div className="bg-black/30 rounded-lg border border-gray-700">
                        {/* Post Header */}
                        <div className="p-3 flex items-center gap-3 border-b border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
                                {destination.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{destination}</p>
                                <p className="text-xs text-gray-400">Just now</p>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="aspect-video bg-black flex items-center justify-center">
                            {mediaType === 'video' || mediaType === 'audio' ? (
                                <video src={mediaUrl} controls className="w-full h-full object-contain" />
                            ) : (
                                <img src={mediaUrl} alt={title} className="max-h-full max-w-full object-contain" />
                            )}
                        </div>

                        {/* Post Footer */}
                        <div className="p-4">
                            <h3 className="font-bold">{title}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {isReal 
                                    ? "This content is now live on your account." 
                                    : "This is a simulated preview. The content was not posted to a live social media account."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                     {isReal && (
                         <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); alert("Redirecting to post..."); }}
                            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium text-sm transition-colors flex items-center gap-2"
                         >
                             View Live Post <ExternalLink size={14} />
                         </a>
                     )}
                     <button onClick={onClose} className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium text-sm transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPreviewModal;
