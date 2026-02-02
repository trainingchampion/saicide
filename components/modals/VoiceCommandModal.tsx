import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles } from 'lucide-react';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (text: string) => void;
}

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen, onClose, onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Listening for commands...');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      setTranscript('');
      setFeedback('Listening for commands...');
    }
    return () => stopListening();
  }, [isOpen]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setFeedback("Voice control not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          setTranscript(finalTranscript);
          processCommand(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
          setTranscript(interimTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setFeedback("Did not catch that. Try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processCommand = (text: string) => {
    setFeedback("Processing...");
    // Artificial delay for effect and to let user see their text
    setTimeout(() => {
        onCommand(text);
        // Fade out/close logic handled by parent usually, but we can auto-close here if single-shot
        setTimeout(onClose, 800);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[300] animate-fade-in" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg p-8 flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        {/* The Neural Orb */}
        <div className="relative mb-12">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'scale-110 shadow-[0_0_100px_rgba(8,145,178,0.6)] bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gray-800 scale-100'}`}>
                {isListening ? (
                    <Mic size={48} className="text-white animate-pulse" />
                ) : (
                    <MicOff size={48} className="text-gray-400" />
                )}
            </div>
            {/* Orbital Rings */}
            {isListening && (
                <>
                    <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute -inset-4 rounded-full border border-blue-500/20"></div>
                </>
            )}
        </div>

        {/* Text Feedback */}
        <div className="text-center space-y-4 w-full">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2 font-michroma">
                <Sparkles size={20} className="text-[#0891b2]" />
                S.AI VOICE
            </h2>
            
            <div className="h-24 flex items-center justify-center">
                {transcript ? (
                    <p className="text-xl md:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-relaxed transition-all">
                        "{transcript}"
                    </p>
                ) : (
                    <p className="text-lg text-gray-500 animate-pulse">{feedback}</p>
                )}
            </div>

            {/* Suggestions */}
            <div className="pt-8 border-t border-white/10 w-full">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Try saying...</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {['"Deploy to Production"', '"Switch to Dark Mode"', '"Open Terminal"', '"Create new File"'].map((cmd, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 font-mono hover:bg-white/10 transition-colors cursor-pointer" onClick={() => processCommand(cmd.replace(/"/g, ''))}>
                            {cmd}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandModal;
