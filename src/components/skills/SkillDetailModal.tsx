import { X, Copy, Check, Trash2, Edit, Save, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Skill } from "@/types/skill";
import * as electron from "@/services/electron";

interface SkillDetailModalProps {
  skill: Skill;
  projectPath: string | null;
  onClose: () => void;
  onAddSkill: (skill: Skill) => void;
  onRemoveSkill?: (skillId: string) => void;
  isDeployed?: boolean;
  devMode?: boolean;
  onRefresh?: () => void;
}

export function SkillDetailModal({
  skill,
  projectPath,
  onClose,
  onAddSkill,
  onRemoveSkill,
  isDeployed = false,
  devMode = false,
  onRefresh
}: SkillDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(skill.name);
  const [editDescription, setEditDescription] = useState(skill.description);
  const [editCategory, setEditCategory] = useState(skill.category || "");
  const [editAllowedTools, setEditAllowedTools] = useState(skill.allowedTools || "");
  const [editTags, setEditTags] = useState(skill.tags?.join(", ") || "");
  const [editInstructions, setEditInstructions] = useState(skill.instructions || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyInstructions = () => {
    const instructionsText = isEditing ? editInstructions : skill.instructions;
    if (instructionsText) {
      navigator.clipboard.writeText(instructionsText);
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
    setEditName(skill.name);
    setEditDescription(skill.description);
    setEditCategory(skill.category || "");
    setEditAllowedTools(skill.allowedTools || "");
    setEditTags(skill.tags?.join(", ") || "");
    setEditInstructions(skill.instructions || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSkill: Partial<Skill> = {
        name: editName,
        description: editDescription,
        category: editCategory || undefined,
        allowedTools: editAllowedTools || undefined,
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        instructions: editInstructions,
      };

      await electron.updateSkillTemplate(skill.id, updatedSkill);
      alert(`Skill "${editName}" updated successfully!`);
      setIsEditing(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update skill:", err);
      alert(`Failed to update skill: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the skill template "${skill.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await electron.deleteSkillTemplate(skill.id);
      alert(`Skill template "${skill.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete skill:", err);
      alert(`Failed to delete skill: ${err}`);
    }
  };

  const handleOpenFile = async () => {
    try {
      await electron.openSkillTemplateFile(skill.id);
    } catch (err) {
      console.error("Failed to open file:", err);
      alert(`Failed to open file: ${err}`);
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
                  placeholder="Skill name"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-muted-foreground"
                  placeholder="Skill description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{skill.name}</h2>
                <p className="text-muted-foreground mt-1">{skill.description}</p>
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
                ) : skill.category ? (
                  <Badge variant="outline">{skill.category}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">No category</span>
                )}
              </div>
            </div>
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
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Allowed Tools
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <Input
                    value={editAllowedTools}
                    onChange={(e) => setEditAllowedTools(e.target.value)}
                    placeholder="Comma-separated tools (optional)"
                  />
                ) : skill.allowedTools ? (
                  <div className="flex flex-wrap gap-1">
                    {skill.allowedTools.split(",").map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-muted text-xs rounded"
                      >
                        {tool.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No tools specified</span>
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
              ) : skill.tags && skill.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
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

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Instructions
              </label>
              {!isEditing && (
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
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="font-mono text-sm min-h-96"
                placeholder="Skill instructions..."
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {skill.instructions || "No instructions"}
                </pre>
              </div>
            )}
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
            {/* Deployed skills: Remove button */}
            {isDeployed && onRemoveSkill && (
              <Button
                variant="destructive"
                onClick={() => onRemoveSkill(skill.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Skill
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
                <Button variant="outline" onClick={handleOpenFile}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open File
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
                    onClick={() => onAddSkill(skill)}
                    disabled={!projectPath}
                  >
                    Add this skill
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
