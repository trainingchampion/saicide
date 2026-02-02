import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Bold, 
    Italic, 
    Underline, 
    Link, 
    AlignLeft, 
    List, 
    Quote, 
    Code, 
    Sparkles,
    FileEdit,
    RotateCcw,
    ArrowRight,
    Library,
    ArrowLeft,
    FilePlus,
    Save,
    Clock,
    Tag,
    MoreHorizontal,
    Calendar,
    Download,
    Share2,
    Settings,
    FileText,
    Wand2,
    RefreshCw,
    FolderOpen,
    ChevronLeft,
    Table,
    Presentation,
    LayoutTemplate,
    Plus,
    Image as ImageIcon,
    Type,
    Play,
    Trash2,
    Grid,
    Palette,
    Monitor,
    Maximize,
    Check,
    ChevronDown,
    FunctionSquare,
    Printer,
    SpellCheck,
    PaintRoller,
    Undo2,
    Redo2,
    Minus,
    Highlighter,
    MessageSquarePlus,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ListOrdered,
    CheckSquare,
    Indent,
    Outdent,
    Baseline,
    X,
    MoreVertical,
    PenTool,
    Pencil,
    Eye,
    MessageSquareText,
    LayoutGrid,
    CreditCard,
    UserPlus,
    Mail,
    User,
    Smartphone,
    Square,
    FileSpreadsheet,
    DollarSign,
    Percent,
    ArrowLeftFromLine,
    ArrowRightFromLine,
    Inbox,
    Target,
    Focus,
    PenLine,
    CheckCircle,
    Briefcase,
    MessageSquare,
    ChevronRight,
    ArrowUp,
    Command,
    Search,
    Zap,
    Star,
    CloudOff,
    Cloud,
    Keyboard,
    History,
    Users,
    Globe,
    Lock,
    Mic,
    Languages,
    FileCheck,
    Layers,
    Copy,
    Scissors,
    ClipboardPaste,
    Moon,
    Sun,
    Bell,
    HelpCircle,
    AlertTriangle
} from 'lucide-react';
import aiService from '../services/geminiService';
import { TeamMember } from '../types';

interface DocumentEditorPaneProps {
  onCollapse: () => void;
  activeModelId?: string;
  onStartLiveSession?: () => void;
  teamMembers?: TeamMember[];
  currentUser?: TeamMember | null;
}

interface Slide {
    id: string;
    layout: 'title' | 'content' | 'visual' | 'big-number' | 'two-column' | 'comparison' | 'timeline' | 'quote' | 'gallery' | 'team';
    title: string;
    subtitle: string;
    body: string;
    image?: string;
    leftContent?: string;
    rightContent?: string;
    items?: string[];
}

const SLIDE_THEMES = {
    // Light Themes
    nova: {
        bg: "bg-gradient-to-br from-[#c7d2fe] to-[#e0e7ff]",
        text: "text-[#0f172a]",
        accent: "text-[#4f46e5]",
        border: "border-[#4f46e5]/20",
        label: "Nova",
        category: "light"
    },
    twilight: {
        bg: "bg-gradient-to-br from-[#fde68a] to-[#fff7ed]",
        text: "text-[#0f172a]",
        accent: "text-[#d97706]",
        border: "border-[#d97706]/20",
        label: "Twilight",
        category: "light"
    },
    coral: {
        bg: "bg-gradient-to-br from-[#fecaca] to-[#fff1f2]",
        text: "text-[#0f172a]",
        accent: "text-[#dc2626]",
        border: "border-[#dc2626]/20",
        label: "Coral",
        category: "light"
    },
    mercury: {
        bg: "bg-gradient-to-br from-[#e5e7eb] to-[#f8fafc]",
        text: "text-[#0f172a]",
        accent: "text-[#475569]",
        border: "border-[#475569]/20",
        label: "Mercury",
        category: "light"
    },
    ashrose: {
        bg: "bg-gradient-to-br from-[#f3e8ff] to-[#faf5ff]",
        text: "text-[#0f172a]",
        accent: "text-[#7c3aed]",
        border: "border-[#7c3aed]/20",
        label: "Ashrose",
        category: "light"
    },
    spectrum: {
        bg: "bg-gradient-to-br from-[#dbeafe] to-[#fefce8]",
        text: "text-[#0f172a]",
        accent: "text-[#0891b2]",
        border: "border-[#0891b2]/20",
        label: "Spectrum",
        category: "light"
    },
    clean: {
        bg: "bg-white",
        text: "text-slate-900",
        accent: "text-blue-600",
        border: "border-gray-200",
        label: "Clean",
        category: "light"
    },
    mint: {
        bg: "bg-gradient-to-br from-[#d1fae5] to-[#ecfdf5]",
        text: "text-[#064e3b]",
        accent: "text-[#059669]",
        border: "border-[#059669]/20",
        label: "Mint",
        category: "light"
    },
    peach: {
        bg: "bg-gradient-to-br from-[#fed7aa] to-[#fff7ed]",
        text: "text-[#7c2d12]",
        accent: "text-[#ea580c]",
        border: "border-[#ea580c]/20",
        label: "Peach",
        category: "light"
    },
    lavender: {
        bg: "bg-gradient-to-br from-[#ddd6fe] to-[#f5f3ff]",
        text: "text-[#4c1d95]",
        accent: "text-[#7c3aed]",
        border: "border-[#7c3aed]/20",
        label: "Lavender",
        category: "light"
    },
    // Dark Themes
    midnight: {
        bg: "bg-gradient-to-br from-slate-900 via-[#0f172a] to-black",
        text: "text-white",
        accent: "text-blue-400",
        border: "border-slate-800",
        label: "Midnight",
        category: "dark"
    },
    ocean: {
        bg: "bg-gradient-to-br from-cyan-600 to-blue-700",
        text: "text-white",
        accent: "text-cyan-200",
        border: "border-white/20",
        label: "Ocean",
        category: "dark"
    },
    noir: {
        bg: "bg-gradient-to-br from-[#18181b] to-[#09090b]",
        text: "text-white",
        accent: "text-zinc-400",
        border: "border-zinc-800",
        label: "Noir",
        category: "dark"
    },
    aurora: {
        bg: "bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#2563eb]",
        text: "text-white",
        accent: "text-purple-200",
        border: "border-purple-500/30",
        label: "Aurora",
        category: "dark"
    },
    forest: {
        bg: "bg-gradient-to-br from-[#14532d] to-[#052e16]",
        text: "text-white",
        accent: "text-emerald-300",
        border: "border-emerald-600/30",
        label: "Forest",
        category: "dark"
    },
    sunset: {
        bg: "bg-gradient-to-br from-[#f97316] via-[#ec4899] to-[#8b5cf6]",
        text: "text-white",
        accent: "text-orange-200",
        border: "border-white/20",
        label: "Sunset",
        category: "dark"
    },
    ember: {
        bg: "bg-gradient-to-br from-[#991b1b] to-[#450a0a]",
        text: "text-white",
        accent: "text-red-300",
        border: "border-red-600/30",
        label: "Ember",
        category: "dark"
    },
    cosmic: {
        bg: "bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a]",
        text: "text-white",
        accent: "text-indigo-300",
        border: "border-indigo-500/30",
        label: "Cosmic",
        category: "dark"
    },
    slate: {
        bg: "bg-gradient-to-br from-[#334155] to-[#1e293b]",
        text: "text-white",
        accent: "text-slate-300",
        border: "border-slate-600",
        label: "Slate",
        category: "dark"
    },
    royal: {
        bg: "bg-gradient-to-br from-[#1e3a8a] to-[#172554]",
        text: "text-white",
        accent: "text-blue-300",
        border: "border-blue-600/30",
        label: "Royal",
        category: "dark"
    }
};

const MODERN_TEMPLATES = [
    // Business
    { id: 't1', name: 'Startup Pitch Deck', category: 'Business', theme: 'midnight', meta: '12 slides · Investor-ready', icon: '🚀', featured: true },
    { id: 't2', name: 'Quarterly Business Review', category: 'Business', theme: 'nova', meta: 'Data-focused layout', icon: '📊' },
    { id: 't3', name: 'Company All-Hands', category: 'Business', theme: 'spectrum', meta: 'Clear communication', icon: '👥' },
    { id: 't4', name: 'Board Meeting', category: 'Business', theme: 'slate', meta: 'Executive summary', icon: '🎯' },
    { id: 't5', name: 'Business Proposal', category: 'Business', theme: 'royal', meta: 'Win clients', icon: '📋' },
    // Marketing
    { id: 't6', name: 'Product Launch', category: 'Marketing', theme: 'coral', meta: 'Bold visuals', icon: '🎉', featured: true },
    { id: 't7', name: 'Marketing Strategy', category: 'Marketing', theme: 'ashrose', meta: 'Growth planning', icon: '📈' },
    { id: 't8', name: 'Brand Partnership', category: 'Marketing', theme: 'sunset', meta: 'Collaboration pitch', icon: '🤝' },
    { id: 't9', name: 'Social Media Campaign', category: 'Marketing', theme: 'aurora', meta: 'Viral content', icon: '📱' },
    { id: 't10', name: 'Content Calendar', category: 'Marketing', theme: 'peach', meta: 'Monthly planning', icon: '📅' },
    // Sales
    { id: 't11', name: 'Sales Deck', category: 'Sales', theme: 'ocean', meta: 'Close deals faster', icon: '💰', featured: true },
    { id: 't12', name: 'Customer Case Study', category: 'Sales', theme: 'mint', meta: 'Success stories', icon: '⭐' },
    { id: 't13', name: 'Pricing Presentation', category: 'Sales', theme: 'clean', meta: 'Value proposition', icon: '💎' },
    { id: 't14', name: 'Demo Walkthrough', category: 'Sales', theme: 'cosmic', meta: 'Product showcase', icon: '🖥️' },
    // Product
    { id: 't15', name: 'Product Roadmap', category: 'Product', theme: 'lavender', meta: 'Vision & timeline', icon: '🗺️', featured: true },
    { id: 't16', name: 'User Research', category: 'Product', theme: 'spectrum', meta: 'Insights & findings', icon: '🔬' },
    { id: 't17', name: 'Feature Announcement', category: 'Product', theme: 'forest', meta: 'Release notes', icon: '✨' },
    { id: 't18', name: 'Design Review', category: 'Product', theme: 'mercury', meta: 'Visual feedback', icon: '🎨' },
    { id: 't19', name: 'Sprint Retrospective', category: 'Product', theme: 'twilight', meta: 'Team learnings', icon: '🔄' },
    // Education
    { id: 't20', name: 'Course Overview', category: 'Education', theme: 'nova', meta: 'Engaging lessons', icon: '📚', featured: true },
    { id: 't21', name: 'Training Workshop', category: 'Education', theme: 'mint', meta: 'Interactive learning', icon: '🎓' },
    { id: 't22', name: 'Research Presentation', category: 'Education', theme: 'clean', meta: 'Academic style', icon: '🔎' },
    { id: 't23', name: 'Onboarding Guide', category: 'Education', theme: 'peach', meta: 'New user welcome', icon: '👋' },
    { id: 't24', name: 'Tutorial Deck', category: 'Education', theme: 'lavender', meta: 'Step-by-step', icon: '📝' },
    // Creative
    { id: 't25', name: 'Portfolio Showcase', category: 'Creative', theme: 'noir', meta: 'Visual impact', icon: '🎭', featured: true },
    { id: 't26', name: 'Event Microsite', category: 'Creative', theme: 'aurora', meta: 'Stunning landing', icon: '🎪' },
    { id: 't27', name: 'Photo Gallery', category: 'Creative', theme: 'midnight', meta: 'Image-first', icon: '📸' },
    { id: 't28', name: 'Webinar Template', category: 'Creative', theme: 'ember', meta: 'Live presentation', icon: '🎙️' },
    { id: 't29', name: 'Newsletter Design', category: 'Creative', theme: 'coral', meta: 'Email-ready', icon: '💌' },
    { id: 't30', name: 'Infographic Deck', category: 'Creative', theme: 'sunset', meta: 'Data storytelling', icon: '📉' }
];

const SLIDE_LAYOUTS = [
    { id: 'title', name: 'Title Slide', icon: '🎬', description: 'Big title with subtitle' },
    { id: 'content', name: 'Content', icon: '📝', description: 'Title with bullet points' },
    { id: 'visual', name: 'Visual', icon: '🖼️', description: 'Split text and image' },
    { id: 'big-number', name: 'Big Number', icon: '📊', description: 'Highlight key metrics' },
    { id: 'two-column', name: 'Two Column', icon: '📰', description: 'Side by side content' },
    { id: 'comparison', name: 'Comparison', icon: '⚖️', description: 'Before vs after' },
    { id: 'timeline', name: 'Timeline', icon: '📅', description: 'Show progression' },
    { id: 'quote', name: 'Quote', icon: '💬', description: 'Testimonial or quote' },
    { id: 'gallery', name: 'Gallery', icon: '🎨', description: 'Multiple images' },
    { id: 'team', name: 'Team', icon: '👥', description: 'Introduce team members' }
];

// Document Templates
const DOC_TEMPLATES = [
    { id: 'd1', name: 'Blank Document', category: 'Basic', icon: '📄', description: 'Start fresh' },
    { id: 'd2', name: 'Project Proposal', category: 'Business', icon: '📋', description: 'Formal proposal template' },
    { id: 'd3', name: 'Meeting Notes', category: 'Business', icon: '📝', description: 'Structured meeting notes' },
    { id: 'd4', name: 'Technical Spec', category: 'Engineering', icon: '⚙️', description: 'Technical documentation' },
    { id: 'd5', name: 'API Documentation', category: 'Engineering', icon: '🔌', description: 'REST API docs' },
    { id: 'd6', name: 'Blog Post', category: 'Content', icon: '✍️', description: 'SEO-optimized blog' },
    { id: 'd7', name: 'Press Release', category: 'Content', icon: '📰', description: 'News announcement' },
    { id: 'd8', name: 'Business Plan', category: 'Business', icon: '🎯', description: 'Comprehensive plan' },
    { id: 'd9', name: 'User Guide', category: 'Documentation', icon: '📚', description: 'Product manual' },
    { id: 'd10', name: 'Research Report', category: 'Academic', icon: '🔬', description: 'Academic research' },
    { id: 'd11', name: 'Resume/CV', category: 'Personal', icon: '👤', description: 'Professional resume' },
    { id: 'd12', name: 'Cover Letter', category: 'Personal', icon: '💌', description: 'Job application' }
];

