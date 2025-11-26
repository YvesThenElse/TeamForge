import { X, Copy, Check, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Hook, HookEvent } from "@/types/hook";
import * as electron from "@/services/electron";

// Helper function to get event badge colors
function getEventBadgeClass(event: HookEvent): string {
  const eventColors: Record<HookEvent, string> = {
    PreToolUse: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
    PostToolUse: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    UserPromptSubmit: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
    Notification: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
    Stop: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
    SubagentStop: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30",
    PreCompact: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    SessionStart: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
    SessionEnd: "bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30",
  };
  return eventColors[event] || "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30";
}

interface HookDetailModalProps {
  hook: Hook;
  projectPath: string | null;
  isDeployed: boolean;
  claudeSettingsFile: string;
  onClose: () => void;
  onDeploy: (hook: Hook) => void;
  onRemove: (hook: Hook) => void;
  devMode?: boolean;
  onRefresh?: () => void;
}

export function HookDetailModal({
  hook,
  projectPath,
  isDeployed,
  claudeSettingsFile,
  onClose,
  onDeploy,
  onRemove,
  devMode = false,
  onRefresh
}: HookDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(hook.name);
  const [editDescription, setEditDescription] = useState(hook.description);
  const [editCategory, setEditCategory] = useState<string>(hook.category || "");
  const [editEvent, setEditEvent] = useState(hook.event);
  const [editMatcher, setEditMatcher] = useState(hook.matcher);
  const [editCommand, setEditCommand] = useState(hook.command);
  const [editTags, setEditTags] = useState(hook.tags?.join(", ") || "");
  const [editRequiresTools, setEditRequiresTools] = useState(hook.requiresTools?.join(", ") || "");
  const [editSuggestedFor, setEditSuggestedFor] = useState(hook.suggestedFor?.join(", ") || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyCommand = () => {
    const commandText = isEditing ? editCommand : hook.command;
    if (commandText) {
      navigator.clipboard.writeText(commandText);
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
    setEditName(hook.name);
    setEditDescription(hook.description);
    setEditCategory(hook.category || "");
    setEditEvent(hook.event);
    setEditMatcher(hook.matcher);
    setEditCommand(hook.command);
    setEditTags(hook.tags?.join(", ") || "");
    setEditRequiresTools(hook.requiresTools?.join(", ") || "");
    setEditSuggestedFor(hook.suggestedFor?.join(", ") || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedHook: Partial<Hook> = {
        name: editName,
        description: editDescription,
        category: (editCategory || undefined) as Hook["category"] | undefined,
        event: editEvent,
        matcher: editMatcher,
        command: editCommand,
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        requiresTools: editRequiresTools ? editRequiresTools.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        suggestedFor: editSuggestedFor ? editSuggestedFor.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      };

      await electron.updateHookTemplate(hook.id, updatedHook);
      alert(`Hook "${editName}" updated successfully!`);
      setIsEditing(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update hook:", err);
      alert(`Failed to update hook: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the hook template "${hook.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await electron.deleteHookTemplate(hook.id);
      alert(`Hook template "${hook.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete hook:", err);
      alert(`Failed to delete hook: ${err}`);
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
                  placeholder="Hook name"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-muted-foreground"
                  placeholder="Hook description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{hook.name}</h2>
                <p className="text-muted-foreground mt-1">{hook.description}</p>
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
                    placeholder="Category (optional)"
                  />
                ) : hook.category ? (
                  <Badge variant="outline">{hook.category}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">No category</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Hook ID
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {hook.id}
                </code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Event
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editEvent}
                    onChange={(e) => setEditEvent(e.target.value as HookEvent)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PreToolUse">PreToolUse</option>
                    <option value="PostToolUse">PostToolUse</option>
                    <option value="UserPromptSubmit">UserPromptSubmit</option>
                    <option value="Notification">Notification</option>
                    <option value="Stop">Stop</option>
                    <option value="SubagentStop">SubagentStop</option>
                    <option value="PreCompact">PreCompact</option>
                    <option value="SessionStart">SessionStart</option>
                    <option value="SessionEnd">SessionEnd</option>
                  </select>
                ) : (
                  <Badge className={`border ${getEventBadgeClass(hook.event)}`}>
                    {hook.event}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Matcher
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <Input
                    value={editMatcher}
                    onChange={(e) => setEditMatcher(e.target.value)}
                    placeholder="Matcher pattern (e.g., *)"
                  />
                ) : (
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {hook.matcher}
                  </code>
                )}
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
              ) : hook.tags && hook.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hook.tags.map((tag) => (
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

          {/* Required Tools */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Required Tools
            </label>
            <div className="mt-2">
              {isEditing ? (
                <Input
                  value={editRequiresTools}
                  onChange={(e) => setEditRequiresTools(e.target.value)}
                  placeholder="Comma-separated tool names (optional)"
                />
              ) : hook.requiresTools && hook.requiresTools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hook.requiresTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No required tools</span>
              )}
            </div>
          </div>

          {/* Suggested For */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Suggested For
            </label>
            <div className="mt-2">
              {isEditing ? (
                <Input
                  value={editSuggestedFor}
                  onChange={(e) => setEditSuggestedFor(e.target.value)}
                  placeholder="Comma-separated technologies (optional)"
                />
              ) : hook.suggestedFor && hook.suggestedFor.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hook.suggestedFor.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No suggestions</span>
              )}
            </div>
          </div>

          {/* Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Shell Command
              </label>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCommand}
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
                value={editCommand}
                onChange={(e) => setEditCommand(e.target.value)}
                className="font-mono text-sm min-h-32"
                placeholder="Shell command to execute..."
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {hook.command || "No command"}
                </pre>
              </div>
            )}
          </div>

          {/* Configuration Preview */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Configuration Preview (.claude/{claudeSettingsFile})
            </label>
            <div className="bg-muted p-4 rounded-lg overflow-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
{`{
  "hooks": {
    "${hook.event}": [
      {
        "matcher": "${hook.matcher}",
        "hooks": [
          {
            "type": "command",
            "command": "${hook.command}"
          }
        ]
      }
    ]
  }
}`}
              </pre>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">How This Hook Works</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Triggers:</strong> When the <code className="bg-muted px-1">{hook.event}</code> event occurs</li>
              <li>• <strong>Matches:</strong> Tools matching <code className="bg-muted px-1">{hook.matcher}</code></li>
              <li>• <strong>Executes:</strong> The shell command specified above</li>
              <li>• <strong>Location:</strong> Saved to <code className="bg-muted px-1">.claude/{claudeSettingsFile}</code></li>
            </ul>
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
            {/* Deployed hooks: Remove button */}
            {isDeployed && (
              <Button
                variant="destructive"
                onClick={() => onRemove(hook)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Hook
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
                    onClick={() => onDeploy(hook)}
                    disabled={!projectPath}
                  >
                    Deploy this hook
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
