
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  FileText, 
  Bot, 
  Paperclip,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Layers,
  MessageSquare,
  Github,
  Pencil,
  Rocket,
  BookOpen,
  Terminal,
  BrainCircuit,
  CheckCircle,
  Plus,
  X,
  GitCommit,
  MessageCircle,
  Network,
  Container,
  Workflow,
  LayoutGrid,
  ListChecks,
  CheckSquare,
  ImageIcon,
  Video,
  Mic,
  Code2,
  Zap,
  Activity,
  Sparkles,
  CreditCard,
  Check
} from 'lucide-react';
import Footer from './Footer';
import { MOCK_TEAM_MEMBERS, INITIAL_DISCUSSIONS, INITIAL_AGENDA_ITEMS } from '../constants';
import { PLANS } from '../services/paystackService';

interface LandingPageProps {
  onLaunch: () => void;
  onSubscribe: () => void;
}

const BLUEPRINTS = [
    { 
        id: 'collab', 
        title: 'Live Meeting', 
        description: 'Doodle together. Real-time sync for teams.', 
        icon: <Users size={24} className="text-emerald-500" />,
    },
    { 
        id: 'whiteboard', 
        title: 'Whiteboard', 
        description: 'Freeform canvas for architectural design.', 
        icon: <Network size={24} className="text-purple-500" />,
    },
    { 
        id: 'docs', 
        title: 'Sketchpad', 
        description: 'Docs and technical specs as a canvas.', 
        icon: <FileText size={24} className="text-blue-500" />,
    },
    { 
        id: 'recorder', 
        title: 'Demo Catcher', 
        description: 'Record screen and camera instantly.', 
        icon: <div className="w-6 h-6 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/30"></div></div>,
    },
    { 
        id: 'agent', 
        title: 'AI Chat', 
        description: 'An AI that thinks in logic scribbles.', 
        icon: <Bot size={24} className="text-indigo-500" />,
    },
];

