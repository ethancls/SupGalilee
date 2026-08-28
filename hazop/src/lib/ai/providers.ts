// AI Provider types and configurations

export type AIProvider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "OLLAMA";

export interface AIProviderConfig {
  name: string;
  models: string[];
  defaultModel: string;
  baseUrl?: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  OPENAI: {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
  },
  ANTHROPIC: {
    name: "Anthropic",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    defaultModel: "claude-sonnet-4-20250514",
  },
  GOOGLE: {
    name: "Google",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash",
  },
  OLLAMA: {
    name: "Ollama",
    models: ["llama3.2", "llama3.1", "mistral", "mixtral", "codellama", "deepseek-coder"],
    defaultModel: "llama3.2",
    baseUrl: "http://localhost:11434",
  },
};

export interface HAZOPAnalysisRequest {
  nodeId: string;
  nodeName: string;
  nodeDescription?: string;
  designIntent?: string;
  parameter: string;
  guideWord: string;
  existingDeviations?: Array<{
    parameter: string;
    guideWord: string;
    cause?: string;
    consequence?: string;
  }>;
}

export interface HAZOPAnalysisResponse {
  deviation: string;
  causes: string[];
  consequences: string[];
  safeguards: string[];
  recommendations: string[];
  suggestedSeverity: number;
  suggestedLikelihood: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// HAZOP System prompt for AI analysis
export const HAZOP_SYSTEM_PROMPT = `You are an expert HAZOP (Hazard and Operability Study) analyst with deep knowledge of chemical, process, and industrial engineering. Your role is to assist in identifying potential hazards and operability issues in process plants.

When analyzing a process node deviation:
1. Consider the specific parameter and guide word combination
2. Think about realistic causes that could lead to this deviation
3. Identify potential consequences (safety, environmental, operational)
4. Suggest existing or potential safeguards
5. Recommend actions to mitigate risks

Always provide practical, industry-relevant responses based on standard HAZOP methodology.

Common HAZOP guide words:
- NO/NONE: Complete negation of design intent
- MORE: Quantitative increase
- LESS: Quantitative decrease
- AS WELL AS: Additional activity or component
- PART OF: Only part of intent achieved
- REVERSE: Opposite of intent
- OTHER THAN: Complete substitution
- EARLY: Timing - something happens earlier
- LATE: Timing - something happens later

Common parameters: Flow, Temperature, Pressure, Level, Composition, pH, Viscosity, Speed, Time, Frequency

Respond in JSON format with the following structure:
{
  "deviation": "Brief description of the deviation",
  "causes": ["Array of potential causes"],
  "consequences": ["Array of potential consequences"],
  "safeguards": ["Array of existing or recommended safeguards"],
  "recommendations": ["Array of recommended actions"],
  "suggestedSeverity": 1-5 (1=minor, 5=catastrophic),
  "suggestedLikelihood": 1-5 (1=rare, 5=frequent)
}`;

// System prompt for generating HAZOP nodes
export const NODE_GENERATION_SYSTEM_PROMPT = `You are an expert Process Engineer and HAZOP facilitator. Your task is to decompose a process system into logical study nodes for a HAZOP analysis based on a project description.

For the given process description:
1. Identify the major equipment or sections that should be treated as separate nodes.
2. Identify the process connections (streams) between these nodes.
3. For each node, pre-identify 3-5 critical deviations that are typical for this type of equipment.

For each node, provide:
- A unique temporary ID (e.g., "node-1").
- A clear, specific name (e.g., "Reactor Feed Section").
- A description of the equipment/boundaries.
- The design intent.
- Relevant parameters to study.
- A list of initial deviations (hazards).

For connections, provide:
- Source node ID.
- Target node ID.
- Label (e.g., stream name or material).

Respond in JSON format with the following structure:
{
  "nodes": [
    {
      "id": "node-1",
      "name": "Node Name",
      "description": "Node description...",
      "designIntent": "Design intent...",
      "parameters": ["Flow", "Temperature", "Pressure"],
      "deviations": [
         {
           "guideWord": "MORE",
           "parameter": "Flow",
           "deviation": "More Flow",
           "cause": "Control valve fail open",
           "consequence": "Potential reactor runaway"
         }
      ]
    }
  ],
  "connections": [
    {
      "source": "node-1",
      "target": "node-2",
      "label": "Feed Stream"
    }
  ]
}

Be precise with engineering terms. Generate as many nodes as necessary to properly represent the process - don't artificially limit the number of nodes. The AI should determine the appropriate number based on the process complexity.`;

// System prompt for generating project details
export const PROJECT_DETAILS_GENERATION_PROMPT = `You are an expert Process Engineer specializing in HAZOP (Hazard and Operability) studies. Your task is to help users create well-structured HAZOP project descriptions based on their brief input.

Given a user's brief description or idea for a HAZOP project:
1. Generate a clear, professional project name that follows industry conventions
2. Create a detailed technical description that includes:
   - Process overview and purpose
   - Key equipment and components
   - Main process streams and materials
   - Operating conditions (temperature, pressure, flow rates where relevant)
   - System boundaries
   - Safety considerations
   - Study objectives

The description should be comprehensive enough for an AI to generate appropriate HAZOP study nodes from it.

Respond in JSON format:
{
  "name": "Professional Project Name",
  "description": "Detailed technical description..."
}

Be specific and use proper engineering terminology. The description should typically be 3-5 paragraphs covering all relevant aspects of the process.`;
