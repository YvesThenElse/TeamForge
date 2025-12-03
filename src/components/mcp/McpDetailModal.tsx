import { X, Copy, Check, Trash2, Edit, Save, Server, Terminal, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { McpServer, McpCategory, McpServerType } from "@/types/mcp";
import * as electron from "@/services/electron";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProjectStore } from "@/stores/projectStore";

interface McpDetailModalProps {
  mcp: McpServer;
  projectPath: string | null;
  onClose: () => void;
  devMode?: boolean;
  onRefresh?: () => void;
}

export function McpDetailModal({
  mcp,
  projectPath: _projectPath,
  onClose,
  devMode = false,
  onRefresh
}: McpDetailModalProps) {
  void _projectPath; // Reserved for future use
  const { mcpDevPath } = useSettingsStore();
  const { projectPath: currentProjectPath } = useProjectStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(mcp.name);
  const [editDescription, setEditDescription] = useState(mcp.description);
  const [editCategory, setEditCategory] = useState<McpCategory>(mcp.category);
  const [editType, setEditType] = useState<McpServerType>(mcp.type);
  const [editCommand, setEditCommand] = useState(mcp.command || "");
  const [editArgs, setEditArgs] = useState(mcp.args?.join(" ") || "");
  const [editUrl, setEditUrl] = useState(mcp.url || "");
  const [editHeaders, setEditHeaders] = useState(mcp.headers ? JSON.stringify(mcp.headers, null, 2) : "");
  const [editEnv, setEditEnv] = useState(mcp.env ? JSON.stringify(mcp.env, null, 2) : "");
  const [editTags, setEditTags] = useState(mcp.tags?.join(", ") || "");
  const [isSaving, setIsSaving] = useState(false);

  const categories: McpCategory[] = ["filesystem", "database", "api", "tools"];
  const serverTypes: McpServerType[] = ["stdio", "http", "sse"];

  const handleCopyConfig = () => {
    const config = generateMcpConfig();
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateMcpConfig = () => {
    const config: any = {
      name: mcp.name,
      description: mcp.description,
      category: mcp.category,
      tags: mcp.tags,
      type: mcp.type,
    };

    if (mcp.type === "stdio") {
      if (mcp.command) config.command = mcp.command;
      if (mcp.args && mcp.args.length > 0) config.args = mcp.args;
    } else {
      if (mcp.url) config.url = mcp.url;
      if (mcp.headers && Object.keys(mcp.headers).length > 0) config.headers = mcp.headers;
    }

    if (mcp.env && Object.keys(mcp.env).length > 0) {
      config.env = mcp.env;
    }

    return config;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditName(mcp.name);
    setEditDescription(mcp.description);
    setEditCategory(mcp.category);
    setEditType(mcp.type);
    setEditCommand(mcp.command || "");
    setEditArgs(mcp.args?.join(" ") || "");
    setEditUrl(mcp.url || "");
    setEditHeaders(mcp.headers ? JSON.stringify(mcp.headers, null, 2) : "");
    setEditEnv(mcp.env ? JSON.stringify(mcp.env, null, 2) : "");
    setEditTags(mcp.tags?.join(", ") || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse JSON fields
      let parsedHeaders: Record<string, string> | undefined;
      let parsedEnv: Record<string, string> | undefined;

      if (editHeaders.trim()) {
        try {
          parsedHeaders = JSON.parse(editHeaders);
        } catch (e) {
          alert("Invalid JSON in Headers field");
          setIsSaving(false);
          return;
        }
      }

      if (editEnv.trim()) {
        try {
          parsedEnv = JSON.parse(editEnv);
        } catch (e) {
          alert("Invalid JSON in Env field");
          setIsSaving(false);
          return;
        }
      }

      const updatedMcp: Partial<McpServer> = {
        name: editName,
        description: editDescription,
        category: editCategory,
        type: editType,
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      if (editType === "stdio") {
        updatedMcp.command = editCommand || undefined;
        updatedMcp.args = editArgs ? editArgs.split(/\s+/).filter(Boolean) : undefined;
        updatedMcp.url = undefined;
        updatedMcp.headers = undefined;
      } else {
        updatedMcp.url = editUrl || undefined;
        updatedMcp.headers = parsedHeaders;
        updatedMcp.command = undefined;
        updatedMcp.args = undefined;
      }

      updatedMcp.env = parsedEnv;

      await electron.updateMcpTemplate(mcp.id, updatedMcp, mcpDevPath || undefined, currentProjectPath || undefined);
      alert(`MCP server "${editName}" updated successfully!`);
      setIsEditing(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update MCP:", err);
      alert(`Failed to update MCP: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the MCP template "${mcp.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await electron.deleteMcpTemplate(mcp.id, mcpDevPath || undefined, currentProjectPath || undefined);
      alert(`MCP template "${mcp.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete MCP:", err);
      alert(`Failed to delete MCP: ${err}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stdio":
        return <Terminal className="h-4 w-4" />;
      case "http":
      case "sse":
        return <Globe className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
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
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold"
                  placeholder="MCP server name"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-muted-foreground"
                  placeholder="MCP server description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Server className="h-6 w-6 text-purple-500" />
                  {mcp.name}
                </h2>
                <p className="text-muted-foreground mt-1">{mcp.description}</p>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as McpCategory)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
                    {mcp.category}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Server Type
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as McpServerType)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {serverTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    {getTypeIcon(mcp.type)}
                    {mcp.type}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                MCP ID
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {mcp.id}
                </code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Path
              </label>
              <div className="mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {mcp.mcpPath}
                </code>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Tags
            </label>
            <div className="mt-2">
              {isEditing ? (
                <Input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Comma-separated tags (optional)"
                />
              ) : mcp.tags && mcp.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mcp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>

          {/* Server Configuration - stdio */}
          {(isEditing ? editType === "stdio" : mcp.type === "stdio") && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-500" />
                Command Configuration
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Command
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <Input
                        value={editCommand}
                        onChange={(e) => setEditCommand(e.target.value)}
                        placeholder="e.g., npx, node, python"
                      />
                    ) : (
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {mcp.command || "Not specified"}
                      </code>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Arguments
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <Input
                        value={editArgs}
                        onChange={(e) => setEditArgs(e.target.value)}
                        placeholder="Space-separated arguments"
                      />
                    ) : mcp.args && mcp.args.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {mcp.args.map((arg, idx) => (
                          <code
                            key={idx}
                            className="text-sm bg-muted px-2 py-1 rounded"
                          >
                            {arg}
                          </code>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No arguments</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server Configuration - http/sse */}
          {(isEditing ? editType !== "stdio" : mcp.type !== "stdio") && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                HTTP Configuration
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    URL
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://api.example.com/mcp"
                      />
                    ) : (
                      <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                        {mcp.url || "Not specified"}
                      </code>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Headers (JSON)
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <Textarea
                        value={editHeaders}
                        onChange={(e) => setEditHeaders(e.target.value)}
                        className="font-mono text-sm"
                        placeholder='{"Authorization": "${API_KEY}"}'
                        rows={3}
                      />
                    ) : mcp.headers && Object.keys(mcp.headers).length > 0 ? (
                      <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(mcp.headers, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-sm text-muted-foreground">No headers</span>
                    )}
                  </div>
                </div>
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
            <div className="mt-2">
              {isEditing ? (
                <Textarea
                  value={editEnv}
                  onChange={(e) => setEditEnv(e.target.value)}
                  className="font-mono text-sm"
                  placeholder='{"API_KEY": "${MY_API_KEY}"}'
                  rows={4}
                />
              ) : mcp.env && Object.keys(mcp.env).length > 0 ? (
                <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(mcp.env, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-muted-foreground">No environment variables</span>
              )}
            </div>
          </div>

          {/* MCP Config Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Template Format (mcp.json)
              </label>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyConfig}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-60">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {JSON.stringify(generateMcpConfig(), null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-6 border-t border-border">
          <div className="flex items-center gap-2">
            {/* Dev Mode: Delete button for templates */}
            {devMode && !isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {devMode && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
