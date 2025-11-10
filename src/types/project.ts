// Project types matching Rust models

export type ProjectType =
  | "WebFullstack"
  | "BackendApi"
  | "Frontend"
  | "Mobile"
  | "Desktop"
  | "Library"
  | "Unknown";

export interface Project {
  name: string;
  path: string;
  projectType: ProjectType;
  detectedTechnologies: string[];
}

export interface ProjectAnalysis {
  timestamp: string;
  projectType: ProjectType;
  languages: Record<string, number>; // percentage
  frameworks: string[];
  buildTools: string[];
  testingFrameworks: string[];
  files: {
    total: number;
    byExtension: Record<string, number>;
  };
  suggestedAgents: string[]; // agent IDs
}

export interface Technology {
  name: string;
  type: "language" | "framework" | "tool" | "library";
  confidence: number; // 0-100
}