// Spreadsheet Templates
const SHEET_TEMPLATES = [
    { id: 's1', name: 'Blank Spreadsheet', category: 'Basic', icon: '📊', description: 'Empty grid' },
    { id: 's2', name: 'Budget Tracker', category: 'Finance', icon: '💰', description: 'Monthly budget' },
    { id: 's3', name: 'Project Timeline', category: 'Project', icon: '📅', description: 'Gantt-style tracker' },
    { id: 's4', name: 'Invoice Template', category: 'Finance', icon: '🧾', description: 'Client invoicing' },
    { id: 's5', name: 'Employee Directory', category: 'HR', icon: '👥', description: 'Team contacts' },
    { id: 's6', name: 'Inventory Tracker', category: 'Operations', icon: '📦', description: 'Stock management' },
    { id: 's7', name: 'Sales Pipeline', category: 'Sales', icon: '📈', description: 'Deal tracking' },
    { id: 's8', name: 'OKR Tracker', category: 'Project', icon: '🎯', description: 'Goals & key results' },
    { id: 's9', name: 'Expense Report', category: 'Finance', icon: '💳', description: 'Business expenses' },
    { id: 's10', name: 'KPI Dashboard', category: 'Analytics', icon: '📉', description: 'Metrics overview' },
    { id: 's11', name: 'Customer List', category: 'CRM', icon: '🤝', description: 'Contact management' },
    { id: 's12', name: 'Sprint Backlog', category: 'Agile', icon: '🏃', description: 'Sprint planning' }
];

// Common formulas for sheets
const COMMON_FORMULAS = [
    { name: 'SUM', syntax: '=SUM(A1:A10)', description: 'Add numbers' },
    { name: 'AVERAGE', syntax: '=AVERAGE(A1:A10)', description: 'Calculate mean' },
    { name: 'COUNT', syntax: '=COUNT(A1:A10)', description: 'Count numbers' },
    { name: 'MAX', syntax: '=MAX(A1:A10)', description: 'Find maximum' },
    { name: 'MIN', syntax: '=MIN(A1:A10)', description: 'Find minimum' },
    { name: 'IF', syntax: '=IF(A1>10,"Yes","No")', description: 'Conditional logic' },
    { name: 'VLOOKUP', syntax: '=VLOOKUP(A1,B:C,2,FALSE)', description: 'Lookup value' },
    { name: 'CONCAT', syntax: '=CONCAT(A1,B1)', description: 'Join text' }
];

const getColumnLabel = (index: number) => {
    let label = '';
    let i = index;
    while (i >= 0) {
        label = String.fromCharCode((i % 26) + 65) + label;
        i = Math.floor(i / 26) - 1;
    }
    return label;
};

const DocsRuler: React.FC = () => {
    return (
        <div className="h-6 bg-[#f9fbfd] border-b border-gray-300 flex items-end relative overflow-hidden shrink-0">
            <div className="absolute left-[96px] top-0 bottom-0 w-[1px] bg-blue-400 z-10">
                <div className="absolute top-0 left-[-5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-blue-500"></div>
            </div>
            <div className="flex-1 flex items-end h-full ml-[96px] mr-[96px]">
                {Array.from({ length: 80 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`border-l border-gray-400 ${i % 10 === 0 ? 'h-3' : i % 5 === 0 ? 'h-2' : 'h-1'}`} 
                        style={{ width: '10px' }}
                    />
                ))}
            </div>
            <div className="absolute right-[96px] top-0 bottom-0 w-[1px] bg-blue-400 z-10">
                 <div className="absolute top-0 left-[-5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-blue-500"></div>
            </div>
        </div>
    )
}

