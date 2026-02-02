
import React, { useState, useRef, useEffect } from 'react';
import { Comment, TeamMember, Task } from '../../types';
import { Send, Sparkles, Plus, X, Loader2 } from 'lucide-react';
import aiService from '../../services/geminiService';

interface CommentThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  lineNumber: number;
  thread: Comment[];
  onAddComment: (text: string) => void;
  onSynthesizeTask: (task: Omit<Task, 'id' | 'status'>) => void;
  currentUser: TeamMember;
}

const CommentThreadModal: React.FC<CommentThreadModalProps> = ({
  isOpen,
  onClose,
  filePath,
  lineNumber,
  thread,
  onAddComment,
  onSynthesizeTask,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setSummary(null); // Reset summary when modal opens
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);


  if (!isOpen) return null;

  const handleAdd = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSummarize = async () => {
      setIsAiLoading(true);
      setSummary("Jules is thinking...");
      try {
        const result = await aiService.summarizeCommentThread(thread);
        setSummary(result);
      } catch (e) {
          setSummary("Failed to generate summary.");
      } finally {
          setIsAiLoading(false);
      }
  };

  const handleCreateTask = async () => {
      setIsAiLoading(true);
      try {
          const taskData = await aiService.synthesizeTaskFromText(thread.map(c => c.text).join('\n'));
          if(taskData) {
              onSynthesizeTask(taskData);
              onClose();
          }
      } catch (e) {
          console.error("Task synthesis failed", e);
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-[#1e2227] w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Discussion Thread</h3>
            <p className="text-xs text-gray-400 font-mono truncate">{filePath}:{lineNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {comment.initials}
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-gray-300">{comment.author}</span>
                  <span className="text-[10px] text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-200">{comment.text}</p>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
        
        {summary && (
            <div className="p-4 border-t border-b border-gray-700 bg-black/20">
                <h4 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> AI Summary
                </h4>
                <p className="text-xs text-gray-300 italic">{summary}</p>
            </div>
        )}

        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={handleSummarize} disabled={isAiLoading || thread.length < 2} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 py-2 rounded-md disabled:opacity-50 transition-colors">
              <Sparkles size={14} /> Summarize
            </button>
            <button onClick={handleCreateTask} disabled={isAiLoading || thread.length === 0} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 py-2 rounded-md disabled:opacity-50 transition-colors">
              <Plus size={14} /> Create Task
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add to the discussion..."
              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={handleAdd} className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50" disabled={!newComment.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentThreadModal;
