import React, { useState, useCallback, useEffect, useRef } from 'react';
import aiService from '../../services/geminiService';

interface DeployCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  iacCode: string;
  onWriteToTerminal: (output: string | string[]) => void;
  activeModelId: string;
}

const DeployCloudModal: React.FC<DeployCloudModalProps> = ({ isOpen, onClose, iacCode, onWriteToTerminal, activeModelId }) => {
  const [plan, setPlan] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setPlan('');
      setLogs([]);
      setIsPlanning(false);
      setIsDeploying(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  
  const handlePreviewPlan = useCallback(async () => {
    setIsPlanning(true);
    setPlan('');
    try {
      const planResult = await aiService.getTerraformPlan(iacCode, activeModelId);
      setPlan(planResult);
    } catch (error) {
      setPlan('Error generating plan preview.');
    } finally {
      setIsPlanning(false);
    }
  }, [iacCode, activeModelId]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setLogs([]);
    const deployLogs = [
      "Initializing Terraform...",
      "Validating configuration...",
      "Applying changes...",
      "aws_s3_bucket.website: Creating...",
      "aws_s3_bucket.website: Creation complete after 2s",
      "Apply complete! Resources: 1 added, 0 changed, 0 destroyed."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < deployLogs.length) {
        setLogs(prev => [...prev, `> ${deployLogs[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsSuccess(true);
        setIsDeploying(false);
        onWriteToTerminal(["\n$ terraform apply", ...deployLogs, "\nDeployment from chat successful."]);
      }
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-3xl text-white border border-gray-700 shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold">Deploy to Cloud with IaC</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 min-h-0 flex-1">
          {/* Left: Code & Plan */}
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Generated Code</h3>
              <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono max-h-48 overflow-y-auto">
                <code>{iacCode}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Plan Preview</h3>
              <div className="bg-black/50 p-3 rounded-lg text-xs font-mono max-h-48 overflow-y-auto">
                {isPlanning ? 'Generating plan...' : (plan ? <pre><code>{plan}</code></pre> : <span className="text-gray-400">Click "Preview Plan" to see changes.</span>)}
              </div>
            </div>
            <button onClick={handlePreviewPlan} disabled={isPlanning || isDeploying} className="w-full mt-auto px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold disabled:opacity-50">
              {isPlanning ? 'Planning...' : 'Preview Plan'}
            </button>
          </div>

          {/* Right: Logs & Actions */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Deployment Logs</h3>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-gray-300 flex-1 overflow-y-auto">
              {logs.length > 0 ? logs.map((log, i) => <div key={i}>{log}</div>) : <span className="text-gray-500">Deployment not started.</span>}
              {isDeploying && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          {isSuccess ? (
             <button onClick={onClose} className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold">
              Done
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying || isPlanning || !plan}
              className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-gray-900 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployCloudModal;