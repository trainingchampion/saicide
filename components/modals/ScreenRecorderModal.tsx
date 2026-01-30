
import React, { useState, useRef, useEffect } from 'react';
import { 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    X, 
    Square, 
    Download, 
    RefreshCw, 
    Circle, 
    Pause, 
    Play,
    Sparkles, 
    Trash2, 
    GripHorizontal, 
    Monitor,
    StopCircle,
    Check,
    ChevronRight,
    Settings,
    RotateCcw,
    Save
} from 'lucide-react';
import creatorService from '../../services/creatorService';
import { Recording } from '../../types';

interface ScreenRecorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (recording: Recording) => void;
    activeCode?: string;
    terminalLogs?: string;
}

// iOS-style Toggle Switch Component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <button 
        onClick={onChange}
        disabled={disabled}
        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ease-in-out ${checked ? 'bg-[#34c759]' : 'bg-[#3a3a3c]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const ScreenRecorderModal: React.FC<ScreenRecorderModalProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState<'setup' | 'countdown' | 'recording' | 'preview'>('setup');
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isNoiseCancelOn, setIsNoiseCancelOn] = useState(true);
    const [recordingTime, setRecordingTime] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingMimeType, setRecordingMimeType] = useState<string>('video/webm');
    const [isPaused, setIsPaused] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);

    // Draggable States
    const [pipPos, setPipPos] = useState({ x: window.innerWidth - 320, y: 100 });
    const [controlPos, setControlPos] = useState({ x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 });
    
    // Refs
    const pipPosRef = useRef(pipPos);
    const controlPosRef = useRef(controlPos);
    const isDraggingPip = useRef(false);
    const isDraggingControl = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Stream Refs
    const screenStreamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    
    // Video Elements
    const cameraVideoRef = useRef<HTMLVideoElement>(null);

    // Initial Setup
    useEffect(() => {
        if (isOpen) {
            setStep('setup');
            setRecordedUrl(null);
            setRecordedBlob(null);
            setAiInsights(null);
            setRecordingTime(0);
            
            // Set initial positions
            setPipPos({ x: window.innerWidth - 320, y: 100 });
            setControlPos({ x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 });
            pipPosRef.current = { x: window.innerWidth - 320, y: 100 };
            controlPosRef.current = { x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 };
        } else {
            cleanup();
        }
    }, [isOpen]);

    // Camera Preview Management
    useEffect(() => {
        let active = true;
        
        const initCamera = async () => {
            if (!isOpen || !isCameraOn) {
                if (cameraStreamRef.current) {
                    cameraStreamRef.current.getTracks().forEach(t => t.stop());
                    cameraStreamRef.current = null;
                }
                return;
            }

            try {
                // If we already have a stream and it's active, don't re-request
                if (cameraStreamRef.current?.active) return;

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false // We handle audio separately to avoid feedback loop in preview
                });
                
                if (active) {
                    cameraStreamRef.current = stream;
                    if (cameraVideoRef.current) {
                        cameraVideoRef.current.srcObject = stream;
                    }
                } else {
                    stream.getTracks().forEach(t => t.stop());
                }
            } catch (e) {
                console.error("Camera error:", e);
                setIsCameraOn(false);
            }
        };

        initCamera();
        return () => { active = false; };
    }, [isOpen, isCameraOn]);

    // Timer
    useEffect(() => {
        let interval: any;
        if (step === 'recording' && !isPaused) {
            interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, isPaused]);

    // Countdown
    useEffect(() => {
        if (step === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                startRecording();
            }
        }
    }, [step, countdown]);

    const cleanup = () => {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        cameraStreamRef.current?.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };

    const handleStartSequence = async () => {
        try {
            // 0. Initialize AudioContext immediately to capture user gesture
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;

            // 1. Get Screen Stream First (User selects screen)
            const displayMedia = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'monitor' },
                audio: true 
            });
            screenStreamRef.current = displayMedia;

            // Handle user stopping share via browser UI
            displayMedia.getVideoTracks()[0].onended = () => stopRecording();

            // 2. Get Mic Stream if enabled
            if (isMicOn) {
                const micMedia = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: isNoiseCancelOn,
                        noiseSuppression: isNoiseCancelOn,
                        autoGainControl: isNoiseCancelOn
                    }
                });
                micStreamRef.current = micMedia;
            }

            // 3. Start Countdown
            setCountdown(3);
            setStep('countdown');

        } catch (e) {
            console.error("Failed to start:", e);
            alert("Could not start screen capture.");
        }
    };

    const startRecording = () => {
        if (!screenStreamRef.current) return;

        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;

        const dest = audioCtx.createMediaStreamDestination();

        // Mix Screen Audio
        if (screenStreamRef.current.getAudioTracks().length > 0) {
            const screenSource = audioCtx.createMediaStreamSource(screenStreamRef.current);
            const screenGain = audioCtx.createGain();
            screenGain.gain.value = 1.0;
            screenSource.connect(screenGain).connect(dest);
        }

        // Mix Mic Audio
        if (micStreamRef.current && micStreamRef.current.getAudioTracks().length > 0) {
            const micSource = audioCtx.createMediaStreamSource(micStreamRef.current);
            const micGain = audioCtx.createGain();
            micGain.gain.value = 1.0; // Boost mic slightly?
            micSource.connect(micGain).connect(dest);
        }

        // Combine Tracks
        const combinedTracks = [
            ...screenStreamRef.current.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ];
        const finalStream = new MediaStream(combinedTracks);

        // Init Recorder
        recordedChunksRef.current = [];
        let mimeType = 'video/webm;codecs=vp9';
        if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
        setRecordingMimeType(mimeType);

        try {
            const recorder = new MediaRecorder(finalStream, { mimeType });
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setRecordedBlob(blob);
                setRecordedUrl(url);
                setStep('preview');
                cleanup();
            };
            recorder.start(1000);
            mediaRecorderRef.current = recorder;
            setStep('recording');
        } catch (e) {
            console.error("Recorder error", e);
            alert("Failed to initialize recorder.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        } else {
            cleanup();
            setStep('preview'); // Fallback if something broke
        }
    };

    const handleSaveInternal = () => {
        if (!recordedUrl || !onSave) return;
        
        const sizeInMb = recordedBlob ? (recordedBlob.size / (1024 * 1024)).toFixed(1) : '0';
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const minutes = Math.floor(recordingTime / 60);
        const seconds = recordingTime % 60;
        const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const newRecording: Recording = {
            id: `rec-${Date.now()}`,
            name: `Capture ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            url: recordedUrl,
            size: `${sizeInMb}MB`,
            date: timestamp,
            duration: durationStr,
            mimeType: recordingMimeType
        };

        onSave(newRecording);
        onClose();
    };

    // --- Draggable Logic ---
    const handleMouseDown = (e: React.MouseEvent, target: 'pip' | 'control') => {
        if (target === 'pip') isDraggingPip.current = true;
        else isDraggingControl.current = true;

        const pos = target === 'pip' ? pipPosRef.current : controlPosRef.current;
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDraggingPip.current) {
            const newPos = { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y };
            pipPosRef.current = newPos;
            setPipPos(newPos);
        }
        if (isDraggingControl.current) {
            const newPos = { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y };
            controlPosRef.current = newPos;
            setControlPos(newPos);
        }
    };

    const handleMouseUp = () => {
        isDraggingPip.current = false;
        isDraggingControl.current = false;
    };

    const handleAIGenerate = async () => {
        setIsProcessingAI(true);
        try {
            const insights = await creatorService.runGenericTool({ prompt: 'Analyze this screen recording for pacing, clarity, and viral potential.' }, 'gemini-3-pro-preview', 'Video Review');
            setAiInsights(insights);
        } catch (e) { setAiInsights("Analysis failed."); }
        finally { setIsProcessingAI(false); }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] flex flex-col pointer-events-none font-sans"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Bubble (Visible in Setup, Recording, Countdown) */}
            {isCameraOn && step !== 'preview' && (
                <div 
                    className={`absolute z-[210] rounded-full overflow-hidden shadow-2xl border-4 border-white/20 pointer-events-auto cursor-move transition-transform active:scale-95 group`}
                    style={{ 
                        width: step === 'setup' ? 180 : 220, 
                        height: step === 'setup' ? 180 : 220,
                        left: step === 'setup' ? '50%' : pipPos.x, 
                        top: step === 'setup' ? '20%' : pipPos.y,
                        transform: step === 'setup' ? 'translateX(-50%)' : 'none'
                    }}
                    onMouseDown={(e) => step !== 'setup' && handleMouseDown(e, 'pip')}
                >
                    <video 
                        ref={cameraVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover transform scale-x-[-1] bg-black"
                    />
                    {step === 'recording' && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <GripHorizontal className="text-white" />
                        </div>
                    )}
                </div>
            )}

            {/* SETUP CARD */}
            {step === 'setup' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in">
                    <div className="w-[360px] bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col gap-6 relative mt-32">
                        {/* Header */}
                        <div className="flex justify-between items-center px-1">
                            <div className="flex flex-col">
                                <h2 className="text-white font-bold text-lg">Studio Recorder</h2>
                                <p className="text-[10px] text-gray-400 font-medium">Configure your session</p>
                            </div>
                            <button onClick={onClose} className="bg-[#2c2c2e] hover:bg-[#3a3a3c] p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Controls List */}
                        <div className="bg-[#2c2c2e]/50 rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                            {/* Camera */}
                            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <Video size={16} fill="currentColor" />
                                    </div>
                                    <span className="text-sm text-white font-medium">Camera</span>
                                </div>
                                <ToggleSwitch checked={isCameraOn} onChange={() => setIsCameraOn(!isCameraOn)} />
                            </div>

                            {/* Mic */}
                            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                        <Mic size={16} fill="currentColor" />
                                    </div>
                                    <span className="text-sm text-white font-medium">Microphone</span>
                                </div>
                                <ToggleSwitch checked={isMicOn} onChange={() => setIsMicOn(!isMicOn)} />
                            </div>

                            {/* Noise Cancel */}
                            {isMicOn && (
                                <div className="flex items-center justify-between p-4 bg-[#2c2c2e]/80">
                                    <div className="flex items-center gap-3 pl-1">
                                        <Sparkles size={18} className={isNoiseCancelOn ? "text-purple-400" : "text-gray-500"} />
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">Voice Isolation</span>
                                            <span className="text-[10px] text-gray-400">AI Noise Reduction</span>
                                        </div>
                                    </div>
                                    <ToggleSwitch checked={isNoiseCancelOn} onChange={() => setIsNoiseCancelOn(!isNoiseCancelOn)} />
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleStartSequence}
                            className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-[20px] text-sm tracking-wide shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Circle size={16} fill="currentColor" className="text-red-500" />
                            Start Recording
                        </button>
                    </div>
                </div>
            )}

            {/* COUNTDOWN OVERLAY */}
            {step === 'countdown' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-auto z-[300]">
                    <div className="text-[150px] font-black text-white drop-shadow-2xl animate-ping">
                        {countdown}
                    </div>
                </div>
            )}

            {/* RECORDING CONTROL PILL */}
            {step === 'recording' && (
                <div 
                    className="absolute pointer-events-auto z-[220]"
                    style={{ left: controlPos.x, top: controlPos.y }}
                    onMouseDown={(e) => handleMouseDown(e, 'control')}
                >
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 flex items-center gap-4 shadow-2xl cursor-move hover:scale-105 transition-transform group">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-mono text-white text-sm font-medium tracking-widest">
                                {Math.floor(recordingTime/60)}:{String(recordingTime%60).padStart(2,'0')}
                            </span>
                        </div>

                        <div className="h-4 w-px bg-white/20" />

                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsPaused(!isPaused)}
                                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                            >
                                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                            </button>
                            <button 
                                onClick={stopRecording}
                                className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white transition-colors shadow-lg"
                            >
                                <Square size={14} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW */}
            {step === 'preview' && recordedUrl && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-[#1c1c1e] w-full max-w-5xl rounded-[24px] border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#2c2c2e]/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Monitor size={18} className="text-gray-400" /> Recording Preview
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 bg-black flex items-center justify-center p-4">
                                <video src={recordedUrl} controls className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/5" />
                            </div>
                            
                            <div className="w-80 bg-[#1c1c1e] border-l border-white/5 p-6 flex flex-col gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Neural Review</h3>
                                    <div className="bg-white/5 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center border border-white/5">
                                        {isProcessingAI ? (
                                            <>
                                                <RefreshCw className="animate-spin text-purple-500 mb-2" size={20} />
                                                <span className="text-xs text-gray-400">Analyzing content...</span>
                                            </>
                                        ) : aiInsights ? (
                                            <p className="text-xs text-gray-300 leading-relaxed text-left">{aiInsights}</p>
                                        ) : (
                                            <button 
                                                onClick={handleAIGenerate}
                                                className="flex flex-col items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                            >
                                                <Sparkles size={24} />
                                                <span className="text-xs font-medium">Generate Summary</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <button 
                                        onClick={handleSaveInternal}
                                        className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                        <Save size={16} /> Save to Library
                                    </button>
                                    <button 
                                        onClick={() => setStep('setup')}
                                        className="w-full py-3 bg-[#2c2c2e] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3a3a3c] transition-colors"
                                    >
                                        <RotateCcw size={16} /> New Recording
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScreenRecorderModal;
