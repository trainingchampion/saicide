import React, { useMemo } from 'react';
import { ICONS } from '../constants';
import { User } from 'lucide-react';
import { Commit } from '../types';

interface GitGraphPaneProps {
  onCollapse?: () => void;
  commits: Commit[];
  minimal?: boolean;
}

const ROW_HEIGHT = 50;
const COL_WIDTH = 20;
const CIRCLE_RADIUS = 5;

const GitGraphPane: React.FC<GitGraphPaneProps> = ({ onCollapse, commits, minimal = false }) => {
    
    // Calculate SVG paths and column positions dynamically
    const { paths, branchColumns } = useMemo(() => {
        const svgPaths: React.ReactNode[] = [];
        
        // Identify all unique branches to assign columns
        const uniqueBranches: string[] = Array.from(new Set(commits.map(c => c.branch)));
        // Always keep 'main' or 'master' on the left (index 0) if possible
        const sortedBranches = uniqueBranches.sort((a: string, b: string) => {
            if (a === 'main' || a === 'master') return -1;
            if (b === 'main' || b === 'master') return 1;
            return a.localeCompare(b);
        });

        const branchCols: Record<string, number> = sortedBranches.reduce((acc: Record<string, number>, branch: string, index: number) => {
            acc[branch] = index;
            return acc;
        }, {} as Record<string, number>);
        
        commits.forEach((commit, index) => {
            const x = (branchCols[commit.branch] || 0) * COL_WIDTH + 15;
            const y = index * ROW_HEIGHT + 25;

            // Draw lines to parents
            commit.parentIds.forEach(pid => {
                const parentIndex = commits.findIndex(c => c.id === pid);
                if (parentIndex === -1) return;

                const parent = commits[parentIndex];
                const px = (branchCols[parent.branch] || 0) * COL_WIDTH + 15;
                const py = parentIndex * ROW_HEIGHT + 25;

                // Bezier curve for smooth connections
                const controlY = y + (py - y) / 2;
                
                let pathD = '';
                // Simple vertical line if same column
                if (x === px) {
                    pathD = `M ${x} ${y} L ${px} ${py}`;
                } else {
                    // Curved line for merges/branches
                    pathD = `M ${x} ${y} C ${x} ${controlY}, ${px} ${controlY}, ${px} ${py}`;
                }

                svgPaths.push(
                    <path 
                        key={`${commit.id}-${pid}`} 
                        d={pathD} 
                        stroke={commit.color} 
                        strokeWidth="2" 
                        fill="none" 
                        opacity="0.6"
                    />
                );
            });
        });
        return { paths: svgPaths, branchColumns: branchCols };
    }, [commits]);

    return (
        <div className={`h-full flex flex-col text-[var(--color-text-primary)] ${minimal ? '' : 'p-2 bg-[var(--color-background-secondary)]'}`}>
            {!minimal && (
                <div className="flex justify-between items-center p-2 flex-shrink-0">
                    <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Git Graph</h2>
                    {onCollapse && (
                        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                            {ICONS.COLLAPSE_LEFT}
                        </button>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-auto relative p-2">
                <div className="flex relative min-h-full">
                    {/* SVG Layer for Graph */}
                    <div className="sticky left-0 top-0 z-10" style={{ width: '80px', flexShrink: 0 }}>
                        <svg width="100%" height={Math.max(commits.length * ROW_HEIGHT + 50, 300)} className="absolute top-0 left-0">
                            {paths}
                            {commits.map((commit, index) => (
                                <circle 
                                    key={commit.id}
                                    cx={(branchColumns[commit.branch] || 0) * COL_WIDTH + 15}
                                    cy={index * ROW_HEIGHT + 25}
                                    r={CIRCLE_RADIUS}
                                    fill={commit.color}
                                    stroke="#1e2227"
                                    strokeWidth="2"
                                />
                            ))}
                        </svg>
                    </div>

                    {/* Commit List */}
                    <div className="flex-1 min-w-0 pt-2">
                        {commits.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm mt-10">No commits found.</div>
                        ) : (
                            commits.map((commit, index) => (
                                <div 
                                    key={commit.id} 
                                    style={{ height: ROW_HEIGHT }} 
                                    className="flex flex-col justify-center border-b border-[var(--color-border)]/30 px-2 hover:bg-[var(--color-background-tertiary)]/50 rounded ml-2 group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[10px] text-gray-500 bg-black/20 px-1 rounded">{commit.id.substring(0, 7)}</span>
                                        <span className="text-sm font-medium text-gray-200 truncate" title={commit.message}>{commit.message}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <User size={10} /> {commit.author}
                                        </span>
                                        <span>{commit.date}</span>
                                        {commit.branch !== 'main' && (
                                            <span 
                                                className="px-1.5 rounded-full text-[9px] font-bold border"
                                                style={{ borderColor: commit.color, color: commit.color }}
                                            >
                                                {commit.branch}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitGraphPane;
