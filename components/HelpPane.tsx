
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants';
import { 
    Search, BookOpen, Keyboard, LifeBuoy, ChevronDown, ChevronRight, Zap, 
    Layout, Cpu, Shield, Cloud, Terminal, Clapperboard, GitBranch, FlaskConical
} from 'lucide-react';

interface HelpTopic {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface HelpCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    topics: HelpTopic[];
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Zap size={16} />,
        topics: [
            {
                id: 'welcome',
                title: 'Welcome to S.AI',
                content: 'S.AI is a multimodal, AI-native cloud IDE. It combines a universal code editor, terminal, and AI agents into a single browser interface.'
            },
            {
                id: 'first-project',
                title: 'Creating a Project',
                content: (
                    <div className="space-y-2 text-sm text-gray-400">
                        <p>1. Open the <strong>File Explorer</strong> (top icon).</p>
                        <p>2. Click <span className="text-white font-mono bg-gray-800 px-1 rounded">New Folder</span> to create a root.</p>
                        <p>3. Use the <strong>AI Chat</strong> to generate a starter template by typing: <em className="text-[var(--color-accent)]">"Scaffold a React app with Vite."</em></p>
                    </div>
                )
            },
            {
                id: 'languages',
                title: 'Supported Languages',
                content: (
                    <div className="space-y-2 text-sm text-gray-400">
                        <p>S.AI supports syntax highlighting and running/building for:</p>
                        <ul className="list-disc pl-4 grid grid-cols-2 gap-1">
                            <li><span className="text-yellow-400">JavaScript/TypeScript</span> (Node.js)</li>
                            <li><span className="text-blue-400">Python</span> (Pyodide)</li>
                            <li><span className="text-cyan-400">Go</span> (Golang)</li>
                            <li><span className="text-orange-400">Rust</span> (Cargo)</li>
                            <li><span className="text-red-400">Java</span> (JDK)</li>
                            <li><span className="text-purple-400">C/C++</span> (GCC)</li>
                        </ul>
                    </div>
                )
            }
        ]
    },
    {
        id: 'interface',
        title: 'Interface Overview',
        icon: <Layout size={16} />,
        topics: [
            {
                id: 'sidebar',
                title: 'Activity Bar (Left Sidebar)',
                content: (
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><strong>File Explorer:</strong> Manage files and folders.</li>
                        <li><strong>Search:</strong> Find and replace text across files.</li>
                        <li><strong>Source Control:</strong> Git integration (stage, commit, sync).</li>
                        <li><strong>Collaboration:</strong> Video calls and screen sharing.</li>
                        <li><strong>Run & Debug:</strong> Execute scripts and debug code.</li>
                        <li><strong>Testing:</strong> Auto-detect and run test suites.</li>
                        <li><strong>Extensions:</strong> Manage VS Code compatible extensions.</li>
                        <li><strong>Terraform:</strong> Generate Infrastructure as Code.</li>
                        <li><strong>Docker:</strong> Build and run containers.</li>
                        <li><strong>Security:</strong> Policy enforcement and compliance.</li>
                        <li><strong>Deployment:</strong> Deploy to AWS, Azure, GCP, Netlify.</li>
                        <li><strong>Creator Studio:</strong> Tools for video/content creation.</li>
                        <li><strong>Personas:</strong> Configure AI personalities.</li>
                    </ul>
                )
            },
            {
                id: 'ai-chat-panel',
                title: 'AI Co-Pilot (Right Panel)',
                content: 'Access the AI chat by clicking the panel toggle in the top-right. Supports generic chat, image generation, video generation, and full-app scaffolding.'
            },
            {
                id: 'terminal',
                title: 'Integrated Terminal',
                content: (
                    <div className="space-y-2 text-sm text-gray-400">
                        <p>A simulated Linux environment.</p>
                        <p><strong>Supported Commands:</strong> <code className="text-cyan-400">npm</code>, <code className="text-cyan-400">node</code>, <code className="text-cyan-400">python</code>, <code className="text-cyan-400">pip</code>, <code className="text-cyan-400">go</code>, <code className="text-cyan-400">cargo</code>, <code className="text-cyan-400">git</code>, <code className="text-cyan-400">docker</code>.</p>
                    </div>
                )
            }
        ]
    },
    {
        id: 'ai-tools',
        title: 'AI Capabilities',
        icon: <Cpu size={16} />,
        topics: [
            {
                id: 'models',
                title: 'Model Marketplace',
                content: 'Switch between Gemini Pro, Claude 3.5 Sonnet, GPT-4o, and others via the dropdown in the header or the Settings pane. You can provide your own API keys.'
            },
            {
                id: 'creator-studio',
                title: 'Creator Studio',
                content: 'A suite of specialized agents for content creators. Includes "Master Co-Pilot" for video ideas, "Viral Predictor" for title analysis, and a built-in screen recorder.'
            },
            {
                id: 'personas',
                title: 'AI Personas',
                content: 'Switch the AI\'s personality context. Example: Switch to "Senior Architect" for system design advice or "Security Auditor" to find vulnerabilities.'
            }
        ]
    },
    {
        id: 'testing-qa',
        title: 'Testing & QA',
        icon: <FlaskConical size={16} />,
        topics: [
            {
                id: 'discovery',
                title: 'Test Discovery',
                content: 'The Testing pane automatically scans for files ending in .test.ts, _test.py, _test.go, etc. Use the "Scan Project" button to refresh the list.'
            },
            {
                id: 'running-tests',
                title: 'Running Tests',
                content: 'Click the Play button next to a test suite or individual test. The system simulates the test run and reports status (Pass/Fail) and duration.'
            }
        ]
    },
    {
        id: 'governance',
        title: 'Security & Governance',
        icon: <Shield size={16} />,
        topics: [
            {
                id: 'policies',
                title: 'Policy Enforcement',
                content: 'Define rules like "No Root IAM User" or "No Public S3 Buckets". These are checked in real-time against your code and Terraform files.'
            },
            {
                id: 'compliance',
                title: 'Compliance Dashboard',
                content: 'View your project\'s standing against standards like SOC2, HIPAA, and GDPR based on the detected infrastructure configuration.'
            }
        ]
    },
    {
        id: 'cloud-devops',
        title: 'Cloud & DevOps',
        icon: <Cloud size={16} />,
        topics: [
            {
                id: 'terraform',
                title: 'Terraform Generator',
                content: 'Describe infrastructure in plain English (e.g., "A scalable GKE cluster") to generate valid HCL code. You can then preview the `terraform plan`.'
            },
            {
                id: 'docker',
                title: 'Container Studio',
                content: 'Generate Dockerfiles, build images, and run containers directly within the browser simulation.'
            },
            {
                id: 'deployment',
                title: 'Multi-Cloud Deploy',
                content: 'Connect to AWS, Azure, GCP, or Netlify. The deployment center handles authentication and resource provisioning logs.'
            }
        ]
    },
    {
        id: 'git',
        title: 'Source Control',
        icon: <GitBranch size={16} />,
        topics: [
            {
                id: 'git-flow',
                title: 'Git Workflow',
                content: 'Track changes in the Source Control pane. Stage files (+) and enter a commit message to save snapshots of your work. Sync to push to the simulated remote.'
            },
            {
                id: 'github',
                title: 'GitHub Integration',
                content: 'Connect your GitHub account in the Integrations pane to clone repositories or push your S.AI project to a real GitHub repo.'
            }
        ]
    }
];

interface HelpPaneProps {
    onCollapse: () => void;
}

const HelpPane: React.FC<HelpPaneProps> = ({ onCollapse }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

    const toggleTopic = (id: string) => {
        const newSet = new Set(expandedTopics);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedTopics(newSet);
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return HELP_CATEGORIES;
        
        return HELP_CATEGORIES.map(cat => ({
            ...cat,
            topics: cat.topics.filter(t => 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof t.content === 'string' && t.content.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        })).filter(cat => cat.topics.length > 0);
    }, [searchQuery]);

    return (
        <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
            {/* Header */}
            <div className="flex justify-between items-center p-2 flex-shrink-0">
                <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Documentation & Help</h2>
                <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    {ICONS.COLLAPSE_LEFT}
                </button>
            </div>

            {/* Search */}
            <div className="px-2 pb-2 flex-shrink-0">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <Search size={14} className="text-[var(--color-text-secondary)]" />
                    </span>
                    <input 
                        type="text"
                        placeholder="Search documentation..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 px-2 pb-4">
                <button className="flex items-center justify-center gap-2 p-3 bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)] transition-colors text-xs font-medium text-gray-300">
                    <Keyboard size={16} className="text-[var(--color-accent)]" />
                    Shortcuts
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-[var(--color-background-tertiary)] hover:bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)] transition-colors text-xs font-medium text-gray-300">
                    <LifeBuoy size={16} className="text-green-400" />
                    Support
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-6">
                {filteredCategories.map(cat => (
                    <div key={cat.id}>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3 pb-1 border-b border-[var(--color-border)]">
                            <span className="text-[var(--color-accent)]">{cat.icon}</span>
                            {cat.title}
                        </h3>
                        <div className="space-y-1">
                            {cat.topics.map(topic => {
                                const isExpanded = expandedTopics.has(topic.id);
                                return (
                                    <div key={topic.id} className="border border-[var(--color-border)] rounded-lg bg-[var(--color-background-tertiary)] overflow-hidden">
                                        <button 
                                            onClick={() => toggleTopic(topic.id)}
                                            className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-background-hover)] transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-200">{topic.title}</span>
                                            {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                        </button>
                                        {isExpanded && (
                                            <div className="p-3 pt-0 text-sm text-gray-400 bg-[var(--color-background-tertiary)] border-t border-[var(--color-border)]/50">
                                                <div className="mt-2 leading-relaxed">
                                                    {topic.content}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        No help topics found.
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)] text-center">
                <p className="text-xs text-gray-500">S.AI v0.1.0 Beta</p>
            </div>
        </div>
    );
};

export default HelpPane;
