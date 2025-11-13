import { useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import type { AgentFile, AgentFileFrontmatter } from "@/types/agentFile";

interface AgentEditorProps {
  agent: AgentFile;
  onSave: () => void;
  onCancel: () => void;
}

export function AgentEditor({ agent, onSave, onCancel }: AgentEditorProps) {
  const { projectPath } = useProjectStore();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [tools, setTools] = useState(agent.tools);
  const [model, setModel] = useState(agent.model);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);

  const handleSave = async () => {
    if (!projectPath) return;
    if (!name.trim()) {
      alert("Agent name is required");
      return;
    }

    setSaving(true);
    try {
      const frontmatter: AgentFileFrontmatter = {
        name: name.trim(),
        description: description.trim(),
        tools: tools.trim() || "all",
        model: model as any,
      };

      // Use name as agent ID (convert to kebab-case)
      const agentId = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await electron.saveAgentFileContent(
        projectPath,
        agentId,
        frontmatter,
        systemPrompt
      );

      onSave();
    } catch (err) {
      alert(`Failed to save agent: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {agent.filename ? "Edit Agent" : "Create New Agent"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure sub-agent settings and system prompt
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Agent"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Metadata</CardTitle>
            <CardDescription>
              Basic information about this sub-agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                type="text"
                placeholder="code-reviewer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase identifier with dashes
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input
                type="text"
                placeholder="Reviews code for quality and best practices"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                When to use this agent
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Tools</label>
              <Input
                type="text"
                placeholder="Read, Grep, Bash (or leave empty for all)"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of tools, or "all"
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="inherit">Inherit from main</option>
                <option value="sonnet">Sonnet (recommended)</option>
                <option value="opus">Opus (most capable)</option>
                <option value="haiku">Haiku (fastest)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Which Claude model to use
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>
              Instructions that define agent behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-input bg-background rounded-md font-mono text-sm"
              placeholder="You are a specialized code reviewer. Your task is to..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              This content will be the agent's system prompt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>File Preview</CardTitle>
          <CardDescription>
            How the agent file will look in .claude/agents/
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-64">
            <code>
              {`---
name: ${name || "agent-name"}
description: ${description || "Agent description"}
tools: ${tools || "all"}
model: ${model}
---

${systemPrompt}`}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
