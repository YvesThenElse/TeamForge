// Team types for managing agent teams and workflows

// ============================================================================
// NEW TEAM STRUCTURE (v2)
// ============================================================================

export interface ElementSecurity {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  configured: boolean; // For warning indicator
}

export interface GlobalSecurity {
  permissions?: {
    allow?: string[];
    deny?: string[];
    ask?: string[];
  };
  env?: Record<string, string>;
  configured: boolean; // For warning indicator
}

export interface TeamAgent {
  agentId: string; // Reference to library agent
  order: number;
  security?: ElementSecurity;
}

export interface TeamSkill {
  skillId: string; // Reference to library skill
  order: number;
  security?: ElementSecurity;
}

export interface TeamHook {
  hookId: string; // Reference to library hook
  order: number;
  security?: ElementSecurity;
}

export interface Team {
  id: string;
  name: string;
  description: string;

  // Elements
  agents: TeamAgent[];
  skills: TeamSkill[];
  hooks: TeamHook[];
  security: GlobalSecurity;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Legacy fields (for backward compatibility)
  chainingEnabled?: boolean;
  workflow?: TeamWorkflowNode[];
}

// ============================================================================
// LEGACY TYPES (v1) - Keep for backward compatibility
// ============================================================================

export interface TeamWorkflowNode {
  agentId: string;
  position: {
    x: number;
    y: number;
  };
  order: number;
}

export interface TeamConfig {
  teams: Team[];
  version: string;
}
