import { useState, useEffect, useMemo } from "react";
import { Loader2, Search, X, CheckCircle, RefreshCw, Code, Plus, FolderPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Skill } from "@/types/skill";
import * as electron from "@/services/electron";
import { SkillDetailModal } from "./SkillDetailModal";
import { CreateSkillModal } from "./CreateSkillModal";

export function SkillsTab() {
  const { projectPath } = useProjectStore();
  const { developerMode, setDeveloperMode, skillCachePath, skillSourcePath, skillDevPath } = useSettingsStore();
  const [library, setLibrary] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deployedSkills, setDeployedSkills] = useState<Skill[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Compute the full path for display (dev mode uses devPath, normal mode uses cachePath)
  const fullCachePath = useMemo(() => {
    if (developerMode) {
      // Dev mode: use skillDevPath
      if (!skillDevPath) return null;
      if (skillDevPath.includes(':') || skillDevPath.startsWith('/')) {
        return skillDevPath;
      }
      // Relative path - needs project
      if (projectPath) {
        return `${projectPath}/${skillDevPath}`.replace(/\\/g, '/');
      }
      return null;
    } else {
      // Normal mode: use skillCachePath
      if (!skillCachePath) return null;
      if (skillCachePath.includes(':') || skillCachePath.startsWith('/')) {
        return skillSourcePath ? `${skillCachePath}/${skillSourcePath}` : skillCachePath;
      }
      // Relative path - needs project
      if (projectPath) {
        return skillSourcePath
          ? `${projectPath}/${skillCachePath}/${skillSourcePath}`.replace(/\\/g, '/')
          : `${projectPath}/${skillCachePath}`.replace(/\\/g, '/');
      }
      return null;
    }
  }, [developerMode, skillCachePath, skillDevPath, skillSourcePath, projectPath]);

  const handleOpenFolder = async () => {
    if (fullCachePath) {
      try {
        await electron.openFolder(fullCachePath.replace(/\//g, '\\'));
      } catch (error) {
        console.error("Failed to open folder:", error);
      }
    }
  };

  // Load template skills
  const loadTemplates = async (devMode = developerMode) => {
    setLoading(true);
    setLoadError(null);
    try {
      console.log(`[SkillsTab] Loading template skills ${devMode ? '(dev mode)' : ''}...`);
      const templates = await electron.loadTemplateSkills(
        devMode,
        skillCachePath || undefined,
        skillDevPath || undefined,
        projectPath || undefined,
        skillSourcePath || undefined
      );
      console.log("[SkillsTab] Loaded templates:", templates);
      setLibrary(templates);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(templates.map((s) => s.category).filter(Boolean))
      ).sort() as string[];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error("[SkillsTab] Failed to load templates:", err);
      setLoadError(err.message || "Failed to load skill library");
      // Clear library when there's an error (especially important for dev mode)
      setLibrary([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when relevant settings change
  useEffect(() => {
    loadTemplates();
  }, []);

  // Reload when developer mode or path settings change
  useEffect(() => {
    loadTemplates(developerMode);
  }, [developerMode, projectPath, skillCachePath, skillSourcePath, skillDevPath]);

  // Load deployed skills when project path changes
  useEffect(() => {
    if (projectPath) {
      loadDeployedSkills();
    } else {
      setDeployedSkills([]);
    }
  }, [projectPath]);

  const loadDeployedSkills = async () => {
    if (!projectPath) return;

    try {
      const deployed = await electron.listSkills(projectPath);
      setDeployedSkills(deployed);
    } catch (err) {
      console.error("[SkillsTab] Failed to load deployed skills:", err);
      setDeployedSkills([]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTemplates(developerMode);
    } catch (err) {
      console.error("[SkillsTab] Failed to refresh skills:", err);
      alert(`Failed to refresh skills: ${err}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle developer mode
  const handleToggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

  // Filter by category first
  let filteredSkills = selectedCategory === "all"
    ? library
    : library.filter((s) => s.category === selectedCategory);

  // Then filter by search query (only if 3+ characters)
  if (searchQuery.trim().length >= 3) {
    const query = searchQuery.toLowerCase();
    filteredSkills = filteredSkills.filter((skill) =>
      skill.name.toLowerCase().includes(query) ||
      skill.description.toLowerCase().includes(query) ||
      skill.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      (skill.category && skill.category.toLowerCase().includes(query))
    );
  }

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleAddSkill = async (skill: Skill) => {
    if (!projectPath) {
      alert("Please select a project first");
      return;
    }

    try {
      // Create frontmatter for the skill file
      const frontmatter: any = {
        name: skill.name,
        description: skill.description,
      };

      if (skill.allowedTools) {
        frontmatter["allowed-tools"] = skill.allowedTools;
      }

      if (skill.category) {
        frontmatter.category = skill.category;
      }

      if (skill.tags && skill.tags.length > 0) {
        frontmatter.tags = skill.tags;
      }

      // Ensure .claude/skills/ directory exists
      await electron.ensureSkillsDir(projectPath);

      // Save skill file to project's .claude/skills/ directory
      const result = await electron.saveSkill(
        projectPath,
        skill.id,
        frontmatter,
        skill.instructions || ""
      );

      if (result.success) {
        alert(`Skill "${skill.name}" added successfully to ${result.skillPath}`);
        setSelectedSkill(null);
        // Reload deployed skills
        loadDeployedSkills();
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
      alert(`Failed to add skill: ${err}`);
    }
  };

  // Check if skill is deployed
  const isSkillDeployed = (skillId: string): boolean => {
    return deployedSkills.some(deployed => deployed.id === skillId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading skill library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skill Library</h2>
          <p className="text-sm text-muted-foreground">
            {library.length > 0 ? (
              <>
                {library.length} skill{library.length !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                {fullCachePath && <span className="ml-1">from <code className="text-xs bg-muted px-1 rounded">{fullCachePath}</code></span>}
              </>
            ) : (
              "No skills loaded"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fullCachePath && library.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleOpenFolder}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Folder
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {developerMode && (
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="default"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          )}
          <Button
            onClick={handleToggleDeveloperMode}
            variant={developerMode ? "default" : "outline"}
            size="sm"
          >
            <Code className="mr-2 h-4 w-4" />
            {developerMode ? "Dev Mode (ON)" : "Dev Mode"}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {loadError && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="py-4">
            <p className="text-red-600 text-sm">{loadError}</p>
            {developerMode && !skillDevPath && (
              <p className="text-muted-foreground text-sm mt-2">
                Please configure a Dev Path in Settings &gt; Skills to use Developer Mode.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories and Search on same row - Hidden in Dev Mode */}
      {!developerMode && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories - Left */}
          <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Filter skills by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All ({library.length})
              </button>
              {categories.map((cat) => {
                const count = library.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search - Right */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Skills</CardTitle>
            <CardDescription>
              Search by name, description, tags, or category (minimum 3 characters)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleClearSearch}
                variant="outline"
                size="icon"
                disabled={!searchQuery}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
              <p className="text-sm text-muted-foreground mt-2">
                Type at least 3 characters to search
              </p>
            )}
            {searchQuery.trim().length >= 3 && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Skills Grid */}
      {!loadError && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(developerMode ? library : filteredSkills).map((skill) => {
          const deployed = isSkillDeployed(skill.id);
          return (
            <Card
              key={skill.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                deployed ? 'border-green-500/50 bg-green-500/5' : ''
              }`}
              onClick={() => setSelectedSkill(skill)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {skill.name}
                      {deployed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {skill.category && (
                        <Badge variant="outline">{skill.category}</Badge>
                      )}
                      {deployed && (
                        <Badge variant="default" className="bg-green-500">
                          Deployed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3 mt-2">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {skill.allowedTools && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Tools:</span>{" "}
                    {skill.allowedTools.split(",").slice(0, 3).map(t => t.trim()).join(", ")}
                    {skill.allowedTools.split(",").length > 3 && "..."}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          projectPath={projectPath}
          onClose={() => setSelectedSkill(null)}
          onAddSkill={handleAddSkill}
          devMode={developerMode}
          onRefresh={loadTemplates}
        />
      )}

      {/* Create Skill Modal */}
      {showCreateModal && (
        <CreateSkillModal
          onClose={() => setShowCreateModal(false)}
          onRefresh={loadTemplates}
        />
      )}

      {!loadError && filteredSkills.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Skills Found</h3>
              <p className="text-muted-foreground">
                No skills in this category yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
