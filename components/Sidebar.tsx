
import React from 'react';
import { Panel } from '../types';
import {
  Files,
  Search,
  GitBranch,
  Bug,
  FlaskConical,
  Workflow,
  Database,
  Box,
  Container,
  GitPullRequest,
  FileEdit,
  CircleDot,
  Network,
  Plug,
  Settings,
  HelpCircle,
  Lock,
  Cpu,
  ShoppingBag,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Component,
  Brain,
  Rocket
} from "lucide-react";

interface SidebarProps {
  activePanel: Panel | null;
  onPanelChange: (panel: Panel) => void;
  userPlan?: string;
  onRestrictedClick: (featureName: string) => void;
  pendingChangesCount?: number;
}

const ExtensionsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="20" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="4" />
    <rect x="8" y="40" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="4" />
    <rect x="28" y="40" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="4" />
    <rect x="38" y="12" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="4" />
  </svg>
);

const KanbanBoardIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 5v14"/>
        <path d="M12 5v8"/>
        <path d="M18 5v11"/>
    </svg>
);

const SIDEBAR_GROUPS = [
    {
        label: "Core",
        items: [
            { id: Panel.FILES, icon: <Files size={20} />, label: "Explorer", minPlan: 'Hobby' },
            { id: Panel.SEARCH, icon: <Search size={20} />, label: "Search", minPlan: 'Hobby' },
            { id: Panel.SOURCE_CONTROL, icon: <GitBranch size={20} />, label: "Source Control", minPlan: 'Hobby' },
        ]
    },
    {
        label: "Engineering",
        items: [
            { id: Panel.DEBUG, icon: <Bug size={20} />, label: "Run & Debug", minPlan: 'Pro' },
            { id: Panel.TESTING, icon: <FlaskConical size={20} />, label: "Testing & QA", minPlan: 'Pro' },
            { id: Panel.API_STUDIO, icon: <Workflow size={20} />, label: "API Studio", minPlan: 'Pro' },
            { id: Panel.DATABASE, icon: <Database size={20} />, label: "Databases", minPlan: 'Pro' },
        ]
    },
    {
        label: "Cloud & Ops",
        items: [
            { id: Panel.TERRAFORM, icon: <Box size={20} />, label: "Terraform IaC", minPlan: 'Pro' },
            { id: Panel.DOCKER, icon: <Container size={20} />, label: "Container Studio", minPlan: 'Pro' },
            { id: Panel.SECURITY, icon: <ShieldCheck size={20} />, label: "Security & Governance", minPlan: 'Pro' },
            { id: Panel.DEPLOYMENT, icon: <Rocket size={20} />, label: "Deployment Center", minPlan: 'Pro' },
        ]
    },
    {
        label: "Studio & Collab",
        items: [
            { id: Panel.EXTENSIONS, icon: <ExtensionsIcon size={20} />, label: "Extensions", minPlan: 'Hobby' },
            { id: Panel.TEAM, icon: <GitPullRequest size={20} />, label: "Team", minPlan: 'Pro' },
            { id: Panel.KANBAN, icon: <KanbanBoardIcon size={20} />, label: "Tasks", minPlan: 'Pro' },
            { id: Panel.DOCUMENT, icon: <FileEdit size={20} />, label: "Document Studio", minPlan: 'Pro' },
            { id: Panel.RECORDER, icon: <CircleDot size={20} />, label: "Screen Recorder", minPlan: 'Pro' },
            { id: Panel.WHITEBOARD, icon: <Network size={20} />, label: "Whiteboard", minPlan: 'Pro' },
            { id: Panel.INTEGRATIONS, icon: <Plug size={20} />, label: "Integrations", minPlan: 'Pro' },
        ]
    },
    {
        label: "Intelligence",
        items: [
            { id: Panel.AI_MARKETPLACE, icon: <ShoppingBag size={20} />, label: "Model Marketplace", minPlan: 'Hobby' },
            { id: Panel.PERSONAS, icon: <BrainCircuit size={20} />, label: "AI Personas", minPlan: 'Pro' },
            { id: Panel.ML_STUDIO, icon: <Brain size={20} />, label: "ML Studio", minPlan: 'Pro' },
            { id: Panel.STITCH_STUDIO, icon: <Component size={20} />, label: "UX Studio", minPlan: 'Hobby' },
        ]
    }
];

