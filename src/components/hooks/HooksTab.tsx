import { useState, useEffect, useMemo } from "react";
import { Loader2, Search, X, CheckCircle, RefreshCw, Code, Plus, FolderPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useHookStore } from "@/stores/hookStore";
import type { Hook, HookEvent } from "@/types/hook";
import * as electron from "@/services/electron";
import { HookDetailModal } from "./HookDetailModal";
import { CreateHookModal } from "./CreateHookModal";

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

export function HooksTab() {
  const { projectPath } = useProjectStore();
  const { claudeSettingsFile, developerMode, setDeveloperMode, hookCachePath, hookSourcePath, hookDevPath } = useSettingsStore();

  // Use hook store for library state
  const {
    library,
    categories,
    selectedCategory,
    searchQuery,
    isLoading: loading,
    setLibrary,
    setSelectedCategory,
    setSearchQuery,
    setIsLoading: setLoading,
    getFilteredHooks,
  } = useHookStore();

  // Local state for UI-specific concerns
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deployedHooks, setDeployedHooks] = useState<Array<{
    event: string;
    matcher: string;
    command: string;
    type: string;
  }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Compute the full path for display (dev mode uses devPath, normal mode uses cachePath)
  const fullCachePath = useMemo(() => {
    if (developerMode) {
      // Dev mode: use hookDevPath
      if (!hookDevPath) return null;
      if (hookDevPath.includes(':') || hookDevPath.startsWith('/')) {
        return hookDevPath;
      }
      // Relative path - needs project
      if (projectPath) {
        return `${projectPath}/${hookDevPath}`.replace(/\\/g, '/');
      }
      return null;
    } else {
      // Normal mode: use hookCachePath
      if (!hookCachePath) return null;
      if (hookCachePath.includes(':') || hookCachePath.startsWith('/')) {
        return hookSourcePath ? `${hookCachePath}/${hookSourcePath}` : hookCachePath;
      }
      // Relative path - needs project
      if (projectPath) {
        return hookSourcePath
          ? `${projectPath}/${hookCachePath}/${hookSourcePath}`.replace(/\\/g, '/')
          : `${projectPath}/${hookCachePath}`.replace(/\\/g, '/');
      }
      return null;
    }
  }, [developerMode, hookCachePath, hookDevPath, hookSourcePath, projectPath]);

  const handleOpenFolder = async () => {
    if (fullCachePath) {
      try {
        await electron.openFolder(fullCachePath.replace(/\//g, '\\'));
      } catch (error) {
        console.error("Failed to open folder:", error);
      }
    }
  };

  // Load template hooks
  const loadTemplates = async (devMode = developerMode) => {
    setLoading(true);
    setLoadError(null);
    try {
      console.log(`[HooksTab] Loading template hooks ${devMode ? '(dev mode)' : ''}...`);
      const templates = await electron.loadTemplateHooks(
        devMode,
        hookCachePath || undefined,
        hookDevPath || undefined,
        projectPath || undefined,
        hookSourcePath || undefined
      );
      console.log("[HooksTab] Loaded templates:", templates);
      // setLibrary automatically extracts categories
      setLibrary(templates);
    } catch (err: any) {
      console.error("[HooksTab] Failed to load templates:", err);
      setLoadError(err.message || "Failed to load hook library");
      // Clear library when there's an error (especially important for dev mode)
      setLibrary([]);
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
  }, [developerMode, projectPath, hookCachePath, hookSourcePath, hookDevPath]);

  // Load deployed hooks when project path changes
  useEffect(() => {
    if (projectPath) {
      loadDeployedHooks();
    } else {
      setDeployedHooks([]);
    }
  }, [projectPath]);

  const loadDeployedHooks = async () => {
    if (!projectPath) return;

    try {
      const deployed = await electron.listHooks(projectPath, claudeSettingsFile);
      setDeployedHooks(deployed);
    } catch (err) {
      console.error("[HooksTab] Failed to load deployed hooks:", err);
      setDeployedHooks([]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTemplates(developerMode);
    } catch (err) {
      console.error("[HooksTab] Failed to refresh hooks:", err);
      alert(`Failed to refresh hooks: ${err}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle developer mode
  const handleToggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

  // Get filtered hooks from store
  const filteredHooks = getFilteredHooks();

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleDeployHook = async (hook: Hook) => {
    if (!projectPath) {
      alert("Please select a project first");
      return;
    }

    try {
      // Ensure .claude directory exists
      await electron.ensureHooksDir(projectPath);

      // Deploy hook to project's .claude/settings file
      await electron.deployHook(projectPath, hook, claudeSettingsFile);

      alert(`Hook "${hook.name}" deployed successfully`);
      setSelectedHook(null);
      // Reload deployed hooks
      loadDeployedHooks();
    } catch (err) {
      console.error("Failed to deploy hook:", err);
      alert(`Failed to deploy hook: ${err}`);
    }
  };

  const handleRemoveHook = async (hook: Hook) => {
    if (!projectPath) {
      alert("Please select a project first");
      return;
    }

    try {
      await electron.removeHook(projectPath, hook.event, hook.matcher, hook.command, claudeSettingsFile);
      alert(`Hook "${hook.name}" removed successfully`);
      loadDeployedHooks();
    } catch (err) {
      console.error("Failed to remove hook:", err);
      alert(`Failed to remove hook: ${err}`);
    }
  };

  // Check if hook is deployed
  const isHookDeployed = (hook: Hook): boolean => {
    return deployedHooks.some(
      deployed =>
        deployed.event === hook.event &&
        deployed.matcher === hook.matcher &&
        deployed.command === hook.command
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hooks library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hooks Library</h2>
          <p className="text-sm text-muted-foreground">
            {library.length > 0 ? (
              <>
                {library.length} hook{library.length !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                {fullCachePath && <span className="ml-1">from <code className="text-xs bg-muted px-1 rounded">{fullCachePath}</code></span>}
              </>
            ) : (
              "No hooks loaded"
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
            {developerMode && !hookDevPath && (
              <p className="text-muted-foreground text-sm mt-2">
                Please configure a Dev Path in Settings &gt; Hooks to use Developer Mode.
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
              Filter hooks by category
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
                const count = library.filter((h) => h.category === cat).length;
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
            <CardTitle className="text-lg">Search Hooks</CardTitle>
            <CardDescription>
              Search by name, description, tags, category, or event (minimum 3 characters)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search hooks..."
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
                Found {filteredHooks.length} hook{filteredHooks.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Hooks Grid */}
      {!loadError && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(developerMode ? library : filteredHooks).map((hook) => {
          const deployed = isHookDeployed(hook);
          return (
            <Card
              key={hook.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                deployed ? 'border-green-500/50 bg-green-500/5' : ''
              }`}
              onClick={() => setSelectedHook(hook)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {hook.name}
                      {deployed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {hook.category && (
                        <Badge variant="outline">{hook.category}</Badge>
                      )}
                      <Badge className={`text-xs border ${getEventBadgeClass(hook.event)}`}>
                        {hook.event}
                      </Badge>
                      {deployed && (
                        <Badge variant="default" className="bg-green-500">
                          Deployed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3 mt-2">
                  {hook.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hook.tags && hook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hook.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {hook.tags.length > 4 && (
                      <span className="px-2 py-0.5 bg-muted text-xs rounded">
                        +{hook.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
                {hook.requiresTools && hook.requiresTools.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Requires:</span>{" "}
                    {hook.requiresTools.slice(0, 3).join(", ")}
                    {hook.requiresTools.length > 3 && "..."}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Hook Detail Modal */}
      {selectedHook && (
        <HookDetailModal
          hook={selectedHook}
          projectPath={projectPath}
          isDeployed={isHookDeployed(selectedHook)}
          claudeSettingsFile={claudeSettingsFile}
          onClose={() => setSelectedHook(null)}
          onDeploy={handleDeployHook}
          onRemove={handleRemoveHook}
          devMode={developerMode}
          onRefresh={loadTemplates}
        />
      )}

      {/* Create Hook Modal */}
      {showCreateModal && (
        <CreateHookModal
          onClose={() => setShowCreateModal(false)}
          onRefresh={loadTemplates}
        />
      )}

      {!loadError && filteredHooks.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Hooks Found</h3>
              <p className="text-muted-foreground">
                No hooks in this category yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
