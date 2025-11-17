import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Agent } from "@/types";

interface AgentDetailsDialogProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentDetailsDialog({ agent, onClose }: AgentDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyTemplate = () => {
    if (agent.template) {
      navigator.clipboard.writeText(agent.template);
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
            <h2 className="text-2xl font-bold">{agent.name}</h2>
            <p className="text-muted-foreground mt-1">{agent.description}</p>
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
                <Badge variant="outline">{agent.category}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Model
              </label>
              <div className="mt-1">
                <Badge variant="outline">{agent.model || "sonnet"}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tools
              </label>
              <div className="mt-1">
                <span className="text-sm">
                  {typeof agent.tools === "string"
                    ? agent.tools
                    : agent.tools?.join(", ") || "all"}
                </span>
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
          {agent.tags && agent.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {agent.tags.map((tag) => (
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

          {/* System Prompt / Template */}
          {agent.template && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  System Prompt
                </label>
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
              </div>
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {agent.template}
                </pre>
              </div>
            </div>
          )}

          {/* Suggested For */}
          {agent.suggestedFor && agent.suggestedFor.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Suggested For Technologies
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {agent.suggestedFor.map((tech: string) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
