
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Phone, 
    RefreshCw, 
    Volume2,
    VolumeX,
    Wifi,
    Mic,
    MicOff,
    Activity,
    PhoneOff,
    Bot
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import aiService from '../services/geminiService';

// Audio decoding utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MicaAssistant: React.FC = () => {
    const [connectionState, setConnectionState] = useState<'idle' | 'ringing' | 'connected' | 'listening' | 'connecting' | 'speaking'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const recognitionRef = useRef<any>(null);

    const speak = async (text: string) => {
        if (isMuted) return;
        
        if (currentSourceRef.current) {
            currentSourceRef.current.stop();
        }

        setConnectionState('speaking');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const ctx = audioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.onended = () => {
                    setConnectionState('listening');
                    startListening();
                };
                currentSourceRef.current = source;
                source.start();
            } else {
                setConnectionState('listening');
                startListening();
            }
        } catch (e) {
            console.error("Speech synthesis failed:", e);
            setConnectionState('listening');
            startListening();
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("STT not supported");
            return;
        }

        if (connectionState === 'speaking' || connectionState === 'connecting') return;

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setConnectionState('listening');
        
        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                processUserIntent(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            if (connectionState !== 'idle' && event.error !== 'no-speech') {
                console.error("STT Error", event.error);
                setTimeout(startListening, 1000);
            }
        };
        
        recognition.onend = () => {
            if (connectionState === 'listening') {
                // If it ends naturally without result, restart listening
                setTimeout(startListening, 100);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Prevent restart on manual stop
            recognitionRef.current.stop();
        }
    };

    const processUserIntent = async (prompt: string) => {
        setConnectionState('connecting');
        try {
            const res = await aiService.getChatResponse({
                prompt,
                modelId: 'gemini-3-pro-preview',
                useGoogleSearch: true,
                systemInstruction: `You are Mica, the integrated neural voice for Sai. 
                Full Awareness: 
                - You are inside Sai, a multimodal, AI-native cloud environment.
                - Features at your command: Universal Terminal, Cloud Deployment (AWS/GCP/Azure/Netlify), Docker Studio, Terraform Generator, UX Stitch (AI Design), Security Sentinel (Logic scan/OWASP), and collaborative Live Meetings.
                - You have ACTIVE ACCESS TO GOOGLE SEARCH. Use it to answer questions about the world, current events, technical documentation, or any topic the user asks about that requires external knowledge.
                - You have deep world knowledge across all programming languages, infrastructure patterns, and tech stacks.
                Behavior: 
                - Voice interaction ONLY. Be concise, professional, and friendly.
                - Action: Respond verbally. If the user asks for complex code, summarize the architectural approach and core logic in words. 
                - If you search for something, integrate the findings naturally into your spoken response without reading raw URLs.
                - You represent the peak of Collective Intelligence within Sai.`
            });
            speak(res.text || "I've processed your request. How else can I help?");
        } catch (e) {
            speak("I'm having trouble connecting to my neural core. Could you repeat that?");
        }
    };

    const handleToggleLink = async () => {
        if (connectionState === 'idle') {
            setConnectionState('ringing');
            await new Promise(r => setTimeout(r, 1500));
            setConnectionState('connected');
            
            const intro = "Neural link established in Sai. I am Mica. What can I help you build today?";
            speak(intro);
        } else {
            handleDisconnect();
        }
    };

    const handleDisconnect = () => {
        if (currentSourceRef.current) {
            currentSourceRef.current.stop();
        }
        stopListening();
        setConnectionState('idle');
    };

    const getStatusText = () => {
        switch (connectionState) {
            case 'ringing': return 'CONNECTING...';
            case 'connected': return 'LINK ACTIVE';
            case 'listening': return 'LISTENING...';
            case 'connecting': return 'THINKING...';
            case 'speaking': return 'MICA SPEAKING';
            default: return 'TALK TO MICA';
        }
    };

    const getPillColor = () => {
        if (connectionState === 'idle') return 'bg-[#0f1117]/90';
        if (connectionState === 'ringing') return 'bg-amber-500/20 border-amber-500/40';
        if (connectionState === 'listening') return 'bg-emerald-500/20 border-emerald-500/40';
        if (connectionState === 'connecting') return 'bg-blue-500/20 border-blue-500/40';
        return 'bg-cyan-500/20 border-cyan-500/40';
    };

    const getDotColor = () => {
        if (connectionState === 'idle') return 'bg-[#10b981]/40';
        if (connectionState === 'ringing') return 'bg-amber-400 animate-ping';
        if (connectionState === 'listening') return 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]';
        if (connectionState === 'connecting') return 'bg-blue-500 animate-spin';
        return 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]';
    };
    
    if (connectionState === 'idle') {
        return (
            <button 
                onClick={handleToggleLink}
                className="fixed bottom-8 right-8 z-[999] w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl text-white hover:scale-110 transition-transform duration-300 animate-fade-in group"
                title="Talk to Mica"
            >
                <Bot size={32} />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping opacity-75 group-hover:opacity-100"></div>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50"></div>
            </button>
        );
    }

    return (
        <div 
            className="fixed bottom-8 right-8 z-[999] flex flex-col items-end gap-4 transition-all duration-500 select-none animate-fade-in"
        >
            <div className="flex items-center gap-4 group">
                <div 
                    onClick={handleToggleLink}
                    className={`flex items-center backdrop-blur-xl border border-white/10 rounded-full py-4 px-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all hover:bg-black/100 cursor-pointer hover:scale-105 active:scale-95 ${getPillColor()}`}
                >
                    <div className={`w-3.5 h-3.5 rounded-full mr-4 transition-all duration-500 ${getDotColor()}`} />
                    <div className="flex flex-col">
                        <span className="text-[14px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap drop-shadow-sm leading-none">
                            {getStatusText()}
                        </span>
                    </div>
                </div>
                
                <div className="relative flex flex-col items-center">
                    <button 
                        onClick={handleToggleLink}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_20px_80px_rgba(0,138,215,0.5)] hover:scale-110 active:scale-90 relative border border-white/10 bg-white text-black rotate-[135deg]`}
                    >
                        <PhoneOff size={32} />
                        
                        {connectionState === 'ringing' && (
                            <div className="absolute inset-0 rounded-full border-4 border-amber-400/50 animate-ping" />
                        )}
                        
                        {connectionState === 'listening' && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 p-1.5 rounded-full shadow-lg border-2 border-[#131b2c] animate-bounce">
                                <Mic size={12} className="text-white" />
                            </div>
                        )}

                        {connectionState === 'speaking' && (
                            <div className="absolute -top-1 -right-1 bg-cyan-500 p-1.5 rounded-full shadow-lg border-2 border-[#131b2c] animate-pulse">
                                <Volume2 size={12} className="text-white" />
                            </div>
                        )}
                    </button>
                    <div className="absolute -bottom-8 w-14 h-4 bg-black/50 rounded-[100%] blur-2xl -z-10 group-hover:scale-125 transition-transform"></div>
                </div>

                {connectionState !== 'idle' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="absolute -top-12 right-2 p-2 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white backdrop-blur-md animate-fade-in"
                    >
                        {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MicaAssistant;
