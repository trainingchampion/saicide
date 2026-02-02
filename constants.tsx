
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

export const RECENT_ITEMS: RecentItem[] = [
    { name: 'hyper-commerce-cloud', path: '~/workspaces/hcc', status: 'main', lastOpened: '3 hours ago', icon: <Cpu size={18} />, type: 'workspace' },
    { name: 'visionary-nexus-ai', path: '~/workspaces/vn-ai', status: 'feat/new-model', lastOpened: '1 day ago', icon: <Cpu size={18} />, type: 'workspace' },
    { name: 'auth_service.ts', path: '~/workspaces/hcc/src/services', status: 'main', lastOpened: '25 minutes ago', icon: <FileCode size={18} />, type: 'file' },
];
export const MOCK_RECENTS = RECENT_ITEMS; // Backward compat

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
    { label: 'YAML', extension: 'yaml', description: 'YAML Configuration', icon: <FileText size={14} className="text-red-400" /> },
    { label: 'XML', extension: 'xml', description: 'XML Document', icon: <Code2 size={14} className="text-orange-400" /> },
    { label: 'SQL', extension: 'sql', description: 'SQL Database Script', icon: <Database size={14} className="text-blue-400" /> },
    { label: 'Shell Script', extension: 'sh', description: 'Bash/Shell Script', icon: <Terminal size={14} className="text-green-400" /> },
    { label: 'PowerShell', extension: 'ps1', description: 'PowerShell Script', icon: <Terminal size={14} className="text-blue-500" /> },
    { label: 'Ruby', extension: 'rb', description: 'Ruby Source', icon: <Code2 size={14} className="text-red-500" /> },
    { label: 'PHP', extension: 'php', description: 'PHP Script', icon: <Code2 size={14} className="text-purple-500" /> },
    { label: 'Swift', extension: 'swift', description: 'Swift Source', icon: <Code2 size={14} className="text-orange-500" /> },
    { label: 'Kotlin', extension: 'kt', description: 'Kotlin Source', icon: <Code2 size={14} className="text-purple-400" /> },
    { label: 'Scala', extension: 'scala', description: 'Scala Source', icon: <Code2 size={14} className="text-red-400" /> },
    { label: 'SCSS', extension: 'scss', description: 'SCSS Stylesheet', icon: <Code2 size={14} className="text-pink-400" /> },
    { label: 'LESS', extension: 'less', description: 'LESS Stylesheet', icon: <Code2 size={14} className="text-indigo-400" /> },
    { label: 'Plain Text', extension: 'txt', description: 'Plain Text File', icon: <FileText size={14} className="text-gray-400" /> },
    { label: 'Environment', extension: 'env', description: 'Environment Variables', icon: <Settings size={14} className="text-yellow-400" /> },
    { label: 'C++', extension: 'cpp', description: 'C++ Source File', icon: <Binary size={14} className="text-blue-400" /> },
    { label: 'C Header', extension: 'h', description: 'C/C++ Header File', icon: <Binary size={14} className="text-gray-400" /> },
    { label: 'Objective-C', extension: 'm', description: 'Objective-C Source', icon: <Code2 size={14} className="text-blue-300" /> },
    { label: 'Dart', extension: 'dart', description: 'Dart/Flutter Source', icon: <Code2 size={14} className="text-cyan-400" /> },
    { label: 'Lua', extension: 'lua', description: 'Lua Script', icon: <Code2 size={14} className="text-blue-600" /> },
    { label: 'Perl', extension: 'pl', description: 'Perl Script', icon: <Code2 size={14} className="text-purple-300" /> },
    { label: 'R', extension: 'r', description: 'R Statistical Script', icon: <Code2 size={14} className="text-blue-400" /> },
    { label: 'Julia', extension: 'jl', description: 'Julia Source', icon: <Code2 size={14} className="text-purple-500" /> },
    { label: 'Haskell', extension: 'hs', description: 'Haskell Source', icon: <Code2 size={14} className="text-purple-400" /> },
    { label: 'Elixir', extension: 'ex', description: 'Elixir Source', icon: <Code2 size={14} className="text-purple-500" /> },
    { label: 'Erlang', extension: 'erl', description: 'Erlang Source', icon: <Code2 size={14} className="text-red-400" /> },
    { label: 'Clojure', extension: 'clj', description: 'Clojure Source', icon: <Code2 size={14} className="text-green-500" /> },
    { label: 'F#', extension: 'fs', description: 'F# Source', icon: <Code2 size={14} className="text-blue-500" /> },
    { label: 'Vue', extension: 'vue', description: 'Vue.js Component', icon: <FileCode size={14} className="text-green-400" /> },
    { label: 'Svelte', extension: 'svelte', description: 'Svelte Component', icon: <FileCode size={14} className="text-orange-500" /> },
    { label: 'GraphQL', extension: 'graphql', description: 'GraphQL Schema/Query', icon: <Code2 size={14} className="text-pink-500" /> },
    { label: 'Protocol Buffers', extension: 'proto', description: 'Protobuf Definition', icon: <Code2 size={14} className="text-blue-400" /> },
    { label: 'TOML', extension: 'toml', description: 'TOML Configuration', icon: <FileText size={14} className="text-orange-400" /> },
    { label: 'INI', extension: 'ini', description: 'INI Configuration', icon: <FileText size={14} className="text-gray-500" /> },
    { label: 'Makefile', extension: '', filename: 'Makefile', description: 'Build Configuration', icon: <Settings size={14} className="text-green-400" /> },
    { label: 'CMakeLists', extension: '', filename: 'CMakeLists.txt', description: 'CMake Build File', icon: <Settings size={14} className="text-blue-400" /> },
    { label: 'Gradle', extension: 'gradle', description: 'Gradle Build Script', icon: <Settings size={14} className="text-green-500" /> },
    { label: 'Apache Config', extension: 'conf', description: 'Configuration File', icon: <Settings size={14} className="text-red-400" /> },
    { label: 'Nginx Config', extension: '', filename: 'nginx.conf', description: 'Nginx Configuration', icon: <Settings size={14} className="text-green-500" /> },
    { label: 'Docker Compose', extension: '', filename: 'docker-compose.yml', description: 'Docker Compose Config', icon: <Container size={14} className="text-blue-400" /> },
    { label: '.gitignore', extension: '', filename: '.gitignore', description: 'Git Ignore Rules', icon: <GitBranch size={14} className="text-orange-400" /> },
    { label: 'README', extension: '', filename: 'README.md', description: 'Project Documentation', icon: <FileText size={14} className="text-blue-400" /> },
    { label: 'License', extension: '', filename: 'LICENSE', description: 'License File', icon: <Shield size={14} className="text-yellow-400" /> },
    { label: 'Jupyter Notebook', extension: 'ipynb', description: 'Python Notebook', icon: <Code2 size={14} className="text-orange-400" /> },
    { label: 'CSV', extension: 'csv', description: 'Comma Separated Values', icon: <Table size={14} className="text-green-400" /> },
    { label: 'TSV', extension: 'tsv', description: 'Tab Separated Values', icon: <Table size={14} className="text-blue-400" /> },
    { label: 'Log File', extension: 'log', description: 'Log File', icon: <FileText size={14} className="text-gray-500" /> },
    { label: 'Batch Script', extension: 'bat', description: 'Windows Batch File', icon: <Terminal size={14} className="text-gray-400" /> },
    { label: 'Assembly', extension: 'asm', description: 'Assembly Language', icon: <Cpu size={14} className="text-gray-500" /> },
    { label: 'Solidity', extension: 'sol', description: 'Ethereum Smart Contract', icon: <Code2 size={14} className="text-gray-400" /> },
    { label: 'Zig', extension: 'zig', description: 'Zig Source', icon: <Zap size={14} className="text-orange-400" /> },
    { label: 'Nim', extension: 'nim', description: 'Nim Source', icon: <Code2 size={14} className="text-yellow-400" /> },
    { label: 'Crystal', extension: 'cr', description: 'Crystal Source', icon: <Code2 size={14} className="text-gray-300" /> },
    { label: 'V', extension: 'v', description: 'V Language Source', icon: <Code2 size={14} className="text-blue-400" /> },
    { label: 'Prisma', extension: 'prisma', description: 'Prisma Schema', icon: <Database size={14} className="text-teal-400" /> },
    { label: 'Bicep', extension: 'bicep', description: 'Azure Bicep IaC', icon: <Box size={14} className="text-blue-500" /> },
    { label: 'HCL', extension: 'hcl', description: 'HashiCorp Config', icon: <Box size={14} className="text-purple-500" /> },
];

export const SAMPLE_PROJECT: FileNode = {
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

export const PROMPT_TEMPLATES: PromptTemplate[] = [
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
  PROMPT_TEMPLATES.push({
    id: `pt${i}`,
    title: `Template ${i}`,
    category: cat,
    description: `High-quality template for ${cat} development. Optimized for rapid prototyping.`,
    prompt: `Generate a robust ${cat} implementation focused on scalability and modern best practices...`,
    previewImage: `https://picsum.photos/seed/sai${i}/600/400`,
    author: { name: 'Community Dev', avatar: `https://i.pravatar.cc/150?u=${i}` },
    stats: { views: `${Math.floor(Math.random() * 20)}K`, likes: `${Math.floor(Math.random() * 1000)}` },
    price: i % 12 === 0 ? '1 Credit' : 'Free'
  });
}
export const MOCK_PROMPT_TEMPLATES = PROMPT_TEMPLATES; // Backward compat
export const MOCK_FILE_STRUCTURE = SAMPLE_PROJECT; // Backward compat

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Chen', initials: 'AC', role: 'Full Stack', status: 'online', email: 'alex@sai.sh', password: 'password123', plan: 'Hobby', hasAcceptedInvite: true, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Sarah Jones', initials: 'SJ', role: 'DevOps', status: 'online', email: 'sarah@sai.sh', password: 'password123', plan: 'Enterprise', hasAcceptedInvite: true, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Mike Ross', initials: 'MR', role: 'Frontend', status: 'away', email: 'mike@sai.sh', password: 'password123', plan: 'Hobby', hasAcceptedInvite: false, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: '4', name: 'Emily Blunt', initials: 'EB', role: 'Product', status: 'online', email: 'emily@sai.sh', password: 'password123', plan: 'Pro', hasAcceptedInvite: false, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' }
];
export const MOCK_TEAM_MEMBERS = TEAM_MEMBERS; // Backward compat

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

// All issues resolved - integrity maintained
export const SECURITY_ISSUES: SecurityIssue[] = [];
export const MOCK_SECURITY_ISSUES = SECURITY_ISSUES; // Backward compat

export const AI_MODELS_DATA: AIModel[] = [
  // Google Models
  { id: 'google-opal', name: 'Opal (App Engine)', provider: 'Google', description: 'High-fidelity synthesis engine for comprehensive application building.' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', description: 'Most capable reasoning model with 1M context window.' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'Ultra-fast multimodal model for rapid iterations.' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Latest stable Flash model with enhanced speed.' },
  
  // Anthropic Models
  { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', description: 'Most capable Claude model for complex tasks.' },
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', description: 'Balanced intelligence and speed for production.' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Expert in coding with exceptional accuracy.' },
  { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Fast and efficient for quick responses.' },
  
  // OpenAI Models
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', description: 'Latest GPT-4 variant with enhanced reasoning.' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Omni model for text, audio, and vision.' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Lightweight GPT-4o for cost-effective tasks.' },
  { id: 'o3', name: 'o3', provider: 'OpenAI', description: 'Advanced reasoning model for complex problems.' },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'OpenAI', description: 'Efficient reasoning model for everyday use.' },
  { id: 'o4-mini', name: 'o4 Mini', provider: 'OpenAI', description: 'Next-gen mini reasoning model.' },
  
  // xAI Models
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', description: 'Real-time knowledge with X/Twitter integration.' },
  { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xAI', description: 'Efficient Grok model for quick responses.' },
  
  // Meta Models
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', description: 'Latest Llama 4 open-weight model.' },
  { id: 'llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta', description: 'Efficient Llama 4 for diverse tasks.' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Powerful open-source model for production.' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', description: 'Largest Llama model with frontier capabilities.' },
  
  // DeepSeek Models
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'State-of-the-art reasoning with chain-of-thought.' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', description: 'Cost-effective frontier model with 671B params.' },
  { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek', description: 'Specialized for code generation and analysis.' },
  
  // Mistral Models
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'Flagship model with top-tier reasoning.' },
  { id: 'mistral-medium', name: 'Mistral Medium', provider: 'Mistral', description: 'Balanced performance and efficiency.' },
  { id: 'codestral', name: 'Codestral', provider: 'Mistral', description: 'Specialized coding model from Mistral.' },
  { id: 'pixtral-large', name: 'Pixtral Large', provider: 'Mistral', description: 'Multimodal model with vision capabilities.' },
  
  // Cohere Models
  { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', description: 'Enterprise-grade RAG and reasoning.' },
  { id: 'command-r', name: 'Command R', provider: 'Cohere', description: 'Optimized for retrieval-augmented generation.' },
  { id: 'embed-v4', name: 'Embed V4', provider: 'Cohere', description: 'State-of-the-art text embeddings.' },
  
  // AI21 Labs Models
  { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', provider: 'AI21', description: 'Hybrid SSM-Transformer with 256K context.' },
  { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', provider: 'AI21', description: 'Efficient Jamba for cost-effective tasks.' },
  
  // Perplexity Models
  { id: 'sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', description: 'Real-time web search with citations.' },
  { id: 'sonar', name: 'Sonar', provider: 'Perplexity', description: 'Fast online model with web access.' },
  
  // Groq Models (Inference Platform)
  { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B (Groq)', provider: 'Groq', description: 'Ultra-fast inference on LPU hardware.' },
  { id: 'groq-mixtral-8x7b', name: 'Mixtral 8x7B (Groq)', provider: 'Groq', description: 'MoE model with blazing speed on Groq.' },
  
  // Together AI Models
  { id: 'together-qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Together', description: 'Leading open-source model from Alibaba.' },
  { id: 'together-yi-large', name: 'Yi Large', provider: 'Together', description: 'Powerful bilingual model.' },
  
  // Amazon Bedrock Models
  { id: 'amazon-titan-text', name: 'Amazon Titan Text', provider: 'Amazon', description: 'AWS native LLM for enterprise.' },
  { id: 'amazon-nova-pro', name: 'Nova Pro', provider: 'Amazon', description: 'Amazon flagship multimodal model.' },
  
  // Azure OpenAI
  { id: 'azure-gpt-4o', name: 'GPT-4o (Azure)', provider: 'Azure', description: 'Enterprise GPT-4o with Azure compliance.' },
  { id: 'azure-gpt-4-turbo', name: 'GPT-4 Turbo (Azure)', provider: 'Azure', description: 'High-performance GPT-4 on Azure.' },
  
  // Local/Self-Hosted Models
  { id: 'ollama-local', name: 'Ollama (Local)', provider: 'Local', description: 'Run LLMs locally with Ollama.' },
  { id: 'lmstudio-local', name: 'LM Studio (Local)', provider: 'Local', description: 'Local LLM inference with LM Studio.' },
  { id: 'llamacpp-local', name: 'llama.cpp (Local)', provider: 'Local', description: 'Efficient local inference with llama.cpp.' },
  
  // Alibaba Models
  { id: 'qwen-max', name: 'Qwen Max', provider: 'Alibaba', description: 'Flagship Qwen model with 200K context.' },
  { id: 'qwen-turbo', name: 'Qwen Turbo', provider: 'Alibaba', description: 'Fast and efficient Qwen variant.' },
  
  // Other Emerging Models
  { id: 'minimax-abab7', name: 'MiniMax ABAB 7', provider: 'MiniMax', description: 'Leading Chinese language model.' },
  { id: 'kuaishou-kling', name: 'Kling', provider: 'Kuaishou', description: 'Multimodal model from Kuaishou.' },
  { id: 'zhipu-glm4', name: 'GLM-4', provider: 'Zhipu', description: 'Bilingual model with strong reasoning.' },
  { id: 'baichuan-4', name: 'Baichuan 4', provider: 'Baichuan', description: 'Advanced Chinese language understanding.' },
  { id: 'moonshot-kimi', name: 'Kimi', provider: 'Moonshot', description: 'Long-context model with 200K tokens.' },
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
  { id: 'ms-python.python', name: 'Python', publisher: 'Microsoft', description: 'IntelliSense, linting, debugging for Python.', iconUrl: 'https://ms-python.gallerycdn.vsassets.io/extensions/ms-python/python/2024.2.1/1707162393176/Microsoft.VisualStudio.Services.Icons.Default', downloads: '102M', rating: 4.8, category: 'Programming Languages' },
  { id: 'esbenp.prettier-vscode', name: 'Prettier - Code formatter', publisher: 'Prettier', description: 'Code formatter for consistent style.', iconUrl: 'https://esbenp.gallerycdn.vsassets.io/extensions/esbenp/prettier-vscode/10.1.0/1690825686837/Microsoft.VisualStudio.Services.Icons.Default', downloads: '45M', rating: 4.5, category: 'Formatters' },
];

export const AI_PERSONAS: AIPersona[] = [
  // Engineering
  { id: '1', name: 'General Developer', description: 'All-around coding assistant for any task.', category: 'Engineering', systemInstruction: 'You are a highly efficient Full-Stack Developer. Help with code generation, explanations, debugging, and general programming logic. Prioritize clean, modern, readable, and accessible code. Always explain your reasoning.' },
  { id: '2', name: 'Frontend Specialist', description: 'Expert in React, Vue, CSS, and modern UI.', category: 'Engineering', systemInstruction: 'You are a Senior Frontend Engineer specializing in React, Vue, TypeScript, and modern CSS (Tailwind, CSS Grid, Flexbox). Focus on component architecture, state management, performance optimization, and accessibility (WCAG). Write pixel-perfect, responsive code.' },
  { id: '3', name: 'Backend Engineer', description: 'APIs, databases, and server-side logic.', category: 'Engineering', systemInstruction: 'You are a Senior Backend Engineer. Specialize in RESTful APIs, GraphQL, database design (SQL/NoSQL), authentication, caching, and microservices. Prioritize security, scalability, and clean architecture patterns (DDD, CQRS).' },
  { id: '4', name: 'Python Expert', description: 'Python specialist for scripts, APIs, and data.', category: 'Engineering', systemInstruction: 'You are a Python expert. Help with Python scripts, FastAPI/Flask/Django backends, data processing with pandas/numpy, type hints, testing with pytest, and Pythonic best practices. Follow PEP 8 guidelines.' },
  { id: '5', name: 'Rust Developer', description: 'Systems programming with memory safety.', category: 'Engineering', systemInstruction: 'You are a Rust expert. Help with systems programming, memory safety, ownership/borrowing, async Rust, error handling with Result/Option, and performance optimization. Explain lifetime annotations clearly.' },
  { id: '6', name: 'Go Developer', description: 'Concurrent, efficient Go applications.', category: 'Engineering', systemInstruction: 'You are a Go expert. Help with concurrent programming (goroutines, channels), HTTP servers, CLI tools, and idiomatic Go patterns. Prioritize simplicity, readability, and Go conventions.' },
  
  // Infrastructure
  { id: '10', name: 'Senior Cloud Architect', description: 'System design, IaC, and scalability expert.', category: 'Infrastructure', systemInstruction: 'You are a Senior Cloud Architect with expertise in AWS, GCP, and Azure. Focus on scalability, high availability, disaster recovery, cost optimization, and Infrastructure as Code (Terraform, Pulumi). Scrutinize architectures for security and reliability.' },
  { id: '11', name: 'DevOps Engineer', description: 'CI/CD, containers, and automation.', category: 'Infrastructure', systemInstruction: 'You are a DevOps Engineer. Specialize in CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins), Docker, Kubernetes, monitoring (Prometheus, Grafana), and infrastructure automation. Focus on reliability, observability, and deployment best practices.' },
  { id: '12', name: 'Kubernetes Specialist', description: 'Container orchestration and cloud-native apps.', category: 'Infrastructure', systemInstruction: 'You are a Kubernetes expert. Help with deployments, services, ingress, Helm charts, operators, resource management, and troubleshooting. Explain K8s concepts clearly and provide production-ready manifests.' },
  { id: '13', name: 'Database Administrator', description: 'SQL, NoSQL, and database optimization.', category: 'Infrastructure', systemInstruction: 'You are a Database Administrator expert in PostgreSQL, MySQL, MongoDB, Redis, and database design. Help with query optimization, indexing strategies, migrations, replication, and data modeling. Prioritize performance and data integrity.' },
  
  // Security
  { id: '20', name: 'Security Auditor', description: 'Vulnerability analysis and secure coding.', category: 'Security', systemInstruction: 'You are a Security Auditor and Penetration Tester. Analyze code for vulnerabilities (OWASP Top 10), review authentication/authorization implementations, identify injection risks, and recommend secure coding practices. Be thorough and security-paranoid.' },
  { id: '21', name: 'Compliance Expert', description: 'GDPR, SOC2, HIPAA, and regulatory compliance.', category: 'Security', systemInstruction: 'You are a Compliance and Privacy Expert. Help with GDPR, SOC2, HIPAA, PCI-DSS requirements, data handling policies, audit preparation, and privacy-by-design principles. Provide actionable compliance checklists.' },
  
  // Frontend
  { id: '30', name: 'UI/UX Designer', description: 'Design systems, accessibility, and aesthetics.', category: 'Frontend', systemInstruction: 'You are a UI/UX Designer with strong coding skills. Focus on design systems, color theory, typography, spacing, accessibility (WCAG AA/AAA), micro-interactions, and user-centered design. Create beautiful, functional interfaces.' },
  { id: '31', name: 'CSS Wizard', description: 'Advanced CSS, animations, and layouts.', category: 'Frontend', systemInstruction: 'You are a CSS expert. Specialize in complex layouts (Grid, Flexbox), animations, transitions, responsive design, CSS variables, and modern CSS features. Write clean, maintainable stylesheets without unnecessary complexity.' },
  { id: '32', name: 'React Expert', description: 'React hooks, patterns, and performance.', category: 'Frontend', systemInstruction: 'You are a React expert. Specialize in hooks, context, performance optimization (memo, useMemo, useCallback), state management (Zustand, Redux), Server Components, and React 19 features. Write idiomatic, performant React code.' },
  
  // Utility
  { id: '40', name: 'Code Reviewer', description: 'Thorough code review and best practices.', category: 'Utility', systemInstruction: 'You are a meticulous Code Reviewer. Analyze code for bugs, security issues, performance problems, readability, and adherence to best practices. Be constructive but thorough. Suggest specific improvements with examples.' },
  { id: '41', name: 'Documentation Writer', description: 'Clear docs, READMEs, and API references.', category: 'Utility', systemInstruction: 'You are a Technical Writer. Create clear, comprehensive documentation including READMEs, API references, tutorials, and inline code comments. Focus on clarity, examples, and helping developers understand quickly.' },
  { id: '42', name: 'Debugging Detective', description: 'Track down bugs and fix issues.', category: 'Utility', systemInstruction: 'You are a Debugging Specialist. Analyze error messages, stack traces, and code to identify root causes. Think systematically, ask clarifying questions, and provide step-by-step debugging strategies. Explain why bugs occur.' },
  { id: '43', name: 'Refactoring Expert', description: 'Clean code and architecture improvements.', category: 'Utility', systemInstruction: 'You are a Refactoring Expert. Improve code structure, reduce complexity, eliminate duplication, apply design patterns appropriately, and enhance maintainability. Explain the rationale behind each refactoring decision.' },
  { id: '44', name: 'Performance Optimizer', description: 'Speed up apps and reduce resource usage.', category: 'Utility', systemInstruction: 'You are a Performance Optimization Expert. Analyze and improve application performance: load times, memory usage, database queries, algorithm efficiency, and caching strategies. Provide measurable optimization recommendations.' },
  { id: '45', name: 'Test Engineer', description: 'Unit tests, integration tests, and TDD.', category: 'Utility', systemInstruction: 'You are a Test Engineering Expert. Write comprehensive unit tests, integration tests, and E2E tests. Practice TDD, achieve high coverage, use mocking appropriately, and ensure tests are maintainable. Support Jest, Pytest, Go testing, and other frameworks.' },
  
  // Data & AI
  { id: '50', name: 'Data Scientist', description: 'ML, analytics, and data pipelines.', category: 'Data & AI', systemInstruction: 'You are a Data Scientist. Help with machine learning models, data analysis, pandas/numpy, visualization, feature engineering, and statistical methods. Explain concepts clearly and provide working code examples.' },
  { id: '51', name: 'ML Engineer', description: 'Model deployment and MLOps.', category: 'Data & AI', systemInstruction: 'You are a Machine Learning Engineer. Specialize in model training, deployment (TensorFlow Serving, TorchServe), MLOps pipelines, model monitoring, and optimization. Bridge the gap between research and production.' },
  { id: '52', name: 'Prompt Engineer', description: 'LLM prompts and AI integration.', category: 'Data & AI', systemInstruction: 'You are a Prompt Engineering Expert. Design effective prompts for LLMs, implement RAG systems, optimize token usage, handle context windows, and integrate AI APIs. Help build reliable AI-powered applications.' },
  
  // Mobile
  { id: '60', name: 'iOS Developer', description: 'Swift, SwiftUI, and Apple platforms.', category: 'Mobile', systemInstruction: 'You are an iOS Developer expert in Swift, SwiftUI, UIKit, and Apple platform development. Help with app architecture (MVVM, TCA), Core Data, networking, and App Store guidelines. Write modern, Swift-idiomatic code.' },
  { id: '61', name: 'Android Developer', description: 'Kotlin, Jetpack Compose, and Android.', category: 'Mobile', systemInstruction: 'You are an Android Developer expert in Kotlin, Jetpack Compose, and Android architecture components. Help with MVVM, Room, Coroutines, and Google Play guidelines. Write clean, modern Android code.' },
  { id: '62', name: 'React Native Dev', description: 'Cross-platform mobile with React Native.', category: 'Mobile', systemInstruction: 'You are a React Native expert. Help with cross-platform mobile development, native modules, navigation, state management, and performance optimization. Bridge React knowledge to mobile contexts.' },
];

// Keep backward compatibility
export const MOCK_PERSONAS = AI_PERSONAS;

export const EXTERNAL_AGENTS: ExternalAgent[] = [
    // Code Quality Agents
    { id: 'agent-auto-fixer', name: 'Auto-Fixer', isEnabled: true, description: 'Automatically fixes lint errors and code issues' },
    { id: 'agent-code-reviewer', name: 'Code Reviewer', isEnabled: true, description: 'Reviews code changes and suggests improvements' },
    { id: 'agent-refactor', name: 'Refactor Assistant', isEnabled: false, description: 'Suggests refactoring opportunities' },
    { id: 'agent-dead-code', name: 'Dead Code Detector', isEnabled: false, description: 'Finds unused code and imports' },
    { id: 'agent-complexity', name: 'Complexity Analyzer', isEnabled: false, description: 'Identifies overly complex functions' },
    
    // Documentation Agents
    { id: 'agent-doc-generator', name: 'Doc Generator', isEnabled: false, description: 'Generates documentation from code' },
    { id: 'agent-readme', name: 'README Writer', isEnabled: false, description: 'Creates and updates README files' },
    { id: 'agent-changelog', name: 'Changelog Generator', isEnabled: false, description: 'Auto-generates changelogs from commits' },
    { id: 'agent-api-docs', name: 'API Doc Generator', isEnabled: false, description: 'Creates OpenAPI/Swagger docs' },
    
    // Testing Agents
    { id: 'agent-test-writer', name: 'Test Writer', isEnabled: false, description: 'Creates unit tests for functions' },
    { id: 'agent-test-coverage', name: 'Coverage Analyzer', isEnabled: false, description: 'Identifies untested code paths' },
    { id: 'agent-e2e-generator', name: 'E2E Test Generator', isEnabled: false, description: 'Creates end-to-end test scenarios' },
    
    // Security Agents
    { id: 'agent-security-scanner', name: 'Security Scanner', isEnabled: true, description: 'Scans for security vulnerabilities' },
    { id: 'agent-secret-detector', name: 'Secret Detector', isEnabled: true, description: 'Finds exposed API keys and secrets' },
    { id: 'agent-dependency-audit', name: 'Dependency Auditor', isEnabled: true, description: 'Checks for vulnerable dependencies' },
    { id: 'agent-license-checker', name: 'License Checker', isEnabled: false, description: 'Validates open source licenses' },
    
    // Performance Agents
    { id: 'agent-perf-analyzer', name: 'Performance Analyzer', isEnabled: false, description: 'Analyzes performance bottlenecks' },
    { id: 'agent-bundle-analyzer', name: 'Bundle Analyzer', isEnabled: false, description: 'Analyzes bundle size and dependencies' },
    { id: 'agent-memory-profiler', name: 'Memory Profiler', isEnabled: false, description: 'Detects memory leaks and issues' },
    
    // Accessibility & Quality
    { id: 'agent-a11y-checker', name: 'Accessibility Checker', isEnabled: false, description: 'Checks for accessibility issues' },
    { id: 'agent-i18n', name: 'i18n Helper', isEnabled: false, description: 'Extracts and manages translations' },
    { id: 'agent-type-checker', name: 'Type Inference', isEnabled: false, description: 'Suggests TypeScript types' },
    
    // DevOps Agents
    { id: 'agent-dockerfile', name: 'Dockerfile Generator', isEnabled: false, description: 'Creates optimized Dockerfiles' },
    { id: 'agent-ci-generator', name: 'CI/CD Generator', isEnabled: false, description: 'Creates GitHub Actions/GitLab CI' },
    { id: 'agent-terraform', name: 'Terraform Helper', isEnabled: false, description: 'Generates infrastructure code' },
    { id: 'agent-k8s', name: 'K8s Manifest Generator', isEnabled: false, description: 'Creates Kubernetes manifests' },
    
    // Productivity Agents
    { id: 'agent-commit-msg', name: 'Commit Message Writer', isEnabled: true, description: 'Generates meaningful commit messages' },
    { id: 'agent-pr-description', name: 'PR Description Writer', isEnabled: false, description: 'Creates PR descriptions from changes' },
    { id: 'agent-code-explainer', name: 'Code Explainer', isEnabled: false, description: 'Explains complex code blocks' },
    { id: 'agent-snippet-saver', name: 'Snippet Manager', isEnabled: false, description: 'Saves and organizes code snippets' },
];

// Backward compatibility
export const MOCK_EXTERNAL_AGENTS = EXTERNAL_AGENTS;

export const LLM_PROVIDERS: LLMProviderConfig[] = [
    { id: 'google', name: 'Google Gemini', isConfigured: false },
    { id: 'anthropic', name: 'Anthropic Claude', isConfigured: false },
    { id: 'openai', name: 'OpenAI', isConfigured: false },
    { id: 'xai', name: 'xAI Grok', isConfigured: false },
    { id: 'mistral', name: 'Mistral AI', isConfigured: false },
    { id: 'cohere', name: 'Cohere', isConfigured: false },
    { id: 'deepseek', name: 'DeepSeek', isConfigured: false },
    { id: 'groq', name: 'Groq', isConfigured: false },
    { id: 'together', name: 'Together AI', isConfigured: false },
    { id: 'perplexity', name: 'Perplexity', isConfigured: false },
    { id: 'ollama', name: 'Ollama (Local)', isConfigured: false },
];

// Backward compatibility
export const MOCK_LLM_PROVIDERS = LLM_PROVIDERS;

export const INTEGRATIONS: Integration[] = [
    { id: 'github', name: 'GitHub', description: 'Sync repositories, pull requests, and actions.', category: 'Source Control', icon: <Github size={20} />, configFields: [{ label: 'Personal Access Token', type: 'password', key: 'token' }] },
];

export const INITIAL_COMMITS: Commit[] = [
    { id: 'c1', message: 'Initial commit', author: 'Alex Chen', date: '3 days ago', branch: 'main', parentIds: [], color: '#4ade80' }
];

export const MCP_SERVERS: MCPServer[] = [
    // Memory & Context
    { id: '@modelcontextprotocol/server-memory', name: 'Persistent Memory', status: 'disconnected' },
    { id: '@anthropic/mcp-memory', name: 'Long-term Memory', status: 'disconnected' },
    
    // File & System
    { id: '@modelcontextprotocol/server-filesystem', name: 'Filesystem Access', status: 'disconnected' },
    { id: '@anthropic/mcp-shell', name: 'Shell Commands', status: 'disconnected' },
    
    // Web & APIs
    { id: '@modelcontextprotocol/server-fetch', name: 'HTTP Fetch', status: 'disconnected' },
    { id: '@anthropic/mcp-puppeteer', name: 'Browser Automation', status: 'disconnected' },
    { id: '@anthropic/mcp-brave-search', name: 'Brave Search', status: 'disconnected' },
    
    // Development Tools
    { id: '@anthropic/mcp-github', name: 'GitHub API', status: 'disconnected' },
    { id: '@anthropic/mcp-gitlab', name: 'GitLab API', status: 'disconnected' },
    { id: '@anthropic/mcp-linear', name: 'Linear (Issues)', status: 'disconnected' },
    { id: '@anthropic/mcp-sentry', name: 'Sentry Errors', status: 'disconnected' },
    
    // Databases
    { id: '@modelcontextprotocol/server-postgres', name: 'PostgreSQL', status: 'disconnected' },
    { id: '@anthropic/mcp-sqlite', name: 'SQLite', status: 'disconnected' },
    { id: '@anthropic/mcp-redis', name: 'Redis', status: 'disconnected' },
    { id: '@anthropic/mcp-mongodb', name: 'MongoDB', status: 'disconnected' },
    
    // Cloud Providers
    { id: '@anthropic/mcp-aws', name: 'AWS SDK', status: 'disconnected' },
    { id: '@anthropic/mcp-gcp', name: 'Google Cloud', status: 'disconnected' },
    { id: '@anthropic/mcp-azure', name: 'Azure SDK', status: 'disconnected' },
    { id: '@anthropic/mcp-vercel', name: 'Vercel', status: 'disconnected' },
    { id: '@anthropic/mcp-cloudflare', name: 'Cloudflare', status: 'disconnected' },
    
    // Communication
    { id: '@anthropic/mcp-slack', name: 'Slack', status: 'disconnected' },
    { id: '@anthropic/mcp-discord', name: 'Discord', status: 'disconnected' },
    { id: '@anthropic/mcp-email', name: 'Email (SMTP)', status: 'disconnected' },
    
    // Knowledge & Docs
    { id: '@anthropic/mcp-notion', name: 'Notion', status: 'disconnected' },
    { id: '@anthropic/mcp-confluence', name: 'Confluence', status: 'disconnected' },
    { id: '@anthropic/mcp-obsidian', name: 'Obsidian Vault', status: 'disconnected' },
    
    // Analytics & Monitoring
    { id: '@anthropic/mcp-datadog', name: 'Datadog', status: 'disconnected' },
    { id: '@anthropic/mcp-grafana', name: 'Grafana', status: 'disconnected' },
    
    // AI & ML
    { id: '@anthropic/mcp-huggingface', name: 'Hugging Face', status: 'disconnected' },
    { id: '@anthropic/mcp-replicate', name: 'Replicate', status: 'disconnected' },
    
    // Utilities
    { id: '@anthropic/mcp-time', name: 'Time & Timezone', status: 'disconnected' },
    { id: '@anthropic/mcp-calculator', name: 'Calculator', status: 'disconnected' },
    { id: '@anthropic/mcp-weather', name: 'Weather API', status: 'disconnected' },
];

// Backward compatibility
export const MOCK_MARKETPLACE_MCP_SERVERS = MCP_SERVERS;

export const ACTIVITY_FEED = [
    { id: 'act1', icon: <Code2 size={14} className="text-blue-400"/>, text: "Alex committed to 'feat/new-auth'", time: '2m ago' },
    { id: 'act2', icon: <Zap size={14} className="text-purple-400"/>, text: "Sarah deployed 'hyper-commerce'", time: '15m ago' },
    { id: 'act3', icon: <MessageSquare size={14} className="text-green-400"/>, text: "Mike commented on 'UI Bug'", time: '45m ago' },
];
export const MOCK_ACTIVITY = ACTIVITY_FEED; // Backward compat

export const INITIAL_DISCUSSIONS = [
    { user: 'alexchen', icon: <Lightbulb size={16} className="text-green-400"/>, title: 'Feature Request: VSCode Theme Sync', time: '2 hours ago' },
    { user: 'sarahjones', icon: <HelpCircle size={16} className="text-purple-400"/>, title: 'How to connect to a private Docker registry?', time: '5 hours ago' }
];
