import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { 
    Play, 
    CheckCircle, 
    XCircle, 
    RefreshCw, 
    Filter, 
    FlaskConical, 
    ChevronRight, 
    ChevronDown, 
    FileCode, 
    Clock, 
    ShieldAlert, 
    AlertTriangle,
    Plus,
    Upload,
    Search,
    FolderOpen
} from 'lucide-react';
import { FileNode, SecurityIssue, SecurityPolicy } from '../types';

interface TestingPaneProps {
  onCollapse: () => void;
  fileStructure: FileNode;
  setFileStructure: React.Dispatch<React.SetStateAction<FileNode>>;
  onRunTest: (cmd: string) => void;
  onWriteToTerminal: (text: string) => void;
  securityIssues: SecurityIssue[];
  policies: SecurityPolicy[];
  onGoToFile: (filePath: string) => void;
  activeExplorerFile?: { node: FileNode; path: string } | null;
}

interface TestItem {
    id: string;
    name: string;
    file: string;
    type: 'suite' | 'test';
    status: 'idle' | 'running' | 'passed' | 'failed';
    duration?: number;
    message?: string;
    children?: TestItem[];
}

// Helper to flatten the tree to find all files
const flattenFileTree = (node: FileNode, path = ''): { name: string, content: string }[] => {
    let files: { name: string, content: string }[] = [];
    if (node.type === 'file' && node.content) {
        files.push({ name: path ? `${path}/${node.name}` : node.name, content: node.content });
    }
    if (node.children) {
        node.children.forEach(child => {
            files = files.concat(flattenFileTree(child, path ? `${path}/${node.name}` : node.name));
        });
    }
    return files;
};

