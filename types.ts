
import React from 'react';

export type DesignName = 'neural-ink' | 'doodle' | 'blueprint' | 'graph-paper';

export enum ViewMode {
  HUB = 'HUB',
  WORKSPACE = 'WORKSPACE',
  TEMPLATES = 'TEMPLATES'
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Apps' | 'Games' | 'Landing Pages' | 'Dashboards' | 'Cloud/API';
  description: string;
  prompt: string; // The seed intent for the AI
  previewImage: string;
  author: {
    name: string;
    avatar: string;
  };
  stats: {
    views: string;
    likes: string;
  };
  price: 'Free' | string;
}

export enum Panel {
  FILES = 'FILES',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  SOURCE_CONTROL = 'SOURCE_CONTROL',
  SECURITY = 'SECURITY',
  TERRAFORM = 'TERRAFORM',
  DOCKER = 'DOCKER',
  EXTENSIONS = 'EXTENSIONS',
  TEAM = 'TEAM',
  INTEGRATIONS = 'INTEGRATIONS',
  AI_MARKETPLACE = 'AI_MARKETPLACE',
  PERSONAS = 'PERSONAS',
  STITCH_STUDIO = 'STITCH_STUDIO',
  RECORDER = 'RECORDER',
  SETTINGS = 'SETTINGS',
  HELP = 'HELP',
  DEBUG = 'DEBUG',
  TESTING = 'TESTING',
  DATABASE = 'DATABASE',
  KANBAN = 'KANBAN',
  PREVIEW = 'PREVIEW',
  API_STUDIO = 'API_STUDIO',
  WHITEBOARD = 'WHITEBOARD',
  DOCUMENT = 'DOCUMENT',
  TERMINAL = 'TERMINAL',
  DEPLOYMENT = 'DEPLOYMENT',
  ML_STUDIO = 'ML_STUDIO'
}

export interface EditorTab {
  path: string;
  node: FileNode;
  isDirty?: boolean;
}

export interface EditorTabGroup {
  id: string;
  name: string;
  tabs: EditorTab[];
  activeTabIndex: number;
  isCollapsed?: boolean;
}

export interface Recording {
  id: string;
  name: string;
  url: string;
  size: string;
  date: string;
  duration: string;
  mimeType: string;
}

export interface DiffData {
  original: string;
  modified: string;
  fileName: string;
}

export interface MenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  icon?: React.ReactNode;
}

export interface MenuCategory {
  label: string;
  items: MenuItem[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isRenaming?: boolean;
}

export interface AppPlan {
  svgPreview: string;
  files: { fileName: string; content: string; description?: string }[];
}

export interface AppFunctionCall {
  name: string;
  args: { [key: string]: any };
  id?: string;
}

export interface AppFunctionResponse {
  name: string;
  response: { result: any };
  id?: string;
}

export interface ChatAttachment {
    data: string; // base64
    mimeType: string;
    name: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isGenerating?: boolean;
  groundingChunks?: any[];
  imageUrl?: string;
  videoUrl?: string;
  videoGenerationStatus?: string;
  audioUrl?: string;
  videoPreviewUrl?: string;
  fileName?: string;
  appPlan?: AppPlan;
  userName?: string;
  userInitials?: string;
  mode?: 'chat' | 'image' | 'video' | 'audio' | 'app';
  toolCalls?: AppFunctionCall[];
  toolResponses?: AppFunctionResponse[];
  attachments?: ChatAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface SecurityPolicy {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    enabled: boolean;
    violationsCount: number;
    issueTypes: Severity[];
}

export interface ComplianceStandard {
    id: string;
    standard: string;
    description: string;
    status: 'pass' | 'fail';
}

export interface ComplianceControl {
    id: string;
    control: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
}

export interface SecurityIssue {
  id: string;
  file: string;
  line: number;
  severity: Severity;
  description: string;
  recommendation: string;
}

export enum CloudProvider {
  AWS = 'AWS',
  GCP = 'GCP',
  AZURE = 'Azure',
  OCI = 'Oracle Cloud',
}

export enum DeploymentStatus {
  SUCCESS = 'Success',
  IN_PROGRESS = 'In Progress',
  FAILED = 'Failed',
  PENDING = 'Pending',
}

export interface Deployment {
  id: string;
  provider: CloudProvider;
  service: string;
  status: DeploymentStatus;
  lastUpdated: string;
  branchOrTag?: string;
}

export interface AIModel {
  id:string;
  name: string;
  provider: string;
  description: string;
}

export enum ContainerStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  EXITED = 'Exited',
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: string;
}

export enum ProjectStatus {
  ACTIVE = 'active',
  REVIEW = 'review',
  DEPLOYED = 'deployed',
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarUrl?: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  email: string;
  password?: string;
  plan: 'Hobby' | 'Pro' | 'Enterprise';
  hasAcceptedInvite?: boolean;
  authProvider?: 'email' | 'google' | 'github';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  teamMemberIds: string[];
  changeCount: number;
  lastUpdate: string;
  comments: { user: string; text: string }[];
}

export interface AppEvent {
  id: number;
  type: 'Build' | 'Render' | 'System' | 'Error' | 'Warning';
  message: string;
  timestamp: Date;
}

export interface RecentActivityEvent {
  id: string;
  userName: string;
  userInitials: string;
  action: string;
  projectName: string;
  timestamp: string;
  type: 'comment' | 'deploy' | 'commit';
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  iconUrl: string;
  publisherVerified?: boolean;
  downloads?: string;
  rating?: number;
  isRecommended?: boolean;
  category?: string;
}

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  category: string;
  systemInstruction: string;
}