const DOC_CONTENT = {
  "Universal Terminal": {
    title: "Universal Terminal",
    description: "A fully-featured shell environment right in your browser.",
    content: (
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
        <p>The Universal Terminal provides a sandboxed POSIX environment with common shell commands and language runtimes like Node.js, Python, Go, and Rust. It's designed for quick scripts, package management, and running build processes without leaving your browser.</p>
        <h4 className="font-bold text-slate-700">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>AI Integration:</strong> Type a natural language command (e.g., "find all files larger than 1MB") and press Tab to have the AI generate and suggest the correct shell command.</li>
            <li><strong>Persistent Sessions:</strong> Your terminal state, including history and environment variables, is saved across reloads within your workspace.</li>
            <li><strong>Multi-Tab Support:</strong> Run multiple terminal sessions side-by-side for parallel tasks.</li>
            <li><strong>Workspace Aware:</strong> The terminal starts in your project's root directory, with access to all your files.</li>
        </ul>
        <h4 className="font-bold text-slate-700">Example Command:</h4>
        <pre className="bg-slate-100 p-3 rounded-lg text-xs"><code># sai synth "a REST API with an endpoint /users" --lang=go</code></pre>
      </div>
    )
  },
  "UX Studio": {
    title: "UX Studio",
    description: "Prototype components, map user flows, and manage design systems with AI.",
    content: (
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
        <p>The UX Studio is a suite of AI-powered tools designed for product designers and frontend engineers to bridge the gap between idea and implementation. It focuses on rapid prototyping, user flow visualization, and maintaining a consistent design system.</p>
        <h4 className="font-bold text-slate-700">Available Tools:</h4>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>Flow Synthesizer:</strong> Describe a user journey in plain language (e.g., "a user signs up, creates a profile, and posts a message") and the AI will generate a complete user flow diagram.</li>
            <li><strong>Component Critic:</strong> Get instant, AI-driven feedback on your UI components. The critic analyzes accessibility (WCAG), responsiveness, and adherence to design system principles.</li>
            <li><strong>Design System Manager:</strong> Automatically document your components, generate variations, and ensure consistency across your entire application.</li>
        </ul>
      </div>
    )
  },
  "Governance": {
    title: "Governance & Security",
    description: "Define and enforce security policies for your infrastructure and code.",
    content: (
        <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
            <p>Sai's Governance module acts as a real-time sentinel for your codebase and infrastructure definitions. It ensures your projects adhere to security best practices and compliance standards automatically.</p>
            <h4 className="font-bold text-slate-700">Core Concepts:</h4>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Policy as Code:</strong> Define rules in a simple, readable format (e.g., "No Public S3 Buckets", "Mandatory CostCenter Tag").</li>
                <li><strong>Real-time Scanning:</strong> The system continuously scans your Terraform, Dockerfiles, and application code for policy violations.</li>
                <li><strong>Automated Remediation:</strong> For certain violations, the AI can suggest and apply a fix with a single click, hardening your infrastructure automatically.</li>
                <li><strong>Compliance Reporting:</strong> Generate reports for standards like SOC2, HIPAA, and GDPR based on your enforced policies and detected infrastructure.</li>
            </ul>
        </div>
    )
  },
  "Container Studio": {
    title: "Container Studio",
    description: "Synthesize, manage, and optimize Docker images and containers.",
    content: (
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
        <p>The Container Studio provides a complete lifecycle management suite for your containerized applications. From AI-powered Dockerfile generation to a real-time fleet overview, it streamlines your entire container workflow.</p>
        <h4 className="font-bold text-slate-700">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dockerfile Synthesis:</strong> Describe your application's needs (e.g., "a production-ready Node.js app") and let the AI generate an optimized, multi-stage Dockerfile.</li>
            <li><strong>Neural Hardening:</strong> Use the AI to scan your Dockerfiles for security vulnerabilities and apply best practices automatically, reducing image size and attack surface.</li>
            <li><strong>Workspace Fleet Management:</strong> View and manage all Docker images and running containers within your local workspace. Start, stop, and inspect containers with a single click.</li>
            <li><strong>Registry Integration:</strong> Connect to Docker Hub, GitHub Container Registry, and other private registries to pull and push images.</li>
        </ul>
      </div>
    )
  },
  "API Studio": {
    title: "API Studio",
    description: "A comprehensive toolkit for designing, testing, and generating APIs.",
    content: (
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
        <p>API Studio is your central hub for API development. It combines an intuitive HTTP client for testing endpoints with a powerful AI "Forge" for scaffolding entire API backends from a simple design interface.</p>
        <h4 className="font-bold text-slate-700">Key Components:</h4>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>API Client:</strong> A full-featured HTTP client to send requests, manage headers, parameters, and bodies. Inspect responses, status codes, and timings in a clean interface.</li>
            <li><strong>API Forge:</strong> Visually design your API endpoints (paths, methods, descriptions). The Forge uses this design to synthesize a complete backend implementation in your chosen language (Node.js, Go, Python, Rust).</li>
            <li><strong>Automated Documentation:</strong> The AI can generate OpenAPI/Swagger specs from your existing code or from the visual designs in the Forge.</li>
            <li><strong>Integration with Run & Debug:</strong> Directly run your forged API and test it with the client, all within the same environment.</li>
        </ul>
      </div>
    )
  }
};

const activityFeed = [
    { user: 'Alex C.', action: "pushed 3 commits to 'neural-ux-lab'", time: '2m ago', icon: <GitCommit size={14} className="text-blue-500" /> },
    { user: 'Sarah J.', action: "commented on 'Mobile Grid Fix'", time: '15m ago', icon: <MessageCircle size={14} className="text-green-500" /> },
    { user: 'Mike R.', action: "deployed 'hyper-commerce' to staging", time: '45m ago', icon: <Rocket size={14} className="text-purple-500" /> },
    { user: 'Emily B.', action: "opened a new issue: 'Add dark mode'", time: '1h ago', icon: <Pencil size={14} className="text-orange-500" /> },
];

const MOCK_LLMS = [
    'Starling-7B', 'Nexus-Raven', 'Zephyr-12B', 'Whisper-Large', 'Llama-3-70B',
    'Mixtral-8x7B', 'Gemma-IT', 'Code-Llama-Instruct', 'Phi-2', 'Qwen-1.5-Chat',
    'DBRX-Instruct', 'OLMo-7B', 'Jamba-Instruct', 'Falcon-180B', 'DeepSeek-Coder',
    'Grok-1', 'Command-R+', 'Mistral-Large', 'Yi-34B', 'Solar-10.7B'
];