const TestingPane: React.FC<TestingPaneProps> = ({ onCollapse, fileStructure, setFileStructure, onRunTest, onWriteToTerminal, securityIssues, policies, onGoToFile, activeExplorerFile }) => {
  const [testTree, setTestTree] = useState<TestItem[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Test Discovery
  useEffect(() => {
      discoverTests();
  }, [fileStructure]);

  useEffect(() => {
      if (activeExplorerFile) {
          const filePath = activeExplorerFile.path;
          // Check if the selected file is a test file known to this panel
          const isTestFile = testTree.some(suite => suite.file === filePath);

          if (isTestFile) {
              // Expand it if it's not already
              setExpandedNodes(prev => {
                  if (prev.has(filePath)) {
                      return prev;
                  }
                  const newSet = new Set(prev);
                  newSet.add(filePath);
                  return newSet;
              });
          }
      }
  }, [activeExplorerFile, testTree]);

  const discoverTests = () => {
      const allFiles = flattenFileTree(fileStructure, '');
      const files = allFiles.map(f => ({ ...f, name: f.name.replace(fileStructure.name + '/', '') }));
      
      const testFiles = files.filter(f => 
          f.name.endsWith('.test.tsx') || 
          f.name.endsWith('.test.ts') || 
          f.name.endsWith('.spec.js') || 
          f.name.endsWith('.spec.ts') ||
          f.name.endsWith('_test.py') || 
          f.name.startsWith('test_') ||
          f.name.endsWith('_test.go') ||
          (f.name.endsWith('.rs') && f.content.includes('#[test]'))
      );

      const tree: TestItem[] = testFiles.map(f => {
          const suites: TestItem[] = [];
          const isPython = f.name.endsWith('.py');
          const isGo = f.name.endsWith('.go');
          const isRust = f.name.endsWith('.rs');

          if (isPython) {
              const classRegex = /class\s+(\w+)/g;
              const funcRegex = /def\s+(test_\w+)/g;
              
              let match;
              while ((match = classRegex.exec(f.content)) !== null) {
                  suites.push({ id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'suite', status: 'idle', children: [] });
              }
              while ((match = funcRegex.exec(f.content)) !== null) {
                  const testItem: TestItem = { id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'test', status: 'idle' };
                  if (suites.length > 0) suites[suites.length - 1].children?.push(testItem);
                  else suites.push(testItem);
              }
          } else if (isGo) {
              const funcRegex = /func\s+(Test\w+)\(/g;
              let match;
              while ((match = funcRegex.exec(f.content)) !== null) {
                  suites.push({ id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'test', status: 'idle' });
              }
          } else if (isRust) {
              const testRegex = /#\[test\]\s*fn\s+(\w+)\(\)/g;
              let match;
              while ((match = testRegex.exec(f.content)) !== null) {
                  suites.push({ id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'test', status: 'idle' });
              }
          } else {
              const describeRegex = /(?:describe|suite)\s*\(\s*['"`](.+?)['"`]/g;
              const itRegex = /(?:it|test)\s*\(\s*['"`](.+?)['"`]/g;
              
              let match;
              while ((match = describeRegex.exec(f.content)) !== null) {
                  suites.push({ id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'suite', status: 'idle', children: [] });
              }
              while ((match = itRegex.exec(f.content)) !== null) {
                  const testItem: TestItem = { id: `${f.name}-${match[1]}`, name: match[1], file: f.name, type: 'test', status: 'idle' };
                  if (suites.length > 0) suites[suites.length - 1].children?.push(testItem);
                  else suites.push(testItem);
              }
          }

          if (suites.length === 0 && f.name.match(/test/i)) {
              return { id: f.name, name: f.name.split('/').pop() || f.name, file: f.name, type: 'test', status: 'idle' };
          }

          return {
              id: f.name,
              name: f.name.split('/').pop() || f.name,
              file: f.name,
              type: 'suite',
              status: 'idle',
              children: suites
          };
      });

      setTestTree(tree);
      // Auto-expand new files
      setExpandedNodes(prev => {
          const next = new Set(prev);
          tree.forEach(t => next.add(t.id));
          return next;
      });
  };

  const handleScan = () => {
      setIsScanning(true);
      setTimeout(() => {
          discoverTests();
          setIsScanning(false);
      }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const newFile: FileNode = { name: file.name, type: 'file', content };
          
          setFileStructure(prev => ({
              ...prev,
              children: [...(prev.children || []), newFile]
          }));
          
          setTimeout(handleScan, 500);
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const toggleExpand = (id: string) => {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
  };

  const updateTestStatus = (id: string, status: 'running' | 'passed' | 'failed', duration?: number, message?: string) => {
      setTestTree(prev => {
          const updateNode = (nodes: TestItem[]): TestItem[] => {
              return nodes.map(node => {
                  if (node.id === id) return { ...node, status, duration, message };
                  if (node.children) return { ...node, children: updateNode(node.children) };
                  return node;
              });
          };
          return updateNode(prev);
      });
  };

  const runGovernanceCheck = async (test: TestItem) => {
      updateTestStatus(test.id, 'running');
      
      let cmd = `npm test -- ${test.file}`;
      if (test.file.endsWith('.py')) cmd = `pytest ${test.file}`;
      if (test.file.endsWith('.go')) cmd = `go test ./${test.file.substring(0, test.file.lastIndexOf('/'))}`;
      if (test.file.endsWith('.rs')) cmd = `cargo test --test ${test.name}`;
      
      onRunTest(cmd);
      
      const fullPath = `${fileStructure.name}/${test.file}`;
      const allFiles = flattenFileTree(fileStructure);
      const fileContent = allFiles.find(f => f.name === fullPath)?.content || '';
      
      const fileIssues = securityIssues.filter(issue => issue.file === test.file);
      const hasRootAccess = policies.some(p => p.enabled && p.id === 'iam-root' && fileContent.includes('root'));
      
      const explicitFail = 
        fileContent.includes('// FAIL') || 
        fileContent.includes('# FAIL') || 
        fileContent.includes('expect(true).toBe(false)') ||
        fileContent.includes('assert False') ||
        fileContent.includes('panic(');

      const duration = Math.floor(Math.random() * 100) + 20;
      await new Promise(r => setTimeout(r, duration + 300));

      if (fileIssues.length > 0) {
          updateTestStatus(test.id, 'failed', duration, `Security Violation: ${fileIssues[0].description}`);
      } else if (hasRootAccess) {
          updateTestStatus(test.id, 'failed', duration, 'Policy Violation: Usage of "root" credentials detected.');
      } else if (explicitFail) {
          updateTestStatus(test.id, 'failed', duration, 'Assertion Error: expected true to be false');
      } else {
          updateTestStatus(test.id, 'passed', duration);
      }
  };

  const handleRunAll = async () => {
      setIsRunningAll(true);
      onWriteToTerminal('Running test suite...');
      
      const setAllRunning = (nodes: TestItem[]): TestItem[] => {
          return nodes.map(n => ({
              ...n,
              status: 'idle',
              message: undefined,
              children: n.children ? setAllRunning(n.children) : undefined
          }));
      };
      setTestTree(prev => setAllRunning(prev));

      const extractTests = (nodes: TestItem[]): TestItem[] => {
          let tests: TestItem[] = [];
          nodes.forEach(n => {
              if (n.type === 'test') tests.push(n);
              if (n.children) tests = tests.concat(extractTests(n.children));
          });
          return tests;
      };

      const allTests = extractTests(testTree);
      
      for (const test of allTests) {
          await runGovernanceCheck(test);
      }
      setIsRunningAll(false);
  };

  const totalTests = testTree.reduce((acc, node) => acc + (node.children?.length || (node.type === 'test' ? 1 : 0)), 0);
  const completedTests = testTree.reduce((acc, node) => acc + (node.children?.filter(c => c.status !== 'idle' && c.status !== 'running').length || (node.status !== 'idle' && node.status !== 'running' ? 1 : 0)), 0);
  const progress = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;

  const renderTree = (nodes: TestItem[], level = 0) => {
      return nodes.map(node => (
          <div key={node.id}>
              <div 
                className={`flex items-start gap-2 py-1.5 px-1 hover:bg-[var(--color-background-tertiary)] rounded cursor-pointer group/item`}
                style={{ paddingLeft: `${level * 12 + 4}px` }}
                onClick={() => node.children && toggleExpand(node.id)}
              >
                  {node.children && node.children.length > 0 ? (
                      expandedNodes.has(node.id) ? <ChevronDown size={12} className="text-gray-500 mt-1"/> : <ChevronRight size={12} className="text-gray-500 mt-1"/>
                  ) : (
                      <span className="w-3" />
                  )}
                  
                  {node.type === 'suite' ? (
                      level === 0 ? <FileCode size={14} className="text-blue-400 mt-0.5" /> : <FlaskConical size={14} className="text-purple-400 mt-0.5" />
                  ) : (
                      <div className="w-3.5" />
                  )}

                  <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${level === 0 ? 'text-gray-300 font-bold' : 'text-gray-400'} truncate`}>
                            {node.name}
                        </span>
                        <div className="flex items-center gap-2">
                            {node.duration && (
                                <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                                    <Clock size={10} /> {node.duration}ms
                                </span>
                            )}
                            <div className="w-4 flex justify-center">
                                {node.status === 'running' && <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>}
                                {node.status === 'passed' && <CheckCircle size={14} className="text-green-500" />}
                                {node.status === 'failed' && <XCircle size={14} className="text-red-500" />}
                            </div>
                        </div>
                      </div>
                      {node.message && (
                          <div className="text-[10px] text-red-400 mt-1 pl-1 border-l-2 border-red-500/50">
                              {node.message}
                          </div>
                      )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                          onClick={(e) => { e.stopPropagation(); onGoToFile(`${fileStructure.name}/${node.file}`); }}
                          className="p-1 hover:bg-gray-600 rounded text-blue-400"
                          title="Go to File"
                      >
                          <FolderOpen size={12} />
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); runGovernanceCheck(node); }}
                          className="p-1 hover:bg-gray-600 rounded text-green-400"
                          title={node.type === 'test' ? 'Run Test' : 'Run Suite'}
                      >
                          <Play size={10} fill="currentColor" />
                      </button>
                  </div>
              </div>
              {node.children && expandedNodes.has(node.id) && (
                  <div>{renderTree(node.children, level + 1)}</div>
              )}
          </div>
      ));
  };

  return (
    <div className="p-2 h-full flex flex-col bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="flex justify-between items-center p-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Testing</h2>
        <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
            {ICONS.COLLAPSE_LEFT}
        </button>
      </div>

      <div className="px-2 pb-2 flex-shrink-0">
          <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Search size={12} /> Test Discovery
                  </h3>
                  <button 
                    onClick={handleScan}
                    className="text-[10px] flex items-center gap-1 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                  >
                      <RefreshCw size={10} className={isScanning ? 'animate-spin' : ''} />
                      {isScanning ? 'Scanning...' : 'Scan Project'}
                  </button>
              </div>
              
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".js,.ts,.tsx,.py,.go,.rs,.java,.c,.cpp"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-[var(--color-border)] rounded-md p-3 text-center cursor-pointer hover:bg-[var(--color-background-tertiary)] hover:border-[var(--color-accent)] transition-colors group"
              >
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 group-hover:text-gray-300">
                      <Upload size={14} />
                      <span>Drag test files here or click to add</span>
                  </div>
              </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 mb-3">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold mb-1">
                  <ShieldAlert size={12} /> Policy Enforcement Active
              </div>
              <p className="text-[10px] text-gray-400">Tests will fail if code violates active security policies.</p>
          </div>

          <div className="flex flex-col gap-2">
            <button 
                onClick={handleRunAll}
                disabled={isRunningAll}
                className={`w-full group relative overflow-hidden rounded-md py-2 px-3 text-xs font-bold text-white shadow-lg transition-all duration-200 
                    ${isRunningAll 
                        ? 'bg-gray-700 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/20 hover:scale-[1.01]'
                    }`}
            >
                <div className="relative flex items-center justify-center gap-2 z-10">
                    {isRunningAll ? (
                        <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Running Suite...</span>
                        </>
                    ) : (
                        <>
                            <Play size={12} fill="currentColor" className="group-hover:text-white" />
                            <span>Run All Checks</span>
                        </>
                    )}
                </div>
            </button>
            
            {isRunningAll && (
                <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}
          </div>
          
          <div className="mt-2 text-[10px] text-gray-500 italic px-1">
              Supports <span className="text-gray-400 font-mono">JS, TS, Python, Go, Rust</span> tests.
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 mt-2 space-y-1">
          {testTree.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                  <p>No tests found.</p>
              </div>
          ) : (
              <div className="text-xs font-mono select-none">
                  {renderTree(testTree)}
              </div>
          )}
      </div>
    </div>
  );
};

export default TestingPane;
