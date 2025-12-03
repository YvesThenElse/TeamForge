import { X, Save, Server, Terminal, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { McpCategory, McpServerType } from "@/types/mcp";
import * as electron from "@/services/electron";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProjectStore } from "@/stores/projectStore";

interface CreateMcpModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export function CreateMcpModal({ onClose, onRefresh }: CreateMcpModalProps) {
  const { mcpDevPath } = useSettingsStore();
  const { projectPath } = useProjectStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<McpCategory>("tools");
  const [serverType, setServerType] = useState<McpServerType>("stdio");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [env, setEnv] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categories: McpCategory[] = ["filesystem", "database", "api", "tools"];
  const serverTypes: McpServerType[] = ["stdio", "http", "sse"];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("MCP server name is required");
      return;
    }
    if (!description.trim()) {
      alert("MCP server description is required");
      return;
    }

    if (serverType === "stdio" && !command.trim()) {
      alert("Command is required for stdio servers");
      return;
    }

    if (serverType !== "stdio" && !url.trim()) {
      alert("URL is required for http/sse servers");
      return;
    }

    // Parse JSON fields
    let parsedHeaders: Record<string, string> | undefined;
    let parsedEnv: Record<string, string> | undefined;

    if (headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        alert("Invalid JSON in Headers field");
        return;
      }
    }

    if (env.trim()) {
      try {
        parsedEnv = JSON.parse(env);
      } catch (e) {
        alert("Invalid JSON in Env field");
        return;
      }
    }

    setIsSaving(true);
    try {
      const newMcp: any = {
        name: name.trim(),
        description: description.trim(),
        category,
        type: serverType,
        tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      if (serverType === "stdio") {
        newMcp.command = command.trim();
        if (args.trim()) {
          newMcp.args = args.split(/\s+/).filter(Boolean);
        }
      } else {
        newMcp.url = url.trim();
        if (parsedHeaders) {
          newMcp.headers = parsedHeaders;
        }
      }

      if (parsedEnv) {
        newMcp.env = parsedEnv;
      }

      await electron.createMcpTemplate(newMcp, mcpDevPath || undefined, projectPath || undefined);
      alert(`MCP server "${name}" created successfully!`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create MCP:", err);
      alert(`Failed to create MCP: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-purple-200 dark:border-purple-800/50 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Server className="h-6 w-6 text-purple-500" />
              Create New MCP Server
            </h2>
            <p className="text-muted-foreground mt-1">Add a new MCP server template to your dev library</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MCP server name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="MCP server description"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as McpCategory)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Server Type <span className="text-red-500">*</span>
              </label>
              <select
                value={serverType}
                onChange={(e) => setServerType(e.target.value as McpServerType)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                {serverTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated tags (optional)"
                className="mt-1"
              />
            </div>
          </div>

          {/* Server Configuration - stdio */}
          {serverType === "stdio" && (
            <div className="space-y-4 p-4 border border-purple-200 dark:border-purple-800/30 rounded-lg bg-purple-50/30 dark:bg-purple-950/10">
              <h3 className="font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-500" />
                Command Configuration
              </h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Command <span className="text-red-500">*</span>
                </label>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., npx, node, python"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Arguments
                </label>
                <Input
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder="Space-separated arguments (e.g., -y @modelcontextprotocol/server-xxx)"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Server Configuration - http/sse */}
          {serverType !== "stdio" && (
            <div className="space-y-4 p-4 border border-purple-200 dark:border-purple-800/30 rounded-lg bg-purple-50/30 dark:bg-purple-950/10">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                HTTP Configuration
              </h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Headers (JSON)
                </label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="font-mono text-sm mt-1"
                  placeholder='{"Authorization": "Bearer ${API_KEY}"}'
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Environment Variables */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Environment Variables (JSON)
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Use <code className="bg-muted px-1 rounded">{`\${VAR}`}</code> syntax for secrets that will be resolved at runtime
            </p>
            <Textarea
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="font-mono text-sm mt-2"
              placeholder='{"API_KEY": "${MY_API_KEY}"}'
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create MCP Server
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
