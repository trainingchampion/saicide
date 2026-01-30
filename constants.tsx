
import React from 'react';
import {
  FileText,
  Box,
  ShieldCheck,
  Rocket,
  Sparkles,
  Users,
  Plug,
  Container,
  LayoutGrid,
  BrainCircuit,
  Settings,
  Clapperboard,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Hammer,
  Github,
  ChevronsLeft,
  Folder,
  FileCode,
  FileJson,
  History,
  Download,
  Upload,
  Youtube,
  Instagram,
  Facebook,
  MessageSquare,
  Clock,
  Activity,
  UserPlus,
  CheckCircle,
  Brain,
  Shield,
  Video, 
  Image as ImageIcon,
  Mic,
  Music,
  ListCollapse,
  HelpCircle,
  File,
  Code2,
  Table,
  Hash,
  Terminal,
  Slack,
  Database,
  Globe,
  ExternalLink,
  Wand2,
  GitBranch,
  Binary,
  Coffee,
  Workflow,
  Cpu,
  Zap,
  Lightbulb,
} from "lucide-react";
import { FileNode, SecurityIssue, Severity, Deployment, CloudProvider, DeploymentStatus, Panel, AIModel, TeamMember, Project, ProjectStatus, SecurityPolicy, ComplianceStandard, RecentActivityEvent, Extension, AIPersona, Integration, ExternalAgent, LLMProviderConfig, ComplianceControl, Commit, MCPServer, RecentItem, Task, AgendaItem, PromptTemplate } from './types';

export const ICONS = {
  NEW_FILE: <FilePlus size={18} />,
  NEW_FOLDER: <FolderPlus size={18} />,
  REFRESH: <RefreshCw size={18} />,
  BUILD: <Hammer size={18} />,
  GITHUB: <Github size={18} />,
  COLLAPSE_ALL: <ListCollapse size={18} />,
  COLLAPSE_LEFT: <ChevronsLeft size={18} />,
  FOLDER: <Folder size={16} className="text-blue-400" />,
  TS_FILE: <FileCode size={16} className="text-blue-300" />,
  JS_FILE: <FileCode size={16} className="text-yellow-300" />,
  JSON_FILE: <FileJson size={16} className="text-yellow-500" />,
  PYTHON_FILE: <Code2 size={16} className="text-blue-500" />,
  YAML_FILE: <Table size={16} className="text-purple-400" />,
  HTML_FILE: <Code2 size={16} className="text-orange-500" />,
  CSS_FILE: <Code2 size={16} className="text-blue-400" />,
  DOCKERFILE: <Container size={16} className="text-blue-500" />,
  DEFAULT_FILE: <File size={16} className="text-gray-400" />,
  HISTORY: <History size={18} />,
  DOWNLOAD: <Download size={14} />,
  UPLOAD: <Upload size={18} />,
  YOUTUBE: <Youtube size={14} />,
  TIKTOK: <span className="font-bold text-xs">TikTok</span>,
  INSTAGRAM: <Instagram size={14} />,
  FACEBOOK: <Facebook size={14} />,
  MESSAGE_SQUARE: <MessageSquare size={14} />,
  DEPLOYMENT: <Rocket size={14} />,
  GIT_COMMIT: <Rocket size={14} />, 
  CLOCK: <Clock size={14} />,
  ACTIVITY: <Activity size={14} />,
  USERS: <Users size={14} />,
  USER_PLUS: <UserPlus size={14} />,
  SHIELD: <Shield size={14} />,
  CHECK_CIRCLE: <CheckCircle size={14} />,
  BRAIN: <Brain size={18} />,
  GOOGLE: <span className="font-bold">G</span>,
  HELP: <HelpCircle size={18} />,
  BUILDER: <Wand2 size={16} className="text-cyan-400" />
};

export const MOCK_RECENTS: RecentItem[] = [
    { name: 'hyper-commerce-cloud', path: '~/workspaces/hcc', status: 'main', lastOpened: '3 hours ago', icon: <Cpu size={18} />, type: 'workspace' },
    { name: 'visionary-nexus-ai', path: '~/workspaces/vn-ai', status: 'feat/new-model', lastOpened: '1 day ago', icon: <Cpu size={18} />, type: 'workspace' },
    { name: 'auth_service.ts', path: '~/workspaces/hcc/src/services', status: 'main', lastOpened: '25 minutes ago', icon: <FileCode size={18} />, type: 'file' },
];

export const INITIAL_TASKS: Task[] = [
    { id: '1', title: 'Implement Auth Flow', tag: 'Feature', assignee: 'AC', status: 'done', commentsCount: 2, attachmentsCount: 1, dueDate: 'Oct 24' },
    { id: '2', title: 'Fix CSS Grid on Mobile', tag: 'Bug', assignee: 'MR', status: 'in-progress', commentsCount: 5 },
    { id: '3', title: 'Optimize Database Queries', tag: 'Refactor', assignee: 'SJ', status: 'todo' },
    { id: '4', title: 'Update Landing Page Hero', tag: 'Design', status: 'review', attachmentsCount: 3, dueDate: 'Tomorrow' },
];

export const INITIAL_AGENDA_ITEMS: AgendaItem[] = [
    { id: '1', text: 'Review Code Changes', completed: false },
    { id: '2', text: 'Deploy to Staging', completed: false }
];

export const FILE_TYPES = [
    { label: 'C', extension: 'c', description: 'C source file', icon: <Binary size={14} className="text-purple-400" /> },
    { label: 'C#', extension: 'cs', description: 'C# source file', icon: <Hash size={14} className="text-green-400" /> },
    { label: 'CSS', extension: 'css', description: 'Cascading Style Sheets', icon: <Code2 size={14} className="text-blue-400" /> },
    { label: 'Dockerfile', extension: '', filename: 'Dockerfile', description: 'Docker Configuration', icon: <Container size={14} className="text-blue-500" /> },
    { label: 'Go', extension: 'go', description: 'Go Source', icon: <Box size={14} className="text-cyan-400" /> },
    { label: 'HTML', extension: 'html', description: 'HyperText Markup', icon: <Code2 size={14} className="text-orange-500" /> },
    { label: 'Java', extension: 'java', description: 'Java source file', icon: <Coffee size={14} className="text-red-400" /> },
    { label: 'JavaScript', extension: 'js', description: 'JavaScript File', icon: <FileCode size={14} className="text-yellow-300" /> },
    { label: 'JSON', extension: 'json', description: 'JSON Data', icon: <FileJson size={14} className="text-yellow-500" /> },
    { label: 'Markdown', extension: 'md', description: 'Documentation', icon: <FileText size={14} className="text-gray-400" /> },
    { label: 'Python', extension: 'py', description: 'Python Script', icon: <Code2 size={14} className="text-blue-500" /> },
    { label: 'Rust', extension: 'rs', description: 'Rust Source', icon: <Settings size={14} className="text-orange-400" /> },
    { label: 'TypeScript', extension: 'ts', description: 'Typed JavaScript', icon: <FileCode size={14} className="text-blue-300" /> },
    { label: 'TypeScript React', extension: 'tsx', description: 'React Components', icon: <FileCode size={14} className="text-blue-300" /> },
    { label: 'Terraform', extension: 'tf', description: 'Infrastructure as Code', icon: <Box size={14} className="text-purple-400" /> },
];

export const MOCK_FILE_STRUCTURE: FileNode = {
  name: 'alphabet-explorer',
  type: 'folder',
  children: [
    {
      name: 'index.html',
      type: 'file',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alphabet Explorer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="game-container">
        <h1>Alphabet Explorer</h1>
        <div id="letter-display">A</div>
        <div id="feedback">Press the correct key!</div>
        <div id="score">Score: 0</div>
    </div>
    <script src="app.js"></script>
</body>
</html>`
    },
    {
      name: 'styles.css',
      type: 'file',
      content: `body {
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f8ff;
    color: #333;
}

#game-container {
    text-align: center;
}

#letter-display {
    font-size: 10rem;
    font-weight: bold;
    color: #4682b4;
    margin: 2rem;
}

#feedback {
    font-size: 1.5rem;
    height: 2rem;
    color: #555;
}

#score {
    font-size: 1.2rem;
    margin-top: 2rem;
}`
    },
    {
      name: 'app.js',
      type: 'file',
      content: `// Alphabet Explorer Game Logic
// TODO: Implement letter generation, keyboard input handling,
// scoring, TTS, and difficulty modes.

console.log('Alphabet Explorer script loaded!');`
    },
    {
      name: 'README.md',
      type: 'file',
      content: `# Alphabet Explorer

Alphabet Explorer is a playful, interactive letter-recognition game designed for early learners. It features Text-to-Speech (TTS) integration to help children associate sounds with symbols, multiple difficulty modes, and an engaging visual feedback system using CSS animations.`
    }
  ]
};

export const MOCK_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt1',
    title: 'Quantum CRM Dashboard',
    category: 'Dashboards',
    description: 'A high-frequency trading style CRM with real-time websocket updates and holographic data visualization.',
    prompt: 'Synthesize a React-based CRM dashboard with a dark "Cyber-Executive" aesthetic. Include a real-time candlestick chart for sales velocity, a holographic contact grid, and a command-line interface for quick data entry. Use Tailwind CSS for glassmorphism effects.',
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
    author: { name: 'Nexus Architect', avatar: 'https://i.pravatar.cc/150?u=nexus' },
    stats: { views: '45K', likes: '3.2K' },
    price: 'Free'
  },
  {
    id: 'pt2',
    title: 'Nebula Chat Interface',
    category: 'Apps',
    description: 'A futuristic, fluid chat interface designed for LLM interactions with streaming typography.',
    prompt: 'Create a "Nebula" chat interface. Key features: Floating message bubbles with blur effects, a "thinking" particle animation for the AI, and a sidebar that collapses into a neural network graph. The color palette should be deep purple and neon blue.',
    previewImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
    author: { name: 'Aether Design', avatar: 'https://i.pravatar.cc/150?u=aether' },
    stats: { views: '32K', likes: '1.8K' },
    price: 'Free'
  },
  {
    id: 'pt3',
    title: 'Orbital Analytics Core',
    category: 'Cloud/API',
    description: 'Serverless backend template for processing high-volume telemetry data with edge caching.',
    prompt: 'Generate a serverless architecture code plan for "Orbital Analytics". Use Node.js for Lambda functions, DynamoDB for hot storage, and S3 for cold archives. Include a Terraform setup that defines a global CDN distribution.',
    previewImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    author: { name: 'DevOps Prime', avatar: 'https://i.pravatar.cc/150?u=devops' },
    stats: { views: '12K', likes: '900' },
    price: '1 Credit'
  },
  {
    id: 'pt4',
    title: 'Neon Snake Retro',
    category: 'Games',
    description: 'Classic snake game with a futuristic vaporwave aesthetic and synthwave soundtrack.',
    prompt: 'Create a classic Snake game using HTML5 Canvas and JavaScript. Use a neon vaporwave color palette (hot pink, cyan, dark purple). Include a scoring system, high-score persistence in localStorage, and increasing difficulty speeds.',
    previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    author: { name: 'Arcade Master', avatar: 'https://i.pravatar.cc/150?u=arcade' },
    stats: { views: '8.4K', likes: '942' },
    price: 'Free'
  },
  {
    id: 'pt5',
    title: 'Holographic Portfolio',
    category: 'Landing Pages',
    description: '3D-enabled portfolio site using Three.js elements for a truly immersive experience.',
    prompt: 'Synthesize a personal portfolio site that treats projects as floating 3D cards in a void. Use React Three Fiber for the 3D elements. The background should be a subtle starfield that reacts to mouse movement.',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
    author: { name: 'Sarah Studio', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    stats: { views: '22K', likes: '3.1K' },
    price: 'Free'
  },
  {
    id: 'pt6',
    title: 'Defi Crypto Exchange',
    category: 'Apps',
    description: 'Secure, high-speed interface for a decentralized exchange with wallet connection.',
    prompt: 'Build a frontend scaffold for a DeFi exchange (DEX). Include a "Swap" card with token selection modals, a slippage settings menu, and a "Connect Wallet" button mock. Use a dark, high-contrast finance aesthetic.',
    previewImage: 'https://images.unsplash.com/photo-1621504450168-b8c437542052?q=80&w=600&auto=format&fit=crop',
    author: { name: 'Block Chain', avatar: 'https://i.pravatar.cc/150?u=block' },
    stats: { views: '18K', likes: '1.5K' },
    price: '2 Credits'
  }
];

// Add more templates to fill the grid
for (let i = 7; i <= 20; i++) {
  const cats: Array<PromptTemplate['category']> = ['Apps', 'Games', 'Landing Pages', 'Dashboards', 'Cloud/API'];
  const cat = cats[i % 5];
  MOCK_PROMPT_TEMPLATES.push({
    id: `pt${i}`,
    title: `Neural Template ${i}`,
    category: cat,
    description: `High-fidelity neural synthesis seed for ${cat} development. Pre-optimized for Sai engine.`,
    prompt: `Generate a robust ${cat} implementation focused on scalability and modern best practices...`,
    previewImage: `https://picsum.photos/seed/sai${i}/600/400`,
    author: { name: 'Community Dev', avatar: `https://i.pravatar.cc/150?u=${i}` },
    stats: { views: `${Math.floor(Math.random() * 20)}K`, likes: `${Math.floor(Math.random() * 1000)}` },
    price: i % 12 === 0 ? '1 Credit' : 'Free'
  });
}

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Chen', initials: 'AC', role: 'Full Stack', status: 'online', email: 'alex@sai.sh', password: 'password123', plan: 'Hobby', hasAcceptedInvite: true, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Sarah Jones', initials: 'SJ', role: 'DevOps', status: 'online', email: 'sarah@sai.sh', password: 'password123', plan: 'Enterprise', hasAcceptedInvite: true, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Mike Ross', initials: 'MR', role: 'Frontend', status: 'away', email: 'mike@sai.sh', password: 'password123', plan: 'Hobby', hasAcceptedInvite: false, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: '4', name: 'Emily Blunt', initials: 'EB', role: 'Product', status: 'online', email: 'emily@sai.sh', password: 'password123', plan: 'Pro', hasAcceptedInvite: false, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' }
];

export const INITIAL_POLICIES: SecurityPolicy[] = [
    { id: 'no-public-s3', title: 'No Public S3 Buckets', severity: 'critical', description: 'S3 buckets should not have public read/write access.', enabled: true, violationsCount: 0, issueTypes: [Severity.CRITICAL] },
    { id: 'iam-root', title: 'No Root IAM User', severity: 'high', description: 'Avoid using the root account for daily tasks.', enabled: true, violationsCount: 0, issueTypes: [Severity.HIGH] },
    { id: 'port-22', title: 'Restricted SSH Access', severity: 'medium', description: 'Port 22 should not be open to 0.0.0.0/0.', enabled: false, violationsCount: 0, issueTypes: [Severity.MEDIUM] },
    { id: 'resource-tags', title: 'Mandatory Tagging', severity: 'low', description: 'All resources must have a "CostCenter" tag.', enabled: true, violationsCount: 0, issueTypes: [Severity.LOW] },
    { id: 'encrypt-rds', title: 'Encrypt RDS Instances', severity: 'high', description: 'RDS instances must have storage encryption enabled.', enabled: true, violationsCount: 0, issueTypes: [Severity.HIGH] }
];

export const INITIAL_COMPLIANCE_STANDARDS: ComplianceStandard[] = [
    { id: 'soc2', standard: 'SOC 2 Type II', description: 'Security, Availability, Processing Integrity, Confidentiality, and Privacy.', status: 'pass' },
    { id: 'hipaa', standard: 'HIPAA', description: 'Health Insurance Portability and Accountability Act.', status: 'pass' },
    { id: 'gdpr', standard: 'GDPR', description: 'General Data Protection Regulation.', status: 'pass' },
    { id: 'pci', standard: 'PCI DSS', description: 'Payment Card Industry Data Security Standard.', status: 'pass' }
];

export const INFRASTRUCTURE_SECURITY_CONTROLS: ComplianceControl[] = [
    { id: 'c1', control: 'VPC Flow Logs Enabled', description: 'Ensure VPC Flow Logs are enabled for all VPCs.', status: 'pass' },
    { id: 'c2', control: 'MFA on Root Account', description: 'Multi-Factor Authentication enabled on root account.', status: 'pass' },
    { id: 'c3', control: 'EBS Volumes Encrypted', description: 'Ensure all EBS volumes attached to EC2 instances are encrypted.', status: 'pass' },
    { id: 'c4', control: 'S3 Bucket Versioning', description: 'Versioning enabled on all S3 buckets.', status: 'pass' },
    { id: 'c5', control: 'RDS Multi-AZ', description: 'Production databases should be Multi-AZ.', status: 'pass' }
];

// FIXED: Issues removed to make Integrity 100% and aware.
export const MOCK_SECURITY_ISSUES: SecurityIssue[] = [];

export const AI_MODELS_DATA: AIModel[] = [
  { id: 'google-opal', name: 'Opal (App Engine)', provider: 'Google', description: 'High-fidelity synthesis engine for comprehensive application building.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google', description: 'High-intelligence reasoning and multimodal core.' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', description: 'Ultra-fast multimodal model for rapid iterations.' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Balanced intelligence and speed, expert in coding.' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Omni model for text, audio, and high-level logic.' },
];

export const IMAGE_MODELS_DATA: AIModel[] = [
    { id: 'gemini-2.5-flash-image', name: 'Gemini Flash Image', provider: 'Google', description: 'Rapid image generation.' },
    { id: 'imagen-4.0-generate-001', name: 'Imagen 3', provider: 'Google', description: 'High fidelity image generation.' },
];

export const VIDEO_MODELS_DATA: AIModel[] = [
    { id: 'flow-1.0-generate-preview', name: 'Google Flow', provider: 'Google', description: 'State-of-the-art cinematic video generation.' },
    { id: 'veo-3.1-fast-generate-preview', name: 'Veo Fast', provider: 'Google', description: 'Rapid video generation preview.' },
    { id: 'veo-3.1-generate-preview', name: 'Veo Pro', provider: 'Google', description: 'High quality video generation.' },
];

export const AUDIO_MODELS_DATA: AIModel[] = [
    { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini TTS', provider: 'Google', description: 'Natural sounding speech.' },
];

export const MOCK_VSCODE_EXTENSIONS: Extension[] = [];

export const FALLBACK_EXTENSIONS: Extension[] = [
  { id: 'ms-python.python', name: 'Python', publisher: 'Microsoft', description: 'IntelliSense, linting, debugging for Python.', iconUrl: 'https://raw.githubusercontent.com/microsoft/vscode-python/main/logo.png', downloads: '102M', rating: 4.8, category: 'Programming Languages' },
  { id: 'esbenp.prettier-vscode', name: 'Prettier - Code formatter', publisher: 'Prettier', description: 'Code formatter for consistent style.', iconUrl: 'https://raw.githubusercontent.com/prettier/prettier-vscode/main/images/icon.png', downloads: '45M', rating: 4.5, category: 'Formatters' },
];

export const MOCK_PERSONAS: AIPersona[] = [
  { id: '1', name: 'General Developer', description: 'All-around coding assistant for any task.', category: 'Engineering', systemInstruction: 'You are a highly efficient Full-Stack Developer. Help with code generation, explanations, and general logic. Prioritize clean, modern, and accessible code.' },
  { id: '2', name: 'Senior Cloud Architect', description: 'Expert in system design, IaC, and scalability.', category: 'Infrastructure', systemInstruction: 'You are a Senior Cloud Architect. Focus on scalability, high availability, security best practices, and Infrastructure as Code (Terraform). SCRUTINIZE any architecture for cost and reliability.' },
];

export const MOCK_EXTERNAL_AGENTS: ExternalAgent[] = [
    { id: 'agent-1', name: 'Auto-Fixer Bot', isEnabled: true },
];

export const MOCK_LLM_PROVIDERS: LLMProviderConfig[] = [
    { id: 'provider-1', name: 'Google Gemini', isConfigured: true },
];

export const INTEGRATIONS: Integration[] = [
    { id: 'github', name: 'GitHub', description: 'Sync repositories, pull requests, and actions.', category: 'Source Control', icon: <Github size={20} />, configFields: [{ label: 'Personal Access Token', type: 'password', key: 'token' }] },
];

export const INITIAL_COMMITS: Commit[] = [
    { id: 'c1', message: 'Initial commit', author: 'Alex Chen', date: '3 days ago', branch: 'main', parentIds: [], color: '#4ade80' }
];

export const MOCK_MARKETPLACE_MCP_SERVERS: MCPServer[] = [
    { id: '@modelcontextprotocol/server-memory', name: 'Persistent Memory', status: 'disconnected' },
];

export const MOCK_ACTIVITY = [
    { id: 'act1', icon: <Code2 size={14} className="text-blue-400"/>, text: "Alex committed to 'feat/new-auth'", time: '2m ago' },
    { id: 'act2', icon: <Zap size={14} className="text-purple-400"/>, text: "Sarah deployed 'hyper-commerce'", time: '15m ago' },
    { id: 'act3', icon: <MessageSquare size={14} className="text-green-400"/>, text: "Mike commented on 'UI Bug'", time: '45m ago' },
];

export const INITIAL_DISCUSSIONS = [
    { user: 'alexchen', icon: <Lightbulb size={16} className="text-green-400"/>, title: 'Feature Request: VSCode Theme Sync', time: '2 hours ago' },
    { user: 'sarahjones', icon: <HelpCircle size={16} className="text-purple-400"/>, title: 'How to connect to a private Docker registry?', time: '5 hours ago' }
];
