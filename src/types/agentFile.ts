// Agent file types (for .claude/agents/*.md files)

export interface AgentFileFrontmatter {
  name: string;
  description: string;
  tools?: string; // comma-separated list or 'all'
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  [key: string]: any; // Allow additional fields
}

export interface AgentFile {
  id: string;
  filename: string;
  filePath: string;
  name: string;
  description: string;
  tools: string;
  model: string;
  systemPrompt: string;
  frontmatter: AgentFileFrontmatter;
}

export interface AgentChain {
  agents: string[]; // Array of agent IDs in order
  description?: string;
}

export interface AgentTeam {
  id: string;
  name: string;
  description: string;
  agents: string[]; // Agent IDs
  chain?: AgentChain; // Optional workflow chain
}

export interface AgentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface PredefinedAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tools?: string;
  model?: string;
  template: string; // System prompt template
  tags?: string[];
}
