import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types';
import { Video, VideoOff, Mic, MicOff, ScreenShare, ScreenShareOff, Phone, MessageSquare, X, Send, Settings, Smile, ChevronDown, ChevronUp, Hand, GripHorizontal, Minimize2, Maximize2, MoreVertical, Circle, Square } from 'lucide-react';
import { TeamChannel } from './TeamChannel';
import LiveSessionChat from './LiveSessionChat';

interface VideoGridProps {
    teamMembers: TeamMember[];
    currentUser: TeamMember;
    onStopSession: () => void;
    isMinimized: boolean;
    onToggleMinimize: () => void;
    isMicOn: boolean;
    onToggleMic: () => void;
    onToggleLiveChat: () => void;
}

const VideoTile: React.FC<{ member: TeamMember, stream?: MediaStream, isLocal?: boolean }> = ({ member, stream, isLocal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-48 h-28 bg-gray-900/80 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-gray-600 transition-all shadow-lg flex-shrink-0">
            {stream ? (
                <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-gray-300">
                        {member.initials}
                    </div>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-white text-xs font-semibold drop-shadow-md">{member.name} {isLocal && '(You)'}</span>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                 <Mic size={12} className="text-white" />
            </div>
        </div>
    );
};

const useDraggable = (initialPos: { x: number, y: number }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e: React.MouseEvent) => {
      // Prevent dragging if clicking buttons/inputs inside the drag handle area
      if ((e.target as HTMLElement).closest('button, input, select')) return;
      
      setIsDragging(true);
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y
      };
    };
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          setPos({
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y
          });
        }
      };
      const handleMouseUp = () => setIsDragging(false);
  
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);
  
    return { pos, handleMouseDown, isDragging };
};


const VideoGrid: React.FC<VideoGridProps> = ({ teamMembers, currentUser, onStopSession, isMinimized, onToggleMinimize, isMicOn, onToggleMic, onToggleLiveChat }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    
    // UI Controls State
    const [isVideosVisible, setIsVideosVisible] = useState(true);
    const [showReactions, setShowReactions] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, left: number }[]>([]);
    
    // Draggable States
    const { pos: controlsPos, handleMouseDown: controlsDragHandler } = useDraggable({ 
        x: window.innerWidth / 2 - 250, 
        y: window.innerHeight - 180 
    });
    
    // Recording Timer
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const stopStream = (stream: MediaStream | null) => {
        stream?.getTracks().forEach(track => track.stop());
    };

    const handleToggleCamera = async () => {
        if (isCameraOn) {
            stopStream(localStream);
            setLocalStream(null);
            setIsCameraOn(false);
        } else {
            if (isScreenSharing) await handleToggleScreenShare(); // Turn off screen share first
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                setIsCameraOn(true);
            } catch (e) { console.error(e); }
        }
    };

    const handleToggleScreenShare = async () => {
        if (isScreenSharing) {
            stopStream(localStream);
            setLocalStream(null);
            setIsScreenSharing(false);
        } else {
             if (isCameraOn) handleToggleCamera(); // Turn off camera first
             try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setLocalStream(stream);
                setIsScreenSharing(true);
             } catch(e) { console.error(e); }
        }
    };
    
    const handleToggleRecording = () => {
        setIsRecording(!isRecording);
    };

    const handleReaction = (emoji: string) => {
        const id = Date.now();
        // Random horizontal position for "floating" effect
        const left = 40 + Math.random() * 20; 
        setFloatingEmojis(prev => [...prev, { id, emoji, left }]);
        setShowReactions(false);
        
        // Cleanup after animation
        setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(e => e.id !== id));
        }, 2000);
    };

    useEffect(() => {
        // Automatically try to start camera when component mounts
        handleToggleCamera();
        // Cleanup on unmount
        return () => stopStream(localStream);
    }, []);

    const onlineMembers = teamMembers.filter(m => m.status === 'online');

    return (
        <>
            {/* Recording Indicator */}
            {isRecording && (
                <div className="fixed top-24 left-6 z-[200] flex items-center gap-2 bg-red-600/90 backdrop-blur text-white px-3 py-1.5 rounded-full shadow-lg animate-pulse font-mono text-sm">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    REC {formatTime(recordingSeconds)}
                </div>
            )}

            {/* Floating Emojis Layer */}
            <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
                {floatingEmojis.map(fe => (
                    <div 
                        key={fe.id}
                        className="absolute bottom-32 text-4xl animate-float-up opacity-0 transition-all duration-[2000ms]"
                        style={{ 
                            left: `${fe.left}%`,
                            transform: 'translateY(-200px)', 
                        }}
                    >
                        <style>{`
                            @keyframes floatUp {
                                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                                20% { transform: translateY(-40px) scale(1.2); opacity: 1; }
                                100% { transform: translateY(-300px) scale(1); opacity: 0; }
                            }
                        `}</style>
                        <div style={{ animation: 'floatUp 2s ease-out forwards' }}>
                            {fe.emoji}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Control Bar */}
            <div 
                className={`fixed z-[200] flex flex-col items-center gap-4 animate-slide-in-from-bottom transition-all duration-300 ${isMinimized ? 'right-0 top-1/2 -translate-y-1/2' : ''}`}
                style={!isMinimized ? { 
                    left: `${controlsPos.x}px`, 
                    top: `${controlsPos.y}px`,
                    width: 'fit-content',
                    maxWidth: '100vw'
                } : {}}
            >
                
                {isMinimized ? (
                    // Compact Pill Mode - Anchored to Right
                    <div 
                        className="bg-[#131b2c]/90 backdrop-blur-md border border-gray-700/50 rounded-l-full py-3 px-3 flex flex-col items-center gap-4 shadow-2xl transition-colors hover:border-cyan-500"
                    >
                        <div className="flex flex-col items-center gap-2 border-b border-gray-700 pb-3">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </div>
                        
                        <button 
                            onClick={onToggleMic}
                            className={`p-2 rounded-full ${isMicOn ? 'text-white hover:bg-white/10' : 'text-red-500 bg-red-500/10'}`}
                        >
                            {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>

                        <button 
                            onClick={onToggleMinimize}
                            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                            title="Expand Controls"
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                ) : (
                    // Full Control Mode
                    <div className="flex flex-col items-center">
                        {/* Video Grid Container */}
                        <div className={`transition-all duration-300 ease-in-out w-full ${!isVideosVisible ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-4'}`}>
                            <div className="flex justify-center gap-3 overflow-x-auto w-full pb-2 no-scrollbar px-4">
                                <VideoTile member={currentUser} stream={localStream} isLocal={true} />
                                {onlineMembers.filter(m => m.id !== currentUser.id).slice(0, 4).map(member => (
                                    <VideoTile key={member.id} member={member} />
                                ))}
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="relative bg-[#131b2c]/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-2 px-3 flex items-center gap-3 shadow-2xl">
                            
                            {/* Drag Handle */}
                            <div 
                                className="cursor-move text-gray-600 hover:text-gray-400 flex items-center px-1"
                                onMouseDown={controlsDragHandler}
                                title="Drag to move"
                            >
                                <GripHorizontal size={18} />
                            </div>

                            {/* Reactions Popup */}
                            {showReactions && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1e2227] border border-gray-700 rounded-full p-2 flex gap-2 shadow-xl animate-fade-in whitespace-nowrap">
                                    {['👏', '👍', '❤️', '😂', '😮', '🎉'].map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => handleReaction(emoji)}
                                            className="p-2 hover:bg-white/10 rounded-full text-xl transition-colors hover:scale-110 active:scale-95"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Settings Popup */}
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-4 w-64 bg-[#1e2227] border border-gray-700 rounded-xl p-4 shadow-xl animate-fade-in text-left">
                                    <h3 className="font-bold text-white mb-3 text-sm">Session Settings</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Camera</label>
                                            <select className="w-full bg-black/30 border border-gray-600 rounded text-xs p-1.5 text-white outline-none">
                                                <option>FaceTime HD Camera</option>
                                                <option>External Webcam</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Microphone</label>
                                            <select className="w-full bg-black/30 border border-gray-600 rounded text-xs p-1.5 text-white outline-none">
                                                <option>Default - MacBook Pro Mic</option>
                                                <option>External Mic</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Speaker</label>
                                            <select className="w-full bg-black/30 border border-gray-600 rounded text-xs p-1.5 text-white outline-none">
                                                <option>Default - MacBook Pro Speakers</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowSettings(false)} className="mt-3 w-full bg-[var(--color-accent)] text-white text-xs py-1.5 rounded hover:bg-[var(--color-accent-hover)]">Done</button>
                                </div>
                            )}

                            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                                <button 
                                    onClick={onToggleMinimize} 
                                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Compact Mode"
                                >
                                    <Minimize2 size={18} />
                                </button>
                                <button 
                                    onClick={() => setIsVideosVisible(!isVideosVisible)} 
                                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title={!isVideosVisible ? "Show Videos" : "Hide Videos"}
                                >
                                    {!isVideosVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={onToggleMic} 
                                    className={`p-3 rounded-full transition-all duration-200 ${isMicOn ? 'bg-gray-700/50 hover:bg-gray-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`} 
                                    title={isMicOn ? "Mute" : "Unmute"}
                                >
                                    {isMicOn ? <Mic size={20}/> : <MicOff size={20} />}
                                </button>
                                <button 
                                    onClick={handleToggleCamera} 
                                    className={`p-3 rounded-full transition-all duration-200 ${isCameraOn ? 'bg-gray-700/50 hover:bg-gray-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`} 
                                    title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                                >
                                    {isCameraOn ? <Video size={20}/> : <VideoOff size={20} />}
                                </button>
                            </div>

                            <div className="w-px h-8 bg-gray-700/50 mx-1"></div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleToggleScreenShare} 
                                    className={`p-3 rounded-full transition-all duration-200 ${isScreenSharing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-700/50 hover:bg-gray-600 text-white'}`} 
                                    title="Share Screen"
                                >
                                    {isScreenSharing ? <ScreenShareOff size={20} /> : <ScreenShare size={20} />}
                                </button>
                                <button 
                                    onClick={handleToggleRecording} 
                                    className={`p-3 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700/50 hover:bg-gray-600 text-white'}`} 
                                    title={isRecording ? "Stop Recording" : "Record Session"}
                                >
                                    {isRecording ? <Square size={20} fill="currentColor" /> : <Circle size={20} fill="currentColor" className="text-red-500" />}
                                </button>
                                <button 
                                    onClick={() => setIsHandRaised(!isHandRaised)} 
                                    className={`p-3 rounded-full transition-all duration-200 ${isHandRaised ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-700/50 hover:bg-gray-600 text-white'}`} 
                                    title="Raise Hand"
                                >
                                    <Hand size={20} />
                                </button>
                                <button 
                                    onClick={() => setShowReactions(!showReactions)} 
                                    className={`p-3 rounded-full transition-all duration-200 ${showReactions ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-white'}`} 
                                    title="Reactions"
                                >
                                    <Smile size={20} />
                                </button>
                            </div>

                            <div className="w-px h-8 bg-gray-700/50 mx-1"></div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={onToggleLiveChat} 
                                    className={`p-3 rounded-full transition-all duration-200 relative bg-gray-700/50 hover:bg-gray-600 text-white`} 
                                    title="Session Chat"
                                >
                                    <MessageSquare size={20} />
                                </button>
                                <button 
                                    onClick={() => setShowSettings(!showSettings)} 
                                    className={`p-3 rounded-full transition-all duration-200 ${showSettings ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-white'}`} 
                                    title="Settings"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>

                            <button 
                                onClick={onStopSession} 
                                className="ml-3 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20" 
                                title="End Session"
                            >
                                <Phone size={18} className="fill-current" />
                                <span className="hidden md:inline">Leave</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default VideoGrid;