export interface MCPServer {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface ExternalAgent {
  id: string;
  name: string;
  isEnabled: boolean;
  description?: string;
}

export interface LLMProviderConfig {
  id: string;
  name: string;
  isConfigured: boolean;
}

export interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  parentIds: string[];
  color: string;
}

export interface RemoteUserState {
  activeFile?: string;
  cursorPos?: { line: number; ch: number };
}

export interface ChangeItem {
  file: string;
  status: 'M' | 'A' | 'D' | 'R' | '?';
}

export interface GitStatus {
    modified: string[];
    untracked: string[];
    deleted: string[];
}

export interface Command {
  id: string;
  label: string;
  icon: React.ReactElement;
  category: string;
  action: () => void;
  isAi?: boolean;
  shortcut?: string;
}

export type IdentityTab = 'profile' | 'billing' | 'security';

export interface ChatParams {
    prompt?: string;
    modelId: string;
    systemInstruction?: string;
    useThinking?: boolean;
    useMaps?: boolean;
    useGoogleSearch?: boolean;
    location?: { latitude: number; longitude: number };
    abortSignal?: AbortSignal;
    apiKeys?: { [key: string]: string };
    mcpServers?: MCPServer[];
    responseMimeType?: string;
    responseSchema?: any;
    attachments?: ChatAttachment[];
}

export interface CodeReviewSuggestion {
  line: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  category: 'Security' | 'Performance' | 'Best Practice' | 'Style';
  recommendation: string;
  explanation: string;
}

export interface Integration {
    id: string;
    name: string;
    description: string;
    category: 'Source Control' | 'Deployment' | 'Communication' | 'Monitoring' | 'Database';
    icon: React.ReactElement;
    configFields: { label: string; type: 'text' | 'password'; key: string }[];
    status?: 'connected' | 'disconnected';
}

export interface RecentItem {
    name: string;
    path: string;
    status: string;
    lastOpened: string;
    icon: React.ReactNode;
    type: string;
}

export interface Artifact {
  id: string;
  type: 'design_doc' | 'diagram' | 'iac_code' | 'code_review' | 'api_spec';
  toolName: string;
  content: string;
  timestamp: Date;
  meta?: Record<string, any>;
}

export type AgentStepStatus = 'idle' | 'planning' | 'executing' | 'review' | 'completed' | 'failed' | 'running';

export interface AgentStep {
  id: string;
  label: string;
  status: AgentStepStatus;
  action?: () => void; // Optional action for the user to take
  actionLabel?: string;
}

export interface Comment {
    id: string;
    author: string;
    initials: string;
    text: string;
    timestamp: string;
    lineNumber?: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    tag: 'Bug' | 'Feature' | 'Refactor' | 'Design';
    assignee?: string;
    status: TaskStatus;
    dueDate?: string;
    commentsCount?: number;
    attachmentsCount?: number;
}

export interface AgendaItem {
    id: string;
    text: string;
    completed: boolean;
}