const Sidebar: React.FC<SidebarProps> = ({ activePanel, onPanelChange, userPlan = 'Hobby', onRestrictedClick, pendingChangesCount = 0 }) => {
  const isHobby = userPlan === 'Hobby';

  const handleItemClick = (item: any) => {
      if (isHobby && item.minPlan !== 'Hobby') {
          onRestrictedClick(item.label);
      } else {
          onPanelChange(item.id);
      }
  };

  return (
    <nav className="h-full w-14 bg-[var(--color-background-nav)] border-r border-[var(--color-border)] flex flex-col py-2 flex-shrink-0 relative select-none z-50">
      <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center space-y-4">
        {SIDEBAR_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="w-full flex flex-col items-center gap-1 pb-2">
                {groupIdx !== 0 && <div className="w-6 h-px bg-white/5 mb-2" />}
                
                {group.items.map((item) => {
                    const isActive = activePanel === item.id;
                    const isLocked = isHobby && item.minPlan !== 'Hobby';

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            title={isLocked ? `${item.label} (Pro Only)` : item.label}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all flex-shrink-0 group
                                ${
                                isActive
                                    ? "bg-[#0891b233] text-[#0891b2] shadow-[0_0_10px_rgba(8,145,178,0.2)]"
                                    : isLocked 
                                        ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                        : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {item.icon}
                            
                            {isActive && (
                                <span className="absolute left-0 w-[2px] h-4 bg-[#0891b2] rounded-r-full" />
                            )}
                            
                            {isLocked && (
                                <div className="absolute -top-1 -right-1 bg-[#101820] p-0.5 rounded-full border border-white/5 text-gray-500 group-hover:text-yellow-500 transition-colors scale-75">
                                    <Lock size={10} />
                                </div>
                            )}

                            {/* Pending changes badge for Source Control */}
                            {item.id === Panel.SOURCE_CONTROL && pendingChangesCount > 0 && !isLocked && (
                                <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-blue-400 shadow-lg">
                                    {pendingChangesCount > 99 ? '99+' : pendingChangesCount}
                                </div>
                            )}

                            <div className="absolute left-full ml-2 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity border border-white/10 translate-x-2 group-hover:translate-x-0">
                                {item.label} {isLocked && '(Pro)'} {item.id === Panel.SOURCE_CONTROL && pendingChangesCount > 0 && `(${pendingChangesCount})`}
                            </div>
                        </button>
                    )
                })}
            </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center flex-shrink-0 pt-2 border-t border-[var(--color-border)]/20 w-full gap-1">
         <button
            onClick={() => onPanelChange(Panel.HELP)}
            title="Help & Docs"
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all group
              ${
                activePanel === Panel.HELP
                  ? "bg-[#0891b233] text-[#0891b2]"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
          >
            <HelpCircle size={20} />
            {activePanel === Panel.HELP && <span className="absolute left-0 w-[2px] h-4 bg-[#0891b2] rounded-r-full" />}
          </button>

         <button
            onClick={() => onPanelChange(Panel.SETTINGS)}
            title="Settings"
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all group
              ${
                activePanel === Panel.SETTINGS
                  ? "bg-[#0891b233] text-[#0891b2]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
          >
            <Settings size={20} />
            {activePanel === Panel.SETTINGS && <span className="absolute left-0 w[2px] h-4 bg-[#0891b2] rounded-r-full" />}
          </button>
      </div>

      <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
};

export default Sidebar;
