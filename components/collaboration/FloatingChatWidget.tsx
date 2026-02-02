
import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types';
import { TeamChannel } from './TeamChannel';
import { MessageSquare, Minimize, ChevronsLeftRight, X, GripHorizontal } from 'lucide-react';

interface FloatingChatWidgetProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  onDock: () => void;
}

const useDraggable = (initialPos: { x: number, y: number }) => {
    const [pos, setPos] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
  
    const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, select')) return;
      setIsDragging(true);
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const newX = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - 50));
            const newY = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - 50));
            setPos({ x: newX, y: newY });
        }
      };
      const handleMouseUp = () => setIsDragging(false);
  
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);
  
    return { pos, handleMouseDown };
};


export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ currentUser, teamMembers, onDock }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const { pos, handleMouseDown } = useDraggable({ x: window.innerWidth - 420, y: 100 });
    const [size, setSize] = useState({ width: 400, height: 600 });

    if (isMinimized) {
        return (
            <button 
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl text-white hover:bg-blue-500 transition-all z-[210] animate-fade-in"
                title="Open Team Channel"
            >
                <MessageSquare size={28} />
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-blue-600"></div>
            </button>
        );
    }

    return (
        <div 
            className="fixed bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col z-[210] animate-fade-in"
            style={{ left: pos.x, top: pos.y, width: size.width, height: size.height }}
        >
            <div onMouseDown={handleMouseDown} className="p-2 border-b border-[var(--color-border)] flex items-center justify-between cursor-move bg-[var(--color-background-tertiary)] rounded-t-2xl">
                <GripHorizontal size={16} className="text-slate-500" />
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Team Channel</h3>
                <div className="flex items-center">
                    <button onClick={onDock} title="Dock to Sidebar"><ChevronsLeftRight size={16} className="text-slate-500 hover:text-slate-800" /></button>
                    <button onClick={() => setIsMinimized(true)} title="Minimize"><Minimize size={16} className="text-slate-500 hover:text-slate-800" /></button>
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <TeamChannel currentUser={currentUser} teamMembers={teamMembers} isFloating={true} onToggleFloat={onDock} />
            </div>
        </div>
    );
};
