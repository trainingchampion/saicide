
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    X, 
    Pencil, 
    Eraser, 
    Square, 
    Circle, 
    Trash2, 
    Download, 
    Sparkles,
    RefreshCw,
    Maximize2,
    MousePointer2,
    Palette,
    Bot,
    ArrowLeft,
    Type,
    Undo2,
    Redo2,
    Grid3X3,
    MoveUpRight
} from 'lucide-react';
import aiService from '../services/geminiService';

interface WhiteboardPaneProps {
  onCollapse?: () => void;
  onReturnToWelcome?: () => void;
  activeModelId?: string;
}

type Tool = 'pencil' | 'line' | 'rect' | 'circle' | 'text' | 'eraser';

interface Point {
    x: number;
    y: number;
}

interface DrawingElement {
    id: string;
    type: Tool;
    points?: Point[]; // For pencil
    start?: Point;    // For shapes/lines
    end?: Point;      // For shapes/lines
    text?: string;    // For text
    color: string;
    size: number;
}

const COLORS = ['#000000', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#ffffff'];
const SIZES = [2, 4, 8, 12];

const WhiteboardPane: React.FC<WhiteboardPaneProps> = ({ onCollapse, onReturnToWelcome, activeModelId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  
  const [activeTool, setActiveTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  
  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawingElement | null>(null);
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [textValue, setTextValue] = useState('');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);

  // --- Rendering Engine ---

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = element.color;

      // Handle Eraser (draws white line over)
      if (element.type === 'eraser') {
          ctx.strokeStyle = '#f1f5f9'; // Matches bg-slate-100
          ctx.lineWidth = element.size * 4;
      }

      ctx.beginPath();

      if (element.type === 'pencil' || element.type === 'eraser') {
          if (element.points && element.points.length > 0) {
              ctx.moveTo(element.points[0].x, element.points[0].y);
              element.points.forEach(point => ctx.lineTo(point.x, point.y));
              ctx.stroke();
          }
      } else if (element.start && element.end) {
          const { x: x1, y: y1 } = element.start;
          const { x: x2, y: y2 } = element.end;

          if (element.type === 'line') {
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              
              // Draw Arrowhead
              const angle = Math.atan2(y2 - y1, x2 - x1);
              const headLength = 15;
              ctx.beginPath();
              ctx.moveTo(x2, y2);
              ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
              ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
              ctx.lineTo(x2, y2);
              ctx.fill();
          } else if (element.type === 'rect') {
              ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
          } else if (element.type === 'circle') {
              const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              ctx.beginPath();
              ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
              ctx.stroke();
          }
      } else if (element.type === 'text' && element.start && element.text) {
          ctx.font = `${element.size * 4}px sans-serif`; // Scale font with size slider
          ctx.textBaseline = 'top';
          ctx.fillText(element.text, element.start.x, element.start.y);
      }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#cbd5e1';
      for (let x = 0; x < width; x += 40) {
          for (let y = 0; y < height; y += 40) {
              ctx.fillRect(x, y, 2, 2);
          }
      }
  };

  const renderCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background
      ctx.fillStyle = '#f1f5f9'; // bg-slate-100
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (showGrid) {
          drawGrid(ctx, canvas.width, canvas.height);
      }

      // Draw saved elements
      elements.forEach(el => drawElement(ctx, el));

      // Draw current action (ghost)
      if (currentAction) {
          drawElement(ctx, currentAction);
      }
  }, [elements, currentAction, showGrid]);

  useEffect(() => {
      renderCanvas();
  }, [renderCanvas]);

  // --- Initialization ---

  useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const resizeCanvas = () => {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          renderCanvas();
      };

      // Use ResizeObserver for more reliable size detection
      const resizeObserver = new ResizeObserver(() => {
          resizeCanvas();
      });
      
      resizeObserver.observe(container);
      
      // Initial resize
      resizeCanvas();

      return () => resizeObserver.disconnect();
  }, [renderCanvas]);

  // --- Input Handlers ---

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | any): Point => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      return {
          x: clientX - rect.left,
          y: clientY - rect.top
      };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (activeTool === 'text') {
          if (textPosition) finalizeText();
          else {
            const pos = getCoordinates(e);
            setTextPosition(pos);
            setTimeout(() => textAreaRef.current?.focus(), 50);
          }
          return;
      }

      const pos = getCoordinates(e);
      setIsDrawing(true);

      const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: activeTool,
          color,
          size,
          points: [pos], // For pencil
          start: pos,
          end: pos
      };
      setCurrentAction(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !currentAction) return;
      const pos = getCoordinates(e);

      if (activeTool === 'pencil' || activeTool === 'eraser') {
          setCurrentAction({
              ...currentAction,
              points: [...(currentAction.points || []), pos]
          });
      } else {
          setCurrentAction({
              ...currentAction,
              end: pos
          });
      }
  };

  const handleMouseUp = () => {
      if (!isDrawing || !currentAction) return;
      setIsDrawing(false);
      
      const newElements = [...elements, currentAction];
      setElements(newElements);
      setCurrentAction(null);

      // History Management
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  // --- Text Handling ---

  const finalizeText = () => {
      if (!textPosition || !textValue.trim()) {
          setTextPosition(null);
          setTextValue('');
          return;
      }

      const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'text',
          start: textPosition,
          end: textPosition, // not needed but good for type safety
          text: textValue,
          color,
          size
      };

      const newElements = [...elements, newElement];
      setElements(newElements);
      
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);

      setTextPosition(null);
      setTextValue('');
  };

  // --- History & Actions ---

  const undo = () => {
      if (historyStep > 0) {
          const prevStep = historyStep - 1;
          // Step 0 is empty state usually, but let's handle index 0 as empty array
          setElements(history[prevStep] || []);
          setHistoryStep(prevStep);
      } else if (historyStep === 0) {
          setElements([]);
          setHistoryStep(-1);
      }
  };

  const redo = () => {
      if (historyStep < history.length - 1) {
          const nextStep = historyStep + 1;
          setElements(history[nextStep]);
          setHistoryStep(nextStep);
      }
  };

  const clearCanvas = () => {
      setElements([]);
      setHistory([]);
      setHistoryStep(0);
      setAiInterpretation(null);
  };

  const downloadCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `SaiWhiteboard_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (textPosition) return; // Disable shortcuts while typing text
          if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
          if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
          
          if (!e.metaKey && !e.ctrlKey) {
              if (e.key === 'p') setActiveTool('pencil');
              if (e.key === 'r') setActiveTool('rect');
              if (e.key === 'c') setActiveTool('circle');
              if (e.key === 'l') setActiveTool('line');
              if (e.key === 't') setActiveTool('text');
              if (e.key === 'e') setActiveTool('eraser');
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textPosition, historyStep, history]);


  // --- AI ---

  const handleInterpret = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setIsAnalyzing(true);
      setAiInterpretation(null);

      try {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.split(',')[1];

          const res = await aiService.getChatResponse({
              prompt: "Interpret this architectural whiteboard sketch. Describe the components, their relationships, and suggest the tech stack that would be most appropriate. Be precise and professional.",
              modelId: 'gemini-3-pro-image-preview',
              attachments: [{
                  data: base64Data,
                  mimeType: 'image/png',
                  name: 'sketch.png'
              }]
          });

          setAiInterpretation(res.text || "Neural core failed to yield a conclusive interpretation.");
      } catch (e) {
          setAiInterpretation("Link unstable. Synthesis error.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 relative overflow-hidden font-sans">
        {/* Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
                {onReturnToWelcome && (
                    <button onClick={onReturnToWelcome} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                        <Palette size={18} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Project Whiteboard</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Architecture & Flow Studio</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleInterpret}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all disabled:opacity-50"
                >
                    {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                    {isAnalyzing ? 'Analyzing Sketch...' : 'AI Interpret'}
                </button>
                {onCollapse && (
                    <button onClick={onCollapse} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
            {/* Toolbar */}
            <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 shrink-0 z-10 shadow-lg overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {[
                        { id: 'pencil', icon: <Pencil size={18} />, label: 'Draw (P)' },
                        { id: 'line', icon: <MoveUpRight size={18} />, label: 'Arrow (L)' },
                        { id: 'rect', icon: <Square size={18} />, label: 'Rectangle (R)' },
                        { id: 'circle', icon: <Circle size={18} />, label: 'Circle (C)' },
                        { id: 'text', icon: <Type size={18} />, label: 'Text (T)' },
                        { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser (E)' }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setActiveTool(t.id as Tool)}
                            className={`p-2.5 rounded-xl transition-all ${activeTool === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                            title={t.label}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                <div className="w-8 h-px bg-slate-200" />

                <div className="flex flex-col gap-2">
                    <button onClick={undo} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl" title="Undo (Ctrl+Z)"><Undo2 size={18}/></button>
                    <button onClick={redo} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl" title="Redo (Ctrl+Y)"><Redo2 size={18}/></button>
                </div>

                <div className="w-8 h-px bg-slate-200" />

                <div className="flex flex-col gap-3">
                    {COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => { setColor(c); if(activeTool === 'eraser') setActiveTool('pencil'); }}
                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${color === c && activeTool !== 'eraser' ? 'border-blue-500 scale-125 shadow-md' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="w-8 h-px bg-slate-200" />

                <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 rounded-xl transition-all ${showGrid ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`} title="Toggle Grid">
                    <Grid3X3 size={20} />
                </button>

                <div className="flex flex-col gap-2 mt-auto">
                    <button onClick={clearCanvas} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Clear All">
                        <Trash2 size={20} />
                    </button>
                    <button onClick={downloadCanvas} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Export PNG">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-slate-200 overflow-hidden" ref={containerRef}>
                <canvas 
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    style={{ cursor: activeTool === 'text' ? 'text' : 'crosshair' }}
                />

                {/* Text Input Overlay */}
                {textPosition && (
                    <div 
                        className="absolute"
                        style={{ left: textPosition.x, top: textPosition.y }}
                    >
                        <textarea
                            ref={textAreaRef}
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            onBlur={finalizeText}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    finalizeText();
                                }
                                if (e.key === 'Escape') {
                                    setTextPosition(null);
                                    setTextValue('');
                                }
                            }}
                            className="bg-transparent border border-blue-500 outline-none p-1 resize-none overflow-hidden shadow-lg rounded"
                            style={{ 
                                color: color, 
                                fontSize: `${size * 4}px`, 
                                fontFamily: 'sans-serif',
                                minWidth: '100px',
                                minHeight: '1.5em'
                            }}
                            autoFocus
                            placeholder="Type..."
                        />
                    </div>
                )}
                
                {/* AI Insight Sidebar */}
                {aiInterpretation && (
                    <div className="absolute right-6 top-6 bottom-6 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right z-30">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-600" />
                                <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Neural Vision</h3>
                            </div>
                            <button onClick={() => setAiInterpretation(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16}/></button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                "{aiInterpretation}"
                            </p>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                                Forge Architecture
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0 z-10">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''}/> Sync Ready</span>
                <span className="flex items-center gap-1.5"><Maximize2 size={12}/> {activeTool} Mode</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                Neural Uplink Stable
            </div>
        </div>
    </div>
  );
};

export default WhiteboardPane;
