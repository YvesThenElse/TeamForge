import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Skill } from "@/types/skill";

interface SkillDetailModalProps {
  skill: Skill;
  projectPath: string | null;
  onClose: () => void;
  onAddSkill: (skill: Skill) => void;
  onRemoveSkill?: (skillId: string) => void;
  isDeployed?: boolean;
}

export function SkillDetailModal({ skill, projectPath, onClose, onAddSkill, onRemoveSkill, isDeployed }: SkillDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInstructions = () => {
    if (skill.instructions) {
      navigator.clipboard.writeText(skill.instructions);
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
            <h2 className="text-2xl font-bold">{skill.name}</h2>
            <p className="text-muted-foreground mt-1">{skill.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {skill.category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{skill.category}</Badge>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Skill ID
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {skill.id}
                </code>
              </div>
            </div>
            {skill.allowedTools && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Allowed Tools
                </label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {skill.allowedTools.split(",").map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-muted text-xs rounded"
                    >
                      {tool.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {skill.tags.map((tag) => (
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

          {/* Instructions */}
          {skill.instructions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Instructions
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInstructions}
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
                  {skill.instructions}
                </pre>
              </div>
            </div>
          )}

          {/* File Format Preview */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Skill File Format (SKILL.md)
            </label>
            <div className="bg-muted p-4 rounded-lg overflow-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
{`---
name: ${skill.name}
description: ${skill.description}${skill.allowedTools ? `\nallowed-tools: ${skill.allowedTools}` : ''}${skill.category ? `\ncategory: ${skill.category}` : ''}${skill.tags && skill.tags.length > 0 ? `\ntags:\n  - ${skill.tags.join('\n  - ')}` : ''}
---

${skill.instructions || "Instructions go here..."}`}
              </pre>
            </div>
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
            {isDeployed && onRemoveSkill ? (
              <Button
                onClick={() => onRemoveSkill(skill.id)}
                variant="destructive"
              >
                Remove from project
              </Button>
            ) : (
              <Button
                onClick={() => onAddSkill(skill)}
                disabled={!projectPath}
              >
                Add this skill
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
