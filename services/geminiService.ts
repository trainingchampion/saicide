
import { GoogleGenAI, GenerateContentResponse, Modality, Type, FunctionDeclaration, FunctionCall, FunctionResponse, Part, Content } from "@google/genai";
import { SecurityPolicy, AppPlan, ChatParams, CodeReviewSuggestion, MCPServer, FileNode, ChangeItem, Comment, Task } from "../types";
import mcpClientService, { Tool } from "./mcpClientService";

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try { 
        return await fn(); 
    } catch (error: any) {
        const isRetryable = error.status === 429 || (error.status >= 500 && error.status < 600) || error.message?.includes('quota');
        if (retries > 0 && isRetryable) {
            const nextDelay = error.status === 429 ? delay * 2 : delay;
            await new Promise(resolve => setTimeout(resolve, nextDelay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const extractJson = (text: string): string => {
    try {
        JSON.parse(text);
        return text;
    } catch (e) {
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = Math.min(cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'), cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['));
        const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        return (start !== Infinity && end !== -1) ? cleaned.substring(start, end + 1) : cleaned;
    }
};

interface GetApiResponseParams {
    contents: (string | Part | Content)[];
    model: string;
    systemInstruction?: string;
    useThinking?: boolean;
    useMaps?: boolean;
    useGoogleSearch?: boolean;
    location?: { latitude: number; longitude: number };
    responseMimeType?: string;
    responseSchema?: any;
    abortSignal?: AbortSignal;
    tools?: FunctionDeclaration[];
}

// Helper to get API key with fallback
const getApiKey = (): string => {
    // First check localStorage for user-provided key
    const userKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sai_gemini_api_key') : null;
    if (userKey) return userKey;
    
    // Fall back to environment variable (set at build time)
    return process.env.API_KEY || '';
};

const getApiResponse = async (params: GetApiResponseParams): Promise<GenerateContentResponse> => {
    const { contents, model, systemInstruction, useThinking, useMaps, useGoogleSearch, location, responseMimeType, responseSchema, abortSignal, tools } = params;
    
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key configured. Please add your Gemini API key in Settings > AI Providers.');
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // Fallback mapping for non-Gemini models to ensure real AI responses
    let targetModel = model;
    if (!model.startsWith('gemini') && !model.startsWith('veo') && !model.startsWith('imagen')) {
        targetModel = 'gemini-3-pro-preview';
    }

    const config: any = { systemInstruction, responseMimeType, responseSchema };
    if (useThinking && (targetModel.includes('gemini-3') || targetModel.includes('gemini-2.5'))) {
        const budget = targetModel.includes('gemini-3-pro') ? 32768 : 24576;
        config.thinkingConfig = { thinkingBudget: budget };
    }
    
    // Handle tools configuration
    const configTools: any[] = [];
    if (useMaps) { configTools.push({ googleMaps: {} }); }
    if (useGoogleSearch) { configTools.push({ googleSearch: {} }); }
    if (tools && tools.length > 0) { configTools.push({ functionDeclarations: tools }); }
    
    if (configTools.length > 0) {
        config.tools = configTools;
    }

    if ((useMaps || useGoogleSearch) && location) { 
        config.toolConfig = { retrievalConfig: { latLng: location } }; 
    }

    try {
        return await retryWithBackoff(() => ai.models.generateContent({ model: targetModel, contents, config, signal: abortSignal }));
    } catch (error: any) {
        const isQuotaError = error.status === 429 || error.message?.includes('quota');
        
        // Handle fallback from Pro to Flash
        if (isQuotaError && targetModel.includes('pro')) {
            const fallbackModel = 'gemini-3-flash-preview';
            console.warn(`Quota exceeded for ${targetModel}. Falling back to ${fallbackModel}`);
            return await retryWithBackoff(() => ai.models.generateContent({ 
                model: fallbackModel, 
                contents, 
                config: { ...config, thinkingConfig: undefined }, 
                signal: abortSignal 
            }));
        }

        // Handle fallback from Flash to Flash Lite
        if (isQuotaError && targetModel.includes('flash') && !targetModel.includes('lite')) {
            const liteModel = 'gemini-flash-lite-latest';
            console.warn(`Flash quota exceeded. Trying Lite fallback: ${liteModel}`);
            return await retryWithBackoff(() => ai.models.generateContent({ 
                model: liteModel, 
                contents, 
                config, 
                signal: abortSignal 
            }));
        }

        throw error;
    }
};

interface ChatResponseResult {
  text?: string;
  groundingChunks?: any[];
  functionCalls?: FunctionCall[];
  appPlan?: AppPlan;
}

interface GenerateContentInput {
  prompt?: string;
  functionResponses?: FunctionResponse[];
}

const getChatResponse = async (params: GenerateContentInput & ChatParams): Promise<ChatResponseResult> => {
    const { prompt, modelId, systemInstruction, useThinking, useMaps, useGoogleSearch, location, abortSignal, functionResponses, responseMimeType, responseSchema, attachments } = params;
    
    // --- EXCLUSIVE SAI OPAL ENGINE ---
    if (modelId === 'google-opal') {
        const sys = `You are the Sai App Engine.
        Your goal is to synthesize fully functional, high-fidelity applications and games within the Sai ecosystem.
        
        CRITICAL: Create a NEW, dedicated file structure for every user request.
        
        When a user asks to build an app or game:
        1. Analyze the requirements deeply.
        2. Generate a complete, production-ready codebase (HTML, CSS, JS/TS).
        3. Ensure it runs immediately in the Sai Live Synthesis runtime.
        4. Return a JSON response with:
        {
          "text": "Detailed explanation of the synthesized architecture from Sai.",
          "appPlan": {
            "svgPreview": "A visual representation of the architecture",
            "files": [
              { "fileName": "index.html", "content": "Full HTML" },
              { "fileName": "style.css", "content": "Full CSS" },
              { "fileName": "main.js", "content": "Full JS" }
            ]
          }
        }`;

        try {
            const res = await getApiResponse({
                model: 'gemini-3-pro-preview', 
                contents: [{ parts: [{ text: prompt || '' }] }],
                systemInstruction: sys,
                responseMimeType: 'application/json'
            });
            
            const data = JSON.parse(extractJson(res.text || '{}'));
            return {
                text: data.text || "Sai synthesis complete. Manifesting application core...",
                appPlan: data.appPlan
            };
        } catch (e: any) {
            return { text: `Sai Engine Synthesis Error: ${e.message}` };
        }
    }

    const sys = systemInstruction || "You are Sai, a helpful AI assistant specialized in software development, cloud infrastructure, and security.";
    
    const contents: any[] = [];
    
    const parts: Part[] = [];
    if (prompt) parts.push({ text: prompt });
    if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
            parts.push({
                inlineData: {
                    data: file.data,
                    mimeType: file.mimeType
                }
            });
        });
    }

    if (parts.length > 0) {
        contents.push({ parts });
    }

    if (functionResponses && functionResponses.length > 0) {
        functionResponses.forEach(fr => {
            contents.push({
                parts: [{ functionResponse: fr }]
            });
        });
    }

    const activeTools = await getMcpToolDeclarations(params.mcpServers || []);

    try {
        const res = await getApiResponse({
            model: modelId,
            contents: contents,
            systemInstruction: sys,
            useThinking,
            useMaps,
            useGoogleSearch,
            location,
            responseMimeType,
            responseSchema,
            abortSignal,
            tools: activeTools
        });
        return { 
            text: res.text || '', 
            groundingChunks: res.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
            functionCalls: res.functionCalls || []
        };
    } catch (error: any) {
        if (error.name === 'AbortError') throw error;
        console.error("getChatResponse error:", error);
        
        if (error.status === 429 || error.message?.includes('quota')) {
            return { text: "I have temporarily reached the limit of my neural capacity. Please wait a moment for the Sai buffers to clear." };
        }
        
        return { text: `My neural link is momentarily unstable. Error: ${error.message}. Please try again.` };
    }
};

export const getMcpToolDeclarations = async (mcpServers: MCPServer[]): Promise<FunctionDeclaration[]> => {
    const declarations: FunctionDeclaration[] = [];
    for (const server of mcpServers) {
        if (server.status === 'connected') {
            const tools = await mcpClientService.listTools(server.id);
            tools.forEach((t: Tool) => {
                declarations.push({
                    name: t.name,
                    description: t.description || `Tool provided by ${server.name}`,
                    parameters: {
                        type: Type.OBJECT,
                        properties: t.inputSchema.properties as any,
                        required: t.inputSchema.required
                    }
                });
            });
        }
    }
    return declarations;
};

export default {
    getChatResponse,
    extractJson,
    
    getTerminalAiResponse: async (command: string, modelId: string): Promise<string> => {
        const systemInstruction = `You are Sai, an AI integrated directly into a shell terminal. Interpret user intent and provide helpful, concise shell-ready responses.`;

        try {
            const response = await getChatResponse({
                prompt: `Interpret: "${command}"`,
                modelId: 'gemini-3-flash-preview',
                systemInstruction
            });
            return response.text || "Command analysis inconclusive.";
        } catch (error) {
            return "Terminal AI logic fault detected.";
        }
    },
    
    synthesizeInlineGhost: async (instruction: string, context: string, fileName: string): Promise<string> => {
        const prompt = `Synthesize code for ${fileName} in Sai: "${instruction}". Context: ${context}`;
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: 'gemini-3-flash-preview' });
        return res.text || '';
    },
    
    getBoilerplate: async (fileName: string, modelId: string): Promise<string> => {
        const prompt = `Generate production-ready Sai boilerplate for "${fileName}". Raw code only.`;
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: modelId || 'gemini-3-flash-preview' });
        return res.text || `// Sai Boilerplate for ${fileName}\n`;
    },

    generateTerraform: async (provider: string, prompt: string, modelId: string, policies: SecurityPolicy[]): Promise<{ fileName: string; content: string }[]> => {
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: modelId });
        const text = res.text || '';
        return [{ fileName: 'main.tf', content: text }];
    },

    analyzeInfrastructure: async (code: string, modelId: string): Promise<any> => {
        const prompt = `Analyze the following Infrastructure as Code (Terraform/HCL) and provide:
1. A monthly cost estimate (be realistic based on typical AWS/GCP/Azure pricing)
2. Security assessment - identify any security risks or compliance issues
3. A breakdown of costs by resource type

Code to analyze:
${code}

Return a JSON object with:
- "costEstimate": string like "$150-200/month"
- "securityStatus": either "safe" or "risk"
- "costBreakdown": array of { resource: string, estimate: string }
- "securityNotes": array of strings describing any security concerns`;

        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: modelId, responseMimeType: 'application/json' });
        try { 
            const result = JSON.parse(extractJson(res.text || '{}'));
            return {
                costEstimate: result.costEstimate || '$50-100/month',
                securityStatus: result.securityStatus || 'safe',
                costBreakdown: result.costBreakdown || [],
                securityNotes: result.securityNotes || []
            };
        } catch (e) { 
            return { costEstimate: '$50-100/month', securityStatus: 'safe', costBreakdown: [], securityNotes: [] }; 
        }
    },

    generateDockerfile: async (prompt: string, modelId: string, policies: SecurityPolicy[]): Promise<string> => {
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: modelId });
        return res.text || 'FROM scratch';
    },

    optimizeDockerfile: async (dockerfileContent: string, modelId: string): Promise<{ content: string, explanation: string }> => {
        const res = await getApiResponse({ contents: [{ parts: [{ text: dockerfileContent }] }], model: modelId, responseMimeType: 'application/json' });
        try { return JSON.parse(extractJson(res.text || '{}')); } catch (e) { return { content: dockerfileContent, explanation: 'Optimization failed.' }; }
    },

    getCodeSuggestions: async (code: string, fileName: string, modelId: string): Promise<string[]> => {
        const res = await getApiResponse({ contents: [{ parts: [{ text: code }] }], model: modelId, responseMimeType: 'application/json' });
        try { return JSON.parse(extractJson(res.text || '[]')); } catch (e) { return []; }
    },

    analyzeTerminalError: async (errorLog: string, modelId: string): Promise<{ issue: string, fix: string, command: string }> => {
        const systemInstruction = `You are a Self-Healing Runtime AI that analyzes terminal errors and provides automated fixes.
Your role is to:
1. Identify the root cause of the error
2. Explain the issue in simple terms
3. Provide a specific fix
4. Generate an executable command that will resolve the issue

Respond ONLY with valid JSON in this exact format:
{
  "issue": "Brief description of what caused the error",
  "fix": "Step-by-step explanation of how to fix it",
  "command": "The exact shell command to run (leave empty if no single command can fix it)"
}

Common fixes:
- Missing npm packages: npm install <package>
- Permission errors: chmod or sudo
- Missing files: touch or mkdir
- Git conflicts: git merge --abort or git stash
- Module not found: npm install or pip install
- Port in use: lsof -ti:PORT | xargs kill
- Node version issues: nvm use <version>`;

        const prompt = `Analyze this terminal error and provide a fix:\n\n${errorLog}`;
        
        try {
            const res = await getApiResponse({ 
                contents: [{ parts: [{ text: prompt }] }], 
                model: modelId || 'gemini-3-flash-preview',
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        issue: { type: Type.STRING, description: 'Brief description of the error cause' },
                        fix: { type: Type.STRING, description: 'How to fix the error' },
                        command: { type: Type.STRING, description: 'Shell command to run, or empty string' }
                    },
                    required: ['issue', 'fix', 'command']
                }
            });
            return JSON.parse(extractJson(res.text || '{}'));
        } catch (e) { 
            return { issue: 'Failed to analyze error', fix: 'Check the error manually and try common solutions.', command: '' }; 
        }
    },

    getTerraformPlan: async (code: string, modelId: string): Promise<string> => {
        const res = await getApiResponse({ contents: [{ parts: [{ text: code }] }], model: modelId });
        return res.text || 'Plan error.';
    },

    generateImage: async (prompt: string, aspectRatio: string, modelId: string): Promise<string | null> => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        try {
            if (modelId.includes('imagen')) {
                // Use generateImages for Imagen models
                const response = await ai.models.generateImages({
                    model: modelId,
                    prompt: prompt,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/jpeg',
                        aspectRatio: aspectRatio as any,
                    },
                });
                const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
                return base64EncodeString;
            } else {
                // Use generateContent for Gemini models (nano banana series)
                const response = await ai.models.generateContent({
                    model: modelId,
                    contents: { parts: [{ text: prompt }] },
                    config: { imageConfig: { aspectRatio: aspectRatio as any } },
                });
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) return part.inlineData.data;
                }
            }
            return null;
        } catch (e) { 
            console.error("Image generation error:", e);
            return null; 
        }
    },

    generateVideo: async (prompt: string, modelId: string): Promise<{ url: string; status: string } | null> => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        try {
            let operation = await ai.models.generateVideos({
                model: modelId,
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });

            // Polling logic
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

            if (videoUri) {
                const response = await fetch(`${videoUri}&key=${getApiKey()}`);
                if (!response.ok) {
                    throw new Error(`Failed to download video file: ${response.status} ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                return { url: videoUrl, status: 'Completed' };
            }
            return null;
        } catch (e: any) {
            console.error("Video generation error:", e);
            throw e;
        }
    },

    generateCommitMessage: async (changes: ChangeItem[]): Promise<string> => {
        const fileList = changes.map(c => `${c.status}: ${c.file}`).join('\n');
        const prompt = `Generate a concise, conventional git commit message for the following changes in Sai:\n${fileList}\n\nReturn only the commit message text.`;
        try {
            const response = await getApiResponse({
                contents: [{ parts: [{ text: prompt }] }],
                model: 'gemini-3-flash-preview',
            });
            return response.text?.trim() || 'feat: update files';
        } catch (error) {
            console.error('Error generating commit message:', error);
            return 'feat: update files';
        }
    },

    generateBranchName: async (summary: string): Promise<string> => {
        const prompt = `Generate a concise, kebab-case git branch name for Sai based on the following summary of changes:\n${summary}\n\nReturn only the branch name, like 'feat/new-user-auth'.`;
        try {
            const response = await getApiResponse({
                contents: [{ parts: [{ text: prompt }] }],
                model: 'gemini-3-flash-preview',
            });
            return response.text?.trim().replace(/\s+/g, '-') || 'feat/updates';
        } catch (error) {
            console.error('Error generating branch name:', error);
            return 'feat/updates';
        }
    },

    generateDeploymentPlan: async (provider: string, projectFiles: string, modelId: string): Promise<{ commands: string[], manifest?: string, explanation: string }> => {
        const prompt = `Act as a Cloud Solutions Architect for Sai. Create a REAL deployment plan for a project with the following files: 
        ${projectFiles}
        
        Target Provider: ${provider}
        
        Return a JSON object with:
        1. "commands": A list of shell commands to execute the deployment.
        2. "manifest": a deployment manifest (YAML/Terraform) if necessary.
        3. "explanation": A brief high-level explanation of what this deployment does.
        
        Ensure the commands are realistic for a browser-simulated shell (e.g. use standard CLI tools).`;
        
        const res = await getApiResponse({
            model: modelId,
            contents: [{ parts: [{ text: prompt }] }],
            responseMimeType: 'application/json'
        });
        
        try {
            return JSON.parse(extractJson(res.text || '{}'));
        } catch (e) {
            return { commands: [`echo "Failed to synthesize deployment for ${provider}"`], explanation: "Sai logic error." };
        }
    },

    generateDailyBriefing: async (activity: { commits: any[], discussions: any[] }): Promise<string> => {
        const prompt = `You are a team lead in the Sai ecosystem. Write a concise, friendly daily briefing summarizing the following activity.
        
        Recent Commits:
        ${activity.commits.map(c => `- ${c.author}: "${c.message}" (${c.date})`).join('\n')}

        New Discussions:
        ${activity.discussions.map(d => `- ${d.user} started: "${d.title}"`).join('\n')}

        Return only the summary text.
        `;
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: 'gemini-3-flash-preview' });
        return res.text || 'No new activity to report.';
    },

    summarizeCommentThread: async (thread: Comment[]): Promise<string> => {
        const prompt = `Summarize the following Sai discussion thread in one sentence:\n\n${thread.map(c => `${c.author}: ${c.text}`).join('\n')}`;
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: 'gemini-3-flash-preview' });
        return res.text || 'Could not generate summary.';
    },
    
    synthesizeTaskFromText: async (text: string): Promise<Omit<Task, 'id' | 'status'> | null> => {
        const prompt = `Analyze the following text from a Sai discussion and extract a single, actionable development task. 
        Return a JSON object with keys: "title" (string), "tag" (one of "Bug", "Feature", "Refactor", "Design"), "description" (string, optional).

        Text:
        "${text}"`;
        const res = await getApiResponse({ contents: [{ parts: [{ text: prompt }] }], model: 'gemini-3-flash-preview', responseMimeType: 'application/json' });
        try {
            return JSON.parse(extractJson(res.text || 'null'));
        } catch(e) {
            return null;
        }
    },
};
