import React, { useState, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';
import {
    Brain,
    Play,
    Square,
    Upload,
    Download,
    Settings,
    ChevronRight,
    ChevronDown,
    Plus,
    Trash2,
    Activity,
    TrendingUp,
    Database,
    Cpu,
    Target,
    Sparkles,
    Eye,
    Table,
    Search,
    X,
    Gauge,
    ArrowDownRight,
    PanelLeft,
    Zap,
    AlertCircle,
    CheckCircle,
    Save
} from 'lucide-react';

interface MlStudioPaneProps {
    onCollapse: () => void;
    activeModelId?: string;
}

interface Dataset {
    id: string;
    name: string;
    data: any[];
    columns: string[];
    rows: number;
    size: string;
    type: 'csv' | 'json';
    uploadedAt: Date;
    targetColumn?: string;
    featureColumns?: string[];
}

interface MLModel {
    id: string;
    name: string;
    type: 'classification' | 'regression';
    status: 'draft' | 'training' | 'trained' | 'deployed' | 'failed';
    accuracy?: number;
    loss?: number;
    epochs: number;
    learningRate: number;
    hiddenLayers: number[];
    datasetId?: string;
    tfModel?: tf.LayersModel;
    createdAt: Date;
    trainedAt?: Date;
    trainingHistory?: { loss: number[]; accuracy: number[]; valLoss?: number[]; valAccuracy?: number[] };
}

interface TrainingJob {
    id: string;
    modelId: string;
    modelName: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    progress: number;
    currentEpoch: number;
    totalEpochs: number;
    currentLoss: number;
    currentAccuracy: number;
    startedAt: Date;
    logs: string[];
}

const MlStudioPane: React.FC<MlStudioPaneProps> = ({ onCollapse }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'models' | 'training' | 'deploy'>('overview');
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [models, setModels] = useState<MLModel[]>([]);
    const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
    const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [isNewModelOpen, setIsNewModelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ quickActions: true, resources: true });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    
    // Model configuration state
    const [newModelConfig, setNewModelConfig] = useState({
        name: '',
        type: 'classification' as 'classification' | 'regression',
        epochs: 50,
        learningRate: 0.001,
        hiddenLayers: [64, 32],
        datasetId: '',
        targetColumn: '',
        featureColumns: [] as string[]
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const stopTrainingRef = useRef<boolean>(false);

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Parse uploaded file
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isCSV = file.name.endsWith('.csv');
        const isJSON = file.name.endsWith('.json');

        if (!isCSV && !isJSON) {
            showNotification('Please upload a CSV or JSON file', 'error');
            return;
        }

        if (isCSV) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const data = results.data as any[];
                    const columns = results.meta.fields || [];
                    const newDataset: Dataset = {
                        id: `ds_${Date.now()}`,
                        name: file.name,
                        data: data.filter(row => Object.values(row).some(v => v !== '' && v !== null)),
                        columns,
                        rows: data.length,
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                        type: 'csv',
                        uploadedAt: new Date()
                    };
                    setDatasets(prev => [...prev, newDataset]);
                    showNotification(`Dataset "${file.name}" uploaded successfully!`, 'success');
                },
                error: (error) => {
                    showNotification(`Failed to parse CSV: ${error.message}`, 'error');
                }
            });
        } else if (isJSON) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    const data = Array.isArray(jsonData) ? jsonData : [jsonData];
                    const columns = data.length > 0 ? Object.keys(data[0]) : [];
                    const newDataset: Dataset = {
                        id: `ds_${Date.now()}`,
                        name: file.name,
                        data,
                        columns,
                        rows: data.length,
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                        type: 'json',
                        uploadedAt: new Date()
                    };
                    setDatasets(prev => [...prev, newDataset]);
                    showNotification(`Dataset "${file.name}" uploaded successfully!`, 'success');
                } catch {
                    showNotification('Failed to parse JSON file', 'error');
                }
            };
            reader.readAsText(file);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    // Create TensorFlow model
    const createTFModel = (config: typeof newModelConfig, inputShape: number): tf.LayersModel => {
        const model = tf.sequential();
        
        // Input layer
        model.add(tf.layers.dense({
            units: config.hiddenLayers[0] || 64,
            activation: 'relu',
            inputShape: [inputShape]
        }));

        // Hidden layers
        for (let i = 1; i < config.hiddenLayers.length; i++) {
            model.add(tf.layers.dense({
                units: config.hiddenLayers[i],
                activation: 'relu'
            }));
            // Add dropout for regularization
            model.add(tf.layers.dropout({ rate: 0.2 }));
        }

        // Output layer
        if (config.type === 'classification') {
            model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        } else {
            model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        }

        // Compile model
        model.compile({
            optimizer: tf.train.adam(config.learningRate),
            loss: config.type === 'classification' ? 'binaryCrossentropy' : 'meanSquaredError',
            metrics: ['accuracy']
        });

        return model;
    };

    // Prepare data for training
    const prepareData = (dataset: Dataset, targetColumn: string, featureColumns: string[]) => {
        const features: number[][] = [];
        const labels: number[] = [];

        for (const row of dataset.data) {
            const featureRow = featureColumns.map(col => {
                const val = parseFloat(row[col]);
                return isNaN(val) ? 0 : val;
            });
            const label = parseFloat(row[targetColumn]);
            if (!isNaN(label)) {
                features.push(featureRow);
                labels.push(label);
            }
        }

        // Normalize features
        const featureTensor = tf.tensor2d(features);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

        const { mean, variance } = tf.moments(featureTensor, 0);
        const normalizedFeatures = featureTensor.sub(mean).div(variance.sqrt().add(1e-7));

        // Split into train/test (80/20)
        const splitIdx = Math.floor(features.length * 0.8);
        const xTrain = normalizedFeatures.slice([0, 0], [splitIdx, -1]);
        const yTrain = labelTensor.slice([0, 0], [splitIdx, -1]);
        const xTest = normalizedFeatures.slice([splitIdx, 0], [-1, -1]);
        const yTest = labelTensor.slice([splitIdx, 0], [-1, -1]);

        return { xTrain, yTrain, xTest, yTest, mean, variance };
    };

    // Train model
    const trainModel = async (model: MLModel) => {
        const dataset = datasets.find(d => d.id === model.datasetId);
        if (!dataset || !model.datasetId) {
            showNotification('Please select a dataset first', 'error');
            return;
        }

        const targetColumn = dataset.targetColumn;
        const featureColumns = dataset.featureColumns;

        if (!targetColumn || !featureColumns || featureColumns.length === 0) {
            showNotification('Please configure target and feature columns', 'error');
            return;
        }

        stopTrainingRef.current = false;

        // Create training job
        const jobId = `job_${Date.now()}`;
        const newJob: TrainingJob = {
            id: jobId,
            modelId: model.id,
            modelName: model.name,
            status: 'running',
            progress: 0,
            currentEpoch: 0,
            totalEpochs: model.epochs,
            currentLoss: 0,
            currentAccuracy: 0,
            startedAt: new Date(),
            logs: ['Starting training...']
        };
        setTrainingJobs(prev => [newJob, ...prev]);
        setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'training' } : m));
        setActiveTab('training');

        try {
            // Prepare data
            const { xTrain, yTrain, xTest, yTest } = prepareData(dataset, targetColumn, featureColumns);
            
            // Create TensorFlow model
            const tfModel = createTFModel({
                ...newModelConfig,
                type: model.type,
                epochs: model.epochs,
                learningRate: model.learningRate,
                hiddenLayers: model.hiddenLayers
            }, featureColumns.length);

            const trainingHistory: { loss: number[]; accuracy: number[] } = { loss: [], accuracy: [] };

            // Train
            await tfModel.fit(xTrain, yTrain, {
                epochs: model.epochs,
                batchSize: 32,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: async (epoch, logs) => {
                        if (stopTrainingRef.current) {
                            tfModel.stopTraining = true;
                            return;
                        }

                        const loss = logs?.loss || 0;
                        const accuracy = logs?.acc || logs?.accuracy || 0;
                        trainingHistory.loss.push(loss);
                        trainingHistory.accuracy.push(accuracy);

                        setTrainingJobs(prev => prev.map(j => 
                            j.id === jobId ? {
                                ...j,
                                currentEpoch: epoch + 1,
                                progress: ((epoch + 1) / model.epochs) * 100,
                                currentLoss: loss,
                                currentAccuracy: accuracy,
                                logs: [...j.logs, `Epoch ${epoch + 1}/${model.epochs} - loss: ${loss.toFixed(4)}, accuracy: ${(accuracy * 100).toFixed(2)}%`]
                            } : j
                        ));
                    }
                }
            });

            if (stopTrainingRef.current) {
                setTrainingJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'stopped', logs: [...j.logs, 'Training stopped by user'] } : j));
                setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'draft' } : m));
                showNotification('Training stopped', 'info');
                return;
            }

            // Evaluate on test set
            const evalResult = tfModel.evaluate(xTest, yTest) as tf.Scalar[];
            const testLoss = (await evalResult[0].data())[0];
            const testAccuracy = (await evalResult[1].data())[0];

            // Update model and job
            setModels(prev => prev.map(m => 
                m.id === model.id ? {
                    ...m,
                    status: 'trained',
                    tfModel,
                    accuracy: testAccuracy,
                    loss: testLoss,
                    trainedAt: new Date(),
                    trainingHistory
                } : m
            ));

            setTrainingJobs(prev => prev.map(j => 
                j.id === jobId ? {
                    ...j,
                    status: 'completed',
                    progress: 100,
                    currentLoss: testLoss,
                    currentAccuracy: testAccuracy,
                    logs: [...j.logs, `Training completed! Test accuracy: ${(testAccuracy * 100).toFixed(2)}%`]
                } : j
            ));

            showNotification(`Model trained successfully! Accuracy: ${(testAccuracy * 100).toFixed(2)}%`, 'success');

            // Cleanup tensors
            xTrain.dispose();
            yTrain.dispose();
            xTest.dispose();
            yTest.dispose();

        } catch (error: any) {
            console.error('Training error:', error);
            setTrainingJobs(prev => prev.map(j => 
                j.id === jobId ? { ...j, status: 'failed', logs: [...j.logs, `Error: ${error.message}`] } : j
            ));
            setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'failed' } : m));
            showNotification(`Training failed: ${error.message}`, 'error');
        }
    };

    const stopTraining = () => {
        stopTrainingRef.current = true;
    };

    // Create new model
    const handleCreateModel = () => {
        if (!newModelConfig.name.trim()) {
            showNotification('Please enter a model name', 'error');
            return;
        }

        const newModel: MLModel = {
            id: `model_${Date.now()}`,
            name: newModelConfig.name,
            type: newModelConfig.type,
            status: 'draft',
            epochs: newModelConfig.epochs,
            learningRate: newModelConfig.learningRate,
            hiddenLayers: [...newModelConfig.hiddenLayers],
            datasetId: newModelConfig.datasetId,
            createdAt: new Date()
        };

        setModels(prev => [newModel, ...prev]);
        setSelectedModel(newModel);
        setIsNewModelOpen(false);
        setNewModelConfig({
            name: '',
            type: 'classification',
            epochs: 50,
            learningRate: 0.001,
            hiddenLayers: [64, 32],
            datasetId: '',
            targetColumn: '',
            featureColumns: []
        });
        showNotification(`Model "${newModel.name}" created!`, 'success');
        setActiveTab('models');
    };

    // Delete dataset
    const deleteDataset = (id: string) => {
        setDatasets(prev => prev.filter(d => d.id !== id));
        if (selectedDataset?.id === id) setSelectedDataset(null);
        showNotification('Dataset deleted', 'info');
    };

    // Delete model
    const deleteModel = (id: string) => {
        const model = models.find(m => m.id === id);
        if (model?.tfModel) {
            model.tfModel.dispose();
        }
        setModels(prev => prev.filter(m => m.id !== id));
        if (selectedModel?.id === id) setSelectedModel(null);
        showNotification('Model deleted', 'info');
    };

    // Export model
    const exportModel = async (model: MLModel) => {
        if (!model.tfModel) {
            showNotification('Model has not been trained yet', 'error');
            return;
        }
        try {
            await model.tfModel.save(`downloads://${model.name.replace(/\s+/g, '_')}`);
            showNotification(`Model exported successfully!`, 'success');
        } catch (error: any) {
            showNotification(`Export failed: ${error.message}`, 'error');
        }
    };

    // Make prediction
    const [predictionInput, setPredictionInput] = useState<Record<string, string>>({});
    const [predictionResult, setPredictionResult] = useState<number | null>(null);

    const makePrediction = async (model: MLModel) => {
        if (!model.tfModel) {
            showNotification('Model not trained', 'error');
            return;
        }

        const dataset = datasets.find(d => d.id === model.datasetId);
        if (!dataset?.featureColumns) return;

        const inputValues = dataset.featureColumns.map(col => {
            const val = parseFloat(predictionInput[col] || '0');
            return isNaN(val) ? 0 : val;
        });

        const inputTensor = tf.tensor2d([inputValues]);
        const prediction = model.tfModel.predict(inputTensor) as tf.Tensor;
        const result = (await prediction.data())[0];
        
        setPredictionResult(model.type === 'classification' ? (result > 0.5 ? 1 : 0) : result);
        inputTensor.dispose();
        prediction.dispose();
    };

    const getStatusColor = (status: MLModel['status'] | TrainingJob['status']) => {
        switch (status) {
            case 'deployed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'trained':
            case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'training':
            case 'running': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'stopped':
            case 'draft': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const renderOverview = () => (
        <div className="p-4 space-y-6 overflow-y-auto h-full custom-scrollbar">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={16} className="text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Models</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{models.length}</div>
                    <div className="text-[10px] text-purple-300 mt-1">{models.filter(m => m.status === 'trained').length} trained</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Datasets</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{datasets.length}</div>
                    <div className="text-[10px] text-blue-300 mt-1">{datasets.reduce((acc, d) => acc + d.rows, 0).toLocaleString()} rows total</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Training</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{trainingJobs.filter(j => j.status === 'running').length}</div>
                    <div className="text-[10px] text-amber-300 mt-1">active jobs</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Best Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {models.length > 0 ? `${(Math.max(...models.filter(m => m.accuracy).map(m => m.accuracy || 0)) * 100).toFixed(1)}%` : '-'}
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-1">across all models</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <button onClick={() => toggleSection('quickActions')} className="flex items-center gap-2 w-full text-left mb-3">
                    {expandedSections.quickActions ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Actions</span>
                </button>
                {expandedSections.quickActions && (
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setIsNewModelOpen(true)} className="flex items-center gap-2 p-3 bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)] transition-all group">
                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <Plus size={14} className="text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-300">New Model</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 p-3 bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)] transition-all group">
                            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                <Upload size={14} className="text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-300">Upload Data</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Active Training */}
            {trainingJobs.filter(j => j.status === 'running').length > 0 && (
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <Activity size={12} className="text-amber-400 animate-pulse" />
                        Active Training
                    </h3>
                    <div className="space-y-2">
                        {trainingJobs.filter(j => j.status === 'running').map(job => (
                            <div key={job.id} className="bg-[var(--color-background-secondary)] rounded-lg p-3 border border-[var(--color-border)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-white">{job.modelName}</span>
                                    <button onClick={stopTraining} className="p-1 hover:bg-red-500/20 rounded transition-colors" title="Stop Training">
                                        <Square size={12} className="text-red-400" />
                                    </button>
                                </div>
                                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Epoch {job.currentEpoch}/{job.totalEpochs}</span>
                                    <span>Loss: {job.currentLoss.toFixed(4)}</span>
                                    <span>Acc: {(job.currentAccuracy * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Models */}
            {models.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Models</h3>
                    <div className="space-y-2">
                        {models.slice(0, 3).map(model => (
                            <button
                                key={model.id}
                                onClick={() => { setSelectedModel(model); setActiveTab('models'); }}
                                className="w-full flex items-center gap-3 p-3 bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)] transition-all text-left"
                            >
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Brain size={14} className="text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{model.name}</div>
                                    <div className="text-[10px] text-slate-400">{model.type} • {model.epochs} epochs</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(model.status)}`}>
                                    {model.status}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {models.length === 0 && datasets.length === 0 && (
                <div className="text-center py-12">
                    <Brain size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-bold text-white mb-2">Welcome to ML Studio</h3>
                    <p className="text-sm text-slate-400 mb-4">Upload a dataset to get started with real machine learning</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold text-white transition-colors">
                        Upload Dataset
                    </button>
                </div>
            )}
        </div>
    );

    const renderDatasets = () => (
        <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search datasets..."
                        className="w-full pl-9 pr-3 py-2 bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-white transition-colors">
                    <Upload size={16} />
                </button>
            </div>

            {datasets.length === 0 ? (
                <div className="text-center py-12">
                    <Database size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-bold text-white mb-2">No Datasets</h3>
                    <p className="text-sm text-slate-400 mb-4">Upload a CSV or JSON file to get started</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold text-white transition-colors">
                        Upload Dataset
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {datasets.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map(dataset => (
                        <div
                            key={dataset.id}
                            onClick={() => setSelectedDataset(dataset)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedDataset?.id === dataset.id
                                    ? 'bg-cyan-500/10 border-cyan-500/50'
                                    : 'bg-[var(--color-background-secondary)] border-[var(--color-border)] hover:border-cyan-500/30'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Table size={16} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{dataset.name}</div>
                                    <div className="text-[10px] text-slate-400">{dataset.rows.toLocaleString()} rows × {dataset.columns.length} cols</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-slate-400">{dataset.size}</span>
                                    <button onClick={(e) => { e.stopPropagation(); deleteDataset(dataset.id); }} className="p-1 hover:bg-red-500/20 rounded transition-colors">
                                        <Trash2 size={12} className="text-slate-500 hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDataset && (
                <div className="mt-4 p-4 bg-[var(--color-background-secondary)] rounded-xl border border-[var(--color-border)]">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Eye size={14} className="text-cyan-400" />
                        Data Preview - {selectedDataset.name}
                    </h3>
                    
                    {/* Column Configuration */}
                    <div className="mb-4 space-y-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Target Column (what to predict)</label>
                            <select
                                value={selectedDataset.targetColumn || ''}
                                onChange={(e) => {
                                    const updated = { ...selectedDataset, targetColumn: e.target.value };
                                    setDatasets(prev => prev.map(d => d.id === selectedDataset.id ? updated : d));
                                    setSelectedDataset(updated);
                                }}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">Select target column...</option>
                                {selectedDataset.columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Feature Columns (inputs)</label>
                            <div className="flex flex-wrap gap-1">
                                {selectedDataset.columns.filter(c => c !== selectedDataset.targetColumn).map(col => {
                                    const isSelected = selectedDataset.featureColumns?.includes(col);
                                    return (
                                        <button
                                            key={col}
                                            onClick={() => {
                                                const features = selectedDataset.featureColumns || [];
                                                const updated = {
                                                    ...selectedDataset,
                                                    featureColumns: isSelected ? features.filter(f => f !== col) : [...features, col]
                                                };
                                                setDatasets(prev => prev.map(d => d.id === selectedDataset.id ? updated : d));
                                                setSelectedDataset(updated);
                                            }}
                                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                                                isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            {col}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-48">
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                    {selectedDataset.columns.slice(0, 6).map(col => (
                                        <th key={col} className="text-left py-1 px-2 whitespace-nowrap">{col}</th>
                                    ))}
                                    {selectedDataset.columns.length > 6 && <th className="text-left py-1 px-2">...</th>}
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {selectedDataset.data.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-slate-800">
                                        {selectedDataset.columns.slice(0, 6).map(col => (
                                            <td key={col} className="py-1 px-2 whitespace-nowrap max-w-[100px] truncate">{String(row[col] ?? '')}</td>
                                        ))}
                                        {selectedDataset.columns.length > 6 && <td className="py-1 px-2">...</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">Showing first 5 of {selectedDataset.rows} rows</div>
                </div>
            )}
        </div>
    );

    const renderModels = () => (
        <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="w-full pl-9 pr-3 py-2 bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
                <button onClick={() => setIsNewModelOpen(true)} className="p-2 bg-purple-500 hover:bg-purple-400 rounded-lg text-white transition-colors">
                    <Plus size={16} />
                </button>
            </div>

            {models.length === 0 ? (
                <div className="text-center py-12">
                    <Brain size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-bold text-white mb-2">No Models</h3>
                    <p className="text-sm text-slate-400 mb-4">Create your first ML model</p>
                    <button onClick={() => setIsNewModelOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold text-white transition-colors">
                        Create Model
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(model => (
                        <div
                            key={model.id}
                            onClick={() => setSelectedModel(model)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedModel?.id === model.id
                                    ? 'bg-purple-500/10 border-purple-500/50'
                                    : 'bg-[var(--color-background-secondary)] border-[var(--color-border)] hover:border-purple-500/30'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    {model.type === 'classification' ? <Target size={14} className="text-purple-400" /> : <TrendingUp size={14} className="text-purple-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{model.name}</div>
                                    <div className="text-[10px] text-slate-400">{model.type} • {model.epochs} epochs • lr={model.learningRate}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(model.status)}`}>
                                    {model.status}
                                </span>
                            </div>
                            {model.accuracy !== undefined && (
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 pl-11">
                                    <span className="flex items-center gap-1">
                                        <Target size={10} className="text-emerald-400" />
                                        Accuracy: {(model.accuracy * 100).toFixed(2)}%
                                    </span>
                                    {model.loss !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <ArrowDownRight size={10} className="text-blue-400" />
                                            Loss: {model.loss.toFixed(4)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedModel && (
                <div className="mt-4 p-4 bg-[var(--color-background-secondary)] rounded-xl border border-[var(--color-border)]">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Settings size={14} className="text-purple-400" />
                            {selectedModel.name}
                        </span>
                        <button onClick={() => deleteModel(selectedModel.id)} className="p-1 hover:bg-red-500/20 rounded transition-colors">
                            <Trash2 size={14} className="text-slate-400 hover:text-red-400" />
                        </button>
                    </h3>

                    {/* Model Config */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <div className="text-slate-400">Type</div>
                            <div className="text-white font-semibold">{selectedModel.type}</div>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <div className="text-slate-400">Epochs</div>
                            <div className="text-white font-semibold">{selectedModel.epochs}</div>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <div className="text-slate-400">Learning Rate</div>
                            <div className="text-white font-semibold">{selectedModel.learningRate}</div>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <div className="text-slate-400">Layers</div>
                            <div className="text-white font-semibold">{selectedModel.hiddenLayers.join(' → ')}</div>
                        </div>
                    </div>

                    {/* Dataset Selection */}
                    {selectedModel.status === 'draft' && (
                        <div className="mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Training Dataset</label>
                            <select
                                value={selectedModel.datasetId || ''}
                                onChange={(e) => {
                                    setModels(prev => prev.map(m => m.id === selectedModel.id ? { ...m, datasetId: e.target.value } : m));
                                    setSelectedModel({ ...selectedModel, datasetId: e.target.value });
                                }}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">Select dataset...</option>
                                {datasets.filter(d => d.targetColumn && d.featureColumns && d.featureColumns.length > 0).map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.rows} rows)</option>
                                ))}
                            </select>
                            {datasets.filter(d => d.targetColumn && d.featureColumns && d.featureColumns.length > 0).length === 0 && (
                                <p className="text-[10px] text-amber-400 mt-1">⚠️ Configure target and features in a dataset first</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        {selectedModel.status === 'draft' && (
                            <button 
                                onClick={() => trainModel(selectedModel)} 
                                disabled={!selectedModel.datasetId}
                                className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Play size={14} /> Train Model
                            </button>
                        )}
                        {selectedModel.status === 'trained' && (
                            <>
                                <button onClick={() => exportModel(selectedModel)} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-semibold transition-colors">
                                    <Download size={14} /> Export
                                </button>
                                <button onClick={() => setActiveTab('deploy')} className="flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-xs font-semibold transition-colors">
                                    <Zap size={14} /> Use Model
                                </button>
                            </>
                        )}
                        {selectedModel.status === 'training' && (
                            <button onClick={stopTraining} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-semibold transition-colors">
                                <Square size={14} /> Stop Training
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderTraining = () => (
        <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Training Jobs</h3>
                <span className="text-[10px] text-slate-500">{trainingJobs.length} total</span>
            </div>

            {trainingJobs.length === 0 ? (
                <div className="text-center py-12">
                    <Cpu size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-bold text-white mb-2">No Training Jobs</h3>
                    <p className="text-sm text-slate-400">Train a model to see jobs here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {trainingJobs.map(job => (
                        <div key={job.id} className="p-4 bg-[var(--color-background-secondary)] rounded-xl border border-[var(--color-border)]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-white">{job.modelName}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(job.status)}`}>
                                        {job.status}
                                    </span>
                                    {job.status === 'running' && (
                                        <button onClick={stopTraining} className="p-1 hover:bg-red-500/20 rounded transition-colors">
                                            <Square size={12} className="text-red-400" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                                <div 
                                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                                        job.status === 'completed' ? 'bg-emerald-500' : 
                                        job.status === 'failed' ? 'bg-red-500' : 
                                        job.status === 'stopped' ? 'bg-slate-500' :
                                        'bg-gradient-to-r from-amber-500 to-orange-500'
                                    }`}
                                    style={{ width: `${job.progress}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center mb-3">
                                <div>
                                    <div className="text-sm font-bold text-white">{job.currentEpoch}/{job.totalEpochs}</div>
                                    <div className="text-[9px] text-slate-500 uppercase">Epoch</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-amber-400">{job.currentLoss.toFixed(4)}</div>
                                    <div className="text-[9px] text-slate-500 uppercase">Loss</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-emerald-400">{(job.currentAccuracy * 100).toFixed(1)}%</div>
                                    <div className="text-[9px] text-slate-500 uppercase">Accuracy</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-cyan-400">{job.progress.toFixed(0)}%</div>
                                    <div className="text-[9px] text-slate-500 uppercase">Progress</div>
                                </div>
                            </div>

                            {/* Training Logs */}
                            <div className="bg-slate-900 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-[10px] text-slate-400">
                                {job.logs.slice(-10).map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDeploy = () => {
        const trainedModels = models.filter(m => m.status === 'trained');
        const selectedTrainedModel = trainedModels.find(m => m.id === selectedModel?.id) || trainedModels[0];

        return (
            <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Use Trained Models</h3>
                </div>

                {trainedModels.length === 0 ? (
                    <div className="text-center py-12">
                        <Zap size={48} className="mx-auto mb-4 text-slate-600" />
                        <h3 className="text-lg font-bold text-white mb-2">No Trained Models</h3>
                        <p className="text-sm text-slate-400">Train a model first to make predictions</p>
                    </div>
                ) : (
                    <>
                        {/* Model Selector */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Select Model</label>
                            <div className="space-y-2">
                                {trainedModels.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => { setSelectedModel(model); setPredictionResult(null); }}
                                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                                            selectedTrainedModel?.id === model.id 
                                                ? 'bg-emerald-500/10 border-emerald-500/50' 
                                                : 'bg-[var(--color-background-secondary)] border-[var(--color-border)] hover:border-emerald-500/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Brain size={14} className="text-emerald-400" />
                                                <span className="text-sm font-semibold text-white">{model.name}</span>
                                            </div>
                                            <span className="text-[10px] text-emerald-400">{(model.accuracy! * 100).toFixed(1)}% accuracy</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prediction Interface */}
                        {selectedTrainedModel && (
                            <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl border border-emerald-500/30">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles size={14} className="text-emerald-400" />
                                    Make Prediction
                                </h3>

                                {(() => {
                                    const dataset = datasets.find(d => d.id === selectedTrainedModel.datasetId);
                                    if (!dataset?.featureColumns) {
                                        return <p className="text-sm text-slate-400">Dataset not found</p>;
                                    }

                                    return (
                                        <>
                                            <div className="space-y-3 mb-4">
                                                {dataset.featureColumns.map(col => (
                                                    <div key={col}>
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">{col}</label>
                                                        <input
                                                            type="number"
                                                            value={predictionInput[col] || ''}
                                                            onChange={(e) => setPredictionInput(prev => ({ ...prev, [col]: e.target.value }))}
                                                            placeholder="Enter value..."
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <button 
                                                onClick={() => makePrediction(selectedTrainedModel)}
                                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Play size={14} /> Run Prediction
                                            </button>

                                            {predictionResult !== null && (
                                                <div className="mt-4 p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">Prediction Result</div>
                                                    <div className="text-2xl font-bold text-white">
                                                        {selectedTrainedModel.type === 'classification' 
                                                            ? (predictionResult === 1 ? '✅ Positive (1)' : '❌ Negative (0)')
                                                            : predictionResult.toFixed(4)
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Export Section */}
                        {selectedTrainedModel && (
                            <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl border border-[var(--color-border)]">
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Download size={14} className="text-blue-400" />
                                    Export Model
                                </h3>
                                <button 
                                    onClick={() => exportModel(selectedTrainedModel)}
                                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={14} /> Download Model Files
                                </button>
                                <p className="text-[10px] text-slate-500 mt-2">Exports as TensorFlow.js format (model.json + weights)</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // New Model Modal
    const NewModelModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsNewModelOpen(false)}>
            <div className="w-full max-w-md bg-[var(--color-background-secondary)] rounded-2xl border border-[var(--color-border)] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-background-secondary)]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Brain size={20} className="text-purple-400" />
                        New ML Model
                    </h2>
                    <button onClick={() => setIsNewModelOpen(false)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {/* Model Name */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Model Name</label>
                        <input
                            type="text"
                            value={newModelConfig.name}
                            onChange={(e) => setNewModelConfig(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="My ML Model"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Model Type */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Model Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setNewModelConfig(prev => ({ ...prev, type: 'classification' }))}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                                    newModelConfig.type === 'classification' ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800 border-slate-700 hover:border-purple-500/50'
                                }`}
                            >
                                <Target size={18} className="text-purple-400" />
                                <span className="text-xs font-semibold text-white">Classification</span>
                                <span className="text-[9px] text-slate-400">Predict categories (0/1)</span>
                            </button>
                            <button 
                                onClick={() => setNewModelConfig(prev => ({ ...prev, type: 'regression' }))}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                                    newModelConfig.type === 'regression' ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800 border-slate-700 hover:border-purple-500/50'
                                }`}
                            >
                                <TrendingUp size={18} className="text-purple-400" />
                                <span className="text-xs font-semibold text-white">Regression</span>
                                <span className="text-[9px] text-slate-400">Predict continuous values</span>
                            </button>
                        </div>
                    </div>

                    {/* Hyperparameters */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Epochs</label>
                            <input
                                type="number"
                                value={newModelConfig.epochs}
                                onChange={(e) => setNewModelConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) || 50 }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Learning Rate</label>
                            <input
                                type="number"
                                step="0.001"
                                value={newModelConfig.learningRate}
                                onChange={(e) => setNewModelConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) || 0.001 }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Hidden Layers */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Hidden Layers (neurons)</label>
                        <div className="flex gap-2">
                            {newModelConfig.hiddenLayers.map((units, i) => (
                                <div key={i} className="flex-1">
                                    <input
                                        type="number"
                                        value={units}
                                        onChange={(e) => {
                                            const newLayers = [...newModelConfig.hiddenLayers];
                                            newLayers[i] = parseInt(e.target.value) || 32;
                                            setNewModelConfig(prev => ({ ...prev, hiddenLayers: newLayers }));
                                        }}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white text-center focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            ))}
                            <button 
                                onClick={() => setNewModelConfig(prev => ({ ...prev, hiddenLayers: [...prev.hiddenLayers, 32] }))}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                <Plus size={14} className="text-slate-400" />
                            </button>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">Architecture: Input → {newModelConfig.hiddenLayers.join(' → ')} → Output</p>
                    </div>

                    <button onClick={handleCreateModel} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Create Model
                    </button>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Gauge size={14} /> },
        { id: 'datasets', label: 'Data', icon: <Database size={14} /> },
        { id: 'models', label: 'Models', icon: <Brain size={14} /> },
        { id: 'training', label: 'Training', icon: <Activity size={14} /> },
        { id: 'deploy', label: 'Predict', icon: <Zap size={14} /> },
    ];

    return (
        <div className="h-full flex flex-col bg-[var(--color-background)] text-white overflow-hidden">
            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Brain size={18} className="text-purple-400" />
                    <h2 className="text-sm font-bold text-white">ML Studio</h2>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full">TensorFlow.js</span>
                </div>
                <button onClick={onCollapse} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <PanelLeft size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)] overflow-x-auto no-scrollbar flex-shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                            activeTab === tab.id
                                ? 'text-purple-400 border-purple-400 bg-purple-500/10'
                                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'datasets' && renderDatasets()}
                {activeTab === 'models' && renderModels()}
                {activeTab === 'training' && renderTraining()}
                {activeTab === 'deploy' && renderDeploy()}
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl animate-slide-up ${
                    notification.type === 'success' ? 'bg-emerald-500' :
                    notification.type === 'error' ? 'bg-red-500' :
                    'bg-slate-700'
                } text-white`}>
                    {notification.type === 'success' && <CheckCircle size={16} />}
                    {notification.type === 'error' && <AlertCircle size={16} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            {/* New Model Modal */}
            {isNewModelOpen && <NewModelModal />}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default MlStudioPane;
