import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Sparkles, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import type { Skill, SkillFrontmatter } from "@/types/skill";
import * as electron from "@/services/electron";

export function SkillsTab() {
  const { projectPath } = useProjectStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (projectPath) {
      loadSkills();
    }
  }, [projectPath]);

  const loadSkills = async () => {
    if (!projectPath) return;

    setIsLoading(true);
    try {
      const loadedSkills = await electron.listSkills(projectPath);
      setSkills(loadedSkills);
    } catch (error) {
      console.error("Failed to load skills:", error);
      alert("Failed to load skills");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSkill = () => {
    setIsCreating(true);
    setEditingSkill(null);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setIsCreating(false);
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!projectPath) return;
    if (!confirm(`Are you sure you want to delete the skill "${skillId}"?`)) return;

    try {
      await electron.deleteSkill(projectPath, skillId);
      await loadSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("Failed to delete skill");
    }
  };

  const handleSaveComplete = () => {
    setIsCreating(false);
    setEditingSkill(null);
    loadSkills();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSkill(null);
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">
            Please select a project first to manage skills
          </p>
        </div>
      </div>
    );
  }

  if (isCreating || editingSkill) {
    return (
      <SkillEditor
        skill={editingSkill}
        projectPath={projectPath}
        onSave={handleSaveComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Skills</h2>
          <p className="text-muted-foreground mt-1">
            Manage skills in .claude/skills/ directory
          </p>
        </div>
        <Button onClick={handleCreateSkill}>
          <Plus className="mr-2 h-4 w-4" />
          New Skill
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : skills.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Skills Created</h3>
              <p className="text-muted-foreground mb-4">
                Skills package expertise into discoverable capabilities. Each skill consists
                of instructions and optional supporting files.
              </p>
              <Button onClick={handleCreateSkill}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Skill
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className={skill.error ? "border-red-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{skill.name}</CardTitle>
                    <CardDescription className="text-xs font-mono mt-1 truncate">
                      {skill.id}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSkill(skill)}
                      disabled={skill.error}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {skill.description || "No description"}
                </p>
                {skill.allowedTools && (
                  <div className="text-xs">
                    <span className="font-medium">Allowed tools:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {skill.allowedTools.split(",").map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-muted rounded text-xs"
                        >
                          {tool.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skill.error && (
                  <div className="text-xs text-red-500 mt-2">
                    Error loading SKILL.md file
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface SkillEditorProps {
  skill: Skill | null; // null for new skill
  projectPath: string;
  onSave: () => void;
  onCancel: () => void;
}

function SkillEditor({ skill, projectPath, onSave, onCancel }: SkillEditorProps) {
  const [skillId, setSkillId] = useState(skill?.id || "");
  const [name, setName] = useState(skill?.name || "");
  const [description, setDescription] = useState(skill?.description || "");
  const [allowedTools, setAllowedTools] = useState(skill?.allowedTools || "");
  const [instructions, setInstructions] = useState(skill?.instructions || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!skillId.trim()) {
      alert("Skill ID is required");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(skillId)) {
      alert("Skill ID must contain only lowercase letters, numbers, and hyphens");
      return;
    }

    if (skillId.length > 64) {
      alert("Skill ID must be 64 characters or less");
      return;
    }

    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    if (!description.trim()) {
      alert("Description is required");
      return;
    }

    if (description.length > 1024) {
      alert("Description must be 1024 characters or less");
      return;
    }

    if (!instructions.trim()) {
      alert("Instructions are required");
      return;
    }

    setIsSaving(true);
    try {
      const frontmatter: SkillFrontmatter = {
        name: name.trim(),
        description: description.trim(),
      };

      if (allowedTools.trim()) {
        frontmatter["allowed-tools"] = allowedTools.trim();
      }

      await electron.saveSkill(
        projectPath,
        skillId.trim(),
        frontmatter,
        instructions.trim()
      );

      onSave();
    } catch (error) {
      console.error("Failed to save skill:", error);
      alert("Failed to save skill");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {skill ? "Edit Skill" : "Create New Skill"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {skill ? `Editing ${skill.id}` : "Create a new skill for this project"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Skill
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Required metadata for the skill (stored in YAML frontmatter)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Skill ID * <span className="text-xs text-muted-foreground">(directory name)</span>
            </label>
            <Input
              type="text"
              placeholder="pdf-processor"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value.toLowerCase())}
              disabled={!!skill} // Can't change ID when editing
              className="mt-1 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lowercase letters, numbers, and hyphens only (max 64 characters)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              type="text"
              placeholder="PDF Processor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Description * <span className="text-xs text-muted-foreground">(max 1024 chars)</span>
            </label>
            <textarea
              placeholder="Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
              maxLength={1024}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/1024 - Be specific about what the skill does and when to use it
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">
              Allowed Tools <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Read, Grep, Glob"
              value={allowedTools}
              onChange={(e) => setAllowedTools(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated list of tools Claude can use (e.g., Read, Grep, Glob)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Instructions</CardTitle>
          <CardDescription>
            Main content that describes how to use this skill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Enter detailed instructions for this skill..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full min-h-[300px] px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Write clear, specific instructions. You can use Markdown formatting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
