// Agent types matching Rust models

export interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: AgentCategory;
  template: string;
  suggestedFor: string[];
  tools?: string | string[]; // Tools available to the agent
  model?: "sonnet" | "opus" | "haiku" | "inherit"; // Model to use
}

export type AgentCategory =
  | "development"
  | "testing"
  | "documentation"
  | "architecture"
  | "devops"
  | "database"
  | "security"
  | "performance";

export interface AgentLibrary {
  version: string;
  agents: Agent[];
  categories: AgentCategory[];
}

// For the advanced agent builder
export interface AgentYamlFrontmatter {
  name: string;
  description: string;
  tags?: string[];
  version?: string;
  tools?: string[];
  model?: "sonnet" | "opus" | "haiku" | "inherit";
}

export interface AgentFile {
  frontmatter: AgentYamlFrontmatter;
  content: string; // Markdown content
}
