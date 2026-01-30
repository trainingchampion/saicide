
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { 
    Plus, 
    MoreHorizontal, 
    Calendar, 
    UserCircle,
    CheckSquare,
    Search,
    RefreshCw,
    MessageSquare,
    Paperclip,
    Clock,
    X,
    Trello
} from 'lucide-react';
import { FileNode, Task, TaskStatus } from '../types';

interface KanbanPaneProps {
  onCollapse: () => void;
  fileStructure: FileNode;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Code Review' },
    { id: 'done', title: 'Done' },
];

const TAG_COLORS: Record<string, string> = {
    'Bug': 'bg-red-500/20 text-red-300',
    'Feature': 'bg-blue-500/20 text-blue-300',
    'Refactor': 'bg-yellow-500/20 text-yellow-300',
    'Design': 'bg-purple-500/20 text-purple-300',
};

const flattenFileTree = (node: FileNode): string[] => {
    let content: string[] = [];
    if (node.type === 'file' && node.content) {
        content.push(node.content);
    }
    if (node.children) {
        node.children.forEach(child => {
            content = content.concat(flattenFileTree(child));
        });
    }
    return content;
};

const KanbanPane: React.FC<KanbanPaneProps> = ({ onCollapse, fileStructure, tasks, setTasks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingCard, setIsAddingCard] = useState<TaskStatus | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const scanForTodos = () => {
        const allContent = flattenFileTree(fileStructure);
        const newTasks: Task[] = [];
        
        allContent.forEach(text => {
            const lines = text.split('\n');
            lines.forEach(line => {
                if (line.includes('TODO:')) {
                    const todoText = line.split('TODO:')[1].trim();
                    if (!tasks.some(t => t.title === todoText)) {
                        newTasks.push({
                            id: `todo-${Date.now()}-${Math.random()}`,
                            title: todoText,
                            tag: 'Feature',
                            status: 'todo'
                        });
                    }
                }
            });
        });

        if (newTasks.length > 0) {
            setTasks(prev => [...prev, ...newTasks]);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        }
        setDraggedTaskId(null);
    };

    const handleAddCard = (status: TaskStatus) => {
        if (!newCardTitle.trim()) {
            setIsAddingCard(null);
            return;
        }
        const newTask: Task = {
            id: `card-${Date.now()}`,
            title: newCardTitle,
            status,
            tag: 'Feature'
        };
        setTasks(prev => [...prev, newTask]);
        setNewCardTitle('');
        setIsAddingCard(null); // Or keep open to add multiple
    };

    return (
        <div className="h-full flex flex-col bg-[#0b0e14] text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-white/10 bg-[#161b22] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-md">
                        <Trello size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-200">Project Board</h2>
                        <p className="text-[10px] text-gray-500 font-medium">S.AI Monorepo</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Filter cards..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-48 bg-[#0d1117] border border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                    <button 
                        onClick={scanForTodos}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 p-1.5 rounded-md transition-colors"
                        title="Scan Code for TODOs"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={onCollapse} className="text-gray-500 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors">
                        {ICONS.COLLAPSE_LEFT}
                    </button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex gap-4 h-full items-start">
                    {COLUMNS.map(col => {
                        const columnTasks = tasks.filter(t => t.status === col.id && t.title.toLowerCase().includes(searchTerm.toLowerCase()));
                        
                        return (
                            <div 
                                key={col.id}
                                className="flex-shrink-0 w-72 bg-[#161b22] rounded-xl border border-white/5 flex flex-col max-h-full"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Column Header */}
                                <div className="p-3 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-white/5">
                                    <h3 className="text-sm font-bold text-gray-200 pl-1">{col.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] bg-[#21262d] text-gray-400 px-2 py-0.5 rounded-full font-mono">
                                            {columnTasks.length}
                                        </span>
                                        <button onClick={() => alert(`Column actions for '${col.title}'`)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Cards List */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                    {columnTasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            className={`bg-[#21262d] p-3 rounded-lg border border-white/5 hover:border-gray-500 cursor-pointer shadow-sm group relative transition-all ${draggedTaskId === task.id ? 'opacity-50 rotate-3' : 'opacity-100'}`}
                                        >
                                            {/* Tag */}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${TAG_COLORS[task.tag] || 'bg-gray-700 text-gray-300'}`}>
                                                    {task.tag}
                                                </span>
                                                <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>

                                            {/* Title */}
                                            <p className="text-sm text-gray-200 font-medium leading-snug mb-3">
                                                {task.title}
                                            </p>

                                            {/* Metadata Row */}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    {task.dueDate && (
                                                        <div className={`flex items-center gap-1 text-[10px] ${task.status === 'done' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} px-1.5 py-0.5 rounded`}>
                                                            <Clock size={10} />
                                                            <span>{task.dueDate}</span>
                                                        </div>
                                                    )}
                                                    {(task.commentsCount || task.attachmentsCount) && (
                                                        <div className="flex gap-2">
                                                            {task.commentsCount && (
                                                                <div className="flex items-center gap-1 text-[10px] hover:text-white">
                                                                    <MessageSquare size={12} /> {task.commentsCount}
                                                                </div>
                                                            )}
                                                            {task.attachmentsCount && (
                                                                <div className="flex items-center gap-1 text-[10px] hover:text-white">
                                                                    <Paperclip size={12} /> {task.attachmentsCount}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Assignee */}
                                                {task.assignee ? (
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white border border-[#161b22] shadow-sm" title={`Assigned to ${task.assignee}`}>
                                                        {task.assignee}
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-[#30363d] flex items-center justify-center text-gray-500 border border-[#161b22] border-dashed hover:bg-white/10 transition-colors">
                                                        <UserCircle size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Inline Add Card */}
                                    {isAddingCard === col.id ? (
                                        <div className="bg-[#21262d] p-2 rounded-lg border border-blue-500 shadow-lg animate-fade-in">
                                            <textarea 
                                                autoFocus
                                                value={newCardTitle}
                                                onChange={(e) => setNewCardTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAddCard(col.id);
                                                    } else if (e.key === 'Escape') {
                                                        setIsAddingCard(null);
                                                    }
                                                }}
                                                placeholder="Enter a title for this card..."
                                                className="w-full bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none min-h-[60px]"
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <button 
                                                    onClick={() => handleAddCard(col.id)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                                                >
                                                    Add Card
                                                </button>
                                                <button 
                                                    onClick={() => setIsAddingCard(null)}
                                                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => { setIsAddingCard(col.id); setNewCardTitle(''); }}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 text-sm transition-colors text-left"
                                        >
                                            <Plus size={16} /> Add a card
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Add Column Placeholder */}
                    <div className="flex-shrink-0 w-72 h-12 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 border-dashed flex items-center justify-center text-sm font-bold text-gray-500 cursor-pointer transition-colors">
                        <Plus size={16} className="mr-2" /> Add another list
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KanbanPane;
