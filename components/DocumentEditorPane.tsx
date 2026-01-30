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
    Inbox
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
    layout: 'title' | 'content' | 'visual' | 'big-number';
    title: string;
    subtitle: string;
    body: string;
    image?: string;
}

const SLIDE_THEMES = {
    nova: {
        bg: "bg-gradient-to-br from-[#c7d2fe] to-[#e0e7ff]",
        text: "text-[#0f172a]",
        accent: "text-[#4f46e5]",
        border: "border-[#4f46e5]/20",
        label: "Nova"
    },
    twilight: {
        bg: "bg-gradient-to-br from-[#fde68a] to-[#fff7ed]",
        text: "text-[#0f172a]",
        accent: "text-[#d97706]",
        border: "border-[#d97706]/20",
        label: "Twilight"
    },
    coral: {
        bg: "bg-gradient-to-br from-[#fecaca] to-[#fff1f2]",
        text: "text-[#0f172a]",
        accent: "text-[#dc2626]",
        border: "border-[#dc2626]/20",
        label: "Coral"
    },
    mercury: {
        bg: "bg-gradient-to-br from-[#e5e7eb] to-[#f8fafc]",
        text: "text-[#0f172a]",
        accent: "text-[#475569]",
        border: "border-[#475569]/20",
        label: "Mercury"
    },
    ashrose: {
        bg: "bg-gradient-to-br from-[#f3e8ff] to-[#faf5ff]",
        text: "text-[#0f172a]",
        accent: "text-[#7c3aed]",
        border: "border-[#7c3aed]/20",
        label: "Ashrose"
    },
    spectrum: {
        bg: "bg-gradient-to-br from-[#dbeafe] to-[#fefce8]",
        text: "text-[#0f172a]",
        accent: "text-[#0891b2]",
        border: "border-[#0891b2]/20",
        label: "Spectrum"
    },
    midnight: {
        bg: "bg-gradient-to-br from-slate-900 via-[#0f172a] to-black",
        text: "text-white",
        accent: "text-blue-400",
        border: "border-slate-800",
        label: "Midnight"
    },
    ocean: {
        bg: "bg-gradient-to-br from-cyan-600 to-blue-700",
        text: "text-white",
        accent: "text-cyan-200",
        border: "border-white/20",
        label: "Ocean"
    },
    clean: {
        bg: "bg-white",
        text: "text-slate-900",
        accent: "text-blue-600",
        border: "border-gray-200",
        label: "Clean"
    }
};

const MODERN_TEMPLATES = [
    { id: 't1', name: 'Pitch Deck', category: 'Business', theme: 'nova', meta: '12 slides · Investor-ready' },
    { id: 't2', name: 'Quarterly Report', category: 'Business', theme: 'twilight', meta: 'Data-focused layout' },
    { id: 't3', name: 'Product Launch', category: 'Marketing', theme: 'coral', meta: 'Bold visuals' },
    { id: 't4', name: 'Team All-Hands', category: 'Internal', theme: 'mercury', meta: 'Clear communication' },
    { id: 't5', name: 'Marketing Strategy', category: 'Marketing', theme: 'ashrose', meta: 'Growth planning' },
    { id: 't6', name: 'User Research', category: 'Product', theme: 'spectrum', meta: 'Insights & findings' }
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

const SlideSetup: React.FC<{ onBack: () => void; onSelect: (layout: string, theme?: string) => void }> = ({ onBack, onSelect }) => {
    const [filter, setFilter] = useState('All');
    
    const filteredTemplates = filter === 'All' ? MODERN_TEMPLATES : MODERN_TEMPLATES.filter(t => t.category === filter);

    return (
        <div className="flex h-full w-full bg-[#f6f7fb] text-[#0f172a] font-sans absolute inset-0 z-50 overflow-hidden">
            <div className="w-64 border-r border-gray-200 bg-white p-6 flex flex-col gap-2 shadow-sm z-10">
                <div className="mb-6 flex items-center gap-2 px-2">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Presentation size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-800">Slides</span>
                </div>
                
                <button className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm transition-colors border border-indigo-100">
                    <Presentation size={18} /> Presentation
                </button>
                
                <div className="mt-auto border-t border-gray-100 pt-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-[1280px] mx-auto px-16 py-14">
                    <div className="mb-10">
                        <div className="text-[13px] font-extrabold tracking-[1.6px] uppercase text-indigo-600 mb-3.5">Create New</div>
                        <h1 className="text-[42px] font-extrabold text-slate-900 leading-[1.1] mb-3.5 tracking-tight">Choose a Modern Presentation Template</h1>
                        <p className="text-lg text-slate-500 max-w-3xl font-medium leading-relaxed">
                            Start with a professionally designed layout. Each template is optimized for clarity, storytelling, and modern presentations.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-12">
                        {['All', 'Business', 'Marketing', 'Product', 'Internal'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border ${
                                    filter === cat 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' 
                                    : 'bg-white text-slate-600 border-transparent hover:border-slate-200 hover:-translate-y-px shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 pb-20">
                        <button 
                            onClick={() => onSelect('fluid', 'clean')}
                            className="h-[270px] rounded-[28px] p-7 flex flex-col justify-center items-center relative overflow-hidden cursor-pointer bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-500">
                                <Plus size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-700 group-hover:text-indigo-600">Start Blank</h4>
                            <p className="text-sm text-slate-400 mt-2 font-medium">Empty canvas</p>
                        </button>

                        {filteredTemplates.map((tpl, index) => {
                            const currentTheme = SLIDE_THEMES[tpl.theme as keyof typeof SLIDE_THEMES];
                            if (!currentTheme) return null;
                            const isHero = filter === 'All' && index === 0;
                            
                            return (
                                <button 
                                    key={tpl.id} 
                                    onClick={() => onSelect('content', tpl.theme)} 
                                    className={`relative h-[270px] rounded-[28px] p-7 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_36px_80px_rgba(15,23,42,0.12)] shadow-[0_24px_50px_rgba(15,23,42,0.08)] group text-left ${isHero ? 'md:col-span-2' : ''}`}
                                >
                                    <div className={`absolute inset-0 ${currentTheme.bg}`} />
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/80" />
                                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg scale-90 group-hover:scale-100 duration-200">
                                        <ArrowRight size={18} strokeWidth={3} />
                                    </div>
                                    <div className="relative z-10 mt-auto">
                                        <div className="text-xs font-extrabold tracking-[1.4px] text-slate-600 uppercase mb-2">{tpl.category}</div>
                                        <h3 className="text-[22px] font-extrabold text-slate-900 leading-tight mb-3">{tpl.name}</h3>
                                        <div className="text-[13px] font-bold text-slate-500">{tpl.meta}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DocumentEditorPane: React.FC<DocumentEditorPaneProps> = ({ onCollapse, activeModelId, currentUser }) => {
    const [view, setView] = useState<'dashboard' | 'slide-setup' | 'editor'>('dashboard');
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

    const handleBack = () => {
        if (view === 'editor' || view === 'slide-setup') setView('dashboard');
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

    const generateSlides = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const prompt = `Create a professional presentation deck about: "${aiPrompt}". Exactly ${genSlideCount} slides long. Return JSON with 'slides' array containing layout, title, subtitle, body.`;
            const response = await aiService.getChatResponse({
                prompt,
                modelId: activeModelId || 'gemini-3-pro-preview',
                responseMimeType: 'application/json'
            });
            const text = response.text || '';
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);
            if (data.slides && Array.isArray(data.slides)) {
                const newSlides = data.slides.map((s: any, i: number) => ({
                    id: Date.now().toString() + i,
                    layout: s.layout || 'content',
                    title: s.title || 'Untitled',
                    subtitle: s.subtitle || '',
                    body: s.body || ''
                }));
                setSlides(newSlides);
                setActiveSlideIndex(0);
                setIsGenerateMode(false);
                setAiPrompt('');
            }
        } catch (e) { console.error(e); }
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
                        {editable ? <textarea value={slide.body} onChange={(e) => updateSlide('body', e.target.value)} className={`flex-1 bg-transparent text-xl outline-none resize-none leading-relaxed placeholder-white/30 ${currentTheme.text}`} placeholder="• Click to add content"/> : <div className="text-xl whitespace-pre-wrap leading-relaxed">{slide.body}</div>}
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
             </div>
        </div>
    };

    if (view === 'dashboard') {
        return (
            <div className="flex h-full w-full bg-[#f8fafc] text-[#0f172a] font-sans overflow-y-auto overflow-x-hidden relative dashboard-root">
                <style dangerouslySetInnerHTML={{ __html: `
                    .dashboard-root {
                      --bg: #f8fafc;
                      --panel: #ffffff;
                      --text: #0f172a;
                      --muted: #475569;
                      --ring: rgba(15,23,42,0.08);
                      --blue: #6366f1;
                      --green: #22c55e;
                      --orange: #fb923c;
                      background:
                        radial-gradient(1000px 600px at 15% -10%, #e0e7ff, transparent 60%),
                        radial-gradient(900px 500px at 90% 10%, #dcfce7, transparent 55%),
                        radial-gradient(800px 500px at 50% 120%, #fff7ed, transparent 60%),
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
                      border-radius: 50%;
                      display: grid;
                      place-items: center;
                      background: white;
                      box-shadow: 0 12px 24px rgba(15,23,42,0.12);
                      font-size: 22px;
                      cursor: pointer;
                      transition: transform .2s ease, box-shadow .2s ease;
                      border: none;
                      z-index: 50;
                    }

                    .close-btn:hover { transform: scale(1.08); box-shadow: 0 18px 36px rgba(15,23,42,0.18); }

                    .eyebrow { font-size: 12px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 14px; }
                    .hero-h1 { font-size: 48px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.02em; color: var(--text); }
                    .dashboard-subtitle { font-size: 18px; color: var(--muted); margin-bottom: 64px; max-width: 640px; }
                    .creative-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

                    .creative-card {
                      position: relative; border-radius: 20px; padding: 20px; background: linear-gradient(180deg, #ffffff, #f8fafc);
                      box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 20px 48px rgba(15,23,42,0.1);
                      cursor: pointer; display: flex; flex-direction: column; gap: 12px; overflow: hidden;
                      transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease; border: none; text-align: left;
                    }

                    .creative-card::after { content: ""; position: absolute; inset: 0; border-radius: 20px; pointer-events: none; box-shadow: inset 0 0 0 1px var(--ring); }
                    .creative-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px rgba(15,23,42,0.15); }

                    .creative-icon { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-size: 20px; font-weight: 800; color: white; box-shadow: 0 8px 16px rgba(15,23,42,0.2); }
                    .docs-grad { background: linear-gradient(135deg, var(--blue), #2563eb); }
                    .sheets-grad { background: linear-gradient(135deg, var(--green), #16a34a); }
                    .slides-grad { background: linear-gradient(135deg, var(--orange), #f97316); }

                    .creative-card h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
                    .creative-card p { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.4; }
                    .hint { margin-top: auto; font-size: 10px; font-weight: 600; color: var(--muted); opacity: .85; }
                    .dashboard-cta { margin-top: 48px; display: flex; justify-content: center; gap: 12px; align-items: center; }

                    .dashboard-cta button { padding: 12px 28px; font-size: 13px; font-weight: 700; border-radius: 999px; border: none; cursor: pointer; background: linear-gradient(135deg, #6366f1, #2563eb); color: white; box-shadow: 0 15px 30px rgba(37,99,235,.3); transition: transform .2s ease, box-shadow .2s ease; }
                    .dashboard-cta button:hover { transform: translateY(-2px); box-shadow: 0 25px 45px rgba(37,99,235,.4); }

                    .kbd-key { font-size: 10px; padding: 3px 6px; border-radius: 4px; background: white; box-shadow: inset 0 0 0 1px var(--ring); font-weight: 700; color: var(--muted); }
                    .recent-sec { margin-top: 56px; }
                    .recent-sec h4 { margin: 0 0 12px; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }

                    @media (max-width: 768px) { .overlay { padding: 48px 24px 72px; } .close-btn { right: 24px; top: 32px; } .hero-h1 { font-size: 24px; } .creative-cards { grid-template-columns: 1fr; } }
                    @media (prefers-color-scheme: dark) {
                      .dashboard-root { --bg: #020617; --panel: #020617; --text: #e5e7eb; --muted: #94a3b8; --ring: rgba(148,163,184,0.2); background: radial-gradient(1000px 600px at 15% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(34,197,94,0.12), transparent 55%), radial-gradient(800px 500px at 50% 120%, rgba(251,146,60,0.12), transparent 60%), var(--bg); }
                      .creative-card { background: linear-gradient(180deg, #0f172a, #020617); box-shadow: 0 20px 50px rgba(0,0,0,.5); }
                      .close-btn, .kbd-key { background: #1e293b; }
                    }
                ` }} />
                
                <div className="overlay">
                    <button onClick={onCollapse} className="close-btn">×</button>
                    <div className="eyebrow">Document Studio</div>
                    <h1 className="hero-h1">Create professional assets in seconds</h1>
                    <p className="dashboard-subtitle">Start with a smart format or use AI to generate your first draft instantly.</p>
                    <div className="creative-cards">
                        <button className="creative-card" onClick={() => handleNewDocument('docs')}>
                            <div className="creative-icon docs-grad">📄</div>
                            <h3>Docs</h3>
                            <p>Write proposals and technical documentation.</p>
                            <div className="hint">Press <span className="kbd-key">D</span> →</div>
                        </button>
                        <button className="creative-card" onClick={() => handleNewDocument('sheets')}>
                            <div className="creative-icon sheets-grad">▦</div>
                            <h3>Sheets</h3>
                            <p>Track metrics and manage data in tables.</p>
                            <div className="hint">Press <span className="kbd-key">S</span> →</div>
                        </button>
                        <button className="creative-card" onClick={() => handleNewDocument('slides')}>
                            <div className="creative-icon slides-grad">▭</div>
                            <h3>Slides</h3>
                            <p>Design visual stories and presentations.</p>
                            <div className="hint">Press <span className="kbd-key">P</span> →</div>
                        </button>
                    </div>
                    <div className="dashboard-cta">
                        <button onClick={() => { setDocType('slides'); setView('slide-setup'); setIsGenerateMode(true); }}>Start with AI</button>
                        <span className="kbd-key">⌘K</span>
                    </div>
                    <div className="recent-sec">
                        <h4>Recent</h4>
                        <div className="flex items-center justify-center py-12 opacity-30 border border-dashed border-gray-300 rounded-2xl w-full">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Inbox size={32} strokeWidth={1.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Workspace history is empty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'slide-setup') return <SlideSetup onBack={() => setView('dashboard')} onSelect={handleSlideSetupComplete}/>;

    return (
        <div className={`flex h-full w-full overflow-hidden text-sans flex-col relative font-sans ${docType === 'docs' ? 'bg-[#f9fbfd]' : 'bg-[#1e1e1e]'}`}>
            <header className={`h-16 flex items-center justify-between px-4 border-b flex-shrink-0 z-40 ${docType === 'docs' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#1e1e1e] border-white/10 text-white'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className={`p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 ${docType === 'docs' ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}><ArrowLeft size={20}/></button>
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${docType === 'docs' ? '' : docType === 'slides' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>{getEditorIcon()}</div>
                        <div className="flex flex-col">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`text-lg font-medium bg-transparent border-none outline-none p-0 h-6 ${docType === 'docs' ? 'text-gray-800' : 'text-gray-200'}`}/>
                            {docType === 'docs' && (
                                <div className="flex gap-4 text-[13px] text-gray-600 mt-0.5 select-none relative" ref={menuRef}>
                                    {MENUS.map(menu => (
                                        <div key={menu.label} className="relative">
                                            <span className={`hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === menu.label ? 'bg-gray-200' : ''}`} onClick={() => handleMenuClick(menu.label)}>{menu.label}</span>
                                            {activeMenu === menu.label && (
                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 flex flex-col animate-fade-in origin-top-left">
                                                    {menu.items.map(item => <button key={item} className="text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm w-full" onClick={() => setActiveMenu(null)}>{item}</button>)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => setIsExportMenu(!isExportMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${docType === 'docs' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}><Download size={16}/> Export</button>
                        {isExportMenuOpen && (
                            <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl border z-50 overflow-hidden py-1 animate-fade-in ${docType === 'docs' ? 'bg-white border-gray-200' : 'bg-[#252526] border-white/10'}`}>
                                {docType === 'docs' && (
                                    <>
                                        <button onClick={() => handleExport('doc')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-50"><FileText size={16} className="text-blue-500"/> Microsoft Word (.doc)</button>
                                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-50"><FileText size={16} className="text-red-500"/> PDF Document (.pdf)</button>
                                    </>
                                )}
                                {docType === 'sheets' && <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-gray-200 hover:bg-white/5"><Table size={16} className="text-green-500"/> Comma Separated (.csv)</button>}
                                {docType === 'slides' && <button onClick={() => handleExport('ppt')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-gray-200 hover:bg-white/5"><Presentation size={16} className="text-orange-500"/> PowerPoint (.pptx)</button>}
                            </div>
                        )}
                    </div>
                    {docType === 'docs' && (
                        <>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><MessageSquarePlus size={20}/></button>
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#c2e7ff] text-[#001d35] font-bold text-sm rounded-full hover:shadow-md transition-shadow"><Share2 size={18}/> Share</button>
                            <div className="flex -space-x-2 ml-2" ref={avatarContainerRef}>
                                {currentUser && (
                                    <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center font-bold text-xs text-white relative z-10 shadow-sm" title={currentUser.name}>
                                        {currentUser.initials}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {docType === 'docs' && (
                <div className="bg-[#f9fbfd] border-b border-gray-300 px-4 py-1.5 flex items-center gap-1 flex-wrap shrink-0 rounded-[28px] mx-2 my-1.5 shadow-sm select-none">
                    <div className="flex gap-1 pr-2 border-r border-gray-300"><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Undo2 size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Redo2 size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Printer size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><SpellCheck size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><PaintRoller size={16}/></button></div>
                    <div className="flex gap-2 items-center px-2 border-r border-gray-300 h-6"><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded">100% <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded">Normal text <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><button className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-200 px-1 rounded font-sans">Arial <ChevronDown size={12}/></button><div className="w-px h-4 bg-gray-300 mx-1"></div><div className="flex items-center gap-1"><button onClick={() => setFontSize(Math.max(1, fontSize-1))} className="p-0.5 text-gray-600 hover:bg-gray-200 rounded"><Minus size={12}/></button><input className="w-8 text-center bg-transparent border border-gray-300 rounded text-xs py-0.5" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}/><button onClick={() => setFontSize(fontSize+1)} className="p-0.5 text-gray-600 hover:bg-gray-200 rounded"><Plus size={12}/></button></div></div>
                    <div className="flex gap-1 items-center px-2 border-r border-gray-300 h-6"><button onClick={() => toggleFormat('bold')} className={`p-1 rounded ${formatting.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Bold size={16}/></button><button onClick={() => toggleFormat('italic')} className={`p-1 rounded italic ${formatting.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Italic size={16}/></button><button onClick={() => toggleFormat('underline')} className={`p-1 rounded underline ${formatting.underline ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}><Underline size={16}/></button><button className="p-1 text-gray-700 hover:bg-gray-200 rounded"><Baseline size={16}/></button><button className="p-1 text-gray-700 hover:bg-gray-200 rounded"><Highlighter size={16}/></button></div>
                    <div className="flex gap-1 items-center px-2 border-r border-gray-300 h-6"><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Link size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><MessageSquarePlus size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><ImageIcon size={16}/></button></div>
                    <div className="flex gap-1 items-center px-2 h-6"><button onClick={() => setAlign('left')} className={`p-1 rounded ${formatting.align === 'left' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignLeft size={16}/></button><button onClick={() => setAlign('center')} className={`p-1 rounded ${formatting.align === 'center' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignCenter size={16}/></button><button onClick={() => setAlign('right')} className={`p-1 rounded ${formatting.align === 'right' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignRight size={16}/></button><button onClick={() => setAlign('justify')} className={`p-1 rounded ${formatting.align === 'justify' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><AlignJustify size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><MoreVertical size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><CheckSquare size={16}/></button><button onClick={() => toggleList('bullet')} className={`p-1 rounded ${formatting.list === 'bullet' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><List size={16}/></button><button onClick={() => toggleList('ordered')} className={`p-1 rounded ${formatting.list === 'ordered' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}><ListOrdered size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Outdent size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><Indent size={16}/></button><button className="p-1 text-gray-600 hover:bg-gray-200 rounded"><RotateCcw size={16}/></button></div>
                    <div className="ml-auto relative mode-selector"><button onClick={() => setIsModeMenuOpen(!isModeMenuOpen)} className="flex items-center bg-[#c2e7ff] rounded-full px-3 py-1 cursor-pointer hover:shadow-sm transition-all">{editMode === 'Editing' && <Pencil size={14} className="text-[#001d35] mr-2"/>}{editMode === 'Suggesting' && <MessageSquareText size={14} className="text-[#001d35] mr-2"/>}{editMode === 'Viewing' && (<><Eye size={14} className="text-[#001d35] mr-2"/><span className="text-xs font-bold text-[#001d35] min-w-[60px] text-left">{editMode}</span></>)}<ChevronDown size={12} className="ml-2 text-[#001d35]"/></button>{isModeMenuOpen && (<div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 flex flex-col animate-fade-in text-gray-800 origin-top-right"><button onClick={() => { setEditMode('Editing'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><Pencil size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Editing</span><span className="text-[10px] text-gray-500">Edit document directly</span></div></button><button onClick={() => { setEditMode('Suggesting'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><MessageSquareText size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Suggesting</span><span className="text-[10px] text-gray-500">Propose changes</span></div></button><button onClick={() => { setEditMode('Viewing'); setIsModeMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-sm"><Eye size={16} className="text-gray-500 shrink-0"/><div className="flex flex-col items-start"><span className="font-semibold">Viewing</span><span className="text-[10px] text-gray-500">Read or print</span></div></button></div>)}</div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {docType === 'slides' && (
                    <div className="flex w-full h-full bg-blue-50/50">
                        {isGenerateMode ? (
                            <div className="absolute inset-0 bg-[#e0f2fe] z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
                                <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[700px]">
                                    <div className="w-full md:w-1/2 p-8 bg-blue-50 flex flex-col justify-center relative overflow-hidden"><button onClick={() => setIsGenerateMode(false)} className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm"><ArrowLeft size={16}/> Back</button><div className="mb-8 relative z-10 text-center"><h2 className="text-3xl font-black text-slate-800 mb-2">Generate</h2><p className="text-sm text-slate-500 font-medium">Design stunning decks in seconds with AI.</p></div><div className="space-y-6 relative z-10"><div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prompt</label><textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Strategy deck for TechCorp Q4..." className="w-full bg-white border border-blue-100 rounded-xl p-4 text-sm text-slate-700 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"/></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Length</label><div className="relative"><select value={genSlideCount} onChange={(e) => setGenSlideCount(Number(e.target.value))} className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"><option value={6}>6 Cards</option><option value={8}>8 Cards</option><option value={10}>10 Cards</option><option value={12}>12 Cards</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/></div></div><div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Language</label><div className="relative"><select className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"><option>English (US)</option><option>Spanish</option><option>French</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/></div></div></div></div></div>
                                    <div className="w-full md:w-1/2 bg-white p-8 overflow-y-auto"><div className="mb-6"><h3 className="text-sm font-bold text-slate-800 mb-1">Customize your slides</h3><p className="text-xs text-slate-400">Choose density and visual style.</p></div><div className="mb-8"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2"><AlignLeft size={14}/> Text Density</label><div className="grid grid-cols-3 gap-3">{[{ id: 'minimal', label: 'Minimal', icon: <Minus size={16}/> }, { id: 'standard', label: 'Standard', icon: <AlignLeft size={16}/> }, { id: 'detailed', label: 'Detailed', icon: <List size={16}/> }].map((opt) => (<button key={opt.id} onClick={() => setGenTextAmount(opt.id as any)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${genTextAmount === opt.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600'}`}><div className="mb-1">{opt.icon}</div><span className="text-[10px] font-bold uppercase">{opt.label}</span></button>))}</div></div><div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2"><Palette size={14}/> Theme</label><div className="grid grid-cols-2 gap-3">{Object.entries(SLIDE_THEMES).map(([key, theme]) => (<button key={key} onClick={() => setSlideTheme(key as any)} className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all group text-left p-3 flex flex-col justify-end ${slideTheme === key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:scale-[1.02]'}`}><div className={`absolute inset-0 ${theme.bg}`}></div><span className={`relative z-10 text-xs font-bold ${theme.text} drop-shadow-md`}>{theme.label}</span>{slideTheme === key && (<div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5"><Check size={10} strokeWidth={4}/></div>)}</button>))}</div></div></div>
                                </div>
                                <div className="mt-8"><button onClick={generateSlides} disabled={!aiPrompt.trim() || isGenerating} className="bg-[#0055ff] hover:bg-[#0044cc] text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3">{isGenerating ? <RefreshCw className="animate-spin"/> : <Sparkles fill="currentColor"/>}{isGenerating ? 'Generating...' : 'Generate Deck'}</button></div>
                            </div>
                        ) : (
                            <>
                                <div ref={sidebarRef} style={{ width: sidebarWidth }} className="bg-[#1c1c1e] border-r border-white/5 flex flex-col z-10 flex-shrink-0"><div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">{slides.map((slide, idx) => (<div key={slide.id} onClick={() => setActiveSlideIndex(idx)} className={`group relative aspect-video rounded-lg cursor-pointer transition-all ${activeSlideIndex === idx ? 'ring-2 ring-orange-500 shadow-xl scale-105 z-10' : 'hover:ring-2 hover:ring-white/20 opacity-70 hover:opacity-100 hover:scale-105'}`}><div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 text-white text-[8px] font-bold flex items-center justify-center backdrop-blur-sm z-20 shadow-md">{idx + 1}</div><div className="w-full h-full rounded-md overflow-hidden bg-white shadow-sm pointer-events-none transform origin-top-left"><div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', height: '500%' }}><SlideRenderer slide={slide} theme={slideTheme} editable={false}/></div></div></div>))}</div><div className="p-4 border-t border-white/5 bg-[#1c1c1e] space-y-2"><button onClick={addNewSlide} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"><Plus size={16}/> Add Slide</button><button onClick={() => setIsGenerateMode(true)} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"><Sparkles size={16}/> Generate with AI</button></div></div>
                                <div onMouseDown={startResizing} className={`w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 flex-shrink-0 hidden lg:block ${isResizing ? 'bg-blue-500' : 'bg-transparent'}`}/>
                                <div className="flex-1 bg-[#0f0f10] flex flex-col items-center justify-center p-8 relative overflow-hidden"><div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', backgroundSize: '24px 24px' }} /><div className={`aspect-video bg-white shadow-2xl rounded-xl relative overflow-hidden flex flex-col transition-all duration-300 ring-1 ring-white/10 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-5xl'}`}>{slides[activeSlideIndex] && (<SlideRenderer slide={slides[activeSlideIndex]} theme={slideTheme} editable={!isFullscreen}/>)}</div></div>
                            </>
                        )}
                    </div>
                )}

                {docType === 'sheets' && (
                    <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
                        <div className="bg-[#1e1e1e] border-b border-white/5 px-4 py-2 flex items-center gap-1 flex-wrap shrink-0"><div className="flex gap-0.5 border-r border-white/10 pr-2 mr-2"><button className="p-1 text-gray-400 hover:text-white rounded"><Undo2 size={16}/></button><button className="p-1 text-gray-400 hover:text-white rounded"><Redo2 size={16}/></button><button className="p-1 text-gray-400 hover:text-white rounded"><Printer size={16}/></button><button className="p-1 text-gray-400 hover:text-white rounded"><PaintRoller size={16}/></button></div><div className="flex gap-2 items-center border-r border-white/10 pr-2 mr-2"><button className="flex items-center gap-1 text-xs text-gray-300 bg-white/5 px-2 py-1 rounded">100% <ChevronDown size={12}/></button><div className="flex gap-0.5"><button className="p-1 text-gray-400 hover:text-white rounded" onClick={() => toggleSheetStyle('textDecoration', 'line-through')}><DollarSign size={16}/></button><button className="p-1 text-gray-400 hover:text-white rounded"><Percent size={16}/></button><button className="p-1 text-gray-400 hover:text-white rounded"><ArrowLeftFromLine size={16}/></button></div></div><div className="flex gap-2 items-center border-r border-white/10 pr-2 mr-2"><button className="flex items-center gap-1 text-xs text-gray-300 bg-white/5 px-2 py-1 rounded w-24 justify-between">Arial <ChevronDown size={12}/></button><div className="flex items-center gap-1 bg-white/5 rounded px-1"><button className="text-gray-400 hover:text-white px-1"><Minus size={12}/></button><span className="text-xs text-white w-4 text-center">10</span><button className="text-gray-400 hover:text-white px-1"><Plus size={12}/></button></div></div><div className="flex gap-0.5"><button onClick={() => toggleSheetStyle('fontWeight', 'bold')} className={`p-1 rounded ${sheetStyles[`${activeCell?.r}-${activeCell?.c}`]?.fontWeight === 'bold' ? 'bg-[#0891b2] text-white' : 'text-gray-400 hover:bg-white/10'}`}><Bold size={16}/></button><button onClick={() => toggleSheetStyle('fontStyle', 'italic')} className={`p-1 rounded ${sheetStyles[`${activeCell?.r}-${activeCell?.c}`]?.fontStyle === 'italic' ? 'bg-[#0891b2] text-white' : 'text-gray-400 hover:bg-white/10'}`}><Italic size={16}/></button><button onClick={() => toggleSheetStyle('textDecoration', 'line-through')} className={`p-1 rounded ${sheetStyles[`${activeCell?.r}-${activeCell?.c}`]?.textDecoration === 'line-through' ? 'bg-[#0891b2] text-white' : 'text-gray-400 hover:bg-white/10'}`}><Type size={16}/></button><button onClick={() => toggleSheetStyle('textAlign', 'left')} className="p-1 text-gray-400 hover:bg-white/10 rounded"><AlignLeft size={16}/></button><button onClick={() => toggleSheetStyle('textAlign', 'center')} className="p-1 text-gray-400 hover:bg-white/10 rounded"><AlignCenter size={16}/></button><button onClick={() => toggleSheetStyle('textAlign', 'right')} className="p-1 text-gray-400 hover:bg-white/10 rounded"><AlignRight size={16}/></button></div></div>
                        <div className="flex items-center px-4 py-2 border-b border-white/5 bg-[#252526] gap-3"><div className="flex items-center gap-2 text-gray-400 min-w-[40px]"><FunctionSquare size={16}/><span className="text-xs font-mono font-bold text-blue-400">{activeCell ? `${getColumnLabel(activeCell.c)}${activeCell.r + 1}` : ''}</span></div><div className="h-6 w-px bg-white/10 mx-1"></div><input className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 font-mono placeholder-gray-600" placeholder="fx" value={activeCell ? sheetData[activeCell.r][activeCell.c] : ''} onChange={(e) => activeCell && updateSheetCell(activeCell.r, activeCell.c, e.target.value)} disabled={!activeCell}/></div>
                        <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#1e1e1e]"><div className="inline-block relative"><div className="flex sticky top-0 z-20 shadow-md"><div className="w-12 h-8 bg-[#252526] border-r border-b border-[#3e3e42] sticky left-0 z-30"></div>{Array.from({ length: 26 }).map((_, i) => (<div key={i} className="w-32 h-8 bg-[#252526] border-r border-b border-[#3e3e42] flex items-center justify-center text-xs font-bold text-gray-400 select-none uppercase">{getColumnLabel(i)}</div>))}</div>{sheetData.map((row, rIdx) => (<div key={rIdx} className="flex group"><div className="w-12 h-8 bg-[#252526] border-r border-b border-[#3e3e42] flex items-center justify-center text-xs font-bold text-gray-400 select-none sticky left-0 z-10 group-hover:bg-[#2c2c2e] transition-colors">{rIdx + 1}</div>{row.map((cell, cIdx) => { const isActive = activeCell?.r === rIdx && activeCell?.c === cIdx; return (<div key={cIdx} onClick={() => setActiveCell({ r: rIdx, c: cIdx })} className={`w-32 h-8 border-r border-b border-[#3e3e42] relative transition-colors ${isActive ? 'z-10 ring-2 ring-[#0891b2] border-transparent bg-[#2d2d2d]' : 'hover:bg-[#262626]'}`}><input className="w-full h-full bg-transparent border-none outline-none px-2 text-xs text-gray-300 font-mono" style={sheetStyles[`${rIdx}-${cIdx}`] || {}} value={cell} onChange={(e) => updateSheetCell(rIdx, cIdx, e.target.value)}/>{isActive && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#0891b2] cursor-crosshair"></div>}</div>)})}</div>))}</div></div>
                    </div>
                )}

                {docType === 'docs' && (
                    <div className="flex flex-1 w-full bg-[#f9fbfd] relative">
                        <div ref={sidebarRef} style={{ width: sidebarWidth }} className="border-r border-gray-300 bg-white flex flex-col hidden lg:flex flex-shrink-0"><div className="p-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-sm font-medium text-gray-700">Document tabs</h3><Plus size={16} className="text-gray-500 cursor-pointer hover:text-black transition-colors" onClick={handleAddSection}/></div><div className="p-2 space-y-1">{docSections.map(section => (<div key={section.id} onClick={() => setActiveSectionId(section.id)} className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm cursor-pointer transition-colors ${activeSectionId === section.id ? 'bg-[#e8f0fe] text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}><FileText size={16} className={activeSectionId === section.id ? 'fill-current' : ''}/>{section.title}{activeSectionId === section.id && <MoreHorizontal size={14} className="ml-auto text-blue-700"/>}</div>))}</div><div className="p-4 mt-auto"><p className="text-xs text-gray-500 italic">Headings you add to the document will appear here.</p></div></div>
                        <div onMouseDown={startResizing} className={`w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 flex-shrink-0 hidden lg:block ${isResizing ? 'bg-blue-500' : 'bg-transparent'}`}/>
                        <div className="flex-1 flex flex-col relative overflow-hidden"><DocsRuler /><div className="flex-1 overflow-y-auto bg-[#f9fbfd] flex justify-center p-4"><div className="bg-white w-[816px] min-h-[1056px] shadow-sm border border-gray-300 p-24 text-black relative outline-none ring-0 transition-all"><div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"><div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer pointer-events-auto"><Sparkles size={12}/> Generate document</div><div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer pointer-events-auto"><Wand2 size={12}/> Help me write</div></div><textarea readOnly={editMode === 'Viewing'} className={`w-full h-full resize-none border-none outline-none font-sans leading-relaxed text-gray-900 overflow-hidden bg-transparent ${editMode === 'Viewing' ? 'cursor-default' : 'cursor-text'}`} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${fontSize}pt`, fontWeight: formatting.bold ? 'bold' : 'normal', fontStyle: formatting.italic ? 'italic' : 'normal', textDecoration: formatting.underline ? 'underline' : 'none', textAlign: formatting.align }} value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} placeholder={editMode === 'Viewing' ? '' : "Type @ to insert"}/><div className="absolute bottom-8 right-[-60px] flex flex-col gap-3"><div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-all hover:scale-110"><Wand2 size={18}/></div><div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-all hover:scale-110"><ImageIcon size={18}/></div></div></div></div></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentEditorPane;