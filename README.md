# 🚀 SAI IDE V3 — The AI-Native Cloud Development Studio

<div align="center">

![SAI IDE](https://img.shields.io/badge/SAI-IDE_V3-00d4ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGQ0ZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEyIDIgMiA3IDEyIDEyIDIyIDcgMTIgMiI+PC9wb2x5Z29uPjxwb2x5bGluZSBwb2ludHM9IjIgMTcgMTIgMjIgMjIgMTciPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz0iMiAxMiAxMiAxNyAyMiAxMiI+PC9wb2x5bGluZT48L3N2Zz4=)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3-646cff?style=for-the-badge&logo=vite)

**Build. Ship. Scale.**

*A comprehensive AI-augmented development platform that unifies coding, collaboration, cloud deployment, and intelligent automation.*

[Getting Started](#-getting-started) • [Features](#-features) • [AI Models](#-ai-model-hub) • [Documentation](#-architecture)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [AI Model Hub](#-ai-model-hub)
- [AI Personas](#-ai-personas)
- [External Agents](#-external-agents)
- [MCP Servers](#-mcp-servers)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)

---

## ✨ Features

### 🖥️ Professional Code Editor
- **Multi-language Support**: TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, and 50+ languages
- **Monaco-powered Editing**: VS Code-quality editing experience
- **Multi-tab Interface**: Split views, tab management, and workspaces
- **Intelligent Auto-save**: Automatic file persistence with undo history

### 🤖 AI-Powered Development
- **55+ AI Models**: Access to Google, Anthropic, OpenAI, Meta, and 20+ providers
- **25+ AI Personas**: Specialized assistants for every development task
- **30 External Agents**: Automated code quality, testing, security, and DevOps
- **33 MCP Servers**: Extensible AI capabilities via Model Context Protocol
- **Ghost Agent**: Autonomous multi-step task execution

### 📁 File Explorer
- **Tree Navigation**: Hierarchical file/folder browsing
- **Context Actions**: Run, rename, delete, copy path, open in terminal
- **Language Detection**: Auto-detects file type and runs with appropriate interpreter
- **Terminal CWD Sync**: Visual indicator of current working directory

### 💻 Integrated Terminal
- **Real PTY Terminal**: Full xterm.js-based terminal with shell support
- **Command Palette**: Quick access to common commands
- **Git Integration**: Pre-configured git command shortcuts
- **Multi-shell Support**: zsh, bash, fish, and more

### 🔄 Git & Source Control
Real git operations executed through the terminal:

| Action | Command |
|--------|---------|
| Stage file | `git add "filename"` |
| Unstage file | `git restore --staged "filename"` |
| Commit | `git commit -m "message"` |
| Switch branch | `git checkout branch` |
| Create branch | `git checkout -b branch` |
| Sync | `git pull && git push` |

- **Visual Diff Viewer**: Side-by-side comparison
- **Git Graph**: Commit history visualization
- **AI Commit Messages**: Auto-generated meaningful commits

### 👥 Team Collaboration
- **Team Hub**: Central dashboard for team activities
- **Live Sessions**: Real-time collaborative coding
- **Video Conferencing**: Built-in video/audio calls
- **Live Chat**: Team messaging during sessions
- **Screen Sharing**: Share your workspace

### ☁️ Cloud & DevOps
- **Terraform Generator**: AI-powered infrastructure-as-code
- **Docker Management**: Container lifecycle management
- **Multi-Cloud Deployment**: AWS, Azure, GCP support
- **Deployment Center**: One-click deployments
- **CloudPulse**: Real-time cloud monitoring

### 🔒 Security & Compliance
- **Policy Enforcement**: Real-time compliance scanning
- **Standards Support**: SOC2, HIPAA, GDPR, PCI DSS
- **Vulnerability Detection**: Automated security scanning
- **License Checking**: Open source license validation

### 🛠️ Developer Tools
- **Run & Debug**: Integrated debugging with breakpoints and watch variables
- **API Client (API Forge)**: REST API testing
- **Database Manager**: SQL/NoSQL database interface
- **Kanban Board**: Project task management
- **Whiteboard**: Collaborative diagramming
- **Document Studio**: Full-featured Docs, Sheets & Slides (Gamma.app-inspired)
- **ML Studio**: Real machine learning model training with TensorFlow.js
- **UX Lab**: UI/UX experimentation

### 🧠 ML Studio (TensorFlow.js)

Train real machine learning models directly in your browser:

#### 📊 Data Management
- **CSV/JSON Upload**: Import datasets directly from files
- **Data Preview**: View your data in a table format
- **Column Configuration**: Select target (what to predict) and feature columns (inputs)
- **Automatic Preprocessing**: Normalization and train/test splitting (80/20)

#### 🏗️ Model Builder
- **Classification Models**: Predict categories (yes/no, spam/not spam, churn/retain)
- **Regression Models**: Predict continuous values (prices, scores, temperatures)
- **Custom Architecture**: Configure hidden layers and neurons
- **Hyperparameters**: Adjustable epochs, learning rate, batch size

#### ⚡ Real Training
- **TensorFlow.js Powered**: Train neural networks in the browser
- **Live Progress**: Watch loss and accuracy update in real-time
- **Training Logs**: Epoch-by-epoch metrics
- **Stop/Resume**: Interrupt training at any time
- **Validation Split**: Automatic holdout for unbiased evaluation

#### 🚀 Deployment & Inference
- **Real Predictions**: Input values and get actual model predictions
- **Model Export**: Download trained models as TensorFlow.js format (model.json + weights)
- **Portable Models**: Use exported models in any TensorFlow.js application

### 📝 Document Studio

A comprehensive productivity suite with modern dark UI:

#### 📄 Docs
- **12 Templates**: Blank, Project Proposal, Meeting Notes, Technical Spec, API Documentation, Blog Post, Press Release, Business Plan, User Guide, Research Report, Resume/CV, Cover Letter
- **Focus Mode**: Distraction-free writing with centered canvas
- **AI Writing Assistant**: 8 quick actions (write intro, expand, summarize, improve, fix grammar, make formal/casual, continue writing)
- **Smart Sidebar**: Document sections, auto-generated outline, real-time stats (words, characters, lines, reading time)
- **Writing Goals**: Track progress toward word count targets
- **Rich Formatting**: Headings, fonts, alignment, lists, quotes, code blocks, links, images

#### 📊 Sheets
- **12 Templates**: Budget Tracker, Project Timeline, Invoice, Employee Directory, Inventory, Sales Pipeline, OKR Tracker, Expense Report, KPI Dashboard, Customer List, Sprint Backlog
- **Multi-Sheet Tabs**: Create and switch between multiple sheets
- **Formula Panel**: 8 common formulas (SUM, AVERAGE, COUNT, MAX, MIN, IF, VLOOKUP, CONCAT)
- **Quick Charts**: Instant bar, line, and pie chart previews
- **AI Data Insights**: AI-powered data analysis
- **Full Formatting**: Bold, italic, alignment, currency, percentage

#### 🎨 Slides (Gamma.app-Inspired)
- **30 Templates**: Across 6 categories (Business, Education, Creative, Tech, Marketing, Personal)
- **20 Themes**: 10 light + 10 dark professional themes (Nova, Twilight, Coral, Midnight, Ocean, Aurora, and more)
- **10 Layouts**: Title, Content, Visual, Big Number, Two-Column, Comparison, Timeline, Quote, Gallery, Team
- **AI Presentation Generator**: Describe your topic and generate slides instantly
- **Fullscreen Presenter**: Present directly in the browser
- **Real-time Editing**: Edit slides with live preview

---

## 🧠 AI Model Hub

Access **55+ AI models** from **25+ providers**:

### Primary Providers

| Provider | Models |
|----------|--------|
| **Google** | Opal (App Engine), Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.0 Flash, PaLM 2, Veo (Video), Imagen (Image) |
| **Anthropic** | Claude 4 Opus, Claude 4 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| **OpenAI** | GPT-4.1, GPT-4o, GPT-4o Mini, o3, o3 Mini, o4 Mini, GPT-4 Turbo |
| **xAI** | Grok 3, Grok 3 Mini |
| **Meta** | Llama 4 Maverick, Llama 4 Scout, Llama 3.3 70B, Llama 3.1 405B, Code Llama 70B |

### Additional Providers

| Provider | Models |
|----------|--------|
| **DeepSeek** | DeepSeek R1, DeepSeek V3, DeepSeek Coder V2 |
| **Mistral** | Mistral Large 2, Mistral Medium, Codestral, Pixtral Large, Mixtral 8x22B |
| **Cohere** | Command R+, Command R, Embed V4 |
| **AI21** | Jamba 1.5 Large, Jamba 1.5 Mini |
| **Perplexity** | Sonar Pro, Sonar |
| **Groq** | Llama 3.3 70B (LPU), Mixtral 8x7B (LPU) |
| **Together** | Qwen 2.5 72B, Yi Large |
| **Amazon** | Titan Text Premier, Nova Pro, Nova Lite |
| **Azure** | GPT-4o (Azure), GPT-4 Turbo (Azure) |
| **Alibaba** | Qwen Max, Qwen Plus, Qwen Turbo |
| **MiniMax** | abab6.5s-chat |
| **Zhipu** | GLM-4-Plus |
| **Moonshot** | Moonshot v1 |
| **Local** | Ollama, LM Studio, llama.cpp |

---

## 🎭 AI Personas

**25+ specialized AI personas** organized by category:

### Engineering
| Persona | Specialty |
|---------|-----------|
| General Developer | All-around coding assistant |
| Frontend Specialist | React, Vue, CSS, modern UI |
| Backend Engineer | APIs, databases, server-side |
| Python Expert | Scripts, FastAPI, data processing |
| Go Developer | Microservices, concurrency |
| Rust Engineer | Systems programming, safety |
| Java Architect | Enterprise, Spring Boot |

### Infrastructure & DevOps
| Persona | Specialty |
|---------|-----------|
| DevOps Engineer | CI/CD, Docker, Kubernetes |
| Cloud Architect | AWS, Azure, GCP solutions |
| Database Admin | SQL/NoSQL optimization |
| Network Engineer | Infrastructure, VPNs, DNS |
| Site Reliability | Monitoring, incident response |

### Security
| Persona | Specialty |
|---------|-----------|
| Security Analyst | Vulnerability assessment |
| AppSec Engineer | Secure coding practices |
| Compliance Officer | SOC2, HIPAA, GDPR |

### Data & AI
| Persona | Specialty |
|---------|-----------|
| Data Scientist | ML models, analytics |
| ML Engineer | Model deployment, MLOps |
| Data Engineer | ETL, pipelines, warehousing |

### Mobile & Frontend
| Persona | Specialty |
|---------|-----------|
| iOS Developer | Swift, SwiftUI |
| Android Developer | Kotlin, Jetpack Compose |
| React Native Dev | Cross-platform mobile |

### Utility
| Persona | Specialty |
|---------|-----------|
| Code Reviewer | Quality and best practices |
| Technical Writer | Documentation |
| Test Engineer | Unit, integration, E2E tests |
| Accessibility Expert | WCAG compliance |
| Performance Engineer | Optimization, profiling |

---

## 🤖 External Agents

**30 automated agents** for continuous development assistance:

### Code Quality
- **Auto-Fixer** — Automatically fixes lint errors
- **Code Reviewer** — Reviews changes and suggests improvements
- **Refactor Assistant** — Identifies refactoring opportunities
- **Dead Code Detector** — Finds unused code and imports
- **Complexity Analyzer** — Identifies overly complex functions

### Documentation
- **Doc Generator** — Generates documentation from code
- **README Writer** — Creates and updates README files
- **Changelog Generator** — Auto-generates changelogs
- **API Doc Generator** — Creates OpenAPI/Swagger docs

### Testing
- **Test Writer** — Creates unit tests for functions
- **Coverage Analyzer** — Identifies untested code paths
- **E2E Test Generator** — Creates end-to-end test scenarios

### Security
- **Security Scanner** — Scans for vulnerabilities
- **Secret Detector** — Finds exposed API keys
- **Dependency Auditor** — Checks for vulnerable dependencies
- **License Checker** — Validates open source licenses

### Performance
- **Performance Analyzer** — Analyzes bottlenecks
- **Bundle Analyzer** — Analyzes bundle size
- **Memory Profiler** — Detects memory leaks

### DevOps
- **Dockerfile Generator** — Creates optimized Dockerfiles
- **CI/CD Generator** — Creates GitHub Actions/GitLab CI
- **Terraform Helper** — Generates infrastructure code
- **K8s Manifest Generator** — Creates Kubernetes manifests

### Productivity
- **Commit Message Writer** — Generates meaningful commits
- **PR Description Writer** — Creates PR descriptions
- **Code Explainer** — Explains complex code blocks
- **Snippet Manager** — Saves and organizes snippets

---

## 🔌 MCP Servers

**33 Model Context Protocol servers** for extended AI capabilities:

### Memory & Context
- `@modelcontextprotocol/server-memory` — Persistent Memory
- `@anthropic/mcp-memory` — Long-term Memory

### File & System
- `@modelcontextprotocol/server-filesystem` — Filesystem Access
- `@anthropic/mcp-shell` — Shell Commands

### Web & APIs
- `@modelcontextprotocol/server-fetch` — HTTP Fetch
- `@anthropic/mcp-puppeteer` — Browser Automation
- `@anthropic/mcp-brave-search` — Brave Search

### Development Tools
- `@anthropic/mcp-github` — GitHub API
- `@anthropic/mcp-gitlab` — GitLab API
- `@anthropic/mcp-linear` — Linear Issues
- `@anthropic/mcp-sentry` — Sentry Errors

### Databases
- `@modelcontextprotocol/server-postgres` — PostgreSQL
- `@anthropic/mcp-sqlite` — SQLite
- `@anthropic/mcp-redis` — Redis
- `@anthropic/mcp-mongodb` — MongoDB

### Cloud Providers
- `@anthropic/mcp-aws` — AWS SDK
- `@anthropic/mcp-gcp` — Google Cloud
- `@anthropic/mcp-azure` — Azure SDK
- `@anthropic/mcp-vercel` — Vercel
- `@anthropic/mcp-cloudflare` — Cloudflare

### Communication
- `@anthropic/mcp-slack` — Slack
- `@anthropic/mcp-discord` — Discord
- `@anthropic/mcp-email` — Email (SMTP)

### Knowledge & Docs
- `@anthropic/mcp-notion` — Notion
- `@anthropic/mcp-confluence` — Confluence
- `@anthropic/mcp-obsidian` — Obsidian Vault

### Analytics & Monitoring
- `@anthropic/mcp-datadog` — Datadog
- `@anthropic/mcp-grafana` — Grafana

### AI & ML
- `@anthropic/mcp-huggingface` — Hugging Face
- `@anthropic/mcp-replicate` — Replicate

### Utilities
- `@anthropic/mcp-time` — Time & Timezone
- `@anthropic/mcp-calculator` — Calculator
- `@anthropic/mcp-weather` — Weather API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sai-ideV3

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GITHUB_TOKEN=your_github_token
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🏗️ Architecture

```
sai-ideV3/
├── components/           # React components
│   ├── collaboration/    # Team collaboration
│   ├── docker/           # Docker management
│   ├── modals/           # Modal dialogs
│   ├── standalone/       # Standalone variants
│   └── tools/            # Tool components
├── modules/
│   └── cloud/
│       └── CloudStudio.tsx  # Main orchestrator
├── services/             # Business logic
│   ├── authService.ts    # Authentication
│   ├── geminiService.ts  # AI integration
│   ├── githubService.ts  # GitHub API
│   └── mcpClientService.ts  # MCP client
├── hooks/                # React hooks
├── server/               # Backend
│   ├── index.ts          # Express + Socket.IO
│   └── mcpRouter.ts      # MCP routing
├── constants.tsx         # App constants
├── types.ts              # TypeScript types
├── themes.ts             # Theme configs
└── App.tsx               # Entry point
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript 5.5 | Type safety |
| Vite 5.3 | Build tool |
| Lucide React | Icons |
| Framer Motion | Animations |
| xterm.js | Terminal |

### Backend
| Technology | Purpose |
|------------|---------|
| Express | HTTP server |
| Socket.IO | Real-time |
| node-pty | Terminal PTY |
| tsx | TypeScript runtime |

### AI & Integrations
| Technology | Purpose |
|------------|---------|
| @google/genai | Gemini API |
| @modelcontextprotocol/sdk | MCP protocol |
| OpenVSX API | Extensions |

---

## 📄 License

This project is proprietary software.

---

<div align="center">

**SAI IDE** — Build. Ship. Scale.

Made with ❤️ by SSLabs for developers who build the future.

</div>