const synthModes = [
  { mode: 'VIDEO', icon: <Video size={16}/>, prompt: 'A cinematic shot of a rainy night in Tokyo.', color: 'rose' },
  { mode: 'IMAGE', icon: <ImageIcon size={16}/>, prompt: 'A photorealistic image of a futuristic city skyline.', color: 'emerald' },
  { mode: 'AUDIO', icon: <Mic size={16}/>, prompt: 'Generate a lo-fi hip hop track, 120bpm.', color: 'amber' },
  { mode: 'APP', icon: <Code2 size={16}/>, prompt: 'Build a simple to-do list application.', color: 'indigo' },
  { mode: 'CHAT', icon: <MessageSquare size={16}/>, prompt: 'Explain quantum computing in simple terms.', color: 'blue' }
];

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onSubscribe }) => {
    const [placeholder, setPlaceholder] = useState('');
    const [userInput, setUserInput] = useState('');
    const placeholderText = "What should we build today? (Sai)...";
    const heroDoodlesRef = useRef<HTMLDivElement>(null);
    const formDoodlesRef = useRef<HTMLDivElement>(null);

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [showLlmList, setShowLlmList] = useState(false);
    const [currentSynthIndex, setCurrentSynthIndex] = useState(0);

    const handleOpenDocModal = (docData: any) => {
        setSelectedDoc(docData);
        setIsDocModalOpen(true);
    };

    const handleBlockedAction = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        alert("Under Development");
    };

    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            root.style.overflowY = 'auto';
            root.classList.add('custom-scrollbar');
        }

        const handleScroll = () => {
            if (!root) return;
            const scrollTop = root.scrollTop;

            if (heroDoodlesRef.current) {
                heroDoodlesRef.current.style.transform = `translate(-50%, -50%) translateY(${scrollTop * 0.2}px) rotate(${scrollTop * 0.05}deg)`;
            }

            if (formDoodlesRef.current) {
                formDoodlesRef.current.style.transform = `translate(-50%, 80px) translateY(${scrollTop * 0.4}px)`;
            }
        };

        if (root) {
            root.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (root) {
                root.style.overflowY = 'hidden';
                root.classList.remove('custom-scrollbar');
                root.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (placeholder.length < placeholderText.length) {
            timeout = setTimeout(() => {
                setPlaceholder(placeholderText.substring(0, placeholder.length + 1));
            }, 100);
        }
        return () => clearTimeout(timeout);
    }, [placeholder]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isDocModalOpen) return;
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setUserInput(e.key);
                setTimeout(() => { onLaunch(); setUserInput(''); }, 200);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onLaunch, isDocModalOpen]);

    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSynthIndex(prev => (prev + 1) % synthModes.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const activeSynth = synthModes[currentSynthIndex];

  return (
    <div className="w-full bg-white text-slate-900 font-sans antialiased relative">
        <style>{`
            @keyframes scribble {
                from { stroke-dashoffset: 400; }
                to { stroke-dashoffset: 0; }
            }
            .animate-scribble {
                stroke-dasharray: 400;
                animation: scribble 3s ease-out forwards;
            }
            @keyframes doodle-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(-2deg); }
                66% { transform: translateY(5px) rotate(2deg); }
            }
            .animate-doodle-float {
                animation: doodle-float 6s ease-in-out infinite;
            }
            @keyframes slow-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-slow-rotate {
                animation: slow-rotate 60s linear infinite;
            }
            .font-doodle { font-family: 'Gochi Hand', cursive; }
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            @keyframes scroll-up {
                from { transform: translateY(0); }
                to { transform: translateY(-50%); }
            }
            .animate-scroll-up {
                animation: scroll-up 40s linear infinite;
            }
        `}</style>

        {/* Hero Section */}
        <div 
            id="the-blueprint-hero"
            className="h-screen min-h-[700px] w-full flex flex-col justify-center items-center p-8 overflow-hidden relative bg-[#1e293b] text-white"
            style={{
                backgroundImage: 
                'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        >
            {/* Background Doodles Layer - ENSURE Z-0 */}
            <div 
                ref={heroDoodlesRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0">
                <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-slow-rotate"></div>
                <div className="absolute inset-12 border border-dashed border-white/5 rounded-full animate-slow-rotate" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute top-1/2 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2"></div>
                
                {/* Floating Particle Doodles */}
                <svg className="absolute top-20 left-40 w-12 h-12 text-cyan-400/20 animate-doodle-float" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
                <svg className="absolute bottom-20 right-40 w-16 h-16 text-purple-400/20 animate-doodle-float" style={{ animationDelay: '1s' }} viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" transform="rotate(15 50 50)"/>
                </svg>
            </div>
        
            <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 border border-white/10 mb-8 backdrop-blur-sm shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <span className="font-doodle text-sm text-cyan-300">Welcome to Sai</span>
                </div>

                <h1 className="relative text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 font-doodle leading-none animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <svg className="absolute -top-12 -right-12 w-24 h-24 text-white/10 -rotate-12 animate-doodle-float z-0" style={{ animationDuration: '10s' }} viewBox="0 0 100 100">
                        <path d="M50 10 L70 40 L60 40 L60 70 L40 70 L40 40 L30 40 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-scribble"/>
                        <path d="M40 70 L50 90 L60 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Let's <span className="relative inline-block text-cyan-400">
                        Code.
                        <svg className="absolute -bottom-3 left-0 w-full h-4 text-cyan-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q25,10 50,5 T100,5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-scribble"/>
                        </svg>
                    </span> Collaborate. Create.
                </h1>
                <p className="text-gray-400 text-lg max-w-xl font-medium mt-6 leading-relaxed animate-fade-in" style={{ animationDelay: '600ms' }}>
                    Turn your scribbles into high-fidelity logical structures. Organic synthesis for a modern, AI-first ecosystem.
                </p>

                <form onSubmit={handleBlockedAction} className="relative group w-full max-w-2xl mt-12 animate-fade-in" style={{ animationDelay: '800ms' }}>
                    {/* Scribble Doodle - Ensure z-0 */}
                    <svg className="absolute -left-24 -bottom-4 w-48 h-24 text-white/20 rotate-[-15deg] animate-doodle-float z-0" style={{ animationDelay: '1s', animationDuration: '12s' }} viewBox="0 0 200 100">
                        <path d="M10 80 Q 80 90, 150 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-scribble"/>
                        <path d="M140 60 L150 50 L140 40" fill="none" stroke="currentColor" strokeWidth="2" />
                        <text x="20" y="60" className="font-doodle text-lg fill-current opacity-70">Sai synthesis</text>
                    </svg>
                    {/* Main Input - Ensure z-20 to be on top */}
                    <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl shadow-black/30 z-20 transition-transform hover:scale-[1.01]">
                        <div className="pl-4 pr-3 text-gray-400">
                            <Paperclip size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-2xl font-bold text-gray-800 font-doodle h-14 flex items-center">
                            {userInput || placeholder}
                            <span className="w-1 h-7 bg-cyan-500 ml-1" style={{ animation: 'cursor-blink 1s infinite' }}></span>
                        </div>
                        <button type="submit" className="w-14 h-14 bg-cyan-400 text-black rounded-full hover:bg-cyan-300 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                            <ArrowRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                    {/* Connecting Doodles - Ensure z-0 */}
                    <div 
                        ref={formDoodlesRef}
                        className="absolute top-1/2 left-1/2 w-[1200px] h-[400px] -translate-x-1/2 translate-y-[80px] pointer-events-none opacity-50 z-0">
                        <svg width="100%" height="100%" viewBox="0 0 1200 400">
                            <path d="M600,0 C 500,150 300,100 200,300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                            <path d="M600,0 C 650,150 750,120 900,250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                            <path d="M600,0 C 450,250 400,200 450,350" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                            <path d="M600,0 C 750,250 800,200 750,350" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                        </svg>
                    </div>
                </form>

                {/* Cards Container - Ensure z-20 to be strictly on top of doodles */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-32 w-full animate-fade-in relative z-20" style={{ animationDelay: '1000ms' }}>
                    {BLUEPRINTS.map((bp) => (
                        <button 
                            key={bp.id} 
                            onClick={() => handleBlockedAction()}
                            className={`text-left bg-black/30 border border-white/10 p-6 rounded-3xl group hover:-translate-y-1 transition-all backdrop-blur-lg hover:bg-black/40 shadow-2xl shadow-black/60 relative z-20 overflow-hidden`}
                        >
                            {/* Card Background Doodle Overlay */}
                            <svg className="absolute -bottom-8 -right-8 w-24 h-24 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-slow-rotate" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                            </svg>
                            
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                                {bp.icon}
                            </div>
                            <h3 className="font-bold text-white mb-1 font-doodle text-xl">{bp.title}</h3>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{bp.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* The Blueprint Section */}
        <section id="the-blueprint" className="py-24 px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.08]">
                <svg width="800" height="800" viewBox="0 0 800 800" className="text-slate-900 animate-slow-rotate">
                    <circle cx="400" cy="400" r="350" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="8 8" />
                    <circle cx="400" cy="400" r="250" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M400,50 L400,750 M50,400 L750,400" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                    <path d="M143,143 L657,657 M143,657 L657,143" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                    <rect x="200" y="200" width="400" height="400" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(45 400 400)" />
                </svg>
            </div>
            <div className="relative z-10">
                <Layers size={32} className="mx-auto text-blue-600 mb-4 animate-pulse"/>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 font-doodle relative">
                    <div className="absolute top-0 -left-8 text-blue-300/50 animate-doodle-float">
                        <svg width="40" height="40" viewBox="0 0 100 100"><path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="currentColor"/></svg>
                    </div>
                    The Sai Fabric
                    <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-6 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-scribble" />
                    </svg>
                </h2>
                <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium mt-10 leading-relaxed">A unified fabric for modern AI-native development.</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 text-left">
                    <FeatureCard 
                        icon={<MessageSquare size={24} className="text-blue-600"/>} 
                        title="Multimodal Core" 
                        description="Chat, generate images, video, and audio with a suite of GenAI models."
                        doodleIcon={<MessageSquare size={80} strokeWidth={1} className="-rotate-12 animate-doodle-float"/>}
                    />
                    <FeatureCard 
                        icon={<Rocket size={24} className="text-purple-600"/>} 
                        title="Cloud Orchestration" 
                        description="Synthesize and deploy infrastructure across AWS, GCP, and Azure."
                        doodleIcon={<Rocket size={80} strokeWidth={1} className="rotate-12 animate-doodle-float" style={{ animationDelay: '0.5s' }}/>}
                    />
                    <FeatureCard 
                        icon={<ShieldCheck size={24} className="text-emerald-600"/>} 
                        title="Sentinel Security" 
                        description="Enforce governance with real-time policy checks and vulnerability scanning."
                        doodleIcon={<ShieldCheck size={80} strokeWidth={1} className="-rotate-6 animate-doodle-float" style={{ animationDelay: '1s' }}/>}
                    />
                    <FeatureCard 
                        icon={<Users size={24} className="text-rose-600"/>} 
                        title="Live Collaboration" 
                        description="Code, chat, and share your screen with your team in real time."
                        doodleIcon={<Users size={80} strokeWidth={1} className="rotate-6 animate-doodle-float" style={{ animationDelay: '1.5s' }}/>}
                    />
                </div>
            </div>
        </section>

        <section id="model-library" className="py-24 px-8 bg-slate-900 text-center w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>

            <div className="max-w-5xl mx-auto relative">
                <Cpu size={32} className="mx-auto text-cyan-400 mb-4 animate-slow-rotate"/>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 font-doodle relative">
                    AI Model Hub
                    <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-6 text-cyan-400/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-scribble" />
                    </svg>
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium mt-10 leading-relaxed">50+ AI models from leading providers, ready to use.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-16 text-left">
                    <ModelProviderCard name="Meta" doodleIcon={<BrainCircuit size={120} strokeWidth={0.5} className="-rotate-6 animate-doodle-float"/>} />
                    <ModelProviderCard name="Google" doodleIcon={<Cpu size={120} strokeWidth={0.5} className="-rotate-12 animate-doodle-float" style={{ animationDelay: '0.3s' }}/>} />
                    <ModelProviderCard name="Anthropic" doodleIcon={<BrainCircuit size={120} strokeWidth={0.5} className="rotate-6 animate-doodle-float" style={{ animationDelay: '0.6s' }}/>} />
                    <ModelProviderCard name="OpenAI" doodleIcon={<Cpu size={120} strokeWidth={0.5} className="rotate-12 animate-doodle-float" style={{ animationDelay: '0.9s' }}/>} />
                    <div className="h-[270px]">
                        {showLlmList ? (
                            <div className="relative w-full h-full bg-slate-800/50 border-2 border-dashed border-cyan-400/50 rounded-2xl flex flex-col p-6 transition-all overflow-hidden animate-fade-in">
                                <button onClick={() => setShowLlmList(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white z-20 p-1 hover:bg-white/10 rounded-full">
                                    <X size={16} />
                                </button>
                                <h3 className="font-bold text-white text-center text-base mb-4">Connecting Endpoints...</h3>
                                <div className="relative flex-1 overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-800/50 to-transparent z-10"></div>
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-800/50 to-transparent z-10"></div>
                                    <div className="absolute inset-0 animate-scroll-up">
                                        <div className="space-y-2">
                                            {[...MOCK_LLMS, ...MOCK_LLMS].map((llm, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg animate-fade-in" style={{ animationDelay: `${i * 50}ms`}}>
                                                    <Cpu size={14} className="text-gray-600" />
                                                    <span className="text-xs font-mono text-gray-400">{llm}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowLlmList(true)} className="w-full h-full bg-transparent border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 group hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all hover:-translate-y-2">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 group-hover:border-cyan-400/80 flex items-center justify-center mb-4 transition-colors group-hover:scale-110">
                                    <Plus size={32} className="text-white/30 group-hover:text-cyan-400 transition-colors"/>
                                </div>
                                <h3 className="font-bold text-white text-lg">Bring Your Own</h3>
                                <p className="text-xs text-gray-500">Connect a custom LLM endpoint.</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>

        <section id="universal-synthesizer" className="py-24 px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 font-doodle relative">Universal Synthesizer</h2>
                    <p className="text-slate-600 text-lg max-w-md mx-auto md:mx-0 font-medium mt-10 leading-relaxed">
                        Go beyond code completion. Our Sai co-pilot is a multimodal engine that can chat, design visuals, compose audio, and synthesize entire applications from a single prompt.
                    </p>
                </div>
                <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl shadow-2xl p-4 backdrop-blur-lg ring-1 ring-black/5">
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-slate-300 border border-slate-700/50">
                        <pre><code><span className="text-green-400">&gt;</span> sai install @multimodal/core<br/><span className="text-gray-500">... synthesis engine loaded</span></code></pre>
                    </div>
                    <div key={currentSynthIndex} className={`mt-4 bg-slate-900/70 border border-slate-700/50 rounded-lg p-4 animate-fade-in`}>
                        <div className={`flex justify-between items-center border-b border-${activeSynth.color}-500/30 pb-2`}>
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-${activeSynth.color}-400`}>
                                {activeSynth.icon}
                                {activeSynth.mode}
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <p className="text-sm text-slate-300 mt-3 h-10">{activeSynth.prompt}</p>
                        <div className="mt-8 flex flex-col items-center gap-2 text-center">
                            <div className={`w-8 h-8 border-2 border-${activeSynth.color}-400 border-t-transparent rounded-full animate-spin`}></div>
                            <span className={`text-xs font-bold text-${activeSynth.color}-400/80 uppercase tracking-widest`}>Synthesizing...</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <div className="bg-white text-slate-900 w-full">
            <section id="documentation" className="py-24 px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.08]">
                    <svg width="800" height="800" viewBox="0 0 800 800" className="text-slate-900 animate-slow-rotate" style={{ animationDirection: 'reverse' }}>
                        <path d="M400,400 C 200,200 600,200 400,400 C 200,600 600,600 400,400" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
                        <path d="M400,400 Q 250,250 100,200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                        <path d="M400,400 Q 550,250 700,200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                        <path d="M400,400 Q 250,550 100,600" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                        <path d="M400,400 Q 550,550 700,600" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-scribble" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <BookOpen size={32} className="mx-auto text-blue-600 mb-4 animate-bounce"/>
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 font-doodle relative">
                        <svg className="absolute top-0 -right-24 w-32 h-16 text-slate-300/80 animate-doodle-float z-0" style={{ animationDuration: '15s' }} viewBox="0 0 200 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <circle cx="150" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path d="M90 50 H 110" stroke="currentColor" strokeWidth="4"/>
                        </svg>
                        The Sai Manual
                        <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-6 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-scribble" />
                        </svg>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium mt-10 leading-relaxed">Your guide to synthesizing at the speed of thought.</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-16 text-left relative z-20">
                        <DocCard
                            icon={<Terminal className="text-blue-600" />}
                            title="Universal Terminal"
                            description="A fully-featured shell environment right in your browser."
                            doodleIcon={<Terminal size={80} strokeWidth={1} className="-rotate-12 animate-doodle-float" />}
                            onClick={() => handleOpenDocModal(DOC_CONTENT["Universal Terminal"])}
                        />
                        <DocCard
                            icon={<Workflow className="text-rose-600" />}
                            title="API Studio"
                            description="A comprehensive toolkit for designing, testing, and generating APIs."
                            doodleIcon={<Workflow size={80} strokeWidth={1} className="-rotate-12 animate-doodle-float" style={{ animationDelay: '0.2s' }}/>}
                            onClick={() => handleOpenDocModal(DOC_CONTENT["API Studio"])}
                        />
                        <DocCard
                            icon={<Container className="text-cyan-600" />}
                            title="Container Studio"
                            description="Synthesize, manage, and optimize Docker images and containers."
                            doodleIcon={<Container size={80} strokeWidth={1} className="rotate-12 animate-doodle-float" style={{ animationDelay: '0.4s' }}/>}
                            onClick={() => handleOpenDocModal(DOC_CONTENT["Container Studio"])}
                        />
                         <DocCard
                            icon={<LayoutGrid className="text-purple-600" />}
                            title="UX Studio"
                            description="Prototype components, map user flows, and manage design systems with AI."
                            doodleIcon={<LayoutGrid size={80} strokeWidth={1} className="rotate-6 animate-doodle-float" style={{ animationDelay: '0.6s' }}/>}
                            onClick={() => handleOpenDocModal(DOC_CONTENT["UX Studio"])}
                        />
                         <DocCard
                            icon={<ShieldCheck className="text-emerald-600" />}
                            title="Governance"
                            description="Define and enforce security policies for your infrastructure and code."
                            doodleIcon={<ShieldCheck size={80} strokeWidth={1} className="-rotate-6 animate-doodle-float" style={{ animationDelay: '0.8s' }}/>}
                            onClick={() => handleOpenDocModal(DOC_CONTENT["Governance"])}
                        />
                    </div>
                </div>
            </section>
        </div>

        <section id="community" className="py-32 px-8 bg-slate-50 text-slate-900 w-full relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-50">
                <svg width="100%" height="100%" viewBox="0 0 1200 1200" className="text-slate-200/80 animate-slow-rotate">
                    <path d="M600,0 C 300,300 300,900 600,1200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                    <path d="M0,600 C 300,300 900,300 1200,600" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                    <path d="M600,0 C 900,300 900,900 600,1200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                    <path d="M0,600 C 300,900 900,900 1200,600" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                </svg>
            </div>
            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-24">
                    <Users size={32} className="mx-auto text-blue-600 mb-4 animate-pulse"/>
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 font-doodle relative">
                        Community Hub
                        <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-6 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-scribble" />
                        </svg>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium mt-10 leading-relaxed">Collaborate in real-time, anywhere in Sai.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-20">
                    <div className="space-y-12">
                        {/* Activity Pulse */}
                        <div className="bg-yellow-50 border-4 border-slate-900 sketch-border p-8 relative rotate-[-2deg] shadow-lg transition-transform hover:rotate-0 duration-500">
                            <div className="absolute -top-4 -left-4 bg-red-500 text-white font-black doodle-text px-4 py-1.5 rounded text-lg rotate-[-10deg] shadow-md animate-pulse">LIVE!</div>
                            <h3 className="text-2xl font-black doodle-text text-slate-800 mb-6">Activity Pulse</h3>
                            <div className="space-y-6">
                                {activityFeed.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i*100}ms` }}>
                                        <div className="p-2 bg-white rounded-full border-2 border-slate-200">{item.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">{item.user} {item.action}</p>
                                            <p className="text-xs text-slate-400 font-bold">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community Discussions */}
                         <div className="bg-blue-50 border-4 border-slate-900 sketch-border p-8 relative rotate-[1deg] shadow-lg transition-transform hover:rotate-0 duration-500">
                            <h3 className="text-2xl font-black doodle-text text-slate-800 mb-6 flex items-center gap-2"><MessageSquare size={24} /> Community Discussions</h3>
                            <div className="space-y-4">
                                {INITIAL_DISCUSSIONS.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer hover:scale-[1.02]">
                                        <div className="p-2">{item.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">{item.title}</p>
                                            <p className="text-xs text-gray-400 font-bold">by @{item.user} &bull; {item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-12">
                        {/* Session Agenda */}
                        <div className="bg-green-50 border-4 border-slate-900 sketch-border p-8 relative rotate-[2deg] shadow-lg transition-transform hover:rotate-0 duration-500">
                            <h3 className="text-2xl font-black doodle-text text-slate-800 mb-6 flex items-center gap-2"><ListChecks size={24} /> Live Session Agenda</h3>
                            <div className="space-y-3">
                                {INITIAL_AGENDA_ITEMS.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-slate-200">
                                        {item.completed ? <CheckSquare size={16} className="text-green-500" /> : <div className="w-4 h-4 border-2 border-slate-400 rounded-sm flex-shrink-0"></div>}
                                        <p className={`text-sm font-bold ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Participants & CTAs */}
                        <div className="space-y-8 rotate-[-1deg]">
                            <div className="bg-white border-4 border-slate-900 sketch-border p-8 relative shadow-lg">
                                <h3 className="text-2xl font-black doodle-text text-slate-800 mb-4">Live Participants</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-4">
                                        {MOCK_TEAM_MEMBERS.map((member) => (
                                            <div key={member.id} className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold border-4 border-white text-white overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-transform" title={member.name}>
                                                {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : member.initials}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                                        <Plus size={20} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 px-4">
                                <button className="w-full bg-slate-800 text-white border-4 border-slate-900 sketch-border sketch-shadow px-6 py-4 font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95">Join Discord</button>
                                <button className="w-full bg-white text-slate-900 border-4 border-slate-900 sketch-border sketch-shadow px-6 py-4 font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95">GitHub Discussions</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" className="py-24 px-8 bg-[#0b0e14] text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <CreditCard size={32} className="mx-auto text-emerald-400 mb-4 animate-bounce" />
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 font-doodle">
                        Neural <span className="text-emerald-400">Pricing</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
                        Flexible tokens. Scale as you synthesize.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PLANS.map((plan) => (
                        <div key={plan.id} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                            plan.id === 'pro' 
                            ? 'bg-slate-800/80 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                            : 'bg-slate-900/50 border-white/10 hover:bg-slate-800/50'
                        }`}>
                            {plan.id === 'pro' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                    Recommended
                                </div>
                            )}
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-black text-white">${plan.priceUSD}</span>
                                <span className="text-sm text-gray-500 font-bold uppercase">/mo</span>
                            </div>
                            {plan.priceUSD > 0 && (
                                <button 
                                    onClick={onSubscribe}
                                    className="w-full mb-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={14} />
                                    Pay Now
                                </button>
                            )}
                            <div className="mb-8 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Quota</div>
                                <div className="text-2xl font-black text-emerald-400">{plan.tokens} <span className="text-sm text-white">Tokens</span></div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={onSubscribe}
                                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    plan.id === 'pro'
                                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {plan.id === 'hobby' ? 'Start Free' : 'Subscribe'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <Footer />
        <DocDetailModal 
            isOpen={isDocModalOpen}
            onClose={() => setIsDocModalOpen(false)}
            doc={selectedDoc}
        />
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string, doodleIcon: React.ReactNode}> = ({icon, title, description, doodleIcon}) => (
    <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-lg shadow-slate-200/50 hover:bg-white hover:-translate-y-2 transition-all relative overflow-hidden group">
        <div className="absolute -right-5 -bottom-5 text-slate-100/80 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg] z-0">
            {doodleIcon}
        </div>
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 border border-slate-200/80 shadow-sm transition-transform group-hover:scale-110">
                {icon}
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    </div>
);

const DocCard: React.FC<{icon: React.ReactNode, title: string, description: string, doodleIcon: React.ReactNode, onClick: () => void}> = ({icon, title, description, doodleIcon, onClick}) => (
    <button onClick={onClick} className="text-left block bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-lg shadow-slate-200/50 hover:bg-white hover:-translate-y-2 transition-all relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 text-slate-100/80 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg] z-0">
            {doodleIcon}
        </div>
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 border border-slate-200/80 shadow-sm transition-transform group-hover:scale-110">
                {icon}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            <span className="text-sm font-bold text-blue-600 group-hover:underline">Read more &rarr;</span>
        </div>
    </button>
);

const DocDetailModal: React.FC<{ isOpen: boolean, onClose: () => void, doc: any }> = ({ isOpen, onClose, doc }) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{doc.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {doc.content}
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">Close</button>
        </div>
      </div>
    </div>
  );
};

const ModelProviderCard: React.FC<{name: string, doodleIcon: React.ReactNode}> = ({name, doodleIcon}) => {
    const fontSizeClass = name.length > 8 ? 'text-2xl' : name.length > 6 ? 'text-3xl' : 'text-4xl';

    return (
        <div className="h-[270px] bg-slate-800/50 border border-white/10 p-6 rounded-2xl hover:bg-slate-800/80 hover:-translate-y-2 transition-all relative overflow-hidden group backdrop-blur-sm shadow-2xl shadow-black/40 flex flex-col">
            <div className="absolute -right-8 -bottom-8 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg] z-0">
                {doodleIcon}
            </div>
            <div className="relative z-10 flex items-start justify-between gap-2">
                <h3 className={`font-mono text-white font-black leading-tight break-words ${fontSizeClass}`}>{name}</h3>
                <div className="flex-shrink-0 flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle size={12}/>
                    <span className="text-[10px] font-bold">Verified</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-auto relative z-10 group-hover:text-gray-200 transition-colors">Industry-leading models for a variety of synthesis tasks.</p>
        </div>
    );
};

export default LandingPage;
