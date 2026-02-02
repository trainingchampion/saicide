import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Calendar, 
    UserCircle,
    CheckSquare,
    Search,
    RefreshCw,
    MessageSquare,
    X,
    Trello,
    Trash2,
    Filter,
    ArrowLeft,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { FileNode, Task, TaskStatus, TeamMember } from '../types';

interface KanbanPaneProps {
  onCollapse: () => void;
  fileStructure: FileNode;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projectName?: string;
  teamMembers?: TeamMember[];
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Code Review', color: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
];

const TAG_COLORS: Record<string, string> = {
    'Bug': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Feature': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Refactor': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Design': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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

const KanbanPane: React.FC<KanbanPaneProps> = ({ onCollapse, fileStructure, tasks, setTasks, projectName = 'Project', teamMembers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
    const [isAddingCard, setIsAddingCard] = useState<TaskStatus | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDescription, setNewCardDescription] = useState('');
    const [newCardTag, setNewCardTag] = useState<Task['tag']>('Feature');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState<Task | null>(null);

    // Persist tasks to localStorage
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('sai_kanban_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Load tasks from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem('sai_kanban_tasks');
        if (savedTasks && tasks.length === 0) {
            try {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setTasks(parsed);
                }
            } catch (e) {
                console.error('Failed to parse saved tasks');
            }
        }
    }, []);

    const scanForTodos = () => {
        const allContent = flattenFileTree(fileStructure);
        const newTasks: Task[] = [];
        
        allContent.forEach(text => {
            const lines = text.split('\n');
            lines.forEach(line => {
                const todoMatch = line.match(/(?:\/\/|#|\/\*)\s*TODO:?\s*(.+?)(?:\*\/)?$/i);
                const fixmeMatch = line.match(/(?:\/\/|#|\/\*)\s*FIXME:?\s*(.+?)(?:\*\/)?$/i);
                
                if (todoMatch) {
                    const todoText = todoMatch[1].trim();
                    if (!tasks.some(t => t.title === todoText)) {
                        newTasks.push({
                            id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                            title: todoText,
                            tag: 'Feature',
                            status: 'todo'
                        });
                    }
                }
                if (fixmeMatch) {
                    const fixmeText = fixmeMatch[1].trim();
                    if (!tasks.some(t => t.title === fixmeText)) {
                        newTasks.push({
                            id: 'fixme-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                            title: fixmeText,
                            tag: 'Bug',
                            status: 'todo'
                        });
                    }
                }
            });
        });

        if (newTasks.length > 0) {
            setTasks(prev => [...prev, ...newTasks]);
            alert('Found ' + newTasks.length + ' new task(s) from code comments!');
        } else {
            alert('No new TODOs or FIXMEs found in code.');
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        }
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    const handleAddCard = (status: TaskStatus) => {
        if (!newCardTitle.trim()) {
            setIsAddingCard(null);
            return;
        }
        const newTask: Task = {
            id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: newCardTitle,
            description: newCardDescription || undefined,
            status,
            tag: newCardTag
        };
        setTasks(prev => [...prev, newTask]);
        setNewCardTitle('');
        setNewCardDescription('');
        setNewCardTag('Feature');
        setIsAddingCard(null);
    };

    const handleDeleteTask = (id: string) => {
        if (confirm('Delete this task?')) {
            setTasks(prev => prev.filter(t => t.id !== id));
            setShowTaskModal(null);
        }
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setShowTaskModal(null);
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (t.description?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesTag = !filterTag || t.tag === filterTag;
            const matchesAssignee = !filterAssignee || t.assignee === filterAssignee;
            return matchesSearch && matchesTag && matchesAssignee;
        });
    }, [tasks, searchTerm, filterTag, filterAssignee]);

    const stats = useMemo(() => ({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
    }), [tasks]);

    return (
        <div className="h-full flex flex-col bg-[#0b0e14] text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#161b22] flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onCollapse}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg">
                            <Trello size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Project Board</h2>
                            <p className="text-xs text-gray-500 font-medium">{projectName}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Circle size={12} className="text-gray-500" />
                        <span>{stats.todo} To Do</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Circle size={12} className="text-blue-500 fill-blue-500" />
                        <span>{stats.inProgress} In Progress</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Circle size={12} className="text-yellow-500 fill-yellow-500" />
                        <span>{stats.review} Review</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span>{stats.done} Done</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-56 bg-[#0d1117] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={'p-2 rounded-lg transition-colors border ' + (filterTag || filterAssignee ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10')}
                            title="Filter"
                        >
                            <Filter size={18} />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1c2128] border border-white/10 rounded-xl shadow-2xl z-50 p-4">
                                <h4 className="text-xs font-bold text-gray-400 mb-3">FILTER BY</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Tag</label>
                                        <select 
                                            value={filterTag || ''}
                                            onChange={e => setFilterTag(e.target.value || null)}
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                        >
                                            <option value="">All Tags</option>
                                            <option value="Bug">Bug</option>
                                            <option value="Feature">Feature</option>
                                            <option value="Refactor">Refactor</option>
                                            <option value="Design">Design</option>
                                        </select>
                                    </div>
                                    {teamMembers.length > 0 && (
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
                                            <select 
                                                value={filterAssignee || ''}
                                                onChange={e => setFilterAssignee(e.target.value || null)}
                                                className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                            >
                                                <option value="">All Members</option>
                                                {teamMembers.map(m => (
                                                    <option key={m.id} value={m.initials}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {(filterTag || filterAssignee) && (
                                        <button 
                                            onClick={() => { setFilterTag(null); setFilterAssignee(null); }}
                                            className="w-full py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={scanForTodos}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                        title="Scan Code for TODOs"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Scan Code</span>
                    </button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex gap-5 h-full items-start min-w-max">
                    {COLUMNS.map(col => {
                        const columnTasks = filteredTasks.filter(t => t.status === col.id);
                        const isOver = dragOverColumn === col.id;
                        
                        return (
                            <div 
                                key={col.id}
                                className={'flex-shrink-0 w-80 bg-[#161b22] rounded-2xl border transition-all flex flex-col max-h-full ' + (isOver ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/5')}
                                onDragOver={(e) => handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Column Header */}
                                <div className="p-4 flex justify-between items-center border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={'w-3 h-3 rounded-full ' + col.color} />
                                        <h3 className="text-sm font-bold text-gray-200">{col.title}</h3>
                                        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => { setIsAddingCard(col.id); setNewCardTitle(''); }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Cards List */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                    {columnTasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onClick={() => setShowTaskModal(task)}
                                            className={'bg-[#21262d] p-4 rounded-xl border border-white/5 hover:border-gray-500 cursor-pointer shadow-sm group relative transition-all ' + (draggedTaskId === task.id ? 'opacity-50 rotate-2 scale-105' : 'opacity-100 hover:shadow-md')}
                                        >
                                            {/* Tag */}
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={'text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border ' + (TAG_COLORS[task.tag] || 'bg-gray-700 text-gray-300 border-gray-600')}>
                                                    {task.tag}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <p className="text-sm text-gray-200 font-medium leading-snug mb-2">
                                                {task.title}
                                            </p>

                                            {/* Description Preview */}
                                            {task.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                                    {task.description}
                                                </p>
                                            )}

                                            {/* Metadata Row */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    {task.dueDate && (
                                                        <div className={'flex items-center gap-1 text-[10px] px-2 py-1 rounded-md ' + (task.status === 'done' ? 'bg-green-500/10 text-green-400' : new Date(task.dueDate) < new Date() ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400')}>
                                                            <Calendar size={10} />
                                                            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {task.commentsCount && task.commentsCount > 0 && (
                                                        <div className="flex items-center gap-1 text-[10px]">
                                                            <MessageSquare size={10} /> {task.commentsCount}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Assignee */}
                                                {task.assignee ? (
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={'Assigned to ' + task.assignee}>
                                                        {task.assignee}
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-[#30363d] flex items-center justify-center text-gray-500 border border-dashed border-gray-600 hover:bg-white/10 transition-colors">
                                                        <UserCircle size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Inline Add Card */}
                                    {isAddingCard === col.id && (
                                        <div className="bg-[#21262d] p-4 rounded-xl border-2 border-blue-500 shadow-lg shadow-blue-500/10 animate-fade-in">
                                            <input 
                                                autoFocus
                                                type="text"
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
                                                placeholder="Task title..."
                                                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none font-medium mb-2"
                                            />
                                            <textarea 
                                                value={newCardDescription}
                                                onChange={(e) => setNewCardDescription(e.target.value)}
                                                placeholder="Description (optional)"
                                                className="w-full bg-transparent text-xs text-gray-400 placeholder-gray-600 resize-none outline-none min-h-[40px] mb-3"
                                            />
                                            <div className="flex items-center gap-2 mb-3">
                                                <select 
                                                    value={newCardTag}
                                                    onChange={(e) => setNewCardTag(e.target.value as Task['tag'])}
                                                    className="bg-[#0d1117] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white"
                                                >
                                                    <option value="Feature">Feature</option>
                                                    <option value="Bug">Bug</option>
                                                    <option value="Refactor">Refactor</option>
                                                    <option value="Design">Design</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleAddCard(col.id)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Add Task
                                                </button>
                                                <button 
                                                    onClick={() => setIsAddingCard(null)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {columnTasks.length === 0 && isAddingCard !== col.id && (
                                        <div className="text-center py-8 text-gray-600">
                                            <CheckSquare size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">No tasks yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add Card Button at Bottom */}
                                {isAddingCard !== col.id && (
                                    <div className="p-3 border-t border-white/5">
                                        <button 
                                            onClick={() => { setIsAddingCard(col.id); setNewCardTitle(''); }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-300 text-sm transition-colors font-medium"
                                        >
                                            <Plus size={16} /> Add Task
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* Add Column Placeholder */}
                    <div className="flex-shrink-0 w-80 h-16 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 border-dashed flex items-center justify-center text-sm font-bold text-gray-500 cursor-pointer transition-colors hover:border-gray-500">
                        <Plus size={16} className="mr-2" /> Add Column
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowTaskModal(null)}>
                    <div className="bg-[#1c2128] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <span className={'text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ' + TAG_COLORS[showTaskModal.tag]}>
                                    {showTaskModal.tag}
                                </span>
                                <button onClick={() => setShowTaskModal(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <input 
                                type="text"
                                value={showTaskModal.title}
                                onChange={(e) => setShowTaskModal({ ...showTaskModal, title: e.target.value })}
                                className="w-full text-xl font-bold text-white bg-transparent outline-none mb-4"
                            />

                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                <textarea 
                                    value={showTaskModal.description || ''}
                                    onChange={(e) => setShowTaskModal({ ...showTaskModal, description: e.target.value })}
                                    placeholder="Add a description..."
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none min-h-[100px] outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                                    <select 
                                        value={showTaskModal.status}
                                        onChange={(e) => setShowTaskModal({ ...showTaskModal, status: e.target.value as TaskStatus })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                    >
                                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Tag</label>
                                    <select 
                                        value={showTaskModal.tag}
                                        onChange={(e) => setShowTaskModal({ ...showTaskModal, tag: e.target.value as Task['tag'] })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                    >
                                        <option value="Feature">Feature</option>
                                        <option value="Bug">Bug</option>
                                        <option value="Refactor">Refactor</option>
                                        <option value="Design">Design</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                                    <input 
                                        type="date"
                                        value={showTaskModal.dueDate || ''}
                                        onChange={(e) => setShowTaskModal({ ...showTaskModal, dueDate: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
                                    <select 
                                        value={showTaskModal.assignee || ''}
                                        onChange={(e) => setShowTaskModal({ ...showTaskModal, assignee: e.target.value || undefined })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {teamMembers.map(m => (
                                            <option key={m.id} value={m.initials}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <button 
                                    onClick={() => handleDeleteTask(showTaskModal.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                                <button 
                                    onClick={() => handleUpdateTask(showTaskModal)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanPane;
