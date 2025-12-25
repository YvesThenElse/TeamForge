// Constitution types for multi-AI system instructions

export type AISystem = "claude-code" | "gemini-cli" | "cline";

export type ConstitutionCategory =
  | "general"      // Universal instructions
  | "coding-style" // Code standards
  | "workflow"     // Work process
  | "security"     // Security rules
  | "project";     // Project-specific

export interface Constitution {
  id: string;
  name: string;
  description: string;
  content: string;           // Markdown content
  targetSystem?: AISystem;   // Target system (optional, universal by default)
  tags: string[];
  category: ConstitutionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ConstitutionLibrary {
  version: string;
  constitutions: Constitution[];
  categories: ConstitutionCategory[];
}

// For the constitution editor
export interface ConstitutionYamlFrontmatter {
  name: string;
  description: string;
  tags?: string[];
  category?: ConstitutionCategory;
  targetSystem?: AISystem;
}

export interface ConstitutionFile {
  frontmatter: ConstitutionYamlFrontmatter;
  content: string; // Markdown content
}

// AI System capabilities for deployment
export interface AISystemCapabilities {
  id: AISystem;
  name: string;
  constitution: boolean;
  agents: boolean;
  skills: boolean;
  hooks: boolean;
  mcpServers: boolean;
  memory: boolean;
}

// Predefined capabilities for each system
export const AI_SYSTEM_CAPABILITIES: Record<AISystem, AISystemCapabilities> = {
  "claude-code": {
    id: "claude-code",
    name: "Claude Code",
    constitution: true,
    agents: true,
    skills: true,
    hooks: true,
    mcpServers: true,
    memory: false,
  },
  "gemini-cli": {
    id: "gemini-cli",
    name: "Gemini CLI",
    constitution: true,
    agents: false,
    skills: false, // Via extensions only
    hooks: false,
    mcpServers: true,
    memory: true, // /memory commands
  },
  "cline": {
    id: "cline",
    name: "Cline",
    constitution: true,
    agents: false, // Via MCP only
    skills: false, // Via MCP only
    hooks: false,
    mcpServers: true,
    memory: true, // Memory Bank
  },
};
