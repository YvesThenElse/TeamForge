// Config types matching Rust models and .teamforge structure

export interface TeamForgeConfig {
  version: string;
  project: ProjectInfo;
  activeAgents: string[]; // agent IDs
  workflow?: AgentWorkflow; // Optional workflow configuration
  customizations: Record<string, unknown>;
  lastAnalyzed: string; // ISO 8601
}

// Agent workflow - simple sequential ordering
export interface AgentWorkflow {
  enabled: boolean;
  sequence: AgentWorkflowStep[];
}

export interface AgentWorkflowStep {
  agentId: string;
  order: number;
  enabled: boolean;
  customInstructions?: string;
}

export interface ProjectInfo {
  name: string;
  projectType: string;
  path: string;
  detectedTechnologies: string[];
}

// Team presets (.teamforge/presets/*.json)
export interface TeamPreset {
  id: string;
  name: string;
  description: string;
  agents: PresetAgent[];
  recommendedFor: string[]; // technologies
  metadata?: {
    author?: string;
    createdAt?: string;
    usageCount?: number;
  };
}

export interface PresetAgent {
  id: string;
  role: string;
  enabled: boolean;
  order?: number; // For workflow ordering
  customInstructions?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
