export interface AgentSecurity {
  agentId: string;
  agentName: string;
  tools: string[];
}

export interface SecurityConfig {
  agents: AgentSecurity[];
  lastModified?: string;
}

export type ToolName =
  | "Read"
  | "Write"
  | "Edit"
  | "Glob"
  | "Grep"
  | "Bash"
  | "Task"
  | "WebFetch"
  | "WebSearch"
  | "NotebookEdit"
  | "TodoWrite"
  | "ExitPlanMode"
  | "AskUserQuestion"
  | "Skill"
  | "SlashCommand"
  | "BashOutput"
  | "KillShell"
  | "*";

export const AVAILABLE_TOOLS: { name: ToolName; description: string }[] = [
  { name: "*", description: "All tools (wildcard)" },
  { name: "Read", description: "Read files from filesystem" },
  { name: "Write", description: "Write new files" },
  { name: "Edit", description: "Edit existing files" },
  { name: "Glob", description: "Find files by pattern" },
  { name: "Grep", description: "Search content in files" },
  { name: "Bash", description: "Execute bash commands" },
  { name: "Task", description: "Launch specialized agents" },
  { name: "WebFetch", description: "Fetch web content" },
  { name: "WebSearch", description: "Search the web" },
  { name: "NotebookEdit", description: "Edit Jupyter notebooks" },
  { name: "TodoWrite", description: "Manage task lists" },
  { name: "ExitPlanMode", description: "Exit planning mode" },
  { name: "AskUserQuestion", description: "Ask user questions" },
  { name: "Skill", description: "Execute skills" },
  { name: "SlashCommand", description: "Execute slash commands" },
  { name: "BashOutput", description: "Get bash output" },
  { name: "KillShell", description: "Kill background shells" },
];
