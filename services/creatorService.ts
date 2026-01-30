import aiService from './geminiService';

const runSystemArchitect = async (
    params: { systemDescription: string; scale: string; constraints: string },
    modelId: string
): Promise<{ description: string; diagram: string }> => {
    const prompt = `
        Act as a Senior Cloud Solutions Architect.
        Analyze the following system description and generate a high-level architectural design and a MermaidJS graph TD diagram.

        System Description: "${params.systemDescription}"
        Scale: ${params.scale}
        Constraints: Must run on ${params.constraints}

        Return a JSON object with two keys:
        1. "description": A markdown-formatted explanation of the proposed architecture, components, and data flow.
        2. "diagram": A MermaidJS 'graph TD' string. Do not include the \`\`\`mermaid tag.

        Example Diagram:
        A[User] --> B(Load Balancer);
        B --> C{Web Server};
        C --> D[(Database)];
    `;

    try {
        const response = await aiService.getChatResponse({
            prompt,
            modelId,
            responseMimeType: 'application/json',
        });
        const jsonStr = aiService.extractJson(response.text || '{}');
        const result = JSON.parse(jsonStr);
        return {
            description: result.description || "No description generated.",
            diagram: result.diagram || "graph TD; A[Error];"
        };
    } catch (error) {
        console.error("Error in runSystemArchitect:", error);
        return {
            description: "Failed to generate architecture.",
            diagram: "graph TD; A[Error generating diagram];"
        };
    }
};

const generateIaCFromDiagram = async (diagram: string, modelId: string): Promise<string> => {
    const prompt = `
        Based on the following MermaidJS diagram, generate the complete Terraform HCL code to provision the infrastructure.
        The code should be modular and follow best practices.
        Return ONLY the raw HCL code.

        Diagram:
        ${diagram}
    `;

    try {
        const response = await aiService.getChatResponse({ prompt, modelId });
        // Extract code from markdown block if present
        const text = response.text || '';
        const codeMatch = text.match(/```(?:hcl|terraform)?\n([\s\S]*?)```/);
        return codeMatch ? codeMatch[1].trim() : text.trim();
    } catch (error) {
        console.error("Error generating IaC from diagram:", error);
        return "# An error occurred during IaC generation.";
    }
};

const runGenericTool = async (
    params: { prompt: string },
    modelId: string,
    toolName: string
): Promise<string> => {
    const systemInstruction = `You are an expert AI assistant acting as the "${toolName}" tool. Analyze the user's prompt and provide a concise, expert-level response.`;
    try {
        const response = await aiService.getChatResponse({
            prompt: params.prompt,
            modelId,
            systemInstruction,
        });
        return response.text || "The tool returned an empty response.";
    } catch (error) {
        console.error(`Error in runGenericTool (${toolName}):`, error);
        return `An error occurred while running the ${toolName} tool.`;
    }
};

export default {
    runSystemArchitect,
    generateIaCFromDiagram,
    runGenericTool,
};
