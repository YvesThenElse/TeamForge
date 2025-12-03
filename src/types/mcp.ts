// MCP Server types for TeamForge

export type McpCategory = "filesystem" | "database" | "api" | "tools";

export type McpServerType = "stdio" | "http" | "sse";

export interface McpServer {
  id: string;                         // Directory name (= key in mcpServers)
  name: string;                       // Display name
  description: string;                // Description
  category: McpCategory;              // Category for filtering
  tags: string[];                     // Tags for filtering
  type: McpServerType;                // Server type
  command?: string;                   // For stdio: command to execute
  args?: string[];                    // For stdio: arguments
  url?: string;                       // For http/sse: server URL
  headers?: Record<string, string>;   // For http/sse: headers
  env?: Record<string, string>;       // Environment variables (can contain ${VAR})
  mcpPath: string;                    // Full path to template directory
  error?: boolean;                    // Error loading flag
}

export interface McpServerFrontmatter {
  name: string;
  description: string;
  category: McpCategory;
  tags?: string[];
  type: McpServerType;
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}

export interface TeamMcp {
  mcpId: string;
  order: number;
}

// MCP config file format (deployed to .mcp.json)
export interface McpConfigFile {
  mcpServers: Record<string, McpServerConfig>;
}

export interface McpServerConfig {
  type: McpServerType;
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}
