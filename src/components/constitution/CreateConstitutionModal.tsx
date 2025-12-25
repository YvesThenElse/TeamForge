import { X, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProjectStore } from "@/stores/projectStore";
import type { AISystem, ConstitutionCategory } from "@/types/constitution";
import * as electron from "@/services/electron";

interface CreateConstitutionModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const AI_SYSTEMS: AISystem[] = ["claude-code", "gemini-cli", "cline"];
const CATEGORIES: ConstitutionCategory[] = ["general", "coding-style", "workflow", "security", "project"];

export function CreateConstitutionModal({ onClose, onRefresh }: CreateConstitutionModalProps) {
  const { constitutionDevPath } = useSettingsStore();
  const { projectPath } = useProjectStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ConstitutionCategory>("general");
  const [targetSystem, setTargetSystem] = useState<AISystem | "">("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!constitutionDevPath) {
      setError("Dev Path must be configured in Settings > Constitutions");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await electron.createConstitutionTemplate(
        name.trim(),
        description.trim(),
        content,
        category,
        tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        targetSystem || undefined,
        constitutionDevPath,
        projectPath || undefined
      );

      alert(`Constitution "${name}" created successfully!`);
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to create constitution:", err);
      setError(err.message || "Failed to create constitution");
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
          <div>
            <h2 className="text-2xl font-bold">Create New Constitution</h2>
            <p className="text-muted-foreground mt-1">
              Create a new constitution template in developer mode
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Code Review Guidelines"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this constitution..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Category and Target System */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ConstitutionCategory)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Target System</label>
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value as AISystem | "")}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Universal (all systems)</option>
                {AI_SYSTEMS.map((system) => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (e.g., typescript, react, testing)"
              className="mt-1"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Constitution content in markdown..."
              className="mt-1 font-mono text-sm min-h-64"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Constitution
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
