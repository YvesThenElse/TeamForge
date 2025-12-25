import { X, Copy, Check, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Constitution, AISystem, ConstitutionCategory } from "@/types/constitution";
import * as electron from "@/services/electron";

interface ConstitutionDetailModalProps {
  constitution: Constitution;
  projectPath: string | null;
  onClose: () => void;
  devMode?: boolean;
  onRefresh?: () => void;
}

const AI_SYSTEMS: AISystem[] = ["claude-code", "gemini-cli", "cline"];
const CATEGORIES: ConstitutionCategory[] = ["general", "coding-style", "workflow", "security", "project"];

export function ConstitutionDetailModal({
  constitution,
  projectPath,
  onClose,
  devMode = false,
  onRefresh
}: ConstitutionDetailModalProps) {
  const { constitutionDevPath } = useSettingsStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(constitution.name);
  const [editDescription, setEditDescription] = useState(constitution.description);
  const [editCategory, setEditCategory] = useState<ConstitutionCategory>(constitution.category);
  const [editTargetSystem, setEditTargetSystem] = useState<AISystem | "">(constitution.targetSystem || "");
  const [editTags, setEditTags] = useState(constitution.tags?.join(", ") || "");
  const [editContent, setEditContent] = useState(constitution.content || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyContent = () => {
    const contentText = isEditing ? editContent : constitution.content;
    if (contentText) {
      navigator.clipboard.writeText(contentText);
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
    setEditName(constitution.name);
    setEditDescription(constitution.description);
    setEditCategory(constitution.category);
    setEditTargetSystem(constitution.targetSystem || "");
    setEditTags(constitution.tags?.join(", ") || "");
    setEditContent(constitution.content || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!constitutionDevPath) {
      alert("Dev Path must be configured in Settings > Constitutions");
      return;
    }

    setIsSaving(true);
    try {
      await electron.updateConstitutionTemplate(
        constitution.id,
        editName,
        editDescription,
        editContent,
        editCategory,
        editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        editTargetSystem || undefined,
        constitutionDevPath,
        projectPath || undefined
      );
      alert(`Constitution "${editName}" updated successfully!`);
      setIsEditing(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to update constitution:", err);
      alert(`Failed to update constitution: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!constitutionDevPath) {
      alert("Dev Path must be configured in Settings > Constitutions");
      return;
    }

    if (!confirm(`Are you sure you want to delete the constitution "${constitution.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await electron.deleteConstitutionTemplate(
        constitution.id,
        constitutionDevPath,
        projectPath || undefined
      );
      alert(`Constitution "${constitution.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete constitution:", err);
      alert(`Failed to delete constitution: ${err}`);
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
                  placeholder="Constitution name"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-muted-foreground"
                  placeholder="Constitution description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{constitution.name}</h2>
                <p className="text-muted-foreground mt-1">{constitution.description}</p>
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
                    onChange={(e) => setEditCategory(e.target.value as ConstitutionCategory)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline">{constitution.category}</Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Target System
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editTargetSystem}
                    onChange={(e) => setEditTargetSystem(e.target.value as AISystem | "")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Universal (all systems)</option>
                    {AI_SYSTEMS.map((system) => (
                      <option key={system} value={system}>{system}</option>
                    ))}
                  </select>
                ) : constitution.targetSystem ? (
                  <Badge variant="secondary">{constitution.targetSystem}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Universal</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Constitution ID
              </label>
              <div className="mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {constitution.id}
                </code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="mt-1">
                <span className="text-sm">
                  {new Date(constitution.updatedAt).toLocaleDateString()}
                </span>
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
              ) : constitution.tags && constitution.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {constitution.tags.map((tag) => (
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

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Content
              </label>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
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
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="font-mono text-sm min-h-96"
                placeholder="Constitution content (markdown)..."
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {constitution.content || "No content"}
                </pre>
              </div>
            )}
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
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
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
