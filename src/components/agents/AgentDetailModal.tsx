import { X, Copy, Check, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Agent } from "@/types";
import * as electron from "@/services/electron";

interface AgentDetailModalProps {
  agent: Agent;
  projectPath: string | null;
  onClose: () => void;
  onAddAgent: (agent: Agent) => void;
  onRemoveAgent?: (agentId: string) => void;
  isDeployed?: boolean;
  devMode?: boolean;
  onRefresh?: () => void;
}

export function AgentDetailModal({
  agent,
  projectPath,
  onClose,
  onAddAgent,
  onRemoveAgent,
  isDeployed = false,
  devMode = false,
  onRefresh
}: AgentDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(agent.name);
  const [editDescription, setEditDescription] = useState(agent.description);
  const [editCategory, setEditCategory] = useState(agent.category);
  const [editModel, setEditModel] = useState(agent.model || "sonnet");
  const [editTools, setEditTools] = useState(typeof agent.tools === "string" ? agent.tools : agent.tools?.join(", ") || "*");
  const [editTags, setEditTags] = useState(agent.tags?.join(", ") || "");
  const [editTemplate, setEditTemplate] = useState(agent.template || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyTemplate = () => {
    const templateText = isEditing ? editTemplate : agent.template;
    if (templateText) {
      navigator.clipboard.writeText(templateText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
    setEditName(agent.name);
    setEditDescription(agent.description);
    setEditCategory(agent.category);
    setEditModel(agent.model || "sonnet");
    setEditTools(typeof agent.tools === "string" ? agent.tools : agent.tools?.join(", ") || "*");
    setEditTags(agent.tags?.join(", ") || "");
    setEditTemplate(agent.template || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedAgent: Partial<Agent> = {
        name: editName,
        description: editDescription,
        category: editCategory,
        model: editModel as any,
        tools: editTools,
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        template: editTemplate,
        suggestedFor: agent.suggestedFor || [],
      };

      await electron.updateAgentTemplate(agent.id, updatedAgent);
      alert(`Agent "${editName}" updated successfully!`);
      setIsEditing(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update agent:", err);
      alert(`Failed to update agent: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the agent template "${agent.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await electron.deleteAgentTemplate(agent.id);
      alert(`Agent template "${agent.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete agent:", err);
      alert(`Failed to delete agent: ${err}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold"
                  placeholder="Agent name"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-muted-foreground"
                  placeholder="Agent description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{agent.name}</h2>
                <p className="text-muted-foreground mt-1">{agent.description}</p>
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
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Category"
                  />
                ) : (
                  <Badge variant="outline">{agent.category}</Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Model
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="sonnet">sonnet</option>
                    <option value="opus">opus</option>
                    <option value="haiku">haiku</option>
                  </select>
                ) : (
                  <Badge variant="outline">{agent.model || "sonnet"}</Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tools
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <Input
                    value={editTools}
                    onChange={(e) => setEditTools(e.target.value)}
                    placeholder="* or comma-separated tools"
                  />
                ) : (
                  <span className="text-sm">
                    {typeof agent.tools === "string"
                      ? agent.tools
                      : agent.tools?.join(", ") || "all"}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Agent ID
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {agent.id}
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
                  placeholder="Comma-separated tags"
                />
              ) : agent.tags && agent.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-xs rounded"
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

          {/* System Prompt / Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                System Prompt
              </label>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTemplate}
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
            {isEditing ? (
              <Textarea
                value={editTemplate}
                onChange={(e) => setEditTemplate(e.target.value)}
                className="font-mono text-sm min-h-96"
                placeholder="System prompt template..."
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {agent.template || "No template"}
                </pre>
              </div>
            )}
          </div>

          {/* File Format Preview */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Agent File Format
            </label>
            <div className="bg-muted p-4 rounded-lg overflow-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {`---
name: ${agent.name}
description: ${agent.description}
tools: ${typeof agent.tools === "string" ? agent.tools : agent.tools?.join(", ") || "all"}
model: ${agent.model || "sonnet"}
---

${agent.template || "System prompt goes here..."}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-6 border-t border-border">
          <div className="flex items-center gap-2">
            {/* Dev Mode: Delete button for templates */}
            {devMode && !isDeployed && !isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
            )}
            {/* Deployed agents: Remove button */}
            {isDeployed && onRemoveAgent && (
              <Button
                variant="destructive"
                onClick={() => onRemoveAgent(agent.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Agent
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!projectPath && !devMode && !isEditing && (
              <p className="text-xs text-muted-foreground">
                Select a project first
              </p>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
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
                {devMode && !isDeployed && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {!isDeployed && !devMode && (
                  <Button
                    onClick={() => onAddAgent(agent)}
                    disabled={!projectPath}
                  >
                    Add this agent
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
