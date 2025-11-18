import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Hook, HookEvent } from "@/types/hook";

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
}

export function HookDetailModal({
  hook,
  projectPath,
  isDeployed,
  claudeSettingsFile,
  onClose,
  onDeploy,
  onRemove,
}: HookDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    if (hook.command) {
      navigator.clipboard.writeText(hook.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
            <h2 className="text-2xl font-bold">{hook.name}</h2>
            <p className="text-muted-foreground mt-1">{hook.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {hook.category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{hook.category}</Badge>
                </div>
              </div>
            )}
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
                <Badge className={`border ${getEventBadgeClass(hook.event)}`}>
                  {hook.event}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Matcher
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {hook.matcher}
                </code>
              </div>
            </div>
          </div>

          {/* Tags */}
          {hook.tags && hook.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {hook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Tools */}
          {hook.requiresTools && hook.requiresTools.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Required Tools
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {hook.requiresTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested For */}
          {hook.suggestedFor && hook.suggestedFor.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Suggested For
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {hook.suggestedFor.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Command */}
          {hook.command && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Shell Command
                </label>
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
              </div>
              <div className="bg-muted p-4 rounded-lg overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {hook.command}
                </pre>
              </div>
            </div>
          )}

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
          <div className="flex-1">
            {!projectPath && (
              <p className="text-xs text-muted-foreground">
                Select a project first
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isDeployed ? (
              <Button
                onClick={() => onRemove(hook)}
                variant="destructive"
              >
                Remove from project
              </Button>
            ) : (
              <Button
                onClick={() => onDeploy(hook)}
                disabled={!projectPath}
              >
                Deploy this hook
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