// Document Setup Screen
const DocSetup: React.FC<{ onBack: () => void; onSelect: (templateId: string) => void }> = ({ onBack, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'templates' | 'ai'>('templates');
    
    const categories = ['All', 'Business', 'Academic', 'Technical', 'Creative', 'Personal'];
    const [filter, setFilter] = useState('All');
    
    const filteredTemplates = DOC_TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filter === 'All' || t.category === filter;
        return matchesSearch && matchesCategory;
    });
    
    return (
        <div className="flex h-full w-full bg-[#faf8f5]">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="p-5 border-b border-slate-100">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors">
                        <ArrowLeft size={16}/> Back to dashboard
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">New Document</h2>
                    <p className="text-sm text-slate-500 mt-1">Choose a template to get started</p>
                </div>
                
                {/* View Toggle */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setViewMode('templates')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                            <LayoutTemplate size={14} className="inline mr-2"/> Templates
                        </button>
                        <button onClick={() => setViewMode('ai')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                            <Sparkles size={14} className="inline mr-2"/> AI Generate
                        </button>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setFilter(cat)} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === cat ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#faf8f5]">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-200">
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search templates..." 
                        className="w-full max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                
                {viewMode === 'templates' ? (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelect(template.id)}
                                    className="group bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                                >
                                    <div className="aspect-[4/3] bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                                        {template.icon}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{template.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="max-w-lg w-full text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
                                <Sparkles size={32} className="text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Generate with AI</h3>
                            <p className="text-slate-500 mb-6">Describe your document and let AI create the structure for you</p>
                            <textarea 
                                className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-4"
                                placeholder="E.g., Create a project proposal for a mobile app development project..."
                            />
                            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                                <Sparkles size={16}/> Generate Document
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Spreadsheet Setup Screen
const SheetSetup: React.FC<{ onBack: () => void; onSelect: (templateId: string) => void }> = ({ onBack, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'templates' | 'ai'>('templates');
    
    const categories = ['All', 'Finance', 'Project Management', 'HR', 'Sales', 'Analytics'];
    const [filter, setFilter] = useState('All');
    
    const filteredTemplates = SHEET_TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filter === 'All' || t.category === filter;
        return matchesSearch && matchesCategory;
    });
    
    return (
        <div className="flex h-full w-full bg-[#faf8f5]">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="p-5 border-b border-slate-100">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors">
                        <ArrowLeft size={16}/> Back to dashboard
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">New Spreadsheet</h2>
                    <p className="text-sm text-slate-500 mt-1">Choose a template to get started</p>
                </div>
                
                {/* View Toggle */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setViewMode('templates')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'templates' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                            <LayoutTemplate size={14} className="inline mr-2"/> Templates
                        </button>
                        <button onClick={() => setViewMode('ai')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                            <Sparkles size={14} className="inline mr-2"/> AI Generate
                        </button>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setFilter(cat)} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === cat ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#faf8f5]">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-200">
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search templates..." 
                        className="w-full max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                
                {viewMode === 'templates' ? (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelect(template.id)}
                                    className="group bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
                                >
                                    <div className="aspect-[4/3] bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                                        {template.icon}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{template.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="max-w-lg w-full text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                                <Sparkles size={32} className="text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Generate with AI</h3>
                            <p className="text-slate-500 mb-6">Describe your data and let AI create the spreadsheet structure</p>
                            <textarea 
                                className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 mb-4"
                                placeholder="E.g., Create a monthly budget tracker with income, expenses, and savings..."
                            />
                            <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                <Sparkles size={16}/> Generate Spreadsheet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SlideSetup: React.FC<{ onBack: () => void; onSelect: (layout: string, theme?: string) => void }> = ({ onBack, onSelect }) => {
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'templates' | 'ai'>('templates');
    const [searchQuery, setSearchQuery] = useState('');
    const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');
    
    const categories = ['All', 'Business', 'Marketing', 'Sales', 'Product', 'Education', 'Creative'];
    
    const filteredTemplates = MODERN_TEMPLATES.filter(t => {
        const matchesCategory = filter === 'All' || t.category === filter;
        const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredTemplates = MODERN_TEMPLATES.filter(t => t.featured);

    return (
        <div className="flex h-full w-full bg-[#faf8f5] text-slate-800 font-sans absolute inset-0 z-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 border-r border-slate-200 bg-white p-6 flex flex-col">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl text-white shadow-lg shadow-orange-500/20">
                        <Presentation size={22} />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">Slides</span>
                        <p className="text-[10px] text-slate-500 font-medium">Gamma-style presentations</p>
                    </div>
                </div>
                
                <div className="space-y-1">
                    <button 
                        onClick={() => setViewMode('templates')}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                            viewMode === 'templates' 
                            ? 'bg-slate-100 text-slate-800' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <LayoutTemplate size={18} /> Templates
                    </button>
                    <button 
                        onClick={() => setViewMode('ai')}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                            viewMode === 'ai' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <Sparkles size={18} /> Generate with AI
                    </button>
                </div>

                <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Categories</h4>
                    <div className="space-y-0.5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setFilter(cat); setViewMode('templates'); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                    filter === cat && viewMode === 'templates'
                                    ? 'bg-orange-100 text-orange-700 font-semibold' 
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                                <span className="text-[10px] text-slate-400 ml-2">
                                    {cat === 'All' ? MODERN_TEMPLATES.length : MODERN_TEMPLATES.filter(t => t.category === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors w-full px-2 py-2 rounded-lg hover:bg-slate-50">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#faf8f5]">
                {viewMode === 'templates' ? (
                    <div className="max-w-[1400px] mx-auto px-12 py-12">
                        {/* Header */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-[11px] font-bold tracking-[2px] uppercase text-purple-600 mb-2 flex items-center gap-2">
                                        <Sparkles size={12} /> Create New
                                    </div>
                                    <h1 className="text-4xl font-bold text-slate-800 leading-tight tracking-tight">
                                        Choose a Template
                                    </h1>
                                    <p className="text-slate-500 mt-2 text-sm max-w-xl">
                                        Start with a professionally designed template. Each is optimized for clarity, storytelling, and modern presentations.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search templates..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-64 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Section */}
                        {filter === 'All' && !searchQuery && (
                            <div className="mb-12">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="text-yellow-500">⭐</span> Featured Templates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {featuredTemplates.slice(0, 3).map((tpl) => {
                                        const currentTheme = SLIDE_THEMES[tpl.theme as keyof typeof SLIDE_THEMES];
                                        if (!currentTheme) return null;
                                        return (
                                            <button 
                                                key={tpl.id} 
                                                onClick={() => onSelect('content', tpl.theme)} 
                                                className="relative h-[200px] rounded-2xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-lg group text-left border border-white/10"
                                            >
                                                <div className={`absolute inset-0 ${currentTheme.bg}`} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                <div className="relative z-10 text-3xl">{tpl.icon}</div>
                                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <ArrowRight size={16} strokeWidth={3} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-1">{tpl.category}</div>
                                                    <h3 className="text-lg font-bold text-white mb-1">{tpl.name}</h3>
                                                    <div className="text-xs text-white/70">{tpl.meta}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* All Templates Grid */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                {filter === 'All' ? 'All Templates' : filter} 
                                <span className="text-slate-400 font-normal ml-2">({filteredTemplates.length})</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
                                {/* Blank Template */}
                                <button 
                                    onClick={() => onSelect('fluid', 'clean')}
                                    className="h-[180px] rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden cursor-pointer bg-white border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-purple-500">
                                        <Plus size={28} />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-600 group-hover:text-purple-600">Start Blank</h4>
                                    <p className="text-xs text-slate-400 mt-1">Empty canvas</p>
                                </button>

                                {filteredTemplates.map((tpl) => {
                                    const currentTheme = SLIDE_THEMES[tpl.theme as keyof typeof SLIDE_THEMES];
                                    if (!currentTheme) return null;
                                    
                                    return (
                                        <button 
                                            key={tpl.id} 
                                            onClick={() => onSelect('content', tpl.theme)} 
                                            className="relative h-[180px] rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group text-left border border-white/10 hover:border-white/20"
                                        >
                                            <div className={`absolute inset-0 ${currentTheme.bg} opacity-80`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                            <div className="relative z-10 flex items-center justify-between">
                                                <span className="text-2xl">{tpl.icon}</span>
                                                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight size={14} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="text-[9px] font-bold tracking-widest text-white/50 uppercase mb-0.5">{tpl.category}</div>
                                                <h3 className="text-sm font-bold text-white leading-tight">{tpl.name}</h3>
                                                <div className="text-[10px] text-white/60 mt-0.5">{tpl.meta}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* AI Generation Mode */
                    <div className="flex items-center justify-center min-h-full p-8">
                        <div className="w-full max-w-4xl">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200 mb-4">
                                    <Sparkles size={14} className="text-purple-600" />
                                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI-Powered</span>
                                </div>
                                <h1 className="text-4xl font-bold text-slate-800 mb-3">Generate a Presentation</h1>
                                <p className="text-slate-500 max-w-lg mx-auto">
                                    Describe your idea, paste an outline, or import content. Our AI will create a stunning deck in seconds.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
                                {/* Input Tabs */}
                                <div className="flex gap-2 mb-6">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-semibold">
                                        <Type size={14} /> Text Prompt
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                                        <FileText size={14} /> Paste Outline
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                                        <Download size={14} /> Import File
                                    </button>
                                </div>

                                {/* Prompt Input */}
                                <div className="relative mb-6">
                                    <textarea
                                        placeholder="Describe your presentation... e.g., 'Q4 strategy deck for fintech startup focusing on growth metrics and 2025 roadmap'"
                                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-500 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500">Press ⌘ Enter to generate</span>
                                    </div>
                                </div>

                                {/* Options Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Slide Count</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option>6 slides</option>
                                            <option>8 slides</option>
                                            <option>10 slides</option>
                                            <option>12 slides</option>
                                            <option>15 slides</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Text Density</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option>Minimal</option>
                                            <option>Standard</option>
                                            <option>Detailed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Language</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                            <option>German</option>
                                            <option>Portuguese</option>
                                            <option>Japanese</option>
                                            <option>Chinese</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Theme Selection */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Theme</label>
                                        <div className="flex gap-2">
                                            {['all', 'light', 'dark'].map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setThemeFilter(f as any)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                                        themeFilter === f 
                                                        ? 'bg-slate-100 text-slate-800' 
                                                        : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(SLIDE_THEMES)
                                            .filter(([_, theme]) => themeFilter === 'all' || theme.category === themeFilter)
                                            .slice(0, 10)
                                            .map(([key, theme]) => (
                                            <button 
                                                key={key} 
                                                className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                                                    'border-transparent hover:border-purple-500'
                                                }`}
                                            >
                                                <div className={`absolute inset-0 ${theme.bg}`}></div>
                                                <span className={`absolute bottom-1 left-2 text-[9px] font-bold ${theme.text} drop-shadow-md opacity-80`}>{theme.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button 
                                    onClick={() => onSelect('content', 'midnight')}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 flex items-center justify-center gap-3"
                                >
                                    <Sparkles size={18} fill="currentColor" />
                                    Generate Presentation
                                </button>
                            </div>

                            {/* Quick Prompts */}
                            <div className="mt-8">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Try these prompts</h4>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        'Startup pitch deck for AI company',
                                        'Q4 marketing strategy presentation',
                                        'Product roadmap for 2025',
                                        'Team onboarding guide',
                                        'Sales deck for enterprise clients'
                                    ].map((prompt) => (
                                        <button 
                                            key={prompt}
                                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 hover:text-slate-800 transition-all"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const DocumentEditorPane: React.FC<DocumentEditorPaneProps> = ({ onCollapse, activeModelId, currentUser }) => {
    const [view, setView] = useState<'dashboard' | 'slide-setup' | 'doc-setup' | 'sheet-setup' | 'editor'>('dashboard');
    const [docType, setDocType] = useState<'docs' | 'sheets' | 'slides'>('docs');
    const [title, setTitle] = useState("Untitled document");
    const [content, setContent] = useState(``);
    const [formatting, setFormatting] = useState({
        bold: false,
        italic: false,
        underline: false,
        align: 'left' as 'left' | 'center' | 'right' | 'justify',
        list: null as 'bullet' | 'ordered' | null
    });
    const [fontSize, setFontSize] = useState(11);
    const ROWS = 50;
    const COLS = 26;
    const [sheetData, setSheetData] = useState<string[][]>(() => 
        Array.from({ length: ROWS }, () => Array(COLS).fill(''))
    );
    const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);
    const [sheetStyles, setSheetStyles] = useState<Record<string, React.CSSProperties>>({});
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [docSections, setDocSections] = useState([{ id: '1', title: 'Main Section' }]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>('1');
    const menuRef = useRef<HTMLDivElement>(null);
    const avatarContainerRef = useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = useState<'Editing' | 'Suggesting' | 'Viewing'>('Editing');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([
        { id: '1', layout: 'title', title: 'Q3 Product Strategy', subtitle: 'Accelerating Growth with AI', body: '' },
        { id: '2', layout: 'content', title: 'Key Objectives', subtitle: '', body: '• Scale infrastructure to 99.99% uptime\n• Integrate Gemini 3 Pro across all surfaces\n• Launch Creator Studio Beta' },
        { id: '3', layout: 'big-number', title: 'User Growth', subtitle: 'Month over Month', body: '142%' },
        { id: '4', layout: 'visual', title: 'Architecture Overview', subtitle: 'System Design', body: '' }
    ]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [slideTheme, setSlideTheme] = useState<keyof typeof SLIDE_THEMES>('midnight');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isGenerateMode, setIsGenerateMode] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [genSlideCount, setGenSlideCount] = useState(8);
    const [genTextAmount, setGenTextAmount] = useState<'minimal' | 'standard' | 'detailed'>('standard');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExportMenuOpen, setIsExportMenu] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [recentDocs, setRecentDocs] = useState<{id: string, title: string, type: 'docs' | 'sheets' | 'slides', lastEdited: string}[]>(() => {
        const stored = localStorage.getItem('sai-recent-docs');
        return stored ? JSON.parse(stored) : [];
    });
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isAiAssisting, setIsAiAssisting] = useState(false);
    
    // Enhanced Docs state
    const [docTemplate, setDocTemplate] = useState<string | null>(null);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [docOutline, setDocOutline] = useState<{id: string, text: string, level: number}[]>([]);
    const [writingGoal, setWritingGoal] = useState<number>(500);
    
    // Enhanced Sheets state
    const [sheetTemplate, setSheetTemplate] = useState<string | null>(null);
    const [showFormulaPanel, setShowFormulaPanel] = useState(false);
    const [selectedRange, setSelectedRange] = useState<{start: {r: number, c: number}, end: {r: number, c: number}} | null>(null);
    const [sheetTabs, setSheetTabs] = useState([{ id: '1', name: 'Sheet 1' }]);
    const [activeSheetTab, setActiveSheetTab] = useState('1');
    const [chartPreview, setChartPreview] = useState<'none' | 'bar' | 'line' | 'pie'>('none');

    // Premium Features State
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [collaborators, setCollaborators] = useState<{id: string, name: string, color: string, avatar?: string, cursor?: {x: number, y: number}, email?: string, permission?: 'view' | 'edit' | 'comment', invitedAt?: Date}[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [documentPermission, setDocumentPermission] = useState<'private' | 'view' | 'edit'>('private');
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePermission, setInvitePermission] = useState<'view' | 'edit' | 'comment'>('edit');
    const [commandSearch, setCommandSearch] = useState('');
    const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success' | 'warning'}[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [voiceInputActive, setVoiceInputActive] = useState(false);
    const [documentLanguage, setDocumentLanguage] = useState('en');
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const commandInputRef = useRef<HTMLInputElement>(null);

    // Command palette commands
    const commands = [
        { id: 'new-doc', label: 'New Document', icon: FileText, shortcut: 'D', action: () => handleNewDocument('docs') },
        { id: 'new-sheet', label: 'New Spreadsheet', icon: Table, shortcut: 'S', action: () => handleNewDocument('sheets') },
        { id: 'new-slide', label: 'New Presentation', icon: Presentation, shortcut: 'P', action: () => handleNewDocument('slides') },
        { id: 'ai-generate', label: 'Generate with AI', icon: Sparkles, shortcut: '⌘K', action: () => { setDocType('slides'); setView('slide-setup'); setIsGenerateMode(true); } },
        { id: 'save', label: 'Save Document', icon: Save, shortcut: '⌘S', action: () => handleSave() },
        { id: 'export', label: 'Export', icon: Download, shortcut: '⌘E', action: () => setIsExportMenu(true) },
        { id: 'share', label: 'Share Document', icon: Share2, shortcut: '⌘⇧S', action: () => setShowShareModal(true) },
        { id: 'focus', label: 'Toggle Focus Mode', icon: Focus, shortcut: '⌘⇧F', action: () => setIsFocusMode(!isFocusMode) },
        { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, shortcut: '⌘/', action: () => setShowKeyboardShortcuts(true) },
        { id: 'history', label: 'Version History', icon: History, shortcut: '⌘H', action: () => setShowVersionHistory(true) },
        { id: 'dark-mode', label: 'Toggle Dark Mode', icon: isDarkMode ? Sun : Moon, shortcut: '⌘D', action: () => setIsDarkMode(!isDarkMode) },
        { id: 'voice', label: 'Voice Input', icon: Mic, shortcut: '⌘M', action: () => setVoiceInputActive(!voiceInputActive) },
    ];

    const filteredCommands = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
    );

    // Autosave effect
    useEffect(() => {
        if (!autoSaveEnabled || view !== 'editor') return;
        const timer = setTimeout(() => {
            setSyncStatus('syncing');
            setTimeout(() => {
                setLastSaved(new Date());
                setSyncStatus('synced');
            }, 800);
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, sheetData, slides, autoSaveEnabled, view]);

    // Command palette keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
                setTimeout(() => commandInputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
                setShowKeyboardShortcuts(false);
                setShowShareModal(false);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setShowKeyboardShortcuts(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSave = () => {
        setSyncStatus('syncing');
        setTimeout(() => {
            setLastSaved(new Date());
            setSyncStatus('synced');
            setNotifications(prev => [...prev, { id: Date.now().toString(), message: 'Document saved', type: 'success' }]);
        }, 500);
    };

    // Initialize collaborators (empty - users must be invited)
    useEffect(() => {
        // No hardcoded collaborators - users must invite people
        // Auto-dismiss notifications after 4 seconds
        const interval = setInterval(() => {
            setNotifications(prev => prev.length > 0 ? prev.slice(1) : prev);
        }, 4000);
        
        return () => clearInterval(interval);
    }, []);

    // Generate random color for new collaborators
    const generateCollaboratorColor = () => {
        const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Invite collaborator by email
    const handleInviteCollaborator = () => {
        if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
            setNotifications(prev => [...prev, { id: Date.now().toString(), message: 'Please enter a valid email', type: 'warning' }]);
            return;
        }
        
        // Check if already invited
        if (collaborators.some(c => c.id === inviteEmail.toLowerCase())) {
            setNotifications(prev => [...prev, { id: Date.now().toString(), message: 'User already invited', type: 'warning' }]);
            return;
        }

        // Extract name from email (before @)
        const namePart = inviteEmail.split('@')[0];
        const formattedName = namePart
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const newCollaborator = {
            id: inviteEmail.toLowerCase(),
            name: formattedName,
            email: inviteEmail.toLowerCase(),
            color: generateCollaboratorColor(),
            permission: invitePermission,
            avatar: undefined,
            cursor: undefined,
            invitedAt: new Date()
        };

        setCollaborators(prev => [...prev, newCollaborator]);
        setInviteEmail('');
        setNotifications(prev => [...prev, { id: Date.now().toString(), message: `Invitation sent to ${inviteEmail}`, type: 'success' }]);
    };

    // Remove collaborator
    const handleRemoveCollaborator = (id: string) => {
        setCollaborators(prev => prev.filter(c => c.id !== id));
        setNotifications(prev => [...prev, { id: Date.now().toString(), message: 'Collaborator removed', type: 'info' }]);
    };

    // Update collaborator permission
    const handleUpdateCollaboratorPermission = (id: string, permission: 'view' | 'edit' | 'comment') => {
        setCollaborators(prev => prev.map(c => c.id === id ? { ...c, permission } : c));
    };

    const startResizing = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const sidebarRect = sidebarRef.current?.getBoundingClientRect();
            if (!sidebarRect) return;
            const newWidth = e.clientX - sidebarRect.left;
            const constrainedWidth = Math.max(200, Math.min(newWidth, 600));
            setSidebarWidth(constrainedWidth);
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenu(null);
            if (isModeMenuOpen && !(event.target as HTMLElement).closest('.mode-selector')) setIsModeMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isModeMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (view === 'dashboard') {
                const key = e.key.toLowerCase();
                if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
                if (key === 'd') { e.preventDefault(); handleNewDocument('docs'); }
                if (key === 's') { e.preventDefault(); handleNewDocument('sheets'); }
                if (key === 'p') { e.preventDefault(); handleNewDocument('slides'); }
                if ((e.metaKey || e.ctrlKey) && key === 'k') {
                  e.preventDefault();
                  setDocType('slides'); setView('slide-setup'); setIsGenerateMode(true);
                }
            } else if (docType === 'slides' && view === 'editor') {
                if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setActiveSlideIndex(prev => Math.max(0, prev - 1)); }
                else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1)); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [docType, view, slides.length]);

    const handleNewDocument = (type: 'docs' | 'sheets' | 'slides' = 'docs') => {
        setDocType(type);
        if (type === 'slides') { setView('slide-setup'); return; }
        if (type === 'docs') { setView('doc-setup'); return; }
        if (type === 'sheets') { setView('sheet-setup'); return; }
        setTitle(type === 'sheets' ? "Untitled Spreadsheet" : "Untitled document");
        setContent("");
        if (type === 'sheets') {
            setSheetData(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
            setActiveCell({ r: 0, c: 0 });
            setSheetStyles({});
        }
        setView('editor');
    };

    const handleSlideSetupComplete = (layout: string, theme?: string) => {
        if (theme) setSlideTheme(theme as any);
        setTitle("Untitled Presentation");
        const initialLayout = (layout === 'fluid' ? 'title' : layout) as 'title' | 'content' | 'visual' | 'big-number';
        setSlides([{ id: Date.now().toString(), layout: initialLayout, title: 'New Presentation', subtitle: 'Subtitle', body: '' }]);
        setActiveSlideIndex(0);
        setView('editor');
    };

    const handleDocSetupComplete = (templateId: string) => {
        const template = DOC_TEMPLATES.find(t => t.id === templateId);
        setDocTemplate(templateId);
        setTitle(template ? `New ${template.name}` : "Untitled Document");
        setContent(template?.content || "");
        setView('editor');
    };

    const handleSheetSetupComplete = (templateId: string) => {
        const template = SHEET_TEMPLATES.find(t => t.id === templateId);
        setSheetTemplate(templateId);
        setTitle(template ? `New ${template.name}` : "Untitled Spreadsheet");
        setSheetData(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
        setActiveCell({ r: 0, c: 0 });
        setSheetStyles({});
        setView('editor');
    };

    const handleBack = () => {
        if (view === 'editor' || view === 'slide-setup' || view === 'doc-setup' || view === 'sheet-setup') setView('dashboard');
        else onCollapse();
    };

    const toggleFormat = (key: keyof typeof formatting) => setFormatting(prev => ({ ...prev, [key]: !prev[key] }));
    const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => setFormatting(prev => ({ ...prev, align }));
    const toggleList = (type: 'bullet' | 'ordered') => setFormatting(prev => ({ ...prev, list: prev.list === type ? null : type }));
    const handleMenuClick = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);
    const handleAddSection = () => {
        const newId = Date.now().toString();
        setDocSections([...docSections, { id: newId, title: `Section ${docSections.length + 1}` }]);
        setActiveSectionId(newId);
    };

    const updateSheetCell = (row: number, col: number, value: string) => {
        const newData = [...sheetData];
        newData[row] = [...newData[row]];
        newData[row][col] = value;
        setSheetData(newData);
    };

    const toggleSheetStyle = (styleKey: keyof React.CSSProperties, value: any) => {
        if (!activeCell) return;
        const key = `${activeCell.r}-${activeCell.c}`;
        setSheetStyles(prev => {
            const currentStyle = prev[key] || {};
            let updatedStyle = { ...currentStyle };
            if (styleKey === 'fontWeight') updatedStyle.fontWeight = currentStyle.fontWeight === 'bold' ? 'normal' : 'bold';
            else if (styleKey === 'fontStyle') updatedStyle.fontStyle = currentStyle.fontStyle === 'italic' ? 'normal' : 'italic';
            else if (styleKey === 'textDecoration') updatedStyle.textDecoration = currentStyle.textDecoration === 'line-through' ? 'none' : 'line-through';
            else updatedStyle = { ...updatedStyle, [styleKey]: value };
            return { ...prev, [key]: updatedStyle };
        });
    };

    const addNewSlide = () => {
        const newSlide: Slide = { id: Date.now().toString(), layout: 'content', title: 'New Slide', subtitle: '', body: '• Click to edit text' };
        const newSlides = [...slides];
        newSlides.splice(activeSlideIndex + 1, 0, newSlide);
        setSlides(newSlides);
        setActiveSlideIndex(activeSlideIndex + 1);
    };

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;

    const saveDocument = useCallback(() => {
        const docData = { title, content, docType, slides, sheetData };
        localStorage.setItem('sai-current-doc', JSON.stringify(docData));
        setLastSaved(new Date());
        
        // Add to recent docs
        const newRecent = {
            id: Date.now().toString(),
            title: title || 'Untitled',
            type: docType,
            lastEdited: new Date().toISOString()
        };
        const updatedRecents = [newRecent, ...recentDocs.filter(d => d.title !== title).slice(0, 4)];
        setRecentDocs(updatedRecents);
        localStorage.setItem('sai-recent-docs', JSON.stringify(updatedRecents));
    }, [title, content, docType, slides, sheetData, recentDocs]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (view !== 'editor') return;
        const interval = setInterval(saveDocument, 30000);
        return () => clearInterval(interval);
    }, [view, saveDocument]);

    const aiAssistContent = async (action: 'improve' | 'summarize' | 'expand' | 'fix') => {
        if (!content.trim()) return;
        setIsAiAssisting(true);
        try {
            const prompts: Record<string, string> = {
                improve: `Improve the writing quality, clarity, and flow of this text while keeping the same meaning:\n\n${content}`,
                summarize: `Summarize this text concisely:\n\n${content}`,
                expand: `Expand on this text with more details and examples:\n\n${content}`,
                fix: `Fix any grammar, spelling, and punctuation errors in this text:\n\n${content}`
            };
            const response = await aiService.getChatResponse({
                prompt: prompts[action],
                modelId: activeModelId || 'gemini-2.5-flash'
            });
            if (response.text) {
                setContent(response.text);
            }
        } catch (e) {
            console.error('AI assist error:', e);
        } finally {
            setIsAiAssisting(false);
        }
    };

    const generateSlides = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const prompt = `Create a professional presentation deck about: "${aiPrompt}".

Requirements:
- Exactly ${genSlideCount} slides
- Each slide must have meaningful content
- First slide should be a title slide
- DO NOT use markdown formatting (no #, **, *, etc.)
- Use plain bullet points with "• " character only
- Write content as plain readable text

Return a valid JSON object with this exact structure:
{
  "slides": [
    {
      "layout": "title",
      "title": "Main Presentation Title",
      "subtitle": "Subtitle or tagline",
      "body": ""
    },
    {
      "layout": "content",
      "title": "Slide Title",
      "subtitle": "",
      "body": "• First key point here\\n• Second key point here\\n• Third key point here"
    }
  ]
}

IMPORTANT: 
- Use "• " (bullet character) NOT "- " or "* "
- No markdown headers (no # symbols)
- No bold/italic markers (no ** or *)
- Just plain text with bullet points
- Layout options: "title", "content", "section", "two-column"
- Make the content informative and professional.`;

            const response = await aiService.getChatResponse({
                prompt,
                modelId: activeModelId || 'gemini-2.5-flash',
                responseMimeType: 'application/json'
            });
            
            const text = response.text || '';
            console.log('AI Slide Response:', text);
            
            // Clean and parse JSON
            let cleanJson = text.replace(/```json|```/g, '').trim();
            
            // Try to extract JSON if wrapped in other text
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }
            
            const data = JSON.parse(cleanJson);
            
            // Helper to clean markdown from text
            const cleanMarkdown = (text: string): string => {
                if (!text) return '';
                return text
                    .replace(/^#{1,6}\s*/gm, '') // Remove # headers
                    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
                    .replace(/\*([^*]+)\*/g, '$1') // Remove *italic*
                    .replace(/^[\-\*]\s/gm, '• ') // Convert - or * bullets to •
                    .replace(/`([^`]+)`/g, '$1') // Remove inline code
                    .trim();
            };
            
            if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
                const newSlides = data.slides.map((s: any, i: number) => ({
                    id: Date.now().toString() + i,
                    layout: s.layout || 'content',
                    title: cleanMarkdown(s.title) || `Slide ${i + 1}`,
                    subtitle: cleanMarkdown(s.subtitle) || '',
                    body: cleanMarkdown(s.body) || ''
                }));
                setSlides(newSlides);
                setActiveSlideIndex(0);
                setIsGenerateMode(false);
                setAiPrompt('');
            } else {
                // Fallback: create default slides if parsing failed
                console.error('Invalid slide data, creating defaults');
                const fallbackSlides = [
                    { id: Date.now().toString() + '0', layout: 'title', title: aiPrompt, subtitle: 'AI Generated Presentation', body: '' },
                    { id: Date.now().toString() + '1', layout: 'content', title: 'Overview', subtitle: '', body: '• Key point 1\n• Key point 2\n• Key point 3' },
                ];
                setSlides(fallbackSlides);
                setActiveSlideIndex(0);
                setIsGenerateMode(false);
                setAiPrompt('');
            }
        } catch (e) { 
            console.error('Slide generation error:', e);
            // Create fallback slides on error
            const fallbackSlides = [
                { id: Date.now().toString() + '0', layout: 'title', title: aiPrompt, subtitle: 'Presentation', body: '' },
                { id: Date.now().toString() + '1', layout: 'content', title: 'Content', subtitle: '', body: 'Add your content here' },
            ];
            setSlides(fallbackSlides);
            setActiveSlideIndex(0);
            setIsGenerateMode(false);
        }
        finally { setIsGenerating(false); }
    };

    const updateSlide = (field: keyof Slide, value: string) => {
        const newSlides = [...slides];
        newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], [field]: value };
        setSlides(newSlides);
    };

    const handleExport = (format: string) => {
        setIsExportMenu(false);
        const timestamp = new Date().toISOString().slice(0, 10);
        let filename = title.replace(/\s+/g, '_') + `_${timestamp}`;
        let contentToSave = '';
        switch (format) {
            case 'csv': filename += '.csv'; contentToSave = sheetData.map(row => row.join(',')).join('\n'); break;
            case 'doc': filename += '.doc'; contentToSave = content; break;
            case 'pdf': filename += '.pdf'; contentToSave = content; break;
            case 'ppt': filename += '.pptx'; contentToSave = JSON.stringify(slides); break;
        }
        if (format === 'csv') {
            const blob = new Blob([contentToSave], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        } else { alert(`Exporting to ${format.toUpperCase()}...`); }
    };

    const getEditorIcon = () => {
        switch(docType) {
            case 'sheets': return <FileSpreadsheet size={18} className="text-emerald-400" />;
            case 'slides': return <Presentation size={18} className="text-orange-400" />;
            default: return <FileText size={18} className="text-blue-600" />;
        }
    };

    const MENUS = [
        { label: 'File', items: ['New', 'Open', 'Make a copy', 'Share', 'Email', 'Download', 'Rename', 'Move to trash'] },
        { label: 'Edit', items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Select all', 'Find and replace'] },
        { label: 'View', items: ['Mode', 'Show print layout', 'Show ruler', 'Show outline', 'Full screen'] },
        { label: 'Insert', items: ['Image', 'Table', 'Drawing', 'Chart', 'Horizontal line', 'Date', 'Footnote'] },
        { label: 'Format', items: ['Text', 'Paragraph styles', 'Align & indent', 'Line & paragraph spacing', 'Columns', 'Bullets & numbering'] },
        { label: 'Tools', items: ['Spelling and grammar', 'Word count', 'Review suggested edits', 'Compare documents', 'Citations'] },
        { label: 'Extensions', items: ['Add-ons', 'Apps script'] },
        { label: 'Help', items: ['Help', 'Training', 'Updates'] }
    ];

    // Helper to render markdown-style content as formatted HTML
    const formatSlideContent = (text: string) => {
        if (!text) return null;
        
        // Split by newlines and process each line
        const lines = text.split('\n');
        
        return (
            <div className="space-y-2">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={idx} className="h-2" />; // Empty line = spacing
                    
                    // Bullet points (•, -, *, or numbered)
                    if (/^[•\-\*]\s/.test(trimmed)) {
                        const content = trimmed.replace(/^[•\-\*]\s*/, '');
                        return (
                            <div key={idx} className="flex items-start gap-3">
                                <span className="text-current opacity-60 mt-1">•</span>
                                <span>{formatInlineText(content)}</span>
                            </div>
                        );
                    }
                    
                    // Numbered lists
                    if (/^\d+[\.\)]\s/.test(trimmed)) {
                        const match = trimmed.match(/^(\d+)[\.\)]\s*(.*)/);
                        if (match) {
                            return (
                                <div key={idx} className="flex items-start gap-3">
                                    <span className="text-current opacity-60 font-semibold min-w-[1.5rem]">{match[1]}.</span>
                                    <span>{formatInlineText(match[2])}</span>
                                </div>
                            );
                        }
                    }
                    
                    // Headers (##, ###)
                    if (/^#{1,3}\s/.test(trimmed)) {
                        const content = trimmed.replace(/^#{1,3}\s*/, '');
                        return <div key={idx} className="font-bold text-lg mt-2">{content}</div>;
                    }
                    
                    // Regular paragraph
                    return <div key={idx}>{formatInlineText(trimmed)}</div>;
                })}
            </div>
        );
    };
    
    // Format inline text (bold, italic)
    const formatInlineText = (text: string) => {
        // Replace **bold** and *italic*
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    const SlideRenderer: React.FC<{ slide: Slide, theme: keyof typeof SLIDE_THEMES, scale?: number, editable?: boolean }> = ({ slide, theme, scale = 1, editable = true }) => {
        const currentTheme = SLIDE_THEMES[theme] || SLIDE_THEMES.midnight;
        if (!currentTheme) return null;
        const style = { transform: `scale(${scale})`, transformOrigin: 'top left', width: '100%', height: '100%' };
        return <div className={`w-full h-full ${currentTheme.bg} ${currentTheme.text} overflow-hidden relative shadow-inner`} style={editable ? {} : style}>
             <div className="absolute inset-0 p-[8%]">
                 {slide.layout === 'title' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-5xl font-black text-center outline-none placeholder-white/30 w-full ${currentTheme.text}`} placeholder="Title"/> : <h1 className="text-5xl font-black">{slide.title}</h1>}
                        {editable ? <input value={slide.subtitle} onChange={(e) => updateSlide('subtitle', e.target.value)} className={`bg-transparent text-2xl font-medium text-center outline-none w-full opacity-80 ${currentTheme.text}`} placeholder="Subtitle"/> : <h2 className="text-2xl font-medium opacity-80">{slide.subtitle}</h2>}
                    </div>
                )}
                {slide.layout === 'content' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-6 border-b-2 ${currentTheme.border} pb-4 w-full ${currentTheme.text}`} placeholder="Slide Title"/> : <h1 className={`text-4xl font-bold mb-6 border-b-2 ${currentTheme.border} pb-4`}>{slide.title}</h1>}
                        {editable ? <textarea value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`flex-1 bg-transparent text-xl outline-none resize-none leading-relaxed placeholder-white/30 ${currentTheme.text}`} placeholder="• Click to add content"/> : <div className="text-xl leading-relaxed flex-1 overflow-auto">{formatSlideContent(slide.body)}</div>}
                    </div>
                )}
                {slide.layout === 'big-number' && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        {editable ? <input value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`bg-transparent text-[12rem] font-black text-center outline-none w-full ${currentTheme.accent}`} placeholder="0%"/> : <div className={`text-[12rem] font-black ${currentTheme.accent}`}>{slide.body}</div>}
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-3xl font-bold text-center outline-none mt-4 w-full ${currentTheme.text}`} placeholder="Statistic Label"/> : <h2 className="text-3xl font-bold mt-4">{slide.title}</h2>}
                    </div>
                )}
                {slide.layout === 'visual' && (
                    <div className="flex h-full gap-8">
                        <div className="w-1/2 flex flex-col justify-center">
                            {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-4 ${currentTheme.text}`} placeholder="Title"/> : <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>}
                            {editable ? <textarea value={slide.subtitle} onChange={(e) => updateSlide('subtitle', e.target.value)} className={`bg-transparent text-lg outline-none resize-none h-40 opacity-80 ${currentTheme.text}`} placeholder="Description..."/> : <p className="text-lg opacity-80">{slide.subtitle}</p>}
                        </div>
                        <div className={`w-1/2 rounded-xl flex items-center justify-center border-2 border-dashed ${currentTheme.border} bg-white/5`}><div className="text-center opacity-50"><ImageIcon size={48} className="mx-auto mb-2"/><span className="text-sm font-bold">Image Placeholder</span></div></div>
                    </div>
                )}
                {slide.layout === 'two-column' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-6 border-b-2 ${currentTheme.border} pb-4 w-full ${currentTheme.text}`} placeholder="Slide Title"/> : <h1 className={`text-4xl font-bold mb-6 border-b-2 ${currentTheme.border} pb-4`}>{slide.title}</h1>}
                        <div className="flex-1 flex gap-8">
                            <div className="flex-1">
                                {editable ? <textarea value={slide.leftContent || slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`w-full h-full bg-transparent text-lg outline-none resize-none leading-relaxed placeholder-white/30 ${currentTheme.text}`} placeholder="Left column content..."/> : <div className="text-lg">{formatSlideContent(slide.leftContent || slide.body)}</div>}
                            </div>
                            <div className={`w-px ${currentTheme.border} border-l`}></div>
                            <div className="flex-1">
                                {editable ? <textarea value={slide.rightContent || ''} onChange={(e) => updateSlide('subtitle', e.target.value)} className={`w-full h-full bg-transparent text-lg outline-none resize-none leading-relaxed placeholder-white/30 ${currentTheme.text}`} placeholder="Right column content..."/> : <div className="text-lg">{formatSlideContent(slide.rightContent || slide.subtitle)}</div>}
                            </div>
                        </div>
                    </div>
                )}
                {slide.layout === 'comparison' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-6 text-center w-full ${currentTheme.text}`} placeholder="Comparison Title"/> : <h1 className="text-4xl font-bold mb-6 text-center">{slide.title}</h1>}
                        <div className="flex-1 flex gap-6">
                            <div className={`flex-1 rounded-2xl p-6 border-2 ${currentTheme.border} bg-white/5`}>
                                <h3 className={`text-xl font-bold mb-4 ${currentTheme.accent}`}>Before</h3>
                                {editable ? <textarea value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`w-full h-32 bg-transparent outline-none resize-none ${currentTheme.text}`} placeholder="Before state..."/> : <div className="text-base">{formatSlideContent(slide.body)}</div>}
                            </div>
                            <div className="flex items-center"><ArrowRight size={32} className={`${currentTheme.accent}`}/></div>
                            <div className={`flex-1 rounded-2xl p-6 border-2 ${currentTheme.border} bg-white/5`}>
                                <h3 className={`text-xl font-bold mb-4 ${currentTheme.accent}`}>After</h3>
                                {editable ? <textarea value={slide.subtitle} onChange={(e) => updateSlide('subtitle', e.target.value)} className={`w-full h-32 bg-transparent outline-none resize-none ${currentTheme.text}`} placeholder="After state..."/> : <div className="text-base">{formatSlideContent(slide.subtitle)}</div>}
                            </div>
                        </div>
                    </div>
                )}
                {slide.layout === 'timeline' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-8 w-full ${currentTheme.text}`} placeholder="Timeline Title"/> : <h1 className="text-4xl font-bold mb-8">{slide.title}</h1>}
                        <div className="flex-1 flex items-center">
                            <div className="flex-1 relative">
                                <div className={`absolute top-1/2 left-0 right-0 h-1 ${currentTheme.accent} bg-current opacity-30 rounded-full`}></div>
                                <div className="flex justify-between relative">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full ${currentTheme.accent} bg-current flex items-center justify-center text-xl font-bold mb-3`}>
                                                <span className={currentTheme.bg.includes('from-slate-900') || currentTheme.bg.includes('from-[#1') || currentTheme.bg.includes('from-cyan') ? 'text-white' : 'text-white'}>{step}</span>
                                            </div>
                                            <span className={`text-sm font-medium ${currentTheme.text} opacity-70`}>Phase {step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {editable ? <textarea value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`bg-transparent text-lg outline-none resize-none h-20 mt-4 ${currentTheme.text}`} placeholder="Timeline description..."/> : <p className="text-lg mt-4">{slide.body}</p>}
                    </div>
                )}
                {slide.layout === 'quote' && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className={`text-8xl ${currentTheme.accent} opacity-30 mb-4`}>"</div>
                        {editable ? <textarea value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`bg-transparent text-3xl font-medium text-center outline-none resize-none w-full leading-relaxed italic ${currentTheme.text}`} placeholder="Enter your quote here..."/> : <blockquote className="text-3xl font-medium italic leading-relaxed">{slide.body}</blockquote>}
                        {editable ? <input value={slide.subtitle} onChange={(e) => updateSlide('subtitle', e.target.value)} className={`bg-transparent text-xl font-bold text-center outline-none mt-8 w-full ${currentTheme.accent}`} placeholder="— Author Name"/> : <cite className={`text-xl font-bold mt-8 ${currentTheme.accent} not-italic`}>{slide.subtitle}</cite>}
                    </div>
                )}
                {slide.layout === 'gallery' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-6 w-full ${currentTheme.text}`} placeholder="Gallery Title"/> : <h1 className="text-4xl font-bold mb-6">{slide.title}</h1>}
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className={`rounded-xl flex items-center justify-center border-2 border-dashed ${currentTheme.border} bg-white/5`}>
                                    <div className="text-center opacity-40">
                                        <ImageIcon size={24} className="mx-auto mb-1"/>
                                        <span className="text-[10px] font-bold">Image {i}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {slide.layout === 'team' && (
                    <div className="flex flex-col h-full">
                        {editable ? <input value={slide.title} onChange={(e) => updateSlide('title', e.target.value)} className={`bg-transparent text-4xl font-bold outline-none mb-8 text-center w-full ${currentTheme.text}`} placeholder="Meet the Team"/> : <h1 className="text-4xl font-bold mb-8 text-center">{slide.title}</h1>}
                        <div className="flex-1 flex justify-center items-center gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-full ${currentTheme.border} border-2 bg-white/10 flex items-center justify-center mb-3`}>
                                        <User size={32} className={`${currentTheme.accent}`}/>
                                    </div>
                                    <span className={`text-sm font-bold ${currentTheme.text}`}>Team Member</span>
                                    <span className={`text-xs ${currentTheme.text} opacity-60`}>Role</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
        </div>
    };

    if (view === 'dashboard') {
        return (
            <div className="flex h-full w-full bg-[#faf8f5] text-slate-800 font-sans overflow-y-auto overflow-x-hidden relative dashboard-root">
                <style dangerouslySetInnerHTML={{ __html: `
                    .dashboard-root {
                      --bg: #faf8f5;
                      --panel: #ffffff;
                      --text: #1e293b;
                      --muted: #64748b;
                      --ring: rgba(0,0,0,0.06);
                      --blue: #3b82f6;
                      --green: #10b981;
                      --orange: #f97316;
                      background:
                        radial-gradient(1000px 600px at 15% -10%, rgba(59,130,246,0.08), transparent 60%),
                        radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.06), transparent 55%),
                        radial-gradient(800px 500px at 50% 120%, rgba(249,115,22,0.06), transparent 60%),
                        var(--bg);
                      color: var(--text);
                    }

                    .overlay {
                      max-width: 1200px;
                      margin: 0 auto;
                      padding: 72px 64px 96px;
                      position: relative;
                      animation: fadeUp .8s cubic-bezier(.2,.8,.2,1) both;
                    }

                    @keyframes fadeUp {
                      from { opacity: 0; transform: translateY(12px); }
                      to { opacity: 1; transform: translateY(0); }
                    }

                    .close-btn {
                      position: absolute;
                      top: 48px;
                      right: 64px;
                      width: 44px; height: 44px;
                      border-radius: 12px;
                      display: grid;
                      place-items: center;
                      background: white;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
                      font-size: 22px;
                      cursor: pointer;
                      transition: transform .2s ease, box-shadow .2s ease;
                      border: none;
                      z-index: 50;
                      color: #64748b;
                    }

                    .close-btn:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,0.12); color: #1e293b; }

                    .eyebrow { font-size: 12px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 14px; }
                    .hero-h1 { font-size: 48px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.02em; color: var(--text); background: linear-gradient(135deg, #1e293b 0%, #475569 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .dashboard-subtitle { font-size: 18px; color: var(--muted); margin-bottom: 64px; max-width: 640px; }
                    .creative-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

                    .creative-card {
                      position: relative; border-radius: 20px; padding: 24px; background: white;
                      box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
                      cursor: pointer; display: flex; flex-direction: column; gap: 12px; overflow: hidden;
                      transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease, border-color .3s; border: 1px solid rgba(0,0,0,0.04); text-align: left;
                    }

                    .creative-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); border-color: rgba(0,0,0,0.08); }
                    .creative-card:hover.docs-card { border-color: rgba(59,130,246,0.4); }
                    .creative-card:hover.sheets-card { border-color: rgba(16,185,129,0.4); }
                    .creative-card:hover.slides-card { border-color: rgba(249,115,22,0.4); }

                    .creative-icon { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; font-size: 22px; font-weight: 800; color: white; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
                    .docs-grad { background: linear-gradient(135deg, var(--blue), #2563eb); }
                    .sheets-grad { background: linear-gradient(135deg, var(--green), #059669); }
                    .slides-grad { background: linear-gradient(135deg, var(--orange), #ea580c); }

                    .creative-card h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text); }
                    .creative-card p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
                    .hint { margin-top: auto; font-size: 11px; font-weight: 600; color: var(--muted); opacity: .7; }
                    .dashboard-cta { margin-top: 48px; display: flex; justify-content: center; gap: 12px; align-items: center; }

                    .dashboard-cta button { padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; box-shadow: 0 15px 30px rgba(139,92,246,.25); transition: transform .2s ease, box-shadow .2s ease; }
                    .dashboard-cta button:hover { transform: translateY(-2px); box-shadow: 0 25px 45px rgba(139,92,246,.35); }

                    .kbd-key { font-size: 11px; padding: 4px 8px; border-radius: 6px; background: #f1f5f9; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); font-weight: 600; color: var(--muted); }
                    .recent-sec { margin-top: 56px; }
                    .recent-sec h4 { margin: 0 0 16px; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); font-weight: 700; }

                    @media (max-width: 768px) { .overlay { padding: 48px 24px 72px; } .close-btn { right: 24px; top: 32px; } .hero-h1 { font-size: 28px; } .creative-cards { grid-template-columns: 1fr; } }
                ` }} />
                
                <div className="overlay">
                    <button onClick={onCollapse} className="close-btn">×</button>
                    <div className="eyebrow">Document Studio</div>
                    <h1 className="hero-h1">Create professional assets in seconds</h1>
                    <p className="dashboard-subtitle">Start with a smart format or use AI to generate your first draft instantly.</p>
                    <div className="creative-cards">
                        <button className="creative-card docs-card" onClick={() => handleNewDocument('docs')}>
                            <div className="creative-icon docs-grad">📄</div>
                            <h3>Docs</h3>
                            <p>Write proposals and technical documentation with AI assistance.</p>
                            <div className="hint">Press <span className="kbd-key">D</span> to start</div>
                        </button>
                        <button className="creative-card sheets-card" onClick={() => handleNewDocument('sheets')}>
                            <div className="creative-icon sheets-grad">📊</div>
                            <h3>Sheets</h3>
                            <p>Track metrics and manage data with powerful formulas.</p>
                            <div className="hint">Press <span className="kbd-key">S</span> to start</div>
                        </button>
                        <button className="creative-card slides-card" onClick={() => handleNewDocument('slides')}>
                            <div className="creative-icon slides-grad">🎨</div>
                            <h3>Slides</h3>
                            <p>Design beautiful presentations like Gamma.app.</p>
                            <div className="hint">Press <span className="kbd-key">P</span> to start</div>
                        </button>
                    </div>
                    <div className="dashboard-cta">
                        <button onClick={() => { setDocType('slides'); setView('slide-setup'); setIsGenerateMode(true); }}>✨ Generate with AI</button>
                        <span className="kbd-key">⌘K</span>
                    </div>
                    <div className="recent-sec">
                        <h4>Recent Documents</h4>
                        {recentDocs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {recentDocs.map(doc => (
                                    <button 
                                        key={doc.id}
                                        onClick={() => {
                                            setDocType(doc.type);
                                            setTitle(doc.title);
                                            if (doc.type === 'slides') setView('editor');
                                            else setView('editor');
                                        }}
                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className={`p-2 rounded-lg ${doc.type === 'docs' ? 'bg-blue-100 text-blue-600' : doc.type === 'sheets' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {doc.type === 'docs' ? <FileText size={18}/> : doc.type === 'sheets' ? <Table size={18}/> : <Presentation size={18}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-800 truncate text-sm">{doc.title}</div>
                                            <div className="text-xs text-slate-500">{new Date(doc.lastEdited).toLocaleDateString()}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12 opacity-40 border border-dashed border-slate-300 rounded-2xl w-full">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <Inbox size={32} strokeWidth={1.5} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No recent documents</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Pro Tips Section */}
                    <div className="mt-12">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Pro Tips</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Keyboard size={16} className="text-purple-500"/>
                                    <span className="text-xs font-bold text-purple-700">Keyboard Power</span>
                                </div>
                                <p className="text-xs text-slate-600">Press <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono border">⌘K</kbd> anywhere to open the command palette for quick actions.</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-blue-500"/>
                                    <span className="text-xs font-bold text-blue-700">AI Magic</span>
                                </div>
                                <p className="text-xs text-slate-600">Select any text and click "AI Assist" to improve, expand, or summarize your content instantly.</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cloud size={16} className="text-emerald-500"/>
                                    <span className="text-xs font-bold text-emerald-700">Auto-Save</span>
                                </div>
                                <p className="text-xs text-slate-600">Your work is automatically saved every 30 seconds. Look for the sync indicator in the header.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Command Palette Modal */}
                {showCommandPalette && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] animate-fade-in" onClick={() => setShowCommandPalette(false)}>
                        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                                <Search size={18} className="text-slate-400"/>
                                <input
                                    ref={commandInputRef}
                                    type="text"
                                    value={commandSearch}
                                    onChange={(e) => setCommandSearch(e.target.value)}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400"
                                    autoFocus
                                />
                                <kbd className="text-[10px] px-2 py-1 bg-slate-100 rounded text-slate-500 font-semibold">ESC</kbd>
                            </div>
                            <div className="max-h-80 overflow-y-auto py-2">
                                {filteredCommands.map((cmd) => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => { cmd.action(); setShowCommandPalette(false); setCommandSearch(''); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <cmd.icon size={16} className="text-slate-500"/>
                                        <span className="flex-1 text-sm text-slate-700">{cmd.label}</span>
                                        <kbd className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-400 font-mono">{cmd.shortcut}</kbd>
                                    </button>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Tip: Use <kbd className="px-1 bg-white rounded text-slate-500">↑↓</kbd> to navigate</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Zap size={10}/> Quick Actions</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Keyboard Shortcuts Modal */}
                {showKeyboardShortcuts && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" onClick={() => setShowKeyboardShortcuts(false)}>
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Keyboard size={20} className="text-purple-500"/>
                                    <h2 className="text-lg font-bold text-slate-800">Keyboard Shortcuts</h2>
                                </div>
                                <button onClick={() => setShowKeyboardShortcuts(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18}/></button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">General</h3>
                                    <div className="space-y-2">
                                        {[
                                            { keys: ['⌘', 'K'], desc: 'Command Palette' },
                                            { keys: ['⌘', 'S'], desc: 'Save Document' },
                                            { keys: ['⌘', 'Z'], desc: 'Undo' },
                                            { keys: ['⌘', '⇧', 'Z'], desc: 'Redo' },
                                            { keys: ['⌘', '/'], desc: 'Keyboard Shortcuts' },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5">
                                                <span className="text-sm text-slate-600">{s.desc}</span>
                                                <div className="flex gap-1">{s.keys.map((k, j) => <kbd key={j} className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{k}</kbd>)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Create</h3>
                                    <div className="space-y-2">
                                        {[
                                            { keys: ['D'], desc: 'New Document' },
                                            { keys: ['S'], desc: 'New Spreadsheet' },
                                            { keys: ['P'], desc: 'New Presentation' },
                                            { keys: ['⌘', 'N'], desc: 'New from Template' },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5">
                                                <span className="text-sm text-slate-600">{s.desc}</span>
                                                <div className="flex gap-1">{s.keys.map((k, j) => <kbd key={j} className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{k}</kbd>)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Formatting</h3>
                                    <div className="space-y-2">
                                        {[
                                            { keys: ['⌘', 'B'], desc: 'Bold' },
                                            { keys: ['⌘', 'I'], desc: 'Italic' },
                                            { keys: ['⌘', 'U'], desc: 'Underline' },
                                            { keys: ['⌘', '⇧', 'F'], desc: 'Focus Mode' },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5">
                                                <span className="text-sm text-slate-600">{s.desc}</span>
                                                <div className="flex gap-1">{s.keys.map((k, j) => <kbd key={j} className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{k}</kbd>)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Slides</h3>
                                    <div className="space-y-2">
                                        {[
                                            { keys: ['←', '→'], desc: 'Navigate Slides' },
                                            { keys: ['⌘', 'Enter'], desc: 'Present' },
                                            { keys: ['N'], desc: 'Add New Slide' },
                                            { keys: ['Delete'], desc: 'Delete Slide' },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5">
                                                <span className="text-sm text-slate-600">{s.desc}</span>
                                                <div className="flex gap-1">{s.keys.map((k, j) => <kbd key={j} className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{k}</kbd>)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" onClick={() => setShowShareModal(false)}>
                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                                <h2 className="text-lg font-bold text-slate-800">Share Document</h2>
                                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18}/></button>
                            </div>
                            <div className="p-6">
                                {/* Invite Section */}
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Invite People</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input 
                                            type="email" 
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleInviteCollaborator()}
                                            placeholder="Enter email address..." 
                                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <select 
                                            value={invitePermission}
                                            onChange={(e) => setInvitePermission(e.target.value as any)}
                                            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                        >
                                            <option value="edit">Can edit</option>
                                            <option value="comment">Can comment</option>
                                            <option value="view">Can view</option>
                                        </select>
                                        <button 
                                            onClick={handleInviteCollaborator}
                                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors"
                                        >
                                            Invite
                                        </button>
                                    </div>
                                </div>

                                {/* Current Collaborators */}
                                {collaborators.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                            People with access ({collaborators.length})
                                        </h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {collaborators.map((collab: any) => (
                                                <div key={collab.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                                                    <div 
                                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                                                        style={{ backgroundColor: collab.color }}
                                                    >
                                                        {collab.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-slate-700 truncate">{collab.name}</div>
                                                        <div className="text-xs text-slate-500 truncate">{collab.email || collab.id}</div>
                                                    </div>
                                                    <select 
                                                        value={collab.permission || 'edit'}
                                                        onChange={(e) => handleUpdateCollaboratorPermission(collab.id, e.target.value as any)}
                                                        className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                                    >
                                                        <option value="edit">Can edit</option>
                                                        <option value="comment">Can comment</option>
                                                        <option value="view">Can view</option>
                                                    </select>
                                                    <button 
                                                        onClick={() => handleRemoveCollaborator(collab.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={14}/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Owner Section */}
                                <div className="mb-6 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3 p-2">
                                        {currentUser && (
                                            <>
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                                                    {currentUser.initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-slate-700">{currentUser.name} (You)</div>
                                                    <div className="text-xs text-slate-500">{currentUser.email || 'Owner'}</div>
                                                </div>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">Owner</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* General Access */}
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">General Access</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'private', label: 'Restricted', desc: 'Only people with access can open', icon: Lock },
                                            { id: 'view', label: 'Anyone with link can view', desc: 'Anyone with the link can view', icon: Eye },
                                            { id: 'edit', label: 'Anyone with link can edit', desc: 'Anyone with the link can edit', icon: Pencil },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setDocumentPermission(opt.id as any)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${documentPermission === opt.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <opt.icon size={16} className={documentPermission === opt.id ? 'text-purple-600' : 'text-slate-500'}/>
                                                <div className="text-left flex-1">
                                                    <div className={`text-sm font-semibold ${documentPermission === opt.id ? 'text-purple-700' : 'text-slate-700'}`}>{opt.label}</div>
                                                    <div className="text-xs text-slate-500">{opt.desc}</div>
                                                </div>
                                                {documentPermission === opt.id && <Check size={16} className="text-purple-600"/>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/doc/${docTitle.replace(/\s+/g, '-').toLowerCase()}`);
                                        setNotifications(prev => [...prev, { id: Date.now().toString(), message: 'Link copied to clipboard', type: 'success' }]);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    <Copy size={16}/> Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Action Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <div className="relative group">
                        <button 
                            onClick={() => setShowCommandPalette(true)}
                            className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center text-white transition-all hover:scale-105 group-hover:from-purple-500 group-hover:to-indigo-500"
                        >
                            <Plus size={24}/>
                        </button>
                        {/* FAB Menu */}
                        <div className="absolute bottom-16 right-0 flex flex-col gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button 
                                onClick={() => handleNewDocument('docs')}
                                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap"
                            >
                                <div className="p-1.5 bg-blue-100 rounded-lg"><FileText size={14} className="text-blue-600"/></div>
                                New Document
                            </button>
                            <button 
                                onClick={() => handleNewDocument('sheets')}
                                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap"
                            >
                                <div className="p-1.5 bg-emerald-100 rounded-lg"><Table size={14} className="text-emerald-600"/></div>
                                New Spreadsheet
                            </button>
                            <button 
                                onClick={() => handleNewDocument('slides')}
                                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap"
                            >
                                <div className="p-1.5 bg-orange-100 rounded-lg"><Presentation size={14} className="text-orange-600"/></div>
                                New Presentation
                            </button>
                            <button 
                                onClick={() => { setDocType('slides'); setView('slide-setup'); setIsGenerateMode(true); }}
                                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-white transition-all whitespace-nowrap"
                            >
                                <div className="p-1.5 bg-white/20 rounded-lg"><Sparkles size={14}/></div>
                                Generate with AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'slide-setup') return <SlideSetup onBack={() => setView('dashboard')} onSelect={handleSlideSetupComplete}/>;
    if (view === 'doc-setup') return <DocSetup onBack={() => setView('dashboard')} onSelect={handleDocSetupComplete}/>;
    if (view === 'sheet-setup') return <SheetSetup onBack={() => setView('dashboard')} onSelect={handleSheetSetupComplete}/>;

    return (
        <div className="flex h-full w-full overflow-hidden text-sans flex-col relative font-sans bg-[#faf8f5]">
            <header className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0 z-40 bg-white border-slate-200 text-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 rounded-lg transition-colors flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100"><ArrowLeft size={18}/></button>
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${docType === 'docs' ? 'bg-blue-500/10' : docType === 'slides' ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>{getEditorIcon()}</div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-base font-semibold bg-transparent border-none outline-none p-0 h-6 text-slate-800"/>
                                {/* Sync Status Indicator */}
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                                    syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-700' : 
                                    syncStatus === 'syncing' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {syncStatus === 'synced' && <Cloud size={10}/>}
                                    {syncStatus === 'syncing' && <RefreshCw size={10} className="animate-spin"/>}
                                    {syncStatus === 'offline' && <CloudOff size={10}/>}
                                    {syncStatus === 'synced' ? 'Saved' : syncStatus === 'syncing' ? 'Saving...' : 'Offline'}
                                </div>
                            </div>
                            {docType === 'docs' && (
                                <div className="flex gap-4 text-[13px] text-slate-500 mt-0.5 select-none relative" ref={menuRef}>
                                    {MENUS.map(menu => (
                                        <div key={menu.label} className="relative">
                                            <span className={`hover:bg-slate-100 px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === menu.label ? 'bg-slate-200' : ''}`} onClick={() => handleMenuClick(menu.label)}>{menu.label}</span>
                                            {activeMenu === menu.label && (
                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col animate-fade-in origin-top-left">
                                                    {menu.items.map(item => <button key={item} className="text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm w-full" onClick={() => setActiveMenu(null)}>{item}</button>)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Command Palette Trigger */}
                    <button 
                        onClick={() => setShowCommandPalette(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm text-slate-600"
                    >
                        <Search size={14}/>
                        <span>Search</span>
                        <kbd className="text-[10px] px-1.5 py-0.5 bg-white rounded text-slate-400 font-mono">⌘K</kbd>
                    </button>
                    
                    {/* Quick Actions */}
                    <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-3">
                        <button onClick={() => setShowKeyboardShortcuts(true)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Keyboard Shortcuts">
                            <Keyboard size={16}/>
                        </button>
                        <button onClick={() => setShowVersionHistory(true)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Version History">
                            <History size={16}/>
                        </button>
                    </div>
                    
                    <div className="relative">
                        <button onClick={() => setIsExportMenu(!isExportMenuOpen)} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"><Download size={16}/> Export</button>
                        {isExportMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl border z-50 overflow-hidden py-1 animate-fade-in bg-white border-slate-200">
                                {docType === 'docs' && (
                                    <>
                                        <button onClick={() => handleExport('doc')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50"><FileText size={16} className="text-blue-500"/> Microsoft Word (.doc)</button>
                                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50"><FileText size={16} className="text-red-500"/> PDF Document (.pdf)</button>
                                    </>
                                )}
                                {docType === 'sheets' && <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50"><Table size={16} className="text-green-500"/> Comma Separated (.csv)</button>}
                                {docType === 'slides' && <button onClick={() => handleExport('ppt')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50"><Presentation size={16} className="text-orange-500"/> PowerPoint (.pptx)</button>}
                            </div>
                        )}
                    </div>
                    {docType === 'docs' && (
                        <>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><MessageSquarePlus size={20}/></button>
                        </>
                    )}
                    
                    {/* Share Button */}
                    <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm rounded-full hover:shadow-lg hover:scale-[1.02] transition-all">
                        <Share2 size={16}/> Share
                    </button>
                    
                    {/* Collaborators */}
                    <div className="flex -space-x-2 ml-1" ref={avatarContainerRef}>
                        {collaborators.length > 0 && collaborators.slice(0, 3).map((collab, i) => (
                            <div 
                                key={collab.id}
                                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] text-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: collab.color, zIndex: 10 - i }}
                                title={collab.name}
                            >
                                {collab.avatar ? <img src={collab.avatar} className="w-full h-full rounded-full object-cover"/> : collab.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                        ))}
                        {collaborators.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-[10px] text-slate-600 shadow-sm">
                                +{collaborators.length - 3}
                            </div>
                        )}
                        {currentUser && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-white flex items-center justify-center font-bold text-[10px] text-white shadow-sm z-20" title={`${currentUser.name} (You)`}>
                                {currentUser.initials}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {docType === 'docs' && (
                <div className="bg-[#f9fbfd] border-b border-gray-300 px-4 py-1.5 flex items-center gap-1 flex-wrap shrink-0 rounded-[28px] mx-2 my-1.5 shadow-sm select-none">
                    <div className="flex gap-1 pr-2 border-r border-gray-300"><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Undo2 size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Redo2 size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Printer size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><SpellCheck size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><PaintRoller size={16}/></button></div>
                    <div className="flex gap-2 items-center px-2 border-r border-gray-300 h-6"><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded">100% <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded">Normal text <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded font-sans">Arial <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><div className="flex items-center gap-1"><button onClick={() => setFontSize(Math.max(1, fontSize-1))} className="p-0.5 text-gray-600 hover:bg-gray-200 rounded"><Minus size={12}/></button><input className="w-8 text-center bg-transparent border border-gray-300 rounded text-xs py-0.5" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}/><button onClick={() => setFontSize(fontSize+1)} className="p-0.5 text-gray-600 hover:bg-gray-200 rounded"><Plus size={12}/></button></div></div>
                    <div className="flex gap-1 items-center px-2 border-r border-gray-300 h-6"><button onClick={() => toggleFormat('bold')} className={`p-1 rounded ${formatting.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Bold size={16}/></button><button onClick={() => toggleFormat('italic')} className={`p-1 rounded italic ${formatting.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Italic size={16}/></button><button onClick={() => toggleFormat('underline')} className={`p-1 rounded underline ${formatting.underline ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Underline size={16}/></button><button className="p-1 text-gray-700 hover:bg-gray-200 rounded"><Baseline size={16}/></button><button className="p-1 text-gray-700 hover:bg-gray-200 rounded"><Highlighter size={16}/></button></div>
                    <div className="flex gap-1 items-center px-2 border-r border-gray-300 h-6"><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Link size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><MessageSquarePlus size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><ImageIcon size={16}/></button></div>
                    <div className="flex gap-1 items-center px-2 h-6"><button onClick={() => setAlign('left')} className={`p-1 rounded ${formatting.align === 'left' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignLeft size={16}/></button><button onClick={() => setAlign('center')} className={`p-1 rounded ${formatting.align === 'center' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignCenter size={16}/></button><button onClick={() => setAlign('right')} className={`p-1 rounded ${formatting.align === 'right' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignRight size={16}/></button><button onClick={() => setAlign('justify')} className={`p-1 rounded ${formatting.align === 'justify' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignJustify size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><MoreVertical size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><CheckSquare size={16}/></button><button onClick={() => toggleList('bullet')} className={`p-1 rounded ${formatting.list === 'bullet' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><List size={16}/></button><button onClick={() => toggleList('ordered')} className={`p-1 rounded ${formatting.list === 'ordered' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><ListOrdered size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Outdent size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Indent size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><RotateCcw size={16}/></button></div>
                    <div className="ml-auto relative mode-selector flex items-center gap-3">
                        <div className="text-xs text-gray-500 hidden sm:flex items-center gap-2">
                            <span>{wordCount} words</span>
                            <span className="text-gray-300">•</span>
                            <span>{charCount} chars</span>
                            {lastSaved && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-green-600"><Check size={12}/> Saved</span>
                                </>
                            )}
                        </div>
                        <div className="relative group">
                            <button 
                                disabled={isAiAssisting}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold hover:bg-purple-200 transition-colors disabled:opacity-50"
                            >
                                {isAiAssisting ? <RefreshCw size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                                AI Assist
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 hidden group-hover:flex flex-col animate-fade-in origin-top-right">
                                <button onClick={() => aiAssistContent('improve')} className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Wand2 size={14} className="text-purple-500"/> Improve writing</button>
                                <button onClick={() => aiAssistContent('fix')} className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><SpellCheck size={14} className="text-blue-500"/> Fix grammar</button>
                                <button onClick={() => aiAssistContent('summarize')} className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><AlignLeft size={14} className="text-green-500"/> Summarize</button>
                                <button onClick={() => aiAssistContent('expand')} className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Plus size={14} className="text-orange-500"/> Expand content</button>
                            </div>
                        </div>
                        <button onClick={() => setIsModeMenuOpen(!isModeMenuOpen)} className="flex items-center bg-[#c2e7ff] rounded-full px-3 py-1 cursor-pointer hover:shadow-sm transition-all">{editMode === 'Editing' && <Pencil size={14} className="text-[#001d35] mr-2"/>}{editMode === 'Suggesting' && <MessageSquareText size={14} className="text-[#001d35] mr-2"/>}{editMode === 'Viewing' && <Eye size={14} className="text-[#001d35] mr-2"/>}<span className="text-xs font-bold text-[#001d35] min-w-[60px] text-left">{editMode}</span><ChevronDown size={12} className="ml-2 text-[#001d35]"/></button>{isModeMenuOpen && (<div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 flex flex-col animate-fade-in text-gray-800 origin-top-right"><button onClick={() => { setEditMode('Editing'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><Pencil size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Editing</span><span className="text-[10px] text-gray-500">Edit document directly</span></div></button><button onClick={() => { setEditMode('Suggesting'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><MessageSquareText size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Suggesting</span><span className="text-[10px] text-gray-500">Propose changes</span></div></button><button onClick={() => { setEditMode('Viewing'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><Eye size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Viewing</span><span className="text-[10px] text-gray-500">Read or print</span></div></button></div>)}
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {docType === 'slides' && (
                    <div className="flex w-full h-full bg-[#faf8f5]">
                        {isGenerateMode ? (
                            <div className="absolute inset-0 bg-[#faf8f5] z-50 flex flex-col items-center justify-center p-8 animate-fade-in overflow-y-auto">
                                <div className="w-full max-w-4xl">
                                    <div className="text-center mb-8">
                                        <button onClick={() => setIsGenerateMode(false)} className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors">
                                            <ArrowLeft size={16}/> Back to Editor
                                        </button>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200 mb-4">
                                            <Sparkles size={14} className="text-purple-600" />
                                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI-Powered</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Generate Slides with AI</h2>
                                        <p className="text-slate-500 text-sm">Describe your presentation and let AI create stunning slides for you.</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl">
                                        <div className="mb-6">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Prompt</label>
                                            <textarea 
                                                value={aiPrompt} 
                                                onChange={(e) => setAiPrompt(e.target.value)} 
                                                placeholder="e.g., 'Q4 strategy deck for fintech startup focusing on growth metrics, user acquisition, and 2025 roadmap...'" 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Slide Count</label>
                                                <div className="relative">
                                                    <select 
                                                        value={genSlideCount} 
                                                        onChange={(e) => setGenSlideCount(Number(e.target.value))} 
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 appearance-none font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value={6}>6 slides</option>
                                                        <option value={8}>8 slides</option>
                                                        <option value={10}>10 slides</option>
                                                        <option value={12}>12 slides</option>
                                                        <option value={15}>15 slides</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16}/>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Text Density</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'minimal', label: 'Min', icon: <Minus size={14}/> }, 
                                                        { id: 'standard', label: 'Std', icon: <AlignLeft size={14}/> }, 
                                                        { id: 'detailed', label: 'Max', icon: <List size={14}/> }
                                                    ].map((opt) => (
                                                        <button 
                                                            key={opt.id} 
                                                            onClick={() => setGenTextAmount(opt.id as any)} 
                                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                                                genTextAmount === opt.id 
                                                                ? 'border-purple-500 bg-purple-100 text-purple-700' 
                                                                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {opt.icon}
                                                            <span className="text-[9px] font-bold uppercase mt-1">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Language</label>
                                                <div className="relative">
                                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 appearance-none font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                        <option>English</option>
                                                        <option>Spanish</option>
                                                        <option>French</option>
                                                        <option>German</option>
                                                        <option>Portuguese</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16}/>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                                <Palette size={12}/> Theme
                                            </label>
                                            <div className="grid grid-cols-10 gap-2">
                                                {Object.entries(SLIDE_THEMES).slice(0, 10).map(([key, theme]) => (
                                                    <button 
                                                        key={key} 
                                                        onClick={() => setSlideTheme(key as any)} 
                                                        className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                                            slideTheme === key ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-transparent hover:scale-105'
                                                        }`}
                                                    >
                                                        <div className={`absolute inset-0 ${theme.bg}`}></div>
                                                        {slideTheme === key && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check size={14} className="text-white drop-shadow-lg"/>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={generateSlides} 
                                            disabled={!aiPrompt.trim() || isGenerating} 
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {isGenerating ? <RefreshCw size={18} className="animate-spin"/> : <Sparkles size={18} fill="currentColor"/>}
                                            {isGenerating ? 'Generating...' : 'Generate Slides'}
                                        </button>
                                    </div>
                                    
                                    {/* Quick prompt suggestions */}
                                    <div className="mt-6">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Try these prompts</h4>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {[
                                                'Startup pitch deck',
                                                'Quarterly review',
                                                'Product roadmap',
                                                'Team introduction',
                                                'Marketing strategy'
                                            ].map((prompt) => (
                                                <button 
                                                    key={prompt}
                                                    onClick={() => setAiPrompt(prompt)}
                                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 hover:text-slate-800 transition-all"
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div ref={sidebarRef} style={{ width: sidebarWidth }} className="bg-white border-r border-slate-200 flex flex-col z-10 flex-shrink-0">
                                    {/* Slide thumbnails */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {slides.map((slide, idx) => (
                                            <div 
                                                key={slide.id} 
                                                onClick={() => setActiveSlideIndex(idx)} 
                                                className={`group relative aspect-video rounded-lg cursor-pointer transition-all duration-200 ${activeSlideIndex === idx ? 'ring-2 ring-purple-500 shadow-xl scale-[1.02] z-10' : 'hover:ring-2 hover:ring-white/20 opacity-70 hover:opacity-100'}`}
                                            >
                                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold flex items-center justify-center backdrop-blur-sm z-20">{idx + 1}</div>
                                                {activeSlideIndex === idx && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); if(slides.length > 1) { const newSlides = slides.filter((_, i) => i !== idx); setSlides(newSlides); setActiveSlideIndex(Math.min(idx, newSlides.length - 1)); } }}
                                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                )}
                                                <div className="w-full h-full rounded-md overflow-hidden bg-white shadow-sm pointer-events-none transform origin-top-left">
                                                    <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', height: '500%' }}>
                                                        <SlideRenderer slide={slide} theme={slideTheme} editable={false}/>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Bottom actions */}
                                    <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                                        <button onClick={addNewSlide} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200">
                                            <Plus size={14}/> Add Slide
                                        </button>
                                        <button onClick={() => setIsGenerateMode(true)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                                            <Sparkles size={14}/> Generate with AI
                                        </button>
                                    </div>
                                </div>
                                
                                <div onMouseDown={startResizing} className={`w-1 cursor-col-resize hover:bg-purple-500/50 transition-colors z-20 flex-shrink-0 hidden lg:block ${isResizing ? 'bg-purple-500' : 'bg-transparent'}`}/>
                                
                                {/* Main editor area */}
                                <div className="flex-1 bg-[#faf8f5] flex flex-col relative overflow-hidden">
                                    {/* Slide toolbar */}
                                    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
                                        <div className="flex items-center gap-2">
                                            {/* Layout picker */}
                                            <div className="relative group">
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-800 font-medium transition-all">
                                                    <LayoutGrid size={14} />
                                                    Layout
                                                    <ChevronDown size={12} className="text-slate-500" />
                                                </button>
                                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-2 hidden group-hover:block animate-fade-in">
                                                    {SLIDE_LAYOUTS.map((layout) => (
                                                        <button 
                                                            key={layout.id}
                                                            onClick={() => updateSlide('layout', layout.id)}
                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                slides[activeSlideIndex]?.layout === layout.id 
                                                                ? 'bg-purple-100 text-purple-700' 
                                                                : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span className="text-lg">{layout.icon}</span>
                                                            <div>
                                                                <div className="font-medium">{layout.name}</div>
                                                                <div className="text-[10px] text-slate-500">{layout.description}</div>
                                                            </div>
                                                            {slides[activeSlideIndex]?.layout === layout.id && <Check size={14} className="ml-auto text-purple-600"/>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Theme picker */}
                                            <div className="relative group">
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-800 font-medium transition-all">
                                                    <Palette size={14} />
                                                    Theme
                                                    <ChevronDown size={12} className="text-slate-500" />
                                                </button>
                                                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 hidden group-hover:block animate-fade-in">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Light Themes</div>
                                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                                        {Object.entries(SLIDE_THEMES).filter(([_, t]) => t.category === 'light').map(([key, theme]) => (
                                                            <button 
                                                                key={key}
                                                                onClick={() => setSlideTheme(key as any)}
                                                                className={`h-10 rounded-lg overflow-hidden border-2 transition-all ${slideTheme === key ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent hover:scale-105'}`}
                                                            >
                                                                <div className={`w-full h-full ${theme.bg}`}></div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dark Themes</div>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {Object.entries(SLIDE_THEMES).filter(([_, t]) => t.category === 'dark').map(([key, theme]) => (
                                                            <button 
                                                                key={key}
                                                                onClick={() => setSlideTheme(key as any)}
                                                                className={`h-10 rounded-lg overflow-hidden border-2 transition-all ${slideTheme === key ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent hover:scale-105'}`}
                                                            >
                                                                <div className={`w-full h-full ${theme.bg}`}></div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                            
                                            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"><ImageIcon size={16}/></button>
                                            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"><Type size={16}/></button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{activeSlideIndex + 1} / {slides.length}</span>
                                            <button 
                                                onClick={() => setIsFullscreen(!isFullscreen)}
                                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <Maximize size={16}/>
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-all">
                                                <Play size={14} fill="currentColor"/> Present
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Slide canvas */}
                                    <div className="flex-1 flex items-center justify-center p-8 relative overflow-auto">
                                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                        <div className={`aspect-video bg-white shadow-2xl rounded-xl relative overflow-hidden flex flex-col transition-all duration-300 ring-1 ring-slate-200 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-5xl'}`}>
                                            {isFullscreen && (
                                                <button 
                                                    onClick={() => setIsFullscreen(false)}
                                                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                                                >
                                                    <X size={20}/>
                                                </button>
                                            )}
                                            {slides[activeSlideIndex] && (<SlideRenderer slide={slides[activeSlideIndex]} theme={slideTheme} editable={!isFullscreen}/>)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {docType === 'sheets' && (
                    <div className="flex h-full w-full bg-[#faf8f5]">
                        {/* Sidebar */}
                        <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                            <div className="p-4 border-b border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <FileSpreadsheet size={16} className="text-emerald-500"/>
                                    Sheets
                                </h3>
                                {/* Sheet tabs */}
                                <div className="space-y-1">
                                    {sheetTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSheetTab(tab.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                                activeSheetTab === tab.id 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            <Table size={14}/>
                                            {tab.name}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const newTab = { id: Date.now().toString(), name: `Sheet ${sheetTabs.length + 1}` };
                                            setSheetTabs([...sheetTabs, newTab]);
                                            setActiveSheetTab(newTab.id);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={14}/> Add Sheet
                                    </button>
                                </div>
                            </div>
                            
                            {/* Formula Helper */}
                            <div className="p-4 border-b border-slate-200">
                                <button 
                                    onClick={() => setShowFormulaPanel(!showFormulaPanel)}
                                    className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    <span className="flex items-center gap-2"><FunctionSquare size={14}/> Formulas</span>
                                    <ChevronDown size={14} className={`transition-transform ${showFormulaPanel ? 'rotate-180' : ''}`}/>
                                </button>
                                {showFormulaPanel && (
                                    <div className="mt-3 space-y-1">
                                        {COMMON_FORMULAS.map((f) => (
                                            <button
                                                key={f.name}
                                                onClick={() => {
                                                    if (activeCell) {
                                                        updateSheetCell(activeCell.r, activeCell.c, f.syntax);
                                                    }
                                                }}
                                                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                                            >
                                                <div className="text-xs font-mono text-emerald-600">{f.name}</div>
                                                <div className="text-[10px] text-slate-500 group-hover:text-slate-600">{f.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Quick Charts */}
                            <div className="p-4 border-b border-slate-200">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Charts</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { type: 'bar', icon: '📊' },
                                        { type: 'line', icon: '📈' },
                                        { type: 'pie', icon: '🥧' },
                                        { type: 'none', icon: '✕' }
                                    ].map((chart) => (
                                        <button
                                            key={chart.type}
                                            onClick={() => setChartPreview(chart.type as any)}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                                                chartPreview === chart.type 
                                                ? 'bg-emerald-100 ring-2 ring-emerald-500' 
                                                : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        >
                                            {chart.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* AI Insights */}
                            <div className="p-4 mt-auto">
                                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                                    <Sparkles size={14}/> AI Data Insights
                                </button>
                            </div>
                        </div>
                        
                        {/* Main area */}
                        <div className="flex-1 flex flex-col">
                            {/* Toolbar */}
                            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 shrink-0">
                                <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                    <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><Undo2 size={15}/></button>
                                    <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><Redo2 size={15}/></button>
                                </div>
                                <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                    <button className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors">
                                        <span className="font-mono">100%</span> <ChevronDown size={12}/>
                                    </button>
                                </div>
                                <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                    <button className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg w-24 justify-between transition-colors">
                                        Arial <ChevronDown size={12}/>
                                    </button>
                                    <div className="flex items-center gap-0.5 bg-slate-50 rounded-lg px-1">
                                        <button className="text-slate-500 hover:text-slate-800 p-1"><Minus size={12}/></button>
                                        <span className="text-xs text-slate-800 w-6 text-center font-mono">10</span>
                                        <button className="text-slate-500 hover:text-slate-800 p-1"><Plus size={12}/></button>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    <button onClick={() => toggleSheetStyle('fontWeight', 'bold')} className={`p-1.5 rounded transition-colors ${sheetStyles[`${activeCell?.r}-${activeCell?.c}`]?.fontWeight === 'bold' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Bold size={15}/></button>
                                    <button onClick={() => toggleSheetStyle('fontStyle', 'italic')} className={`p-1.5 rounded transition-colors ${sheetStyles[`${activeCell?.r}-${activeCell?.c}`]?.fontStyle === 'italic' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Italic size={15}/></button>
                                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                    <button onClick={() => toggleSheetStyle('textAlign', 'left')} className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><AlignLeft size={15}/></button>
                                    <button onClick={() => toggleSheetStyle('textAlign', 'center')} className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><AlignCenter size={15}/></button>
                                    <button onClick={() => toggleSheetStyle('textAlign', 'right')} className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><AlignRight size={15}/></button>
                                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><DollarSign size={15}/></button>
                                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><Percent size={15}/></button>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-xs text-slate-500">
                                        {activeCell ? `${getColumnLabel(activeCell.c)}${activeCell.r + 1}` : 'Select a cell'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Formula bar */}
                            <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-white gap-3">
                                <div className="flex items-center gap-2 text-slate-500 min-w-[60px]">
                                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                        {activeCell ? `${getColumnLabel(activeCell.c)}${activeCell.r + 1}` : '—'}
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-slate-200"></div>
                                <div className="flex items-center gap-2 flex-1">
                                    <FunctionSquare size={14} className="text-slate-500"/>
                                    <input 
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 font-mono placeholder-slate-400" 
                                        placeholder="Enter formula or value..." 
                                        value={activeCell ? sheetData[activeCell.r][activeCell.c] : ''} 
                                        onChange={(e) => activeCell && updateSheetCell(activeCell.r, activeCell.c, e.target.value)} 
                                        disabled={!activeCell}
                                    />
                                </div>
                            </div>
                            
                            {/* Chart Preview (if enabled) */}
                            {chartPreview !== 'none' && (
                                <div className="h-48 border-b border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
                                    <div className="bg-white rounded-xl p-6 flex items-center justify-center gap-4 border border-slate-200 shadow-sm">
                                        <div className="text-4xl">
                                            {chartPreview === 'bar' ? '📊' : chartPreview === 'line' ? '📈' : '🥧'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800">Chart Preview</div>
                                            <div className="text-xs text-slate-500">Select data range to generate {chartPreview} chart</div>
                                        </div>
                                        <button onClick={() => setChartPreview('none')} className="p-1 text-slate-500 hover:text-slate-800"><X size={14}/></button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Spreadsheet grid */}
                            <div className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50">
                                <div className="inline-block relative">
                                    <div className="flex sticky top-0 z-20">
                                        <div className="w-12 h-8 bg-slate-100 border-r border-b border-slate-200 sticky left-0 z-30"></div>
                                        {Array.from({ length: COLS }).map((_, i) => (
                                            <div key={i} className="w-32 h-8 bg-slate-100 border-r border-b border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 select-none uppercase">
                                                {getColumnLabel(i)}
                                            </div>
                                        ))}
                                    </div>
                                    {sheetData.map((row, rIdx) => (
                                        <div key={rIdx} className="flex group">
                                            <div className="w-12 h-8 bg-slate-100 border-r border-b border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 select-none sticky left-0 z-10 group-hover:bg-slate-200 transition-colors">
                                                {rIdx + 1}
                                            </div>
                                            {row.map((cell, cIdx) => { 
                                                const isActive = activeCell?.r === rIdx && activeCell?.c === cIdx; 
                                                return (
                                                    <div 
                                                        key={cIdx} 
                                                        onClick={() => setActiveCell({ r: rIdx, c: cIdx })} 
                                                        className={`w-32 h-8 border-r border-b border-slate-200 relative transition-colors ${isActive ? 'z-10 ring-2 ring-emerald-500 bg-emerald-100' : 'bg-white hover:bg-slate-50'}`}
                                                    >
                                                        <input 
                                                            className="w-full h-full bg-transparent border-none outline-none px-2 text-xs text-slate-700 font-mono" 
                                                            style={sheetStyles[`${rIdx}-${cIdx}`] || {}} 
                                                            value={cell} 
                                                            onChange={(e) => updateSheetCell(rIdx, cIdx, e.target.value)}
                                                        />
                                                        {isActive && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 cursor-crosshair rounded-sm"></div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {docType === 'docs' && (
                    <div className={`flex flex-1 w-full ${isFocusMode ? 'bg-slate-100' : 'bg-[#faf8f5]'} relative`}>
                        {/* Left Sidebar - Document Outline */}
                        {!isFocusMode && (
                            <div ref={sidebarRef} style={{ width: sidebarWidth }} className="border-r border-slate-200 bg-white flex flex-col shrink-0 hidden lg:flex">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-blue-500"/>
                                        Document
                                    </h3>
                                    {/* Writing Progress */}
                                    {writingGoal > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>Progress</span>
                                                <span>{content.split(/\s+/).filter(Boolean).length} / {writingGoal} words</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min((content.split(/\s+/).filter(Boolean).length / writingGoal) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setWritingGoal(writingGoal > 0 ? 0 : 500)}
                                        className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                                    >
                                        <Target size={12}/> {writingGoal > 0 ? 'Clear goal' : 'Set writing goal'}
                                    </button>
                                </div>
                                
                                {/* Document Sections */}
                                <div className="p-4 border-b border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sections</h4>
                                        <button onClick={handleAddSection} className="text-slate-500 hover:text-slate-800 transition-colors"><Plus size={14}/></button>
                                    </div>
                                    <div className="space-y-1">
                                        {docSections.map(section => (
                                            <button 
                                                key={section.id} 
                                                onClick={() => setActiveSectionId(section.id)} 
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                    activeSectionId === section.id 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                                }`}
                                            >
                                                <FileText size={14}/>
                                                {section.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Document Outline */}
                                <div className="p-4 border-b border-slate-200 flex-1">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Outline</h4>
                                    <div className="space-y-1 text-sm">
                                        {docOutline.length > 0 ? docOutline.map((item, i) => (
                                            <div key={i} className="text-slate-600 hover:text-slate-800 cursor-pointer transition-colors flex items-center gap-2" style={{ paddingLeft: (item.level - 1) * 12 }}>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                                {item.text}
                                            </div>
                                        )) : (
                                            <p className="text-xs text-slate-400 italic">Headings will appear here</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="p-4 border-t border-slate-200">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Statistics</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <div className="text-slate-500">Words</div>
                                            <div className="text-slate-800 font-mono">{content.split(/\s+/).filter(Boolean).length}</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <div className="text-slate-500">Chars</div>
                                            <div className="text-slate-800 font-mono">{content.length}</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <div className="text-slate-500">Lines</div>
                                            <div className="text-slate-800 font-mono">{content.split('\n').length}</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <div className="text-slate-500">Read time</div>
                                            <div className="text-slate-800 font-mono">{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!isFocusMode && <div onMouseDown={startResizing} className={`w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 shrink-0 hidden lg:block ${isResizing ? 'bg-blue-500' : 'bg-transparent'}`}/>}
                        
                        {/* Main Editor Area */}
                        <div className="flex-1 flex flex-col relative">
                            {/* Toolbar */}
                            {!isFocusMode && (
                                <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 shrink-0">
                                    <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                        <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><Undo2 size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><Redo2 size={15}/></button>
                                    </div>
                                    <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                        <button className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg w-28 justify-between transition-colors">
                                            {['Normal text', 'Heading 1', 'Heading 2', 'Heading 3'][0]} <ChevronDown size={12}/>
                                        </button>
                                    </div>
                                    <div className="flex gap-1 border-r border-slate-200 pr-3 mr-2">
                                        <button className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg w-24 justify-between transition-colors">
                                            Arial <ChevronDown size={12}/>
                                        </button>
                                        <div className="flex items-center gap-0.5 bg-slate-50 rounded-lg px-1">
                                            <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="text-slate-500 hover:text-slate-800 p-1"><Minus size={12}/></button>
                                            <span className="text-xs text-slate-800 w-6 text-center font-mono">{fontSize}</span>
                                            <button onClick={() => setFontSize(Math.min(72, fontSize + 1))} className="text-slate-500 hover:text-slate-800 p-1"><Plus size={12}/></button>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        <button onClick={() => setFormatting(p => ({ ...p, bold: !p.bold }))} className={`p-1.5 rounded transition-colors ${formatting.bold ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Bold size={15}/></button>
                                        <button onClick={() => setFormatting(p => ({ ...p, italic: !p.italic }))} className={`p-1.5 rounded transition-colors ${formatting.italic ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Italic size={15}/></button>
                                        <button onClick={() => setFormatting(p => ({ ...p, underline: !p.underline }))} className={`p-1.5 rounded transition-colors ${formatting.underline ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Underline size={15}/></button>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <button onClick={() => setFormatting(p => ({ ...p, align: 'left' }))} className={`p-1.5 rounded transition-colors ${formatting.align === 'left' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><AlignLeft size={15}/></button>
                                        <button onClick={() => setFormatting(p => ({ ...p, align: 'center' }))} className={`p-1.5 rounded transition-colors ${formatting.align === 'center' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><AlignCenter size={15}/></button>
                                        <button onClick={() => setFormatting(p => ({ ...p, align: 'right' }))} className={`p-1.5 rounded transition-colors ${formatting.align === 'right' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><AlignRight size={15}/></button>
                                        <button onClick={() => setFormatting(p => ({ ...p, align: 'justify' }))} className={`p-1.5 rounded transition-colors ${formatting.align === 'justify' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><AlignJustify size={15}/></button>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><List size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><ListOrdered size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><Quote size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><Code size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><Link size={15}/></button>
                                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors"><ImageIcon size={15}/></button>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <button 
                                            onClick={() => setIsFocusMode(true)}
                                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <Focus size={14}/> Focus
                                        </button>
                                        <button 
                                            onClick={() => setShowAiPanel(!showAiPanel)}
                                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${showAiPanel ? 'bg-purple-100 text-purple-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                        >
                                            <Sparkles size={14}/> AI Assist
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Focus mode exit button */}
                            {isFocusMode && (
                                <button 
                                    onClick={() => setIsFocusMode(false)}
                                    className="absolute top-4 right-4 z-50 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all"
                                >
                                    <X size={14}/> Exit Focus
                                </button>
                            )}
                            
                            {/* Document Canvas */}
                            <div className={`flex-1 overflow-y-auto flex justify-center p-8 ${isFocusMode ? 'py-16' : ''}`}>
                                <div className={`bg-white shadow-xl rounded-xl border border-slate-200 relative transition-all ${isFocusMode ? 'w-[700px] min-h-[800px] p-16' : 'w-[816px] min-h-[1056px] p-16'}`}>
                                    <textarea 
                                        autoFocus
                                        readOnly={editMode === 'Viewing'} 
                                        className="w-full min-h-[800px] resize-none border-none outline-none font-sans leading-relaxed text-slate-800 bg-transparent focus:outline-none focus:ring-0 cursor-text placeholder-slate-400" 
                                        style={{ 
                                            fontFamily: 'Georgia, serif', 
                                            fontSize: `${fontSize}pt`, 
                                            fontWeight: formatting.bold ? 'bold' : 'normal', 
                                            fontStyle: formatting.italic ? 'italic' : 'normal', 
                                            textDecoration: formatting.underline ? 'underline' : 'none', 
                                            textAlign: formatting.align,
                                            caretColor: '#3b82f6',
                                            lineHeight: '1.8'
                                        }} 
                                        value={content} 
                                        onChange={(e) => setContent(e.target.value)} 
                                        spellCheck={false} 
                                        placeholder={editMode === 'Viewing' ? '' : "Start writing your masterpiece..."}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* AI Assist Panel */}
                        {showAiPanel && !isFocusMode && (
                            <div className="w-72 border-l border-slate-200 bg-white flex flex-col shrink-0">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <Sparkles size={16} className="text-purple-500"/>
                                        AI Writing Assistant
                                    </h3>
                                </div>
                                
                                <div className="p-4 space-y-2 flex-1">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                                    {[
                                        { label: 'Write introduction', icon: Wand2, prompt: 'intro' },
                                        { label: 'Expand paragraph', icon: ArrowRightFromLine, prompt: 'expand' },
                                        { label: 'Summarize text', icon: FileText, prompt: 'summarize' },
                                        { label: 'Improve writing', icon: PenLine, prompt: 'improve' },
                                        { label: 'Fix grammar', icon: CheckCircle, prompt: 'grammar' },
                                        { label: 'Make it formal', icon: Briefcase, prompt: 'formal' },
                                        { label: 'Make it casual', icon: MessageSquare, prompt: 'casual' },
                                        { label: 'Continue writing', icon: ChevronRight, prompt: 'continue' },
                                    ].map((action) => (
                                        <button
                                            key={action.prompt}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm transition-all group"
                                        >
                                            <action.icon size={14} className="text-purple-500 group-hover:text-purple-600"/>
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="p-4 border-t border-slate-200">
                                    <div className="relative">
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                                            placeholder="Custom prompt..."
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-500 hover:bg-purple-400 rounded-lg text-white transition-colors">
                                            <ArrowUp size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Version History Panel */}
            {showVersionHistory && (
                <div className="fixed inset-0 z-[100] flex">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)}/>
                    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <History size={16} className="text-blue-500"/>
                                Version History
                            </h3>
                            <button onClick={() => setShowVersionHistory(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={16} className="text-slate-500"/>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {[
                                { id: 'v5', time: 'Just now', user: 'You', changes: 'Added AI features and premium UI', isCurrent: true },
                                { id: 'v4', time: '10 minutes ago', user: 'You', changes: 'Updated slide templates', isCurrent: false },
                                { id: 'v3', time: '1 hour ago', user: 'You', changes: 'Created presentation outline', isCurrent: false },
                                { id: 'v2', time: '2 hours ago', user: 'You', changes: 'Initial content draft', isCurrent: false },
                                { id: 'v1', time: '3 hours ago', user: 'You', changes: 'Document created', isCurrent: false },
                            ].map((version) => (
                                <div 
                                    key={version.id}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                        version.isCurrent 
                                        ? 'border-blue-200 bg-blue-50' 
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${version.isCurrent ? 'bg-blue-500' : 'bg-slate-300'}`}/>
                                            <span className="text-xs font-semibold text-slate-800">{version.time}</span>
                                        </div>
                                        {version.isCurrent && (
                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-500 text-white rounded-full">Current</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 pl-4">{version.changes}</p>
                                    <p className="text-[10px] text-slate-400 pl-4 mt-1">by {version.user}</p>
                                    {!version.isCurrent && (
                                        <div className="flex gap-2 mt-2 pl-4">
                                            <button className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Preview</button>
                                            <button className="text-[10px] font-semibold text-slate-600 hover:text-slate-800">Restore</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <p className="text-[10px] text-slate-500 text-center">
                                Version history is auto-saved every 5 minutes
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notification Toasts */}
            <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto animate-slide-up ${
                            notif.type === 'success' ? 'bg-emerald-500 text-white' :
                            notif.type === 'warning' ? 'bg-amber-500 text-white' :
                            'bg-slate-800 text-white'
                        }`}
                    >
                        {notif.type === 'success' && <CheckCircle size={16}/>}
                        {notif.type === 'warning' && <AlertTriangle size={16}/>}
                        {notif.type === 'info' && <Bell size={16}/>}
                        <span className="text-sm font-medium">{notif.message}</span>
                        <button 
                            onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X size={14}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentEditorPane;