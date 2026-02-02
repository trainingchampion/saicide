import React, { useState, useMemo } from 'react';
import { AIPersona } from '../types';
import { ICONS } from '../constants';
import { 
    BrainCircuit, 
    ShieldCheck, 
    Code2, 
    Layout, 
    Zap, 
    Search, 
    Plus, 
    Settings, 
    BookOpen, 
    X,
    Filter,
    ShieldAlert,
    Cpu,
    Sparkles,
    RotateCcw
} from 'lucide-react';

interface PersonasPaneProps {
  personas: AIPersona[];
  activePersona: AIPersona | null;
  onSelectPersona: (persona: AIPersona | null) => void;
  onCreatePersona: () => void;
  onCollapse: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Engineering': <Code2 size={14} />,
    'Infrastructure': <Cpu size={14} />,
    'Security': <ShieldCheck size={14} />,
    'Frontend': <Layout size={14} />,
    'Utility': <BookOpen size={14} />,
    'Custom': <Settings size={14} />,
};

const PERSONA_CAPABILITIES: Record<string, string[]> = {
    // Engineering
    'General Developer': ['Code Generation', 'Debugging', 'Explanations'],
    'Frontend Specialist': ['React', 'TypeScript', 'CSS', 'Accessibility'],
    'Backend Engineer': ['APIs', 'Databases', 'Microservices'],
    'Python Expert': ['FastAPI', 'Django', 'Data Processing'],
    'Rust Developer': ['Systems', 'Memory Safety', 'Performance'],
    'Go Developer': ['Concurrency', 'CLI Tools', 'HTTP Servers'],
    
    // Infrastructure
    'Senior Cloud Architect': ['System Design', 'Terraform', 'Cost Analysis'],
    'DevOps Engineer': ['CI/CD', 'Docker', 'Kubernetes'],
    'Kubernetes Specialist': ['K8s', 'Helm', 'Cloud Native'],
    'Database Administrator': ['SQL', 'NoSQL', 'Query Optimization'],
    
    // Security
    'Security Auditor': ['Vulnerabilities', 'OWASP', 'Secure Code'],
    'Compliance Expert': ['GDPR', 'SOC2', 'HIPAA'],
    
    // Frontend
    'UI/UX Designer': ['Design Systems', 'Accessibility', 'UX'],
    'CSS Wizard': ['Animations', 'Grid/Flexbox', 'Responsive'],
    'React Expert': ['Hooks', 'Performance', 'State Management'],
    
    // Utility
    'Code Reviewer': ['Best Practices', 'Bug Detection', 'Quality'],
    'Documentation Writer': ['READMEs', 'API Docs', 'Tutorials'],
    'Debugging Detective': ['Stack Traces', 'Root Cause', 'Fixes'],
    'Refactoring Expert': ['Clean Code', 'Patterns', 'Architecture'],
    'Performance Optimizer': ['Speed', 'Memory', 'Caching'],
    'Test Engineer': ['Unit Tests', 'TDD', 'Coverage'],
    
    // Data & AI
    'Data Scientist': ['ML', 'Analytics', 'Pandas'],
    'ML Engineer': ['MLOps', 'Deployment', 'Pipelines'],
    'Prompt Engineer': ['LLM', 'RAG', 'AI Integration'],
    
    // Mobile
    'iOS Developer': ['Swift', 'SwiftUI', 'UIKit'],
    'Android Developer': ['Kotlin', 'Compose', 'Jetpack'],
    'React Native Dev': ['Cross-Platform', 'Native Modules', 'Expo'],
};

const PersonasPane: React.FC<PersonasPaneProps> = ({ personas, activePersona, onSelectPersona, onCreatePersona, onCollapse }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersonas = useMemo(() => {
    if (!searchTerm) return personas;
    return personas.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [personas, searchTerm]);

  const groupedPersonas = useMemo(() => {
    return filteredPersonas.reduce((acc, persona) => {
      (acc[persona.category] = acc[persona.category] || []).push(persona);
      return acc;
    }, {} as { [key: string]: AIPersona[] });
  }, [filteredPersonas]);

  const categories = Object.keys(groupedPersonas).sort();

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-3 flex-shrink-0 border-b border-[var(--color-border)] mb-4">
        <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-[0.2em]">AI Personas</h2>
        </div>
        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
          {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="px-3 pb-4 flex-shrink-0 space-y-3">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 group-focus-within:text-[var(--color-accent)] transition-colors">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search experts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all placeholder-gray-600"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onCreatePersona} 
                className="text-[10px] bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest py-2.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
            <Plus size={14} strokeWidth={3} /> Create
            </button>
            <button 
                onClick={() => onSelectPersona(null)} 
                className="text-[10px] bg-black/20 text-gray-400 hover:text-white font-black uppercase tracking-widest py-2.5 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
            >
            <RotateCcw size={14} /> Reset
            </button>
        </div>

        {activePersona && (
            <div className="p-3 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl animate-fade-in relative overflow-hidden group shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onSelectPersona(null)} className="text-gray-400 hover:text-white"><X size={14}/></button>
                </div>
                <p className="text-[9px] font-black text-[var(--color-accent)] uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Zap size={10} fill="currentColor" className="animate-pulse" /> Currently Active
                </p>
                <p className="text-sm font-bold text-white truncate pr-6">{activePersona.name}</p>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-1 flex items-center gap-2">
                {CATEGORY_ICONS[category] || <BrainCircuit size={14} />}
                {category}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {groupedPersonas[category].map(persona => {
                const isActive = activePersona?.id === persona.id;
                const capabilities = PERSONA_CAPABILITIES[persona.name] || [];
                
                return (
                  <div
                    key={persona.id}
                    onClick={() => onSelectPersona(persona)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all group ${
                        isActive 
                            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]' 
                            : 'bg-[var(--color-background-tertiary)]/40 border-white/5 hover:border-white/20 hover:bg-[var(--color-background-tertiary)]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                            <h4 className={`font-black text-sm tracking-tight ${isActive ? 'text-black' : 'text-white'}`}>{persona.name}</h4>
                            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-relaxed ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{persona.description}</p>
                        </div>
                        {isActive && <Sparkles size={14} className="text-black ml-2 animate-pulse" />}
                    </div>
                    
                    {capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {capabilities.map(cap => (
                                <span key={cap} className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${isActive ? 'bg-black/10 text-black/60' : 'bg-black/40 text-gray-500'}`}>
                                    {cap}
                                </span>
                            ))}
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                <Search size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching agents</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PersonasPane;