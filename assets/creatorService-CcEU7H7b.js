import{a as s}from"./index.dev-vR_ZKarG.js";const c=async(r,n)=>{const t=`
        Act as a Senior Cloud Solutions Architect.
        Analyze the following system description and generate a high-level architectural design and a MermaidJS graph TD diagram.

        System Description: "${r.systemDescription}"
        Scale: ${r.scale}
        Constraints: Must run on ${r.constraints}

        Return a JSON object with two keys:
        1. "description": A markdown-formatted explanation of the proposed architecture, components, and data flow.
        2. "diagram": A MermaidJS 'graph TD' string. Do not include the \`\`\`mermaid tag.

        Example Diagram:
        A[User] --> B(Load Balancer);
        B --> C{Web Server};
        C --> D[(Database)];
    `;try{const e=await s.getChatResponse({prompt:t,modelId:n,responseMimeType:"application/json"}),o=s.extractJson(e.text||"{}"),a=JSON.parse(o);return{description:a.description||"No description generated.",diagram:a.diagram||"graph TD; A[Error];"}}catch(e){return console.error("Error in runSystemArchitect:",e),{description:"Failed to generate architecture.",diagram:"graph TD; A[Error generating diagram];"}}},i=async(r,n)=>{const t=`
        Based on the following MermaidJS diagram, generate the complete Terraform HCL code to provision the infrastructure.
        The code should be modular and follow best practices.
        Return ONLY the raw HCL code.

        Diagram:
        ${r}
    `;try{const o=(await s.getChatResponse({prompt:t,modelId:n})).text||"",a=o.match(/```(?:hcl|terraform)?\n([\s\S]*?)```/);return a?a[1].trim():o.trim()}catch(e){return console.error("Error generating IaC from diagram:",e),"# An error occurred during IaC generation."}},p=async(r,n,t)=>{const e=`You are an expert AI assistant acting as the "${t}" tool. Analyze the user's prompt and provide a concise, expert-level response.`;try{return(await s.getChatResponse({prompt:r.prompt,modelId:n,systemInstruction:e})).text||"The tool returned an empty response."}catch(o){return console.error(`Error in runGenericTool (${t}):`,o),`An error occurred while running the ${t} tool.`}},m={runSystemArchitect:c,generateIaCFromDiagram:i,runGenericTool:p};export{m as c};
