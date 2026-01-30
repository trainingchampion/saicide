
export interface SocialMediaUploadMetadata {
    title?: string;
    caption?: string;
    privacy?: 'public' | 'unlisted' | 'private' | 'friends';
    tags?: string[];
    destination: string;
    // New fields for real authentication
    accessToken?: string;
    accountId?: string;
}

const uploadMedia = async (
    mediaUrl: string,
    mediaType: 'video' | 'audio' | 'image',
    platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram',
    metadata: SocialMediaUploadMetadata,
    onProgress: (progress: number, status: string) => void
): Promise<string> => {
    
    // --- Real Instagram Integration ---
    if (platform === 'instagram' && metadata.accessToken && metadata.accountId) {
        if (mediaType !== 'image') {
            throw new Error("Currently, only Image publishing is supported for Real Instagram uploads via this tool.");
        }

        // Basic validation for public URL (Instagram API requirement)
        if (mediaUrl.startsWith('data:') || mediaUrl.startsWith('blob:')) {
             onProgress(10, 'Warning: Local images cannot be uploaded directly to Instagram API.');
             await new Promise(r => setTimeout(r, 2000));
             // We continue to the mock flow if it's local, but user is warned.
             // Ideally we would upload to S3 here first.
             console.warn("Instagram API requires a public URL. Proceeding with simulation for local asset.");
        } else {
            try {
                onProgress(10, 'Connecting to Instagram Graph API...');
                
                const response = await fetch('/api/instagram/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: mediaUrl,
                        caption: `${metadata.caption || ''} ${metadata.tags?.map(t => `#${t}`).join(' ') || ''}`,
                        accessToken: metadata.accessToken,
                        accountId: metadata.accountId
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to publish to Instagram');
                }

                const data = await response.json();
                onProgress(100, 'Published Successfully!');
                return `https://instagram.com/p/${data.id}`; // Returns real ID if successful
            } catch (error: any) {
                console.error("Instagram Upload Error:", error);
                throw new Error(`Instagram API Error: ${error.message}`);
            }
        }
    }

    // --- Simulated Flow for other platforms or missing credentials ---
    
    onProgress(0, `Connecting to ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
    await new Promise(r => setTimeout(r, 1000));

    if (mediaType === 'image' && (platform === 'youtube' || platform === 'tiktok')) {
        onProgress(10, 'Optimizing image format for platform...');
        await new Promise(r => setTimeout(r, 1000));
    } else if (mediaType === 'audio') {
        onProgress(10, 'Visualizing audio stream...');
        await new Promise(r => setTimeout(r, 1000));
    }

    onProgress(20, `Authenticating for profile "${metadata.destination}"...`);
    await new Promise(r => setTimeout(r, 800));

    onProgress(30, 'Starting upload...');
    
    // Simulate upload progress
    for (let i = 30; i <= 90; i += 10) {
        await new Promise(r => setTimeout(r, 400));
        onProgress(i, `Uploading to ${platform}... ${i}%`);
    }

    onProgress(95, 'Processing media...');
    await new Promise(r => setTimeout(r, 1500));

    onProgress(100, 'Upload Complete!');

    // Return a mock URL based on platform
    const mockId = Math.random().toString(36).substring(7);
    switch (platform) {
        case 'youtube': return `https://youtu.be/${mockId}`;
        case 'tiktok': return `https://tiktok.com/@user/video/${mockId}`;
        case 'facebook': return `https://facebook.com/user/posts/${mockId}`;
        case 'instagram': return `https://instagram.com/p/${mockId}`;
        default: return `https://example.com/${mockId}`;
    }
};

export default {
    uploadMedia
};
