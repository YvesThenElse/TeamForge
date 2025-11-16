// Team types for managing agent teams and workflows

export interface TeamWorkflowNode {
  agentId: string;
  position: {
    x: number;
    y: number;
  };
  order: number; // Sequential order for chaining
}

export interface Team {
  id: string;
  name: string;
  description: string;
  chainingEnabled: boolean; // Default: true
  workflow: TeamWorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamConfig {
  teams: Team[];
  version: string;
}
