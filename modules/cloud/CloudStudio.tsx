
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { 
  Panel, FileNode, TeamMember, ChatMessage, ChatSession, 
  SecurityPolicy, SecurityIssue, Extension, AIPersona, 
  RemoteUserState, AppEvent, AppPlan, ProjectStatus, MenuCategory, Severity, Commit, ChangeItem, MCPServer, Command, IdentityTab, DiffData, AgentStep, Recording,
  EditorTabGroup, EditorTab, ViewMode, Project, DesignName,
  Comment, Task, AgendaItem, GitStatus, PromptTemplate
} from '../../types';
import { 
  MOCK_TEAM_MEMBERS, 
  INITIAL_POLICIES, MOCK_VSCODE_EXTENSIONS, 
  MOCK_PERSONAS, AI_MODELS_DATA,
  MOCK_FILE_STRUCTURE,
  INITIAL_COMMITS,
  MOCK_SECURITY_ISSUES,
  INITIAL_DISCUSSIONS,
  INITIAL_TASKS,
  INITIAL_AGENDA_ITEMS
} from '../../constants';
import { THEMES } from '../../themes';
import authService from '../../services/authService';
import aiService from '../../services/geminiService';
import { useMCP } from '../../hooks/useMCP';
import { 
  FilePlus, 
  Rocket, 
  Box, 
  MessageSquare, 
  Terminal as TerminalIcon, 
  X, 
  Sparkles, 
  Loader2,
  Plus,
  Undo2,
  Redo2,
  Search,
  Hammer,
  Play,
  Bot,
  Save,
  FolderOpen,
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  Layout,
  LayoutGrid,
  Zap,
  MousePointer2,
  Eye,
  Command as CommandIcon,
  ChevronRight,
  Terminal,
  Layers,
  Github,
  Link as LinkIcon,
  FileText,
  Globe,
  ListChecks,
  Check,
  Palette,
  Activity,
  LayoutTemplate,
  ChevronsLeft,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  PanelLeft,
  Maximize2,
  SplitSquareHorizontal,
  Folder,
  Bug,
  Settings,
  Database,
  Shield,
  TestTube2,
  Trello,
  PenTool,
  FolderPlus,
  GitCommit,
  Upload,
  Download,
  AlignLeft,
  Cloud,
  Users,
  Share2,
  Keyboard,
  BookOpen,
  Info,
  Star
} from 'lucide-react';

// Core Components (always loaded)
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import FileExplorer from '../../components/FileExplorer';
import EditorPane, { EditorPaneRef } from '../../components/EditorPane';
import { ChatPanel } from '../../components/ChatPanel';
import LandingPage from '../../components/LandingPage';

// Lazy-loaded Components for code splitting
const SearchPane = React.lazy(() => import('../../components/SearchPane'));
const SourceControlPane = React.lazy(() => import('../../components/SourceControlPane'));
const SecurityPane = React.lazy(() => import('../../components/SecurityPane'));
const TerraformGenerator = React.lazy(() => import('../../components/TerraformGenerator'));
const DockerPane = React.lazy(() => import('../../components/DockerPane'));
const SettingsPane = React.lazy(() => import('../../components/SettingsPane'));
const HelpPane = React.lazy(() => import('../../components/HelpPane'));
const PreviewPane = React.lazy(() => import('../../components/PreviewPane'));
const ModelMarketplace = React.lazy(() => import('../../components/ModelMarketplace'));
const PersonasPane = React.lazy(() => import('../../components/PersonasPane'));
const ExtensionsPane = React.lazy(() => import('../../components/ExtensionsPane'));
const StitchStudioPane = React.lazy(() => import('../../components/UxLabPane'));
const DebugPane = React.lazy(() => import('../../components/DebugPane'));
const TestingPane = React.lazy(() => import('../../components/TestingPane'));
const DatabasePane = React.lazy(() => import('../../components/DatabasePane'));
const KanbanPane = React.lazy(() => import('../../components/KanbanPane'));
const ApiStudioPane = React.lazy(() => import('../../components/ApiForgePane'));
const RecorderPane = React.lazy(() => import('../../components/RecorderPane'));
// WhiteboardPane is statically imported by EditorPane, so import it normally here too
import WhiteboardPane from '../../components/WhiteboardPane';
const DocumentEditorPane = React.lazy(() => import('../../components/DocumentEditorPane'));
const CollaborationSidebarPane = React.lazy(() => import('../../components/collaboration/CollaborationSidebarPane'));
const TeamCollaborationPane = React.lazy(() => import('../../components/TeamCollaborationPane').then(m => ({ default: m.TeamCollaborationPane })));
const GhostAgent = React.lazy(() => import('../../components/GhostAgent'));
const DeploymentCenter = React.lazy(() => import('../../components/DeploymentCenter'));
const TeamHub = React.lazy(() => import('../../components/TeamHub'));
const FloatingChatWidget = React.lazy(() => import('../../components/collaboration/FloatingChatWidget').then(m => ({ default: m.FloatingChatWidget })));
const VideoGrid = React.lazy(() => import('../../components/collaboration/VideoGrid'));
const LiveSessionChat = React.lazy(() => import('../../components/collaboration/LiveSessionChat'));
const IntegrationsPane = React.lazy(() => import('../../components/IntegrationsPane'));
const PromptLibrary = React.lazy(() => import('../../components/TemplateLibrary'));
const MicaAssistant = React.lazy(() => import('../../components/MicaAssistant'));
const MlStudioPane = React.lazy(() => import('../../components/MlStudioPane'));

// Lazy-loaded Modals
const CommandPaletteModal = React.lazy(() => import('../../components/modals/CommandPaletteModal'));
const OnboardingModal = React.lazy(() => import('../../components/modals/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const InviteMemberModal = React.lazy(() => import('../../components/modals/InviteMemberModal'));
const SaveToGithubModal = React.lazy(() => import('../../components/modals/SaveToGithubModal'));
const AiSuggestionModal = React.lazy(() => import('../../components/modals/AiSuggestionModal'));
const FileTypeModal = React.lazy(() => import('../../components/modals/FileTypeModal'));
const AuthModal = React.lazy(() => import('../../components/modals/AuthModal'));
const SwitchProjectModal = React.lazy(() => import('../../components/modals/SwitchProjectModal'));
const IdentityDashboardModal = React.lazy(() => import('../../components/modals/IdentityDashboardModal'));
const CreateProjectModal = React.lazy(() => import('../../components/modals/CreateProjectModal'));
const UpgradeModal = React.lazy(() => import('../../components/modals/UpgradeModal'));
const AboutModal = React.lazy(() => import('../../components/modals/AboutModal'));
const VoiceCommandModal = React.lazy(() => import('../../components/modals/VoiceCommandModal'));
const ScreenRecorderModal = React.lazy(() => import('../../components/modals/ScreenRecorderModal'));
const CloneRepoModal = React.lazy(() => import('../../components/modals/CloneRepoModal'));
const NetlifyDeployModal = React.lazy(() => import('../../components/modals/NetlifyDeployModal'));
const ConnectCloudModal = React.lazy(() => import('../../components/modals/ConnectCloudModal'));
const CommentThreadModal = React.lazy(() => import('../../components/modals/CommentThreadModal'));
const BuildPreviewModal = React.lazy(() => import('../../components/modals/BuildPreviewModal'));
const CreatePersonaModal = React.lazy(() => import('../../components/modals/CreatePersonaModal'));
const PaymentModal = React.lazy(() => import('../../components/modals/PaymentModal'));

// Loading fallback component
const PaneLoader = () => (
  <div className="flex items-center justify-center h-full w-full bg-[var(--color-background)]">
    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
  </div>
);


const FS_STORAGE_KEY = 'sai_workspace_fs';
const COMMIT_STORAGE_KEY = 'sai_last_commit_fs';
const RECORDINGS_STORAGE_KEY = 'sai_recordings';
const PROJECTS_STORAGE_KEY = 'sai_projects';

const INITIAL_PROJECTS: Project[] = [
    { id: '1', title: 'alphabet-explorer', description: 'Interactive letter-recognition game for early learners.', teamMemberIds: ['1', '2', '3', '4'], status: ProjectStatus.ACTIVE, changeCount: 0, lastUpdate: 'Just now', comments: [] },
    { id: '2', title: 'neural-ux-lab', description: 'Experimental design systems with AI', teamMemberIds: ['1', '2'], status: ProjectStatus.REVIEW, changeCount: 5, lastUpdate: '1h ago', comments: [] },
    { id: '3', title: 'hyper-commerce', description: 'Go-based scalable microservices', teamMemberIds: ['1', '3'], status: ProjectStatus.DEPLOYED, changeCount: 0, lastUpdate: '3d ago', comments: [] }
];

const WorkspaceDoodles = () => (
    <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03] overflow-hidden">
        {/* Abstract connection lines */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" viewBox="0 0 100 100">
            <path d="M10,10 L30,40 L60,20 L90,80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" className="animate-flow-dashes"/>
            <circle cx="10" cy="10" r="2" fill="currentColor" className="animate-pulse-scale" style={{animationDelay: '0s'}}/>
            <circle cx="30" cy="40" r="2" fill="currentColor" className="animate-pulse-scale" style={{animationDelay: '1s'}}/>
            <circle cx="60" cy="20" r="2" fill="currentColor" className="animate-pulse-scale" style={{animationDelay: '2s'}}/>
            <circle cx="90" cy="80" r="2" fill="currentColor" className="animate-pulse-scale" style={{animationDelay: '3s'}}/>
        </svg>
        {/* Brain outline */}
        <svg className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] text-blue-500 animate-subtle-rotate animate-breathe" style={{ transformOrigin: 'center' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
        </svg>
        {/* Floating Code Bracket */}
        <div className="absolute top-[40%] left-[40%] doodle-text text-8xl opacity-10 animate-doodle-float">{'{}'}</div>
    </div>
);

interface CloudStudioProps {
  design: DesignName;
  setDesign: (design: DesignName) => void;
}

const CloudStudio: React.FC<CloudStudioProps> = ({ design, setDesign }) => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HUB);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [activePanel, setActivePanel] = useState<Panel | null>(null);
  const [isDeploymentCenterOpen, setIsDeploymentCenterOpen] = useState(false);
  const [isTeamChannelPoppedOut, setIsTeamChannelPoppedOut] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(() => {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [fileStructure, setFileStructure] = useState<FileNode>(() => {
    const saved = localStorage.getItem(FS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved FS", e);
      }
    }
    return MOCK_FILE_STRUCTURE;
  });

  const [lastCommittedStructure, setLastCommittedStructure] = useState<FileNode>(() => {
      const saved = localStorage.getItem(COMMIT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_FILE_STRUCTURE;
  });

  // Editor Tab Groups State
  const [tabGroups, setTabGroups] = useState<EditorTabGroup[]>([
    { id: 'group-1', name: 'Main', tabs: [], activeTabIndex: -1, isCollapsed: false }
  ]);
  const [focusedGroupId, setFocusedGroupId] = useState('group-1');

  const activeFile = useMemo(() => {
    const group = tabGroups.find(g => g.id === focusedGroupId);
    if (!group || group.activeTabIndex === -1) return null;
    return group.tabs[group.activeTabIndex];
  }, [tabGroups, focusedGroupId]);

  // Updated default theme to 'Evergreen'
  const [theme, setTheme] = useState(localStorage.getItem('sai_theme') || 'Evergreen');
  const [activeModelId, setActiveModelId] = useState('gemini-3-pro-preview');
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(0); 
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVoiceCommandOpen, setIsVoiceCommandOpen] = useState(false);

  const [drawerWidth, setDrawerWidth] = useState(320);
  const [isResizingDrawer, setIsResizingDrawer] = useState(false);
  const isResizingDrawerRef = useRef(false);

  const [chatWidth, setChatWidth] = useState(450);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const isResizingChatRef = useRef(false);

  // Staging state
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  
  // Git branch state
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState<string[]>(['main', 'dev']);
  const [isSyncing, setIsSyncing] = useState(false);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth & Cloud state
  const [authenticatedProviders, setAuthenticatedProviders] = useState<string[]>([]);
  const [activeProviderForAuth, setActiveProviderForAuth] = useState<string | null>(null);
  const [isConnectCloudModalOpen, setIsConnectCloudModalOpen] = useState(false);

  const [recordings, setRecordings] = useState<Recording[]>(() => {
      const saved = localStorage.getItem(RECORDINGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
  });
  
  // Live Session Chat State
  const [isLiveSessionChatOpen, setIsLiveSessionChatOpen] = useState(false);
  const [isLiveSessionChatMinimized, setIsLiveSessionChatMinimized] = useState(false);
  const [liveSessionMessages, setLiveSessionMessages] = useState<{ user: string; text: string; time: string }[]>([]);
  const [hasUnreadLiveMessages, setHasUnreadLiveMessages] = useState(false);
  const [activityFeed, setActivityFeed] = useState<{id: string; icon: React.ReactNode; text: string; time: string; user?: string}[]>([]);
  const [discussions, setDiscussions] = useState(INITIAL_DISCUSSIONS);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(INITIAL_AGENDA_ITEMS);
  const [gitStatus, setGitStatus] = useState<GitStatus>({ modified: [], untracked: [], deleted: [] });

  useEffect(() => {
        const originalFiles = new Map<string, FileNode>();
        const currentFiles = new Map<string, FileNode>();

        const traverse = (node: FileNode, path: string, map: Map<string, FileNode>) => {
            const currentPath = path ? `${path}/${node.name}` : node.name;
            map.set(currentPath, node);
            if (node.children) {
                node.children.forEach(child => traverse(child, currentPath, map));
            }
        };

        traverse(lastCommittedStructure, '', originalFiles);
        traverse(fileStructure, '', currentFiles);

        const modified: string[] = [];
        const untracked: string[] = [];
        const deleted: string[] = [];
        
        currentFiles.forEach((node, path) => {
            const relativePath = path.substring(fileStructure.name.length + 1);
            if (!relativePath) return;

            const originalPath = path.replace(fileStructure.name, lastCommittedStructure.name);
            if (originalFiles.has(originalPath)) {
                const originalNode = originalFiles.get(originalPath)!;
                if (node.type === 'file' && originalNode.type === 'file' && node.content !== originalNode.content) {
                    modified.push(relativePath);
                }
            } else {
                if(node.type === 'file') {
                    untracked.push(relativePath);
                }
            }
        });

        originalFiles.forEach((node, path) => {
            const relativePath = path.substring(lastCommittedStructure.name.length + 1);
            if (!relativePath) return; 

            if (!currentFiles.has(path.replace(lastCommittedStructure.name, fileStructure.name))) {
                if(node.type === 'file') {
                    deleted.push(relativePath);
                }
            }
        });

        setGitStatus({ modified, untracked, deleted });
  }, [fileStructure, lastCommittedStructure]);

  const { stagedChanges, unstagedChanges } = useMemo(() => {
      const allChanges: ChangeItem[] = [
          ...gitStatus.modified.map(f => ({ file: f, status: 'M' as const })),
          ...gitStatus.untracked.map(f => ({ file: f, status: 'A' as const })),
          ...gitStatus.deleted.map(f => ({ file: f, status: 'D' as const }))
      ];

      return {
          stagedChanges: allChanges.filter(c => stagedFiles.includes(c.file)),
          unstagedChanges: allChanges.filter(c => !stagedFiles.includes(c.file))
      };
  }, [gitStatus, stagedFiles]);

  const handleAddActivity = useCallback((text: string, icon: React.ReactNode) => {
    const newActivity = {
        id: `act-${Date.now()}`,
        icon: icon, // Passed sized icon directly to avoid cloneElement issues
        text: text,
        time: 'just now',
        user: currentUser?.name || 'Anonymous'
    };
    setActivityFeed(prev => [newActivity, ...prev]);
  }, [currentUser]);

    const handleAddAgendaItem = (text: string) => {
        if(!currentUser) return;
        const newItem: AgendaItem = { id: Date.now().toString(), text, completed: false };
        setAgendaItems(prev => [...prev, newItem]);
        handleAddActivity(`${currentUser.name} added to agenda: "${text}"`, <ListChecks size={14} className="text-blue-400" />);
    };
    
    const handleToggleAgendaItem = (id: string) => {
        if(!currentUser) return;
        setAgendaItems(prev => {
            const newItems = prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
            const toggledItem = newItems.find(item => item.id === id);
            if(toggledItem?.completed){
                handleAddActivity(`${currentUser.name} completed: "${toggledItem.text}"`, <Check size={14} className="text-green-400"/>);
            }
            return newItems;
        });
    };
    
    const handleDeleteAgendaItem = (id: string) => {
        if(!currentUser) return;
        const deletedItem = agendaItems.find(item => item.id === id);
        if(deletedItem){
             handleAddActivity(`${currentUser.name} removed from agenda: "${deletedItem.text}"`, <X size={14} className="text-red-400"/>);
        }
        setAgendaItems(prev => prev.filter(item => item.id !== id));
    };

  const handleImportLink = (url: string) => {
    if (!currentUser) return;
    
    let icon = <Globe size={16} className="text-gray-400" />;
    let title = `Discussion: ${new URL(url).hostname}`;
    let subject = 'a link';

    if (url.includes('github.com')) {
        icon = <Github size={16} className="text-gray-400" />;
        const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
        const repoName = match ? match[1].replace('.git', '') : 'a repository';
        title = `Review: ${repoName}`;
        subject = `repository ${repoName}`;
    } else if (url.includes('medium.com')) {
        icon = <FileText size={16} className="text-green-400" />;
        const path = new URL(url).pathname.split('/').pop() || 'an article';
        title = `Article: ${path.replace(/-/g, ' ')}`;
        subject = 'a Medium article';
    }

    const newDiscussion = {
        user: currentUser.name,
        icon: icon,
        title: title,
        time: 'just now'
    };
    
    setDiscussions(prev => [newDiscussion, ...prev]);
    handleAddActivity(`${currentUser.name} imported ${subject} for discussion`, <LinkIcon size={14} className="text-gray-400" />);
  };

  const handleToggleLiveChat = () => {
    setIsLiveSessionChatOpen(true);
    setIsLiveSessionChatMinimized(false);
    setHasUnreadLiveMessages(false);
  };

  const handleSendLiveChatMessage = (text: string) => {
    if (!currentUser) return;
    const newMessage = {
      user: currentUser.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLiveSessionMessages(prev => [...prev, newMessage]);
    
    // Simulate a reply to show notification dot
    setTimeout(() => {
      const otherMembers = teamMembers.filter(m => m.id !== currentUser.id);
      if (otherMembers.length > 0) {
        const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        const reply = {
            user: randomMember.name,
            text: "Roger that.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLiveSessionMessages(prev => [...prev, reply]);
        if (isLiveSessionChatMinimized || !isLiveSessionChatOpen) {
            setHasUnreadLiveMessages(true);
        }
      }
    }, 2000);
  };


  useEffect(() => {
    localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleSaveRecording = useCallback((recording: Recording) => {
      setRecordings(prev => [recording, ...prev]);
  }, []);

  const handleDeleteRecording = useCallback((id: string) => {
      setRecordings(prev => prev.filter(r => r.id !== id));
  }, []);

  const [githubToken, setGithubToken] = useState<string | null>(localStorage.getItem('sai_github_token'));
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const [vimMode, setVimMode] = useState(false);
  const [keymap, setKeymap] = useState('vscode');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>();
  const [chatInitialMode, setChatInitialMode] = useState<'chat' | 'image' | 'video' | 'audio' | 'app' | undefined>();

  // Ghost Agent State
  const [ghostStatus, setGhostStatus] = useState<'idle' | 'planning' | 'executing' | 'review' | 'completed'>('idle');
  const [ghostSteps, setGhostSteps] = useState<AgentStep[]>([]);
  const [currentGhostAction, setCurrentGhostAction] = useState('');
  

  useEffect(() => {
    localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(fileStructure));
  }, [fileStructure]);

  useEffect(() => {
    localStorage.setItem(COMMIT_STORAGE_KEY, JSON.stringify(lastCommittedStructure));
  }, [lastCommittedStructure]);

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
            e.preventDefault();
            setTerminalHeight(prev => prev === 0 ? 250 : 0);
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
          e.preventDefault();
          setIsSidebarVisible(prev => !prev);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
          e.preventDefault();
          if (currentUser?.plan === 'Hobby') {
            setUpgradeFeatureName('AI Chat');
            setIsUpgradeModalOpen(true);
          } else {
            setIsChatOpen(prev => !prev);
          }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', title: 'Neural Sync Assistant', messages: [] }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');

  const handleNewChat = () => {
    const newId = Date.now().toString();
    setSessions(prev => [...prev, { id: newId, title: 'New Conversation', messages: [] }]);
    setActiveSessionId(newId);
  };

  const handleSwitchChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleDeleteChat = (sessionId: string) => {
      if (sessions.length <= 1) {
          setSessions([{ id: Date.now().toString(), title: 'Neural Sync Assistant', messages: [] }]);
          setActiveSessionId(sessions[0].id);
          return;
      }
      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);
      if (activeSessionId === sessionId) {
          setActiveSessionId(newSessions[newSessions.length - 1].id);
      }
  };

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || sessions[0], 
  [sessions, activeSessionId]);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    // Load API keys from localStorage on init
    try {
      const saved = localStorage.getItem('sai_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  // Persist API keys to localStorage and update gemini key
  useEffect(() => {
    localStorage.setItem('sai_api_keys', JSON.stringify(apiKeys));
    // If gemini/google key is saved, also save to special key for geminiService
    const geminiKey = apiKeys['google'] || apiKeys['gemini'] || apiKeys['gemini-3-pro-preview'];
    if (geminiKey) {
      localStorage.setItem('sai_gemini_api_key', geminiKey);
    }
  }, [apiKeys]);
  
  const { servers: mcpServers, connectServer, disconnectServer } = useMCP();

  const [activePersona, setActivePersona] = useState<AIPersona | null>(null);
  const [customPersonas, setCustomPersonas] = useState<AIPersona[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>(INITIAL_POLICIES);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>(MOCK_SECURITY_ISSUES);
  const [installedExtensions, setInstalledExtensions] = useState<Extension[]>(MOCK_VSCODE_EXTENSIONS);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [inviteDockLocation, setInviteDockLocation] = useState<'header' | 'sidebar'>('header');
  const [commits, setCommits] = useState<Commit[]>(INITIAL_COMMITS);
  const [stagedCommitMessage, setStagedCommitMessage] = useState('');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSaveToGithubOpen, setIsSaveToGithubOpen] = useState(false);
  const [isAiSuggestionOpen, setIsAiSuggestionOpen] = useState(false);
  const [isFileTypeModalOpen, setIsFileTypeModalOpen] = useState(false);
  const [isBuildPreviewOpen, setIsBuildPreviewOpen] = useState(false);
  const [isCreatePersonaOpen, setIsCreatePersonaOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSwitchProjectOpen, setIsSwitchProjectOpen] = useState(false);
  const [isIdentityDashboardOpen, setIsIdentityDashboardOpen] = useState(false);
  const [identityInitialTab, setIdentityInitialTab] = useState<IdentityTab>('profile');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isScreenRecorderOpen, setIsScreenRecorderOpen] = useState(false);
  const [isCloneRepoModalOpen, setIsCloneRepoModalOpen] = useState(false);
  const [isNetlifyDeployOpen, setIsNetlifyDeployOpen] = useState(false);
  const [terminalCwd, setTerminalCwd] = useState<string>('~');

  const editorRef = useRef<EditorPaneRef>(null);

  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [activeCommentThread, setActiveCommentThread] = useState<{ filePath: string, lineNumber: number } | null>(null);

  const handleOpenCommentThread = (filePath: string, lineNumber: number) => {
    setActiveCommentThread({ filePath, lineNumber });
  };

  const handleAddComment = (filePath: string, lineNumber: number, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      initials: currentUser.initials,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lineNumber,
    };
    setComments(prev => ({
      ...prev,
      [filePath]: [...(prev[filePath] || []), newComment],
    }));
  };

  const handleSynthesizeTask = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'todo',
    };
    setTasks(prev => [newTask, ...prev]);
  };


  const handleFileSelect = (node: FileNode, path: string) => {
    setTabGroups(prev => {
      const newGroups = [...prev];
      let foundGroupIdx = -1;
      let foundTabIdx = -1;

      // Search if file already open
      newGroups.forEach((g, gIdx) => {
        const tIdx = g.tabs.findIndex(t => t.path === path);
        if (tIdx !== -1) {
          foundGroupIdx = gIdx;
          foundTabIdx = tIdx;
        }
      });

      if (foundGroupIdx !== -1) {
        newGroups[foundGroupIdx].activeTabIndex = foundTabIdx;
        setFocusedGroupId(newGroups[foundGroupIdx].id);
      } else {
        // Add to focused group
        const groupIdx = newGroups.findIndex(g => g.id === focusedGroupId);
        if (groupIdx !== -1) {
          newGroups[groupIdx].tabs.push({ node, path });
          newGroups[groupIdx].activeTabIndex = newGroups[groupIdx].tabs.length - 1;
        }
      }
      return newGroups;
    });
    setDiffData(null); 
  };

  const handleCloseTab = (groupId: string, tabIndex: number) => {
    setTabGroups(prev => {
      const newGroups = prev.map(g => {
        if (g.id !== groupId) return g;
        const newTabs = g.tabs.filter((_, i) => i !== tabIndex);
        let newActive = g.activeTabIndex;
        if (newActive >= newTabs.length) newActive = newTabs.length - 1;
        return { ...g, tabs: newTabs, activeTabIndex: newActive };
      });
      return newGroups;
    });
  };

  const handleTerminalOutput = useCallback((text: string) => {
    setTerminalHistory(prev => [...prev, text].slice(-100)); 
  }, []);

  const onRunInTerminal = useCallback((cmd: string) => {
    editorRef.current?.ensureTerminalVisible();
    editorRef.current?.runTerminalCommand(cmd);
  }, []);

  // Real git operations using terminal
  const runGitBranchChange = useCallback((branch: string) => {
    onRunInTerminal(`git checkout ${branch}`);
    setCurrentBranch(branch);
    handleAddActivity(`Switched to branch: ${branch}`, <GitBranch size={14} className="text-purple-400" />);
  }, [onRunInTerminal, handleAddActivity]);

  const runGitCreateBranch = useCallback((branchName: string) => {
    onRunInTerminal(`git checkout -b ${branchName}`);
    setBranches(prev => [...new Set([...prev, branchName])]);
    setCurrentBranch(branchName);
    handleAddActivity(`Created and switched to new branch: ${branchName}`, <GitBranch size={14} className="text-green-400" />);
  }, [onRunInTerminal, handleAddActivity]);

  const runGitSync = useCallback(() => {
    setIsSyncing(true);
    onRunInTerminal(`git pull origin ${currentBranch} && git push origin ${currentBranch}`);
    handleAddActivity(`Syncing changes with remote on branch: ${currentBranch}`, <RefreshCw size={14} className="text-blue-400" />);
    // Reset syncing after a delay (in real app, would track terminal output)
    setTimeout(() => setIsSyncing(false), 3000);
  }, [onRunInTerminal, currentBranch, handleAddActivity]);

  const runGitRefreshStatus = useCallback(() => {
    onRunInTerminal('git status');
  }, [onRunInTerminal]);

  const runGitStageFile = useCallback((file: string) => {
    onRunInTerminal(`git add "${file}"`);
    setStagedFiles(prev => [...new Set([...prev, file])]);
  }, [onRunInTerminal]);

  const runGitUnstageFile = useCallback((file: string) => {
    onRunInTerminal(`git restore --staged "${file}"`);
    setStagedFiles(prev => prev.filter(f => f !== file));
  }, [onRunInTerminal]);

  const runGitStageAll = useCallback(() => {
    onRunInTerminal('git add -A');
    setStagedFiles(unstagedChanges.map(c => c.file).concat(stagedFiles));
  }, [onRunInTerminal, unstagedChanges, stagedFiles]);

  const runGitUnstageAll = useCallback(() => {
    onRunInTerminal('git restore --staged .');
    setStagedFiles([]);
  }, [onRunInTerminal]);
  
  const onWriteToTerminalAndShow = useCallback((text: string | string[]) => {
      editorRef.current?.ensureTerminalVisible();
      if (Array.isArray(text)) {
          text.forEach(line => {
              editorRef.current?.writeToTerminal(line);
              handleTerminalOutput(line);
          });
      } else {
          editorRef.current?.writeToTerminal(text);
          handleTerminalOutput(text);
      }
  }, [handleTerminalOutput]);

  const handleOpenInTerminal = useCallback((path: string) => {
      if (!editorRef.current) return;
      
      const parts = path.split('/');
      const lastName = parts[parts.length - 1];
      let directoryPath = path;
  
      if (lastName.includes('.')) {
          directoryPath = parts.slice(0, -1).join('/');
      }
  
      const command = `cd ${directoryPath || '~'}`; 
      editorRef.current.runTerminalCommand(command);
  }, []);

  const handleRunFile = useCallback((path: string) => {
      if (!editorRef.current) return;
      
      const parts = path.split('/');
      const fileName = parts[parts.length - 1];
      const ext = fileName.split('.').pop()?.toLowerCase();
      
      // Determine the run command based on file extension
      let runCommand = '';
      if (ext === 'js') runCommand = `node ${fileName}`;
      else if (ext === 'ts') runCommand = `npx ts-node ${fileName}`;
      else if (ext === 'py') runCommand = `python ${fileName}`;
      else if (ext === 'sh') runCommand = `bash ${fileName}`;
      else if (ext === 'go') runCommand = `go run ${fileName}`;
      else if (ext === 'rs') runCommand = `rustc ${fileName} && ./${fileName.replace('.rs', '')}`;
      else if (ext === 'rb') runCommand = `ruby ${fileName}`;
      else {
          onWriteToTerminalAndShow(`\r\n\x1b[33mNo runner configured for .${ext} files\x1b[0m`);
          return;
      }
      
      // First cd to directory, then run
      const directoryPath = parts.slice(0, -1).join('/') || '~';
      editorRef.current.runTerminalCommand(`cd ${directoryPath} && ${runCommand}`);
  }, [onWriteToTerminalAndShow]);

  const handleCwdChange = useCallback((cwd: string) => {
      setTerminalCwd(cwd);
  }, []);

  const handleRefresh = useCallback(() => {
    onWriteToTerminalAndShow([
        "\r\n\x1b[1;34m[SAI]\x1b[0m Synchronizing workspace files...",
        "\x1b[1;32m✓\x1b[0m File system re-indexed.",
        "\x1b[1;34m[SAI]\x1b[0m Refresh complete."
    ]);
  }, [onWriteToTerminalAndShow]);

  const handleQuickRun = useCallback(() => {
    if (!activeFile) {
        onWriteToTerminalAndShow("\r\n\x1b[31mError: No active file selected.\x1b[0m");
        return;
    }
    const ext = activeFile.node.name.split('.').pop()?.toLowerCase();
    let cmd = '';
    if (ext === 'js' || ext === 'ts') cmd = `node ${activeFile.node.name}`;
    else if (ext === 'py') cmd = `python ${activeFile.node.name}`;
    if (cmd) onRunInTerminal(cmd);
  }, [activeFile, onRunInTerminal, onWriteToTerminalAndShow]);

  const validateCommand = useCallback((cmd: string): { allowed: boolean; reason?: string } => {
    if (cmd.trim().toLowerCase().startsWith('rm -rf /')) {
      return { allowed: false, reason: "Destructive root commands are restricted in this environment." };
    }
    return { allowed: true };
  }, []);

  const handleRunBuild = useCallback(() => {
    onWriteToTerminalAndShow([
        "\r\n\x1b[1;35m[SYSTEM]\x1b[0m Triggering workspace build sequence...",
        "\x1b[1;32m✓\x1b[0m Build artifacts generated.",
        "\x1b[1;35m[SYSTEM]\x1b[0m Ready for deployment."
    ]);
    handleAddActivity(`${currentUser?.name || 'User'} triggered a workspace build`, <Hammer size={14} className="text-amber-400" />);
  }, [onWriteToTerminalAndShow, handleAddActivity, currentUser]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        // Initialize dynamic team list with current user
        setTeamMembers([user]);
        if (!localStorage.getItem('sai_onboarded')) {
            setTimeout(() => setIsOnboardingOpen(true), 800);
        }
    } else {
        setTeamMembers([]);
    }
  }, []);

  // Handle GitHub OAuth callback - check for stored OAuth code after redirect
  useEffect(() => {
    const handleGitHubOAuthCallback = async () => {
      const code = sessionStorage.getItem('github_oauth_code');
      const state = sessionStorage.getItem('github_oauth_state_received');
      
      if (code && state) {
        // Clean up sessionStorage
        sessionStorage.removeItem('github_oauth_code');
        sessionStorage.removeItem('github_oauth_state_received');
        
        try {
          // Try to exchange code via backend API
          const response = await fetch('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              // Backend returned user data - sign them in
              const signedInUser = await authService.signInWithGitHubToken(data.accessToken);
              setCurrentUser(signedInUser);
              setTeamMembers([signedInUser]);
              setViewMode(ViewMode.WORKSPACE);
              return;
            }
          }
        } catch (error) {
          console.log('Backend OAuth exchange not available, checking stored token...');
        }
        
        // Fallback: Check if we have an existing GitHub token from a previous auth
        const existingToken = localStorage.getItem('github_access_token');
        if (existingToken) {
          try {
            const user = await authService.signInWithGitHubToken(existingToken);
            setCurrentUser(user);
            setTeamMembers([user]);
            setViewMode(ViewMode.WORKSPACE);
            return;
          } catch (error) {
            console.error('GitHub re-auth failed:', error);
          }
        }
        
        // If no backend and no stored token, show auth modal to let user know
        // GitHub OAuth requires a backend to exchange the code
        console.log('GitHub OAuth requires backend code exchange. Opening auth modal for alternative methods.');
        setIsAuthModalOpen(true);
      }
    };
    
    handleGitHubOAuthCallback();
  }, []);

  useEffect(() => {
    const selectedTheme = THEMES.find(t => t.name === theme) || THEMES[0];
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string);
    });
    localStorage.setItem('sai_theme', theme);
  }, [theme]);

  const handleUpdateSession = (messages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const firstUserMsg = messages.find(m => m.sender === 'user')?.text;
        const title = firstUserMsg ? (firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg) : s.title;
        return { ...s, messages, title };
      }
      return s;
    }));
  };

  const handleAppGeneration = useCallback(async (plan: AppPlan, prompt: string) => {
    const projectName = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) || `sai-app-${Date.now()}`;
    
    setGhostStatus('planning');
    setCurrentGhostAction('Decomposing Synthesis Plan...');
    setGhostSteps([
        { id: '1', label: 'Decomposing Synthesis Plan', status: 'running' },
        { id: '2', label: `Generating files for '${projectName}'`, status: 'idle' },
        { id: '3', label: `Injecting '${projectName}' into workspace`, status: 'idle' },
        { id: '4', label: 'Updating Team Hub', status: 'idle' },
        { id: '5', label: 'Launching Preview Runtime', status: 'idle' }
    ]);

    await new Promise(r => setTimeout(r, 1200));
    setGhostStatus('executing');
    setCurrentGhostAction(`Generating files for '${projectName}'...`);
    setGhostSteps(prev => prev.map(s => s.id === '1' ? { ...s, status: 'completed' } : s.id === '2' ? { ...s, status: 'running' } : s));
    
    // 1. Create the new project folder structure
    const newProjectFolder: FileNode = {
        name: projectName,
        type: 'folder',
        children: plan.files.map(f => ({
            name: f.fileName,
            type: 'file',
            content: f.content,
        })),
    };

    // --- CRITICAL PREVIEW FIX: Clear stale boilerplate and prepare editor ---
    setTabGroups([{ id: 'group-1', name: 'Main', tabs: [], activeTabIndex: -1, isCollapsed: false }]);

    setFileStructure(prev => {
        const children = prev.children || [];
        // Force removal of "alphabet-explorer" to prevent entry-point collision
        const updatedChildren = [newProjectFolder, ...children.filter(c => c.name !== 'alphabet-explorer')];
        return { ...prev, children: updatedChildren };
    });

    await new Promise(r => setTimeout(r, 800));
    setCurrentGhostAction(`Injecting '${projectName}' into workspace...`);
    setGhostSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'completed' } : s.id === '3' ? { ...s, status: 'running' } : s));
    
    // 3. Create a new project entry for the Team Hub
    const newProject: Project = {
        id: Date.now().toString(),
        title: projectName,
        description: `AI-generated project for: "${prompt}"`,
        teamMemberIds: currentUser ? [currentUser.id] : [],
        status: ProjectStatus.ACTIVE,
        changeCount: plan.files.length,
        lastUpdate: 'Just now',
        comments: []
    };
    setProjects(prev => [newProject, ...prev]);
    handleAddActivity(`${currentUser?.name || 'User'} synthesized new app: '${projectName}'`, <Zap size={14} className="text-cyan-400" />);

    await new Promise(r => setTimeout(r, 1000));
    setCurrentGhostAction('Updating Team Hub...');
    setGhostSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'completed' } : s.id === '4' ? { ...s, status: 'running' } : s));
    
    await new Promise(r => setTimeout(r, 600));
    setCurrentGhostAction('Launching Preview Runtime...');
    setGhostSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'completed' } : s.id === '5' ? { ...s, status: 'running' } : s));

    // 4. Automatically open the primary entry point (index.html) of the NEW app
    const entryFile = newProjectFolder.children?.find(f => f.name === 'index.html') || newProjectFolder.children?.[0];
    if (entryFile) {
        handleFileSelect(entryFile, `${projectName}/${entryFile.name}`);
    }

    // 5. Transition to Workspace View & Preview Panel
    setViewMode(ViewMode.WORKSPACE);
    setActivePanel(Panel.PREVIEW);
    
    onWriteToTerminalAndShow(`\r\n\x1b[32m✓ Synthesized and saved new project: ${projectName}\x1b[0m`);

    setGhostStatus('completed');
    setCurrentGhostAction('Manifest injection successful.');
    setGhostSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
  }, [currentUser, onWriteToTerminalAndShow, handleAddActivity]);


  const handleFileUpdateInState = (newContent: string) => {
    if (!activeFile) return;
    const { path } = activeFile;
    const pathParts = path.split('/');
    
    // Update the tab's node content immediately for responsive typing
    setTabGroups(prev => prev.map(group => ({
        ...group,
        tabs: group.tabs.map(tab => 
            tab.path === path 
                ? { ...tab, node: { ...tab.node, content: newContent } }
                : tab
        )
    })));
    
    // Also update the file structure for persistence
    const updateRecursive = (nodes: FileNode[], parts: string[]): { updatedNodes: FileNode[], changed: boolean } => {
        if (!nodes || parts.length === 0) return { updatedNodes: nodes, changed: false };
        let changed = false;
        const updatedNodes = nodes.map(node => {
            if (node.name !== parts[0]) return node;
            if (parts.length === 1 && node.type === 'file') {
                changed = true;
                const updatedNode = { ...node, content: newContent };
                return updatedNode;
            } else if (node.type === 'folder' && node.children) {
                const result = updateRecursive(node.children, parts.slice(1));
                if (result.changed) {
                    changed = true;
                    return { ...node, children: result.updatedNodes };
                }
            }
            return node;
        });
        return { updatedNodes, changed };
    };
    setFileStructure(prev => {
        if (!prev.children) return prev;
        const { updatedNodes, changed } = updateRecursive(prev.children, pathParts);
        return changed ? { ...prev, children: updatedNodes } : prev;
    });
  };

  const handleInsertCodeIntoEditor = (codeToInsert: string) => {
    if (!activeFile) {
        alert("No active file to insert code into. Please open a file first.");
        return;
    }
    const currentContent = activeFile.node.content || '';
    const newContent = currentContent + '\n\n' + codeToInsert;
    handleFileUpdateInState(newContent);
};

  const handleNewFolder = (name?: string) => {
    setFileStructure(prev => {
        let finalName = name || 'New Folder';
        const existingNames = prev.children?.map(c => c.name) || [];
        if (!name) {
            while (existingNames.includes(finalName)) finalName = `New Folder ${Math.floor(Math.random()*100)}`;
        }
        const newFolder: FileNode = { name: finalName, type: 'folder', children: [], isRenaming: !name };
        return { ...prev, children: [...(prev.children || []), newFolder] };
    });
  };

  const handleNewFile = (defaultName?: string) => {
    if (defaultName) {
      // If a default name is provided, create the file directly
      let fileName = defaultName;
      setFileStructure(prev => {
        const newNode: FileNode = { name: fileName, type: 'file', content: '', isRenaming: false };
        return { ...prev, children: [...(prev.children || []), newNode] };
      });
      
      // Open the file explorer panel
      setActivePanel(Panel.FILES);
      
      // Open the newly created file in the editor
      setTimeout(() => {
        const newNode: FileNode = { name: fileName, type: 'file', content: '' };
        handleFileSelect(newNode, fileName);
      }, 100);
    } else {
      // Show file type selection modal
      setIsFileTypeModalOpen(true);
    }
  };

  const handleNewDocument = (extension: string, defaultName?: string) => {
      let fileName: string;
      
      if (defaultName) {
          fileName = defaultName;
      } else {
          fileName = extension ? `untitled.${extension}` : 'untitled';
      }
      
      setFileStructure(prev => {
          const existingNames = (prev.children || []).map(c => c.name);
          let count = 0;
          let finalName = fileName;
          while (existingNames.includes(finalName)) {
              count++;
              finalName = extension ? `untitled_${count}.${extension}` : `untitled_${count}`;
          }
          fileName = finalName;
          const newNode: FileNode = { name: fileName, type: 'file', content: '', isRenaming: !defaultName };
          return { ...prev, children: [...(prev.children || []), newNode] };
      });
      
      // Open the file explorer panel
      setActivePanel(Panel.FILES);
      
      // Open the newly created file in the editor after state updates
      setTimeout(() => {
        // Re-calculate the final name in case it was modified
        const newNode: FileNode = { name: fileName, type: 'file', content: '' };
        handleFileSelect(newNode, fileName);
      }, 100);
  };

  const handleDeleteFile = (path: string, silent: boolean = false) => {
    const confirmDelete = silent ? true : window.confirm(`Delete '${path.split('/').pop()}'?`);
    if (!confirmDelete) return;
    const recursiveDelete = (nodes: FileNode[], pathParts: string[]): FileNode[] => {
        if (!nodes || pathParts.length === 0) return nodes;
        const currentPart = pathParts[0];
        const remainingParts = pathParts.slice(1);
        if (remainingParts.length === 0) return nodes.filter(node => node.name !== currentPart);
        return nodes.map(node => node.name === currentPart && node.type === 'folder' && node.children ? { ...node, children: recursiveDelete(node.children, remainingParts) } : node);
    };
    setFileStructure(prev => ({ ...prev, children: recursiveDelete(prev.children || [], path.split('/')) }));
    
    // Close tab if deleted
    setTabGroups(prev => {
      return prev.map(g => ({
        ...g,
        tabs: g.tabs.filter(t => t.path !== path),
        activeTabIndex: g.activeTabIndex >= g.tabs.length - 1 ? Math.max(0, g.tabs.length - 2) : g.activeTabIndex
      }));
    });
  };

  const handleRenameFile = (originalName: string, newName: string) => {
    const renameRecursive = (node: FileNode): FileNode => {
        if (node.name === originalName) return { ...node, name: newName, isRenaming: false };
        if (node.children) return { ...node, children: node.children.map(renameRecursive) };
        return node;
    };
    setFileStructure(prev => renameRecursive(prev));
  };

  const handleStartRenaming = (name: string) => {
    const startRenameRecursive = (node: FileNode): FileNode => {
        if (node.name === name) return { ...node, isRenaming: true };
        const newNode = { ...node, isRenaming: false };
        if (newNode.children) return { ...newNode, children: newNode.children.map(startRenameRecursive) };
        return newNode;
    };
    setFileStructure(prev => startRenameRecursive(prev));
  };

  const handleMoveNode = (sourcePath: string, targetFolderPath: string) => {
    let sourceNode: FileNode | null = null;
    
    // Create immutable helpers
    const removeRecursive = (parent: FileNode, pathParts: string[]): FileNode => {
      if (pathParts.length === 0 || !parent.children) return parent;
      const childName = pathParts[0];
      
      if (pathParts.length === 1) {
        const found = parent.children.find(c => childName === c.name);
        if (found) sourceNode = found;
        return { ...parent, children: parent.children.filter(c => c.name !== childName) };
      }
      
      return { ...parent, children: parent.children.map(child => {
        if (child.name === childName && child.type === 'folder') {
          return removeRecursive(child, pathParts.slice(1));
        }
        return child;
      })};
    };

    const addRecursive = (parent: FileNode, pathParts: string[], nodeToAdd: FileNode): FileNode => {
      if (pathParts.length === 0) {
          return { ...parent, children: [...(parent.children || []), nodeToAdd] };
      }
      
      if (!parent.children) return parent;
      const childName = pathParts[0];

      return { ...parent, children: parent.children.map(child => {
        if (child.name === childName && child.type === 'folder') {
          return addRecursive(child, pathParts.slice(1), nodeToAdd);
        }
        return child;
      })};
    };

    setFileStructure(prev => {
      if (!sourcePath || targetFolderPath.startsWith(sourcePath)) return prev;

      const tempRoot = removeRecursive(prev, sourcePath.split('/'));
      if (!sourceNode) return prev; // source not found

      const finalRoot = addRecursive(tempRoot, targetFolderPath ? targetFolderPath.split('/') : [], sourceNode);
      return finalRoot;
    });
  };

  const handleGoToFile = (filePath: string) => {
    const relativePath = filePath.startsWith(`${fileStructure.name}/`) ? filePath.substring(fileStructure.name.length + 1) : filePath;
    const parts = relativePath.split('/');
    let current: FileNode | undefined = fileStructure;
    for (const part of parts) {
        current = current?.children?.find(c => c.name === part);
    }
    if (current && current.type === 'file') {
        handleFileSelect(current, relativePath);
        setActivePanel(Panel.FILES);
    }
  };

  const handleAuthSuccess = (user: TeamMember) => { 
    setCurrentUser(user); 
    setIsAuthModalOpen(false); 
    
    // Immediately check for onboarding after auth
    if (!localStorage.getItem('sai_onboarded')) {
        setTimeout(() => setIsOnboardingOpen(true), 500);
    }
  };

  const handleToggleMcp = (id: string) => {
      const server = mcpServers.find(s => s.id === id);
      if (!server) return;
      if (server.status === 'connected') disconnectServer(id);
      else connectServer(id, { env: apiKeys }); 
  };

  const handleCloudAuth = useCallback((provider: string) => {
      setActiveProviderForAuth(provider);
      setIsConnectCloudModalOpen(true);
  }, []);

  const handleCloudConnectSuccess = (key: string) => {
      if (activeProviderForAuth) {
          setAuthenticatedProviders(prev => [...new Set([...prev, activeProviderForAuth])]);
          onWriteToTerminalAndShow([
              `\r\n\x1b[32m✓ Identity Verified for ${activeProviderForAuth}.\x1b[0m`,
              `\x1b[34m[SAI]\x1b[0m Session token injected into kernel buffer.`
          ]);
          handleAddActivity(`${currentUser?.name || 'User'} connected to ${activeProviderForAuth} cloud`, <ShieldCheck size={14} className="text-emerald-400" />);
      }
      setIsConnectCloudModalOpen(false);
  };

  const handleAiIntentRequest = useCallback((prompt: string, mode: 'chat' | 'app' = 'chat') => {
      setIsChatOpen(true);
      setChatInitialPrompt(prompt);
      setChatInitialMode(mode);
  }, []);

  const startResizingDrawer = (e: React.MouseEvent) => { 
    e.preventDefault(); 
    isResizingDrawerRef.current = true; 
    setIsResizingDrawer(true); 
    document.body.style.cursor = 'col-resize'; 
  };
  const startResizingChat = (e: React.MouseEvent) => { 
    e.preventDefault(); 
    isResizingChatRef.current = true; 
    setIsResizingChat(true); 
    document.body.style.cursor = 'col-resize'; 
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isResizingDrawerRef.current) {
              const newWidth = e.clientX - 56;
              if (newWidth < 50) setDrawerWidth(0);
              else if (newWidth <= 800) setDrawerWidth(newWidth);
          }
          if (isResizingChatRef.current && !isMobile) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth < 50) setIsChatOpen(false);
            else setChatWidth(newWidth);
          }
      };
      const handleMouseUp = () => { 
        isResizingDrawerRef.current = false; 
        setIsResizingDrawer(false); 
        isResizingChatRef.current = false; 
        setIsResizingChat(false); 
        document.body.style.cursor = ''; 
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isMobile]);

  const menuCategories: MenuCategory[] = [
    { label: 'File', items: [
        { label: 'New File', action: () => setIsFileTypeModalOpen(true), shortcut: isMac ? '⌘N' : 'Ctrl+N', icon: <FilePlus size={14} /> }, 
        { label: 'New Folder', action: () => handleNewFolder(), shortcut: isMac ? '⌘⇧N' : 'Ctrl+Shift+N', icon: <FolderOpen size={14} /> },
        { divider: true },
        { label: 'Open Project', action: () => setIsSwitchProjectOpen(true), icon: <Layout size={14} /> },
        { label: 'Save All', action: () => {}, shortcut: isMac ? '⌘S' : 'Ctrl+S', icon: <Save size={14} /> },
    ]},
    { label: 'Edit', items: [
        { label: 'Undo', action: () => { /* Logic to trigger undo in current buffer */ }, shortcut: isMac ? '⌘Z' : 'Ctrl+Z', icon: <Undo2 size={14} /> },
        { label: 'Redo', action: () => { /* Logic to trigger redo in current buffer */ }, shortcut: isMac ? '⌘Y' : 'Ctrl+Y', icon: <Redo2 size={14} /> },
        { divider: true },
        { label: 'Cut', action: () => {}, shortcut: isMac ? '⌘X' : 'Ctrl+X', icon: <Scissors size={14} /> },
        { label: 'Copy', action: () => {}, shortcut: isMac ? '⌘C' : 'Ctrl+C', icon: <Copy size={14} /> },
        { label: 'Paste', action: () => {}, shortcut: isMac ? '⌘V' : 'Ctrl+V', icon: <Clipboard size={14} /> },
    ]},
    { label: 'Selection', items: [
        { label: 'Select All', action: () => {}, shortcut: isMac ? '⌘A' : 'Ctrl+A', icon: <MousePointer2 size={14} /> },
        { label: 'Expand Selection', action: () => {}, icon: <LayoutGrid size={14} /> },
    ]},
    { label: 'View', items: [
        { label: 'Command Palette', action: () => setIsCommandPaletteOpen(true), shortcut: isMac ? '⌘⇧P' : 'Ctrl+Shift+P', icon: <CommandIcon size={14} /> },
        { label: 'Toggle Sidebar', action: () => setIsSidebarVisible(!isSidebarVisible), shortcut: isMac ? '⌘B' : 'Ctrl+B', icon: <Layout size={14} /> },
        { label: 'Toggle Chat', action: () => setIsChatOpen(!isChatOpen), shortcut: isMac ? '⌘I' : 'Ctrl+I', icon: <MessageSquare size={14} /> },
        { label: 'Toggle Terminal', action: () => setTerminalHeight(prev => prev === 0 ? 250 : 0), shortcut: isMac ? '⌘J' : 'Ctrl+J', icon: <Terminal size={14} /> },
    ]},
    { label: 'Go', items: [
        { label: 'Go to File', action: () => setIsCommandPaletteOpen(true), shortcut: isMac ? '⌘P' : 'Ctrl+P', icon: <Search size={14} /> },
        { label: 'Go to Symbol', action: () => {}, shortcut: isMac ? '⌘⇧O' : 'Ctrl+Shift+O', icon: <Zap size={14} /> },
    ]}
  ];

  const commands: Command[] = [
      // File Commands
      { id: 'new-file', label: 'New File', icon: <FilePlus size={16} />, category: 'File', action: () => setIsFileTypeModalOpen(true), shortcut: '⌘N' },
      { id: 'save-file', label: 'Save File', icon: <Save size={16} />, category: 'File', action: () => handleSaveFile(), shortcut: '⌘S' },
      { id: 'save-all', label: 'Save All Files', icon: <Save size={16} />, category: 'File', action: () => handleSaveAllFiles(), shortcut: '⌘⇧S' },
      { id: 'close-tab', label: 'Close Tab', icon: <X size={16} />, category: 'File', action: () => { if (focusedGroupId && tabGroups.length > 0) { const group = tabGroups.find(g => g.id === focusedGroupId); if (group && group.tabs.length > 0) handleCloseTab(focusedGroupId, group.tabs[group.activeTabIndex]?.id || ''); }}, shortcut: '⌘W' },
      { id: 'close-all-tabs', label: 'Close All Tabs', icon: <X size={16} />, category: 'File', action: () => setTabGroups(prev => prev.map(g => ({ ...g, tabs: [], activeTabIndex: -1 }))), shortcut: '⌘⇧W' },
      
      // AI Commands
      { id: 'toggle-chat', label: 'Open AI Chat', icon: <MessageSquare size={16} />, category: 'AI', action: () => { if (currentUser?.plan === 'Hobby') { setUpgradeFeatureName('AI Chat'); setIsUpgradeModalOpen(true); } else { setIsChatOpen(true); } }, shortcut: '⌘⇧A' },
      { id: 'ai-generate', label: 'AI Generate Code', icon: <Sparkles size={16} />, category: 'AI', action: () => { setIsChatOpen(true); setChatInitialPrompt('Generate code for: '); } },
      { id: 'ai-explain', label: 'AI Explain Code', icon: <Sparkles size={16} />, category: 'AI', action: () => { setIsChatOpen(true); setChatInitialPrompt('Explain this code: '); } },
      { id: 'ai-refactor', label: 'AI Refactor Code', icon: <Sparkles size={16} />, category: 'AI', action: () => { setIsChatOpen(true); setChatInitialPrompt('Refactor this code to improve: '); } },
      { id: 'ai-debug', label: 'AI Debug Helper', icon: <Sparkles size={16} />, category: 'AI', action: () => { setIsChatOpen(true); setChatInitialPrompt('Help me debug: '); } },
      { id: 'ghost-agent', label: 'Summon Ghost Agent', icon: <Sparkles size={16} />, category: 'AI', action: () => setShowGhostAgent(true) },
      
      // View Commands
      { id: 'toggle-terminal', label: 'Toggle Terminal', icon: <Terminal size={16} />, category: 'View', action: () => setIsTerminalOpen(!isTerminalOpen), shortcut: '⌘`' },
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: <PanelLeft size={16} />, category: 'View', action: () => setIsSidebarExpanded(!isSidebarExpanded), shortcut: '⌘B' },
      { id: 'toggle-preview', label: 'Toggle Preview', icon: <Eye size={16} />, category: 'View', action: () => setIsPreviewVisible(!isPreviewVisible), shortcut: '⌘⇧P' },
      { id: 'zen-mode', label: 'Zen Mode', icon: <Maximize2 size={16} />, category: 'View', action: () => { setIsSidebarExpanded(false); setIsTerminalOpen(false); } },
      { id: 'split-editor', label: 'Split Editor', icon: <SplitSquareHorizontal size={16} />, category: 'View', action: () => handleCreateGroup() },
      
      // Panel Commands
      { id: 'open-explorer', label: 'Open File Explorer', icon: <Folder size={16} />, category: 'Panel', action: () => setActivePanel(Panel.EXPLORER), shortcut: '⌘⇧E' },
      { id: 'open-search', label: 'Global Search', icon: <Search size={16} />, category: 'Panel', action: () => setActivePanel(Panel.SEARCH), shortcut: '⌘⇧F' },
      { id: 'open-git', label: 'Source Control', icon: <GitBranch size={16} />, category: 'Panel', action: () => setActivePanel(Panel.SOURCE_CONTROL), shortcut: '⌘⇧G' },
      { id: 'open-extensions', label: 'Extensions', icon: <Box size={16} />, category: 'Panel', action: () => setActivePanel(Panel.EXTENSIONS), shortcut: '⌘⇧X' },
      { id: 'open-debug', label: 'Debug Panel', icon: <Bug size={16} />, category: 'Panel', action: () => setActivePanel(Panel.DEBUG) },
      { id: 'open-settings', label: 'Settings', icon: <Settings size={16} />, category: 'Panel', action: () => setActivePanel(Panel.SETTINGS), shortcut: '⌘,' },
      { id: 'open-database', label: 'Database Panel', icon: <Database size={16} />, category: 'Panel', action: () => setActivePanel(Panel.DATABASE) },
      { id: 'open-docker', label: 'Docker Panel', icon: <Box size={16} />, category: 'Panel', action: () => setActivePanel(Panel.DOCKER) },
      { id: 'open-api-client', label: 'API Client', icon: <Globe size={16} />, category: 'Panel', action: () => setActivePanel(Panel.API_CLIENT) },
      { id: 'open-security', label: 'Security Scan', icon: <Shield size={16} />, category: 'Panel', action: () => setActivePanel(Panel.SECURITY) },
      { id: 'open-testing', label: 'Testing Panel', icon: <TestTube2 size={16} />, category: 'Panel', action: () => setActivePanel(Panel.TESTING) },
      
      // Project Commands
      { id: 'open-kanban', label: 'Project Board', icon: <Trello size={16} />, category: 'Project', action: () => setActivePanel(Panel.KANBAN) },
      { id: 'open-whiteboard', label: 'Whiteboard', icon: <PenTool size={16} />, category: 'Project', action: () => setActivePanel(Panel.WHITEBOARD) },
      { id: 'open-document', label: 'Document Studio', icon: <FileText size={16} />, category: 'Project', action: () => setActivePanel(Panel.DOCUMENT) },
      { id: 'new-project', label: 'Create New Project', icon: <FolderPlus size={16} />, category: 'Project', action: () => setIsCreateProjectOpen(true) },
      { id: 'clone-repo', label: 'Clone Repository', icon: <GitBranch size={16} />, category: 'Project', action: () => setIsCloneRepoModalOpen(true) },
      
      // Git Commands
      { id: 'git-commit', label: 'Git: Commit', icon: <GitCommit size={16} />, category: 'Git', action: () => { setActivePanel(Panel.SOURCE_CONTROL); } },
      { id: 'git-push', label: 'Git: Push', icon: <Upload size={16} />, category: 'Git', action: () => onWriteToTerminalAndShow('\r\n\x1b[34m[GIT]\x1b[0m Pushing to remote...') },
      { id: 'git-pull', label: 'Git: Pull', icon: <Download size={16} />, category: 'Git', action: () => onWriteToTerminalAndShow('\r\n\x1b[34m[GIT]\x1b[0m Pulling from remote...') },
      { id: 'git-branch', label: 'Git: Create Branch', icon: <GitBranch size={16} />, category: 'Git', action: () => setActivePanel(Panel.SOURCE_CONTROL) },
      
      // Tools Commands
      { id: 'format-document', label: 'Format Document', icon: <AlignLeft size={16} />, category: 'Tools', action: () => onWriteToTerminalAndShow('\r\n\x1b[32m✓ Document formatted\x1b[0m'), shortcut: '⌘⇧F' },
      { id: 'run-build', label: 'Run Build', icon: <Hammer size={16} />, category: 'Tools', action: () => { setIsTerminalOpen(true); onWriteToTerminalAndShow('\r\n\x1b[36m[BUILD]\x1b[0m Starting build process...'); }, shortcut: '⌘⇧B' },
      { id: 'deploy', label: 'Deploy to Cloud', icon: <Cloud size={16} />, category: 'Tools', action: () => setIsDeployModalOpen(true) },
      { id: 'preview-build', label: 'Preview Build', icon: <Eye size={16} />, category: 'Tools', action: () => setIsBuildPreviewOpen(true) },
      { id: 'run-tests', label: 'Run Tests', icon: <TestTube2 size={16} />, category: 'Tools', action: () => { setActivePanel(Panel.TESTING); } },
      
      // Collaboration Commands  
      { id: 'open-collab', label: 'Team Collaboration', icon: <Users size={16} />, category: 'Collaboration', action: () => setActivePanel(Panel.COLLABORATION) },
      { id: 'start-live-share', label: 'Start Live Share', icon: <Share2 size={16} />, category: 'Collaboration', action: () => onWriteToTerminalAndShow('\r\n\x1b[35m[LIVE]\x1b[0m Starting live share session...') },
      { id: 'open-team-hub', label: 'Team Hub', icon: <Users size={16} />, category: 'Collaboration', action: () => setViewMode(ViewMode.HUB) },
      
      // Help Commands
      { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} />, category: 'Help', action: () => setActivePanel(Panel.HELP), shortcut: '⌘K ⌘S' },
      { id: 'documentation', label: 'Documentation', icon: <BookOpen size={16} />, category: 'Help', action: () => setActivePanel(Panel.HELP) },
      { id: 'about', label: 'About SAI-IDE', icon: <Info size={16} />, category: 'Help', action: () => setIsAboutOpen(true) },
      { id: 'whats-new', label: "What's New", icon: <Star size={16} />, category: 'Help', action: () => setIsAboutOpen(true) },
  ];

  const handleOnboardingComplete = (workspaceName: string) => {
    setIsOnboardingOpen(false);
    localStorage.setItem('sai_onboarded', 'true');
    setFileStructure(prev => ({
        ...prev,
        name: workspaceName
    }));
    onWriteToTerminalAndShow([
        `\r\n\x1b[32m✓ Neural workspace initialized as "${workspaceName}".\x1b[0m`,
        `\x1b[34m[SAI]\x1b[0m Ready for synthesis.`
    ]);
    setViewMode(ViewMode.HUB); // After onboarding, go to the hub
  };

  const handleCreateGroup = () => {
    const newId = `group-${Date.now()}`;
    setTabGroups(prev => [...prev, { id: newId, name: 'New Group', tabs: [], activeTabIndex: -1, isCollapsed: false }]);
    setFocusedGroupId(newId);
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    setTabGroups(prev => prev.map(g => g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g));
  };

  const handleLaunchWorkspace = (projectName: string) => {
      // Switch context to specific workspace
      setViewMode(ViewMode.WORKSPACE);
      onWriteToTerminalAndShow([
          `\r\n\x1b[36m[HUB]\x1b[0m Entering workspace: ${projectName}...`,
          `\x1b[34m[SAI]\x1b[0m Attaching co-pilot session to project context.`
      ]);
  };

  const handleCreateProject = (data: { title: string; description: string; memberIds: string[] }) => {
      const newProject: Project = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          teamMemberIds: data.memberIds,
          status: ProjectStatus.ACTIVE,
          changeCount: 0,
          lastUpdate: 'Just now',
          comments: []
      };
      setProjects(prev => [newProject, ...prev]);
      setIsCreateProjectOpen(false);
      onWriteToTerminalAndShow(`\r\n\x1b[32m✓ Created new blueprint: ${data.title}\x1b[0m`);
      handleAddActivity(`${currentUser?.name || 'User'} created project: '${data.title}'`, <LayoutGrid size={14} className="text-blue-400" />);
  };

  const handlePopOutTeamChannel = () => {
    setIsTeamChannelPoppedOut(true);
    setActivePanel(null); // Close the main collaboration panel
  };

  const handleDockTeamChannel = () => {
    setIsTeamChannelPoppedOut(false);
  };
  
  const handlePanelChange = (panel: Panel) => {
    if (panel === Panel.DEPLOYMENT) {
        setIsDeploymentCenterOpen(true);
    } else {
        setActivePanel(activePanel === panel ? null : panel);
    }
  };

  const handlePromptTemplateSynthesis = (tpl: PromptTemplate) => {
      handleLaunchWorkspace(tpl.title);
      // Initiate AI Synthesis flow
      setTimeout(() => {
          handleAiIntentRequest(tpl.prompt, 'app');
      }, 1000);
  };

  const handleCommit = useCallback((msg: string) => {
      // Run real git commit command
      const escapedMessage = msg.replace(/"/g, '\\"');
      editorRef.current?.ensureTerminalVisible();
      editorRef.current?.runTerminalCommand(`git commit -m "${escapedMessage}"`);
      
      // Update local state
      setCommits(prev => [{id: Math.random().toString(16).substring(2, 9), message: msg, author: currentUser?.name || 'Anonymous', date: 'Just now', branch: currentBranch, parentIds: prev.length > 0 ? [prev[0].id] : [], color: '#4ade80'}, ...prev]);
      setLastCommittedStructure(JSON.parse(JSON.stringify(fileStructure)));
      setStagedFiles([]);
      handleAddActivity(`${currentUser?.name || 'User'} committed: "${msg}"`, <GitBranch size={14} className="text-green-400" />);
  }, [currentUser, handleAddActivity, fileStructure, currentBranch]);

  const handleUpgradeSuccess = (newPlan: 'Pro' | 'Enterprise') => {
      if (currentUser) {
          const updatedUser = { ...currentUser, plan: newPlan };
          setCurrentUser(updatedUser);
          authService.createProUser(currentUser.name, currentUser.email, 'NO_PASS_UPDATE'); // Logic stub for persistence
          onWriteToTerminalAndShow([
              `\r\n\x1b[32m✓ PRO UPGRADE SUCCESSFUL\x1b[0m`,
              `\x1b[34m[SAI]\x1b[0m Welcome to the ${newPlan} tier. Neural pipelines upgraded.`
          ]);
          handleAddActivity(`${currentUser.name} upgraded to ${newPlan} plan!`, <Zap size={14} className="text-yellow-400" />);
      }
  };
  
  const handleInviteSent = () => {
    // Simulate dynamic joining by adding a random user from MOCK_TEAM_MEMBERS after a delay
    // Filter to ensure we don't add someone already in the team
    const delay = Math.floor(Math.random() * 2000) + 1000;
    setTimeout(() => {
        const potentialJoiners = MOCK_TEAM_MEMBERS.filter(m => 
            !teamMembers.some(existing => existing.email === m.email) &&
            (currentUser ? m.email !== currentUser.email : true)
        );

        if (potentialJoiners.length > 0) {
            const newMember = potentialJoiners[0];
            setTeamMembers(prev => [...prev, newMember]);
            
            handleAddActivity(`${newMember.name} joined via invite link`, <UserPlus size={14} className="text-green-400" />);
            onWriteToTerminalAndShow([
                `\r\n\x1b[32m[System]\x1b[0m New connection established: ${newMember.name}`,
                `\x1b[34m[Collab]\x1b[0m Synchronizing workspace state... Done.`
            ]);
            
            if (isLiveSessionChatOpen) {
                handleSendLiveChatMessage(`**${newMember.name}** has joined the session.`);
            }
        }
    }, delay);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] relative overflow-hidden">
      <Header 
        models={AI_MODELS_DATA} activeModelId={activeModelId} onModelChange={setActiveModelId} teamMembers={teamMembers} currentUser={currentUser} onSignIn={() => setIsAuthModalOpen(true)} onSignOut={() => { authService.signOut(); setCurrentUser(null); }} onInvite={() => setIsInviteModalOpen(true)} isLanding={!currentUser} isChatOpen={isChatOpen} onToggleChat={() => { if (currentUser?.plan === 'Hobby') { setUpgradeFeatureName('AI Chat'); setIsUpgradeModalOpen(true); } else { setIsChatOpen(!isChatOpen); } }} isSidebarVisible={isSidebarVisible} onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)} onOpenProfile={() => { setIdentityInitialTab('profile'); setIsIdentityDashboardOpen(true); }} mcpServers={mcpServers} onToggleMcp={handleToggleMcp} onStatusChange={(status) => currentUser && setCurrentUser({ ...currentUser, status })} menuCategories={menuCategories} isLive={isLiveSession} onOpenVoiceCommand={() => setIsVoiceCommandOpen(true)}
        activePanel={activePanel} onPanelChange={handlePanelChange} onToggleTerminal={() => setTerminalHeight(prev => prev === 0 ? 250 : 0)} isTerminalOpen={terminalHeight > 0} onRun={handleQuickRun} onBuild={() => setIsBuildPreviewOpen(true)} 
        isCallMinimized={isCallMinimized}
        onToggleCallMinimize={() => setIsCallMinimized(p => !p)}
        isMicOn={isMicOn}
        onToggleMic={() => setIsMicOn(p => !p)}
        onUpgradeClick={() => { setUpgradeFeatureName("Premium Features"); setIsUpgradeModalOpen(true); }}
      />
      
      {isLiveSession && currentUser && (
          <Suspense fallback={null}>
          <VideoGrid
            onStopSession={() => setIsLiveSession(false)}
            currentUser={currentUser}
            teamMembers={teamMembers}
            isMinimized={isCallMinimized}
            onToggleMinimize={() => setIsCallMinimized(p => !p)}
            isMicOn={isMicOn}
            onToggleMic={() => setIsMicOn(p => !p)}
            onToggleLiveChat={handleToggleLiveChat}
          />
          </Suspense>
      )}

      {currentUser && isLiveSessionChatOpen && (
        <Suspense fallback={null}>
        <LiveSessionChat 
            currentUser={currentUser} 
            teamMembers={teamMembers} 
            isOpen={isLiveSessionChatOpen}
            isMinimized={isLiveSessionChatMinimized}
            messages={liveSessionMessages}
            hasUnread={hasUnreadLiveMessages}
            activity={activityFeed}
            onSendMessage={handleSendLiveChatMessage}
            onClose={() => setIsLiveSessionChatOpen(false)}
            onMinimize={() => setIsLiveSessionChatMinimized(true)}
            onMaximize={() => {
                setIsLiveSessionChatMinimized(false);
                setHasUnreadLiveMessages(false);
            }}
            discussions={discussions}
        />
        </Suspense>
      )}

      {isTeamChannelPoppedOut && currentUser && (
        <Suspense fallback={null}>
        <FloatingChatWidget 
            currentUser={currentUser} 
            teamMembers={teamMembers} 
            onDock={handleDockTeamChannel} 
        />
        </Suspense>
      )}

      {ghostStatus !== 'idle' && (
        <Suspense fallback={null}>
        <GhostAgent status={ghostStatus} steps={ghostSteps} currentAction={currentGhostAction} onClose={() => setGhostStatus('idle')} />
        </Suspense>
      )}

      <div className="flex-1 flex flex-col pt-14 overflow-y-auto custom-scrollbar relative">
        {!currentUser ? (
          <LandingPage onLaunch={() => setIsAuthModalOpen(true)} onSubscribe={() => setIsAuthModalOpen(true)} />
        ) : (
          <>
              {viewMode === ViewMode.HUB ? (
                  <Suspense fallback={<PaneLoader />}>
                  <TeamHub 
                      projects={projects}
                      teamMembers={teamMembers} 
                      currentUser={currentUser}
                      onLaunchWorkspace={handleLaunchWorkspace} 
                      onInvite={() => setIsInviteModalOpen(true)}
                      onCreateProject={() => setIsCreateProjectOpen(true)}
                      onBrowseTemplates={() => setViewMode(ViewMode.TEMPLATES)}
                      commits={commits}
                      onAskHubAgent={handleAiIntentRequest}
                      onJoinDiscussion={handleAddActivity}
                      discussions={discussions}
                      onImportLink={handleImportLink}
                      agendaItems={agendaItems}
                      activity={activityFeed}
                  />
                  </Suspense>
              ) : viewMode === ViewMode.TEMPLATES ? (
                  <Suspense fallback={<PaneLoader />}>
                  <PromptLibrary 
                    onSelect={handlePromptTemplateSynthesis} 
                    onBack={() => setViewMode(ViewMode.HUB)} 
                  />
                  </Suspense>
              ) : (
                  <div className="flex-1 flex overflow-x-auto md:overflow-hidden relative animate-fade-in h-full">
                      {/* Global Workspace Doodles */}
                      <WorkspaceDoodles />

                      {isSidebarVisible && (
                          <Sidebar activePanel={activePanel} onPanelChange={handlePanelChange} userPlan={currentUser.plan} onRestrictedClick={(feature) => { setUpgradeFeatureName(feature); setIsUpgradeModalOpen(true); }} pendingChangesCount={unstagedChanges.length + stagedChanges.length} />
                      )}
                      
                      {/* HUB Switcher Button in Sidebar Bottom */}
                      <div className="absolute bottom-20 left-2 w-10 h-10 z-50">
                          <button onClick={() => setViewMode(ViewMode.HUB)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all shadow-lg border border-white/10 group overflow-hidden relative" title="Return to Team Hub">
                              <Layers size={20} />
                              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                      </div>

                      {activePanel === Panel.DOCUMENT ? (
                          <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]/80 backdrop-blur-sm relative z-20">
                              <Suspense fallback={<PaneLoader />}>
                              <DocumentEditorPane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} teamMembers={teamMembers} currentUser={currentUser} />
                              </Suspense>
                          </div>
                      ) : activePanel === Panel.STITCH_STUDIO ? (
                          <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14] relative z-20 animate-fade-in">
                              <Suspense fallback={<PaneLoader />}>
                              <StitchStudioPane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} onSaveFile={handleFileUpdateInState} />
                              </Suspense>
                          </div>
                      ) : activePanel === Panel.WHITEBOARD ? (
                          <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative z-20 animate-fade-in">
                              <Suspense fallback={<PaneLoader />}>
                              <WhiteboardPane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} />
                              </Suspense>
                          </div>
                      ) : activePanel === Panel.KANBAN ? (
                          <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14] relative z-20 animate-fade-in">
                              <Suspense fallback={<PaneLoader />}>
                              <KanbanPane onCollapse={() => setActivePanel(null)} fileStructure={fileStructure} tasks={tasks} setTasks={setTasks} projectName={fileStructure.name} teamMembers={teamMembers} />
                              </Suspense>
                          </div>
                      ) : activePanel === Panel.DATABASE ? (
                          <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14] relative z-20 animate-fade-in">
                              <Suspense fallback={<PaneLoader />}>
                              <DatabasePane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} />
                              </Suspense>
                          </div>
                      ) : (
                          <>
                              {activePanel && activePanel !== Panel.CHAT && (
                                  <>
                                      {isMobile && (
                                          <div 
                                              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[180] animate-fade-in" 
                                              onClick={() => setActivePanel(null)} 
                                          />
                                      )}
                                      <div 
                                          className={`border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background-secondary)]/90 backdrop-blur-md z-[190] transition-all
                                              ${isMobile 
                                                  ? 'fixed inset-y-0 left-14 top-14 w-[calc(100%-56px)] animate-slide-in-left shadow-2xl' 
                                                  : `relative ${isResizingDrawer ? 'border-[var(--color-accent)]' : ''}`
                                              }
                                          `} 
                                          style={{ width: isMobile ? 'calc(100% - 56px)' : `${drawerWidth}px`, minWidth: isMobile ? 'auto' : (drawerWidth === 0 ? '0px' : '50px') }}
                                      >
                                          <Suspense fallback={<PaneLoader />}>
                                          {activePanel === Panel.FILES && <FileExplorer rootNode={fileStructure} activeFile={activeFile ? activeFile.node : null} onFileSelect={handleFileSelect} onCollapse={() => setActivePanel(null)} onNewFile={() => setIsFileTypeModalOpen(true)} onNewFolder={() => handleNewFolder()} onRefresh={handleRefresh} onSaveToGithub={() => setIsSaveToGithubOpen(true)} onBuild={() => setIsBuildPreviewOpen(true)} onRenameFile={handleRenameFile} onStartRenaming={handleStartRenaming} onDeleteFile={handleDeleteFile} onOpenInTerminal={handleOpenInTerminal} onRunFile={handleRunFile} terminalCwd={terminalCwd} onMoveNode={handleMoveNode} securityIssues={securityIssues} onOpenDocuments={() => setActivePanel(Panel.DOCUMENT)} onPanelChange={setActivePanel} />}
                                          {activePanel === Panel.SEARCH && <SearchPane onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.SOURCE_CONTROL && <SourceControlPane onCollapse={() => setActivePanel(null)} changes={unstagedChanges} stagedChanges={stagedChanges} onStageFile={runGitStageFile} onUnstageFile={runGitUnstageFile} onStageAll={runGitStageAll} onUnstageAll={runGitUnstageAll} onCommit={handleCommit} onSync={runGitSync} isSyncing={isSyncing} currentBranch={currentBranch} branches={branches} onBranchChange={runGitBranchChange} onCreateBranch={runGitCreateBranch} commits={commits} fileStructure={fileStructure} activeModelId={activeModelId} onWriteToTerminal={onWriteToTerminalAndShow} onRefreshGitStatus={runGitRefreshStatus} />}
                                          {activePanel === Panel.SECURITY && <SecurityPane securityIssues={securityIssues} onCollapse={() => setActivePanel(null)} policies={policies} onTogglePolicy={(id) => setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))} onSetPolicies={setPolicies} fileStructure={fileStructure} />}
                                          {activePanel === Panel.TERRAFORM && <TerraformGenerator onSaveFile={handleFileUpdateInState} activeModelId={activeModelId} onCollapse={() => setActivePanel(null)} policies={policies} onWriteToTerminal={onWriteToTerminalAndShow} />}
                                          {activePanel === Panel.DOCKER && <DockerPane onSaveFile={handleFileUpdateInState} activeModelId={activeModelId} onCollapse={() => setActivePanel(null)} policies={policies} onWriteToTerminal={onWriteToTerminalAndShow} fileStructure={fileStructure} />}
                                          {activePanel === Panel.EXTENSIONS && <ExtensionsPane installedExtensions={installedExtensions} onInstall={(ext) => setInstalledExtensions([...installedExtensions, ext])} onUninstall={(id) => setInstalledExtensions(installedExtensions.filter(e => e.id !== id))} onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.TEAM && <CollaborationSidebarPane isLive={isLiveSession} onStartSession={() => { setIsLiveSession(true); handleToggleLiveChat(); }} onStopSession={() => setIsLiveSession(false)} onInvite={() => setIsInviteModalOpen(true)} teamMembers={teamMembers} currentUser={currentUser} onCollapse={() => setActivePanel(null)} inviteDockLocation={inviteDockLocation} onMoveInvite={() => setInviteDockLocation(prev => prev === 'header' ? 'sidebar' : 'header')} onPopOut={handlePopOutTeamChannel} agendaItems={agendaItems} onAddAgendaItem={handleAddAgendaItem} onToggleAgendaItem={handleToggleAgendaItem} onDeleteAgendaItem={handleDeleteAgendaItem} onInviteSent={handleInviteSent} />}
                                          {activePanel === Panel.INTEGRATIONS && <IntegrationsPane githubToken={githubToken} onConnectGithub={() => setIsSaveToGithubOpen(true)} onDisconnectGithub={() => { setGithubToken(null); localStorage.removeItem('sai_github_token'); }} onDeployNetlify={() => setIsNetlifyDeployOpen(true)} onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.AI_MARKETPLACE && <ModelMarketplace models={AI_MODELS_DATA} activeModelId={activeModelId} apiKeys={apiKeys} onSetActiveModel={setActiveModelId} onSaveApiKey={(id, key) => setApiKeys(prev => ({ ...prev, [id]: key }))} onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.PERSONAS && <PersonasPane personas={[...MOCK_PERSONAS, ...customPersonas]} activePersona={activePersona} onSelectPersona={setActivePersona} onCreatePersona={() => setIsCreatePersonaOpen(true)} onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.ML_STUDIO && <MlStudioPane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} />}
                                          {activePanel === Panel.RECORDER && <RecorderPane recordings={recordings} onDeleteRecording={handleDeleteRecording} onCollapse={() => setActivePanel(null)} onOpenRecorder={() => setIsScreenRecorderOpen(true)} />}
                                          {activePanel === Panel.SETTINGS && <SettingsPane onCollapse={() => setActivePanel(null)} design={design} onDesignChange={setDesign} themeName={theme} onThemeChange={setTheme} apiKeys={apiKeys} onSaveApiKey={(id, key) => setApiKeys(prev => ({ ...prev, [id]: key }))} mcpServers={mcpServers} onToggleMcp={handleToggleMcp} onOpenBilling={() => setIsPaymentModalOpen(true)} currentPlan={currentUser.plan} />}
                                          {activePanel === Panel.HELP && <HelpPane onCollapse={() => setActivePanel(null)} />}
                                          {activePanel === Panel.DEBUG && <DebugPane onCollapse={() => setActivePanel(null)} onRun={onRunInTerminal} activeFile={activeFile ? activeFile.node : null} fileStructure={fileStructure} terminalHistory={terminalHistory} activeModelId={activeModelId} />}
                                          {activePanel === Panel.TESTING && <TestingPane onCollapse={() => setActivePanel(null)} fileStructure={fileStructure} setFileStructure={setFileStructure} onRunTest={onRunInTerminal} onWriteToTerminal={(text) => onWriteToTerminalAndShow(text)} securityIssues={securityIssues} policies={policies} onGoToFile={handleGoToFile} activeExplorerFile={activeFile} />}
                                          {activePanel === Panel.PREVIEW && <PreviewPane onCollapse={() => setActivePanel(null)} fileStructure={fileStructure} />}
                                          {activePanel === Panel.API_STUDIO && <ApiStudioPane onCollapse={() => setActivePanel(null)} activeModelId={activeModelId} onSaveFile={handleFileUpdateInState} onRunInTerminal={onRunInTerminal} onPanelChange={setActivePanel} />}
                                          </Suspense>
                                      </div>
                                      {!isMobile && (
                                          <div 
                                              onMouseDown={startResizingDrawer} 
                                              className="w-2 cursor-col-resize group z-30 flex-shrink-0 flex items-center justify-center"
                                              title="Resize Panel"
                                          >
                                              <div className={`h-full w-px bg-white/10 group-hover:bg-cyan-500/50 transition-colors duration-200 ${isResizingDrawer ? 'bg-cyan-500 w-0.5' : ''}`} />
                                          </div>
                                      )}
                                  </>
                              )}

                              <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-background)] relative h-full">
                                  <EditorPane 
                                      ref={editorRef}
                                      tabGroups={tabGroups}
                                      focusedGroupId={focusedGroupId}
                                      onSelectTab={(gid, tid) => {
                                      setFocusedGroupId(gid);
                                      setTabGroups(prev => prev.map(g => g.id === gid ? { ...g, activeTabIndex: tid } : g));
                                      }}
                                      onCloseTab={handleCloseTab}
                                      onFileUpdate={handleFileUpdateInState}
                                      onToggleGroupCollapse={(groupId) => {
                                          setTabGroups(prev => prev.map(g => g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g));
                                      }}
                                      onCreateGroup={() => {
                                          const newGroup: EditorTabGroup = { id: Date.now().toString(), tabs: [], activeTabIndex: 0, isCollapsed: false };
                                          setTabGroups(prev => [...prev, newGroup]);
                                          setFocusedGroupId(newGroup.id);
                                      }}
                                      onUndo={() => {}}
                                      onRedo={() => {}}
                                      appEvents={[]}
                                      onClearEvents={() => {}}
                                      onGoToFile={() => {}}
                                      onOpenChat={() => setIsChatOpen(true)}
                                      onOpenSettings={() => setActivePanel(Panel.SETTINGS)}
                                      onStartDebugging={() => setActivePanel(Panel.DEBUG)}
                                      onCloneRepo={() => setIsCloneRepoModalOpen(true)}
                                      onChangePanel={setActivePanel}
                                      onNewFile={handleNewFile}
                                      onNewFolder={handleNewFolder}
                                      onDeleteFile={handleDeleteFile}
                                      fontSize={'14'}
                                      wordWrap={'off'}
                                      keymap={keymap}
                                      vimMode={vimMode}
                                      isMac={isMac}
                                      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                      collaborationState={{}}
                                      teamMembers={teamMembers}
                                      currentUser={currentUser}
                                      fileStructure={fileStructure}
                                      setFileStructure={setFileStructure}
                                      canEdit={true}
                                      terminalHeight={terminalHeight}
                                      onTerminalResize={setTerminalHeight}
                                      policies={policies}
                                      securityIssues={securityIssues}
                                      installedExtensions={installedExtensions}
                                      onGetSuggestions={() => {}}
                                      onClearProblems={() => {}}
                                      onValidateCommand={validateCommand}
                                      diffData={diffData}
                                      onCloseDiff={() => setDiffData(null)}
                                      onReturnToSetup={() => {}}
                                      recents={[]}
                                      onTerminalOutput={handleTerminalOutput}
                                      onCloudAuth={handleCloudAuth}
                                      onAIAppGen={handleAiIntentRequest}
                                      onOpenDocs={() => setActivePanel(Panel.DOCUMENT)}
                                      onOpenRecorder={() => setActivePanel(Panel.RECORDER)}
                                      comments={comments}
                                      onOpenCommentThread={handleOpenCommentThread}
                                      gitStatus={gitStatus}
                                      onSetStagedCommitMessage={setStagedCommitMessage}
                                      onGitPush={() => setIsSaveToGithubOpen(true)}
                                      onCwdChange={handleCwdChange}
                                      // Correctly pass activeModelId to EditorPane
                                      activeModelId={activeModelId}
                                      onRestrictedClick={(feature) => { setUpgradeFeatureName(feature); setIsUpgradeModalOpen(true); }}
                                  />
                                  {isDeploymentCenterOpen && (
                                      <div className="absolute inset-0 z-50 animate-fade-in backdrop-blur-xl">
                                          <Suspense fallback={<PaneLoader />}>
                                          <DeploymentCenter onClose={() => setIsDeploymentCenterOpen(false)} authenticatedProviders={authenticatedProviders} fileStructure={fileStructure} onRunInTerminal={onRunInTerminal} activeModelId={activeModelId}/>
                                          </Suspense>
                                      </div>
                                  )}
                              </div>

                              {isChatOpen && (
                              <>
                                  {!isMobile && (
                                      <div 
                                          onMouseDown={startResizingChat} 
                                          className="w-2 cursor-col-resize group z-30 flex-shrink-0 flex items-center justify-center"
                                      >
                                          <div className={`h-full w-px bg-white/10 group-hover:bg-cyan-500/50 transition-colors duration-200 ${isResizingChat ? 'bg-cyan-500 w-0.5' : ''}`} />
                                      </div>
                                  )}
                                  
                                  {isMobile && (
                                      <div 
                                          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] animate-fade-in" 
                                          onClick={() => setIsChatOpen(false)} 
                                      />
                                  )}

                                  <div 
                                      className={`transition-all z-[200] bg-[var(--color-background)]/95 backdrop-blur-xl overflow-hidden shadow-2xl relative
                                          ${isMobile 
                                              ? 'fixed inset-0 top-14 animate-slide-in-right' 
                                              : `flex-shrink-0 border-l border-white/5 ${isResizingChat ? 'border-[var(--color-accent)]' : ''}`
                                          }`
                                      }
                                      style={{ width: isMobile ? '100%' : `${chatWidth}px` }}
                                  >
                                    <ChatPanel 
                                      activeModelId={activeModelId} 
                                      activePersona={activePersona} 
                                      session={activeSession} 
                                      allSessions={sessions}
                                      onUpdateSession={handleUpdateSession} 
                                      onNewChat={handleNewChat}
                                      onSwitchChat={handleSwitchChat}
                                      onDeleteSession={handleDeleteChat}
                                      onCollapse={() => setIsChatOpen(false)} 
                                      apiKeys={apiKeys} 
                                      currentUser={currentUser}
                                      onModelChange={setActiveModelId}
                                      initialPrompt={chatInitialPrompt}
                                      onClearInitialPrompt={() => setChatInitialPrompt(undefined)}
                                      initialMode={chatInitialMode}
                                      onClearInitialMode={() => setChatInitialMode(undefined)}
                                      onAppGeneration={handleAppGeneration}
                                      onInsertCodeIntoEditor={handleInsertCodeIntoEditor}
                                      onOpenPreview={() => setActivePanel(Panel.PREVIEW)}
                                      onDeployRequest={() => setIsDeploymentCenterOpen(true)}
                                    />
                                  </div>
                              </>
                            )}
                          </>
                      )}
                  </div>
              )}
          </>
        )}
      </div>

      <Suspense fallback={null}>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} onAskOracle={(query) => { setIsChatOpen(true); setChatInitialPrompt(query); }} />
      {currentUser && <OnboardingModal isOpen={isOnboardingOpen} onClose={handleOnboardingComplete} design={design} onDesignChange={setDesign} currentTheme={theme} onThemeChange={setTheme} keymap={keymap} onKeymapChange={setKeymap} vimMode={vimMode} onToggleVimMode={() => setVimMode(!vimMode)} />}
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onInviteSent={handleInviteSent} />
      <SaveToGithubModal isOpen={isSaveToGithubOpen} onClose={() => setIsSaveToGithubOpen(false)} fileStructure={fileStructure} token={githubToken} onSetToken={setGithubToken} />
      <AiSuggestionModal isOpen={isAiSuggestionOpen} onClose={() => setIsAiSuggestionOpen(false)} activeFileContent={activeFile?.node.content} activeFileName={activeFile?.node.name} activeModelId={activeModelId} />
      <FileTypeModal isOpen={isFileTypeModalOpen} onClose={() => setIsFileTypeModalOpen(false)} onSelect={handleNewDocument} />
      <BuildPreviewModal isOpen={isBuildPreviewOpen} onClose={() => setIsBuildPreviewOpen(false)} onRunBuild={handleRunBuild} onOpenGit={() => setActivePanel(Panel.SOURCE_CONTROL)} onOpenDeploy={() => setIsDeploymentCenterOpen(true)} activeFile={activeFile ? activeFile.node : null} />
      <CreatePersonaModal isOpen={isCreatePersonaOpen} onClose={() => setIsCreatePersonaOpen(false)} onCreate={(p) => setCustomPersonas(prev => [...prev, { ...p, id: `custom-${Date.now()}` }])} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} currentUser={currentUser!} onUpgradeSuccess={handleUpgradeSuccess} />
      <SwitchProjectModal isOpen={isSwitchProjectOpen} onClose={() => setIsSwitchProjectOpen(false)} onSelect={(name) => {}} currentProjectName={fileStructure.name} />
      {currentUser && <IdentityDashboardModal isOpen={isIdentityDashboardOpen} onClose={() => setIsIdentityDashboardOpen(false)} user={currentUser} initialTab={identityInitialTab} />}
      <CreateProjectModal isOpen={isCreateProjectOpen} onClose={() => setIsCreateProjectOpen(false)} onSubmit={handleCreateProject} teamMembers={teamMembers} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={() => { setIsUpgradeModalOpen(false); setIsPaymentModalOpen(true); }} featureName={upgradeFeatureName} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <VoiceCommandModal isOpen={isVoiceCommandOpen} onClose={() => setIsVoiceCommandOpen(false)} onCommand={(cmd) => { onRunInTerminal(`sai synth "${cmd}"`); }}/>
      <ScreenRecorderModal isOpen={isScreenRecorderOpen} onClose={() => setIsScreenRecorderOpen(false)} onSave={handleSaveRecording} />
      <CloneRepoModal isOpen={isCloneRepoModalOpen} onClose={() => setIsCloneRepoModalOpen(false)} onClone={(url) => { onRunInTerminal(`git clone ${url}`); }} />
      <NetlifyDeployModal isOpen={isNetlifyDeployOpen} onClose={() => setIsNetlifyDeployOpen(false)} projectName={fileStructure.name} />
      <ConnectCloudModal isOpen={isConnectCloudModalOpen} onClose={() => setIsConnectCloudModalOpen(false)} providerName={activeProviderForAuth || 'Cloud'} onConnect={handleCloudConnectSuccess} />
      {activeCommentThread && currentUser && (
        <CommentThreadModal
          isOpen={!!activeCommentThread}
          onClose={() => setActiveCommentThread(null)}
          filePath={activeCommentThread.filePath}
          lineNumber={activeCommentThread.lineNumber}
          thread={comments[activeCommentThread.filePath]?.filter(c => c.lineNumber === activeCommentThread.lineNumber) || []}
          onAddComment={(text) => handleAddComment(activeCommentThread.filePath, activeCommentThread.lineNumber, text)}
          onSynthesizeTask={handleSynthesizeTask}
          currentUser={currentUser}
        />
      )}
      {/* Mounted MicaAssistant - Only on landing page */}
      {!currentUser && <MicaAssistant />}
      </Suspense>
    </div>
  );
};

export default CloudStudio;
