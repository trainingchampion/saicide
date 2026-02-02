
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SecurityIssue, Severity, SecurityPolicy, ComplianceStandard, ComplianceControl, FileNode } from '../types';
import { ICONS, INITIAL_COMPLIANCE_STANDARDS, INFRASTRUCTURE_SECURITY_CONTROLS } from '../constants';
import { RefreshCw } from 'lucide-react';

interface SecurityPaneProps {
    securityIssues: SecurityIssue[];
    onCollapse: () => void;
    policies: SecurityPolicy[];
    onTogglePolicy: (id: string) => void;
    onSetPolicies: React.Dispatch<React.SetStateAction<SecurityPolicy[]>>;
    fileStructure: FileNode;
}

// Icons
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-text-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.072-.267-2.09-.75-3.042z" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const ScanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>

const StatCard: React.FC<{ icon: React.ReactElement, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)] rounded-lg p-4 flex items-center space-x-4">
        {icon}
        <div>
            <p className="text-[var(--color-text-secondary)] text-sm">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const SeverityPill: React.FC<{ level: 'critical' | 'high' | 'medium' | 'low' }> = ({ level }) => {
    const styles = {
        critical: 'bg-red-500/20 text-red-400',
        high: 'bg-orange-500/20 text-orange-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-gray-500/20 text-gray-400',
    }[level];
    return <span className={`uppercase text-xs font-bold px-2 py-0.5 rounded-full ${styles}`}>{level}</span>;
};

const ComplianceStatusItem: React.FC<{ standard: string, description: string, status: 'pass' | 'fail' }> = ({ standard, description, status }) => (
    <div className="flex items-start justify-between py-3">
        <div>
            <p className="font-semibold text-white">{standard}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
        </div>
        {status === 'pass' ? <CheckCircleIcon /> : <WarningIcon />}
    </div>
);

const ComplianceControlItem: React.FC<{ control: ComplianceControl }> = ({ control }) => (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0 group">
        <div className="mt-0.5 flex-shrink-0 text-green-400">
            {control.status === 'pass' ? <CheckCircleIcon /> : <WarningIcon />}
        </div>
        <div>
            <p className="font-semibold text-white text-sm group-hover:text-[var(--color-text-accent)] transition-colors">{control.control}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{control.description}</p>
        </div>
    </div>
);

const PolicyToggle: React.FC<{ policy: SecurityPolicy, onToggle: (id: string) => void }> = ({ policy, onToggle }) => {
    return (
        <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)] rounded-lg p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white">{policy.title}</h4>
                        <SeverityPill level={policy.severity} />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{policy.description}</p>
                    {policy.violationsCount > 0 && (
                        <div className="text-[var(--color-warning)] text-sm mt-2 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="ml-2">{policy.violationsCount} violations detected</span>
                        </div>
                    )}
                </div>
                <div 
                    onClick={() => onToggle(policy.id)}
                    className={`w-12 h-6 rounded-full p-1 flex items-center cursor-pointer transition-colors ${policy.enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-background-hover)]'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${policy.enabled ? 'translate-x-6' : 'translate-x-0'}`}/>
                </div>
            </div>
        </div>
    );
};


const SecurityPane: React.FC<SecurityPaneProps> = ({ securityIssues, onCollapse, policies, onTogglePolicy, onSetPolicies, fileStructure }) => {
    const [compliance, setCompliance] = useState<ComplianceStandard[]>(INITIAL_COMPLIANCE_STANDARDS);
    const [isScanning, setIsScanning] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure'>('overview');
    const [detectedIssues, setDetectedIssues] = useState<SecurityIssue[]>([]);
    const [scanLog, setScanLog] = useState<string[]>([]);

    const [activePoliciesCount, setActivePoliciesCount] = useState(0);
    const [totalViolations, setTotalViolations] = useState(0);
    const [complianceScore, setComplianceScore] = useState("100.0%");

    // Dynamic resource counter using actual file structure
    const resourcesMonitored = useMemo(() => {
        let count = 0;
        const scan = (node: FileNode) => {
            if (node.type === 'file') {
                const content = node.content || '';
                // Count infra resources
                const matches = content.match(/resource\s+"[^"]+"\s+"[^"]+"/g);
                if (matches) count += matches.length;
                // Count container steps
                if (node.name.toLowerCase() === 'dockerfile') {
                    const layers = content.split('\n').filter((l: string) => l.trim().match(/^(FROM|RUN|COPY|ADD|CMD|ENTRYPOINT)/)).length;
                    count += layers;
                }
                // Count K8s resources
                const k8sMatches = content.match(/kind:\s*(Deployment|Service|Pod|Ingress|ConfigMap|Secret|StatefulSet)/g);
                if (k8sMatches) count += k8sMatches.length;
            }
            if (node.children) node.children.forEach(scan);
        };
        scan(fileStructure);
        return count;
    }, [fileStructure]);

    // Dynamic infrastructure controls based on actual file content analysis
    const dynamicInfraControls = useMemo(() => {
        const controls: ComplianceControl[] = [];
        
        const checkFiles = (node: FileNode) => {
            if (node.type === 'file' && node.content) {
                const content = node.content;
                const fileName = node.name.toLowerCase();
                
                // Check for VPC Flow Logs in Terraform
                if (fileName.includes('.tf')) {
                    if (/aws_flow_log|google_compute_subnetwork.*log_config|azurerm_network_watcher_flow_log/i.test(content)) {
                        controls.push({ id: 'vpc-flow', control: 'VPC Flow Logs Enabled', description: `Found in ${node.name}`, status: 'pass' });
                    }
                    
                    // Check for encryption
                    if (/encrypted\s*=\s*true|storage_encrypted\s*=\s*true|kms_key/i.test(content)) {
                        controls.push({ id: 'encrypt', control: 'Encryption Enabled', description: `Storage encryption configured in ${node.name}`, status: 'pass' });
                    }
                    
                    // Check for Multi-AZ
                    if (/multi_az\s*=\s*true|availability_zone/i.test(content)) {
                        controls.push({ id: 'multi-az', control: 'Multi-AZ Deployment', description: `High availability configured in ${node.name}`, status: 'pass' });
                    }
                    
                    // Check for S3 versioning
                    if (/versioning\s*\{[\s\S]*enabled\s*=\s*true/i.test(content)) {
                        controls.push({ id: 's3-version', control: 'S3 Bucket Versioning', description: `Versioning enabled in ${node.name}`, status: 'pass' });
                    }
                    
                    // Check for public access blocks
                    if (/block_public_acls\s*=\s*true/i.test(content)) {
                        controls.push({ id: 's3-public', control: 'S3 Public Access Blocked', description: `Public access blocked in ${node.name}`, status: 'pass' });
                    }
                }
                
                // Check Docker security
                if (fileName === 'dockerfile') {
                    if (/^USER\s+(?!root)/im.test(content)) {
                        controls.push({ id: 'docker-user', control: 'Non-Root Container User', description: 'Container runs as non-root user', status: 'pass' });
                    }
                    if (/HEALTHCHECK/i.test(content)) {
                        controls.push({ id: 'docker-health', control: 'Docker Health Check', description: 'Container has health check configured', status: 'pass' });
                    }
                }
                
                // Check Kubernetes security
                if (fileName.includes('.yaml') || fileName.includes('.yml')) {
                    if (/securityContext[\s\S]*runAsNonRoot:\s*true/i.test(content)) {
                        controls.push({ id: 'k8s-nonroot', control: 'K8s Non-Root Pod', description: 'Pod configured to run as non-root', status: 'pass' });
                    }
                    if (/resources:[\s\S]*limits:/i.test(content)) {
                        controls.push({ id: 'k8s-limits', control: 'K8s Resource Limits', description: 'Resource limits configured for pods', status: 'pass' });
                    }
                    if (/networkPolicy/i.test(content)) {
                        controls.push({ id: 'k8s-netpol', control: 'K8s Network Policy', description: 'Network policies configured', status: 'pass' });
                    }
                }
            }
            if (node.children) node.children.forEach(checkFiles);
        };
        
        checkFiles(fileStructure);
        
        // Return found controls or default ones
        return controls.length > 0 ? controls : INFRASTRUCTURE_SECURITY_CONTROLS;
    }, [fileStructure]);

    useEffect(() => {
        const active = policies.filter(p => p.enabled);
        const violations = active.reduce((sum, p) => sum + p.violationsCount, 0);
        const policiesWithViolations = active.filter(p => p.violationsCount > 0).length;

        setActivePoliciesCount(active.length);
        setTotalViolations(violations);

        if (active.length === 0) {
            setComplianceScore("100.0%");
        } else {
            const score = ((active.length - policiesWithViolations) / active.length) * 100;
            setComplianceScore(`${score.toFixed(1)}%`);
        }
    }, [policies]);

    // Real security scanning function that analyzes actual file content
    const scanFileForIssues = useCallback((node: FileNode, issues: SecurityIssue[], log: string[]) => {
        if (node.type === 'file' && node.content) {
            const lines = node.content.split('\n');
            const fileName = node.name.toLowerCase();
            
            lines.forEach((line, idx) => {
                const lineNum = idx + 1;
                const lineLower = line.toLowerCase();
                
                // Check for hardcoded secrets/credentials
                if (/password\s*[=:]\s*['"]\w+/i.test(line) || 
                    /api[_-]?key\s*[=:]\s*['"]\w+/i.test(line) ||
                    /secret\s*[=:]\s*['"]\w+/i.test(line) ||
                    /token\s*[=:]\s*['"]\w+/i.test(line)) {
                    issues.push({
                        id: `${node.name}-${lineNum}-cred`,
                        file: node.name,
                        line: lineNum,
                        severity: Severity.CRITICAL,
                        description: 'Hardcoded credential detected',
                        recommendation: 'Use environment variables or a secrets manager'
                    });
                    log.push(`🔴 CRITICAL: Hardcoded credential in ${node.name}:${lineNum}`);
                }
                
                // Check for public S3 bucket access
                if (/acl\s*=\s*["']public-read/i.test(line) || 
                    /acl\s*=\s*["']public-read-write/i.test(line) ||
                    /public_access_block\s*=\s*false/i.test(line)) {
                    issues.push({
                        id: `${node.name}-${lineNum}-s3`,
                        file: node.name,
                        line: lineNum,
                        severity: Severity.CRITICAL,
                        description: 'Public S3 bucket access detected',
                        recommendation: 'Set ACL to private and use proper IAM policies'
                    });
                    log.push(`🔴 CRITICAL: Public S3 access in ${node.name}:${lineNum}`);
                }
                
                // Check for open SSH (port 22) to world
                if (/0\.0\.0\.0\/0/.test(line) && (/22|ssh/i.test(line) || lineLower.includes('from_port') || lineLower.includes('ingress'))) {
                    issues.push({
                        id: `${node.name}-${lineNum}-ssh`,
                        file: node.name,
                        line: lineNum,
                        severity: Severity.MEDIUM,
                        description: 'SSH port open to world (0.0.0.0/0)',
                        recommendation: 'Restrict SSH access to specific IP ranges'
                    });
                    log.push(`🟡 MEDIUM: Open SSH access in ${node.name}:${lineNum}`);
                }
                
                // Check for unencrypted storage
                if (fileName.includes('.tf') || fileName.includes('terraform')) {
                    if (/encrypted\s*=\s*false/i.test(line) || /storage_encrypted\s*=\s*false/i.test(line)) {
                        issues.push({
                            id: `${node.name}-${lineNum}-encrypt`,
                            file: node.name,
                            line: lineNum,
                            severity: Severity.HIGH,
                            description: 'Unencrypted storage resource',
                            recommendation: 'Enable encryption for data at rest'
                        });
                        log.push(`🟠 HIGH: Unencrypted storage in ${node.name}:${lineNum}`);
                    }
                }
                
                // Check for missing resource tags
                if (fileName.includes('.tf') && /resource\s+"aws_/i.test(line)) {
                    // Look for tags in nearby lines (simplified check)
                    const nextLines = lines.slice(idx, idx + 20).join('\n');
                    if (!/tags\s*=/.test(nextLines)) {
                        issues.push({
                            id: `${node.name}-${lineNum}-tags`,
                            file: node.name,
                            line: lineNum,
                            severity: Severity.LOW,
                            description: 'AWS resource may be missing required tags',
                            recommendation: 'Add CostCenter and Environment tags'
                        });
                        log.push(`⚪ LOW: Missing tags in ${node.name}:${lineNum}`);
                    }
                }
                
                // Check Docker for running as root
                if (fileName === 'dockerfile') {
                    if (/^USER\s+root/i.test(line.trim())) {
                        issues.push({
                            id: `${node.name}-${lineNum}-root`,
                            file: node.name,
                            line: lineNum,
                            severity: Severity.HIGH,
                            description: 'Container running as root user',
                            recommendation: 'Use a non-root user for better security'
                        });
                        log.push(`🟠 HIGH: Root user in Dockerfile:${lineNum}`);
                    }
                }
                
                // Check for eval() usage (code injection risk)
                if (/\beval\s*\(/.test(line)) {
                    issues.push({
                        id: `${node.name}-${lineNum}-eval`,
                        file: node.name,
                        line: lineNum,
                        severity: Severity.HIGH,
                        description: 'Use of eval() detected - code injection risk',
                        recommendation: 'Avoid eval() - use safer alternatives'
                    });
                    log.push(`🟠 HIGH: eval() usage in ${node.name}:${lineNum}`);
                }
                
                // Check for SQL injection patterns
                if (/\+\s*["'].*SELECT|INSERT|UPDATE|DELETE/i.test(line) || 
                    /\$\{.*\}.*SELECT|INSERT|UPDATE|DELETE/i.test(line)) {
                    issues.push({
                        id: `${node.name}-${lineNum}-sql`,
                        file: node.name,
                        line: lineNum,
                        severity: Severity.CRITICAL,
                        description: 'Potential SQL injection vulnerability',
                        recommendation: 'Use parameterized queries or an ORM'
                    });
                    log.push(`🔴 CRITICAL: SQL injection risk in ${node.name}:${lineNum}`);
                }
            });
        }
        
        // Recursively scan children
        if (node.children) {
            node.children.forEach(child => scanFileForIssues(child, issues, log));
        }
    }, []);

    const handleScanProject = useCallback(() => {
        setIsScanning(true);
        setScanLog(['🔍 Starting security scan...']);
        setDetectedIssues([]);
        
        // Run scan with small delay to show loading state
        setTimeout(() => {
            const issues: SecurityIssue[] = [];
            const log: string[] = ['🔍 Starting security scan...'];
            
            // Scan the entire file structure
            scanFileForIssues(fileStructure, issues, log);
            
            log.push(`\n📊 Scan complete: ${issues.length} issue(s) found`);
            
            setDetectedIssues(issues);
            setScanLog(log);
            
            // Update policy violation counts based on real issues
            onSetPolicies(currentPolicies => {
                return currentPolicies.map(policy => {
                    let newViolationsCount = 0;
                    if (policy.enabled) {
                        // Match issues to policy by severity
                        const matchingIssues = issues.filter(issue => policy.issueTypes.includes(issue.severity));
                        newViolationsCount = matchingIssues.length;
                    }
                    return { ...policy, violationsCount: newViolationsCount };
                });
            });
            
            // Update compliance standards based on findings
            setCompliance(prev => prev.map(standard => {
                // Fail compliance if critical issues are found
                const criticalCount = issues.filter(i => i.severity === Severity.CRITICAL).length;
                const highCount = issues.filter(i => i.severity === Severity.HIGH).length;
                
                if (standard.id === 'soc2' && (criticalCount > 0 || highCount > 2)) {
                    return { ...standard, status: 'fail' as const };
                }
                if (standard.id === 'pci' && criticalCount > 0) {
                    return { ...standard, status: 'fail' as const };
                }
                if (standard.id === 'hipaa' && issues.some(i => i.description.includes('credential'))) {
                    return { ...standard, status: 'fail' as const };
                }
                return { ...standard, status: 'pass' as const };
            }));
            
            setIsScanning(false);
        }, 800);
    }, [fileStructure, onSetPolicies, scanFileForIssues]);

    return (
        <div className="p-4 h-full flex flex-col overflow-y-auto bg-[var(--color-background)] text-[var(--color-text-primary)]">
            <div className="flex justify-end">
                 <button onClick={onCollapse} title="Collapse Panel" className="text-[var(--color-text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--color-background-tertiary)]">
                    {ICONS.COLLAPSE_LEFT}
                </button>
            </div>
            <div className="text-center mb-6">
                <span className="inline-block bg-[var(--color-background-tertiary)]/50 border border-[var(--color-border)] rounded-full px-3 py-1 text-sm text-[var(--color-text-primary)]">
                    Governance & Compliance
                </span>
                <h1 className="text-2xl font-bold text-white mt-3">Built-in Policy Enforcement</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">Automated governance with compliance checks and security guardrails</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <StatCard icon={<ShieldIcon />} label="Active Policies" value={activePoliciesCount} />
                <StatCard icon={<WarningIcon />} label="Policy Violations" value={totalViolations} />
                <StatCard icon={<CheckCircleIcon />} label="Compliance Score" value={complianceScore} />
                <StatCard icon={<EyeIcon />} label="Resources Monitored" value={resourcesMonitored} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Security Policies</h3>
                        <button 
                            onClick={handleScanProject} 
                            disabled={isScanning}
                            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center disabled:bg-gray-600 disabled:cursor-wait"
                        >
                            {isScanning ? (
                                <>
                                 <RefreshCw size={16} className="animate-spin mr-2" />
                                 Scanning Workspace...
                                </>
                            ) : (
                                <>
                                 <ScanIcon />
                                 Scan Project
                                </>
                            )}
                        </button>
                    </div>
                    {policies.map(policy => (
                        <PolicyToggle key={policy.id} policy={policy} onToggle={onTogglePolicy} />
                    ))}
                    
                    {/* Detected Issues Section */}
                    {detectedIssues.length > 0 && (
                        <div className="mt-6 bg-[var(--color-background-secondary)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)] rounded-lg p-4">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Detected Issues ({detectedIssues.length})
                            </h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {detectedIssues.map(issue => (
                                    <div key={issue.id} className="bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <SeverityPill level={issue.severity === Severity.CRITICAL ? 'critical' : issue.severity === Severity.HIGH ? 'high' : issue.severity === Severity.MEDIUM ? 'medium' : 'low'} />
                                                    <span className="text-xs text-[var(--color-text-secondary)]">{issue.file}:{issue.line}</span>
                                                </div>
                                                <p className="text-sm text-white font-medium">{issue.description}</p>
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                                    💡 {issue.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Scan Log */}
                    {scanLog.length > 1 && (
                        <div className="mt-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
                            <h5 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Scan Log</h5>
                            <div className="font-mono text-xs space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {scanLog.map((log, i) => (
                                    <div key={i} className="text-[var(--color-text-secondary)]">{log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Compliance Status</h3>
                    </div>
                    <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] shadow-[0_0_20px_var(--color-card-glow)] rounded-lg flex flex-col h-[500px]">
                        {/* Tabs */}
                        <div className="flex border-b border-[var(--color-border)]">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-[var(--color-background-tertiary)]/30' : 'text-gray-400 hover:text-white'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('infrastructure')}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'infrastructure' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-[var(--color-background-tertiary)]/30' : 'text-gray-400 hover:text-white'}`}
                            >
                                Infrastructure Security
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            {activeTab === 'overview' ? (
                                <div className="divide-y divide-[var(--color-border)]">
                                    {compliance.map(c => (
                                        <ComplianceStatusItem
                                            key={c.id}
                                            standard={c.standard}
                                            description={c.description}
                                            status={c.status}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 mb-3 uppercase font-bold tracking-wider">
                                        {dynamicInfraControls.length > 0 ? 'Detected Security Controls' : 'Default Controls'}
                                    </p>
                                    {dynamicInfraControls.map(control => (
                                        <ComplianceControlItem key={control.id} control={control} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPane;
