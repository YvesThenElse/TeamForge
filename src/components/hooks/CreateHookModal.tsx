import { X, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Hook, HookEvent } from "@/types/hook";
import * as electron from "@/services/electron";

interface CreateHookModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export function CreateHookModal({ onClose, onRefresh }: CreateHookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [event, setEvent] = useState<HookEvent>("PreToolUse");
  const [matcher, setMatcher] = useState("*");
  const [command, setCommand] = useState("");
  const [tags, setTags] = useState("");
  const [requiresTools, setRequiresTools] = useState("");
  const [suggestedFor, setSuggestedFor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Hook name is required");
      return;
    }
    if (!description.trim()) {
      alert("Hook description is required");
      return;
    }
    if (!command.trim()) {
      alert("Shell command is required");
      return;
    }

    setIsSaving(true);
    try {
      const newHook = {
        name: name.trim(),
        description: description.trim(),
        category: (category.trim() || "Code Quality") as Hook["category"],
        event: event,
        matcher: matcher.trim(),
        command: command.trim(),
        tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        requiresTools: requiresTools ? requiresTools.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        suggestedFor: suggestedFor ? suggestedFor.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      };

      await electron.createHookTemplate(newHook);
      alert(`Hook "${name}" created successfully!`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create hook:", err);
      alert(`Failed to create hook: ${err}`);
    } finally {
      setIsSaving(false);
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
            <h2 className="text-2xl font-bold">Create New Hook</h2>
            <p className="text-muted-foreground mt-1">Add a new hook template to your dev library</p>
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
                placeholder="Hook name"
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
                placeholder="Hook description"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Event <span className="text-red-500">*</span>
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value as HookEvent)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Matcher <span className="text-red-500">*</span>
              </label>
              <Input
                value={matcher}
                onChange={(e) => setMatcher(e.target.value)}
                placeholder="Matcher pattern (e.g., *)"
                className="mt-1"
              />
            </div>
          </div>

          {/* Command */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Shell Command <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="font-mono text-sm min-h-32 mt-1"
              placeholder="Shell command to execute..."
            />
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div>
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
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Required Tools
              </label>
              <Input
                value={requiresTools}
                onChange={(e) => setRequiresTools(e.target.value)}
                placeholder="Comma-separated tool names (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Suggested For
              </label>
              <Input
                value={suggestedFor}
                onChange={(e) => setSuggestedFor(e.target.value)}
                placeholder="Comma-separated technologies (optional)"
                className="mt-1"
              />
            </div>
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Hook
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
