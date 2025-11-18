import { X, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import * as electron from "@/services/electron";

interface CreateSkillModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export function CreateSkillModal({ onClose, onRefresh }: CreateSkillModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [allowedTools, setAllowedTools] = useState("");
  const [tags, setTags] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Skill name is required");
      return;
    }
    if (!description.trim()) {
      alert("Skill description is required");
      return;
    }

    setIsSaving(true);
    try {
      const newSkill = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim() || undefined,
        allowedTools: allowedTools.trim() || undefined,
        tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        instructions: instructions.trim(),
      };

      await electron.createSkillTemplate(newSkill);
      alert(`Skill "${name}" created successfully!`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to create skill:", err);
      alert(`Failed to create skill: ${err}`);
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
            <h2 className="text-2xl font-bold">Create New Skill</h2>
            <p className="text-muted-foreground mt-1">Add a new skill template to your dev library</p>
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
                placeholder="Skill name"
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
                placeholder="Skill description"
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
                Allowed Tools
              </label>
              <Input
                value={allowedTools}
                onChange={(e) => setAllowedTools(e.target.value)}
                placeholder="Comma-separated tools (optional)"
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
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
          </div>

          {/* Instructions */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Instructions
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="font-mono text-sm min-h-96 mt-1"
              placeholder="Skill instructions..."
            />
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
                  Create Skill
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
