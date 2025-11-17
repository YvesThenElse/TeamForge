export type HookEvent =
  | "PreToolUse"
  | "PostToolUse"
  | "UserPromptSubmit"
  | "Notification"
  | "Stop"
  | "SubagentStop"
  | "PreCompact"
  | "SessionStart"
  | "SessionEnd";

export type HookCategory =
  | "Code Quality"
  | "Logging & Monitoring"
  | "Security"
  | "Testing"
  | "Documentation"
  | "Notifications"
  | "Safety"
  | "Git Workflow"
  | "Project Setup"
  | "Performance";

export interface Hook {
  id: string;
  name: string;
  description: string;
  category: HookCategory;
  tags: string[];
  event: HookEvent;
  matcher: string;
  command: string;
  requiresTools: string[];
  suggestedFor: string[];
  enabled?: boolean;
}

export interface HookConfig {
  type: "command";
  command: string;
}

export interface HookMatcher {
  matcher: string;
  hooks: HookConfig[];
}

export interface HookSettings {
  [event: string]: HookMatcher[];
}

export interface ProjectHookSettings {
  hooks: HookSettings;
}
