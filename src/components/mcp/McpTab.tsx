import { useState, useEffect, useMemo } from "react";
import { Loader2, Search, X, CheckCircle, RefreshCw, Code, Plus, FolderPlus, ExternalLink, Server, Terminal, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useMcpStore } from "@/stores/mcpStore";
import type { McpServer } from "@/types/mcp";
import * as electron from "@/services/electron";
import { McpDetailModal } from "./McpDetailModal";
import { CreateMcpModal } from "./CreateMcpModal";

export function McpTab() {
  const { projectPath } = useProjectStore();
  const { developerMode, setDeveloperMode, mcpCachePath, mcpSourcePath, mcpDevPath } = useSettingsStore();

  // Use MCP store for library state
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
    getFilteredMcps,
  } = useMcpStore();

  // Local state for UI-specific concerns
  const [selectedMcp, setSelectedMcp] = useState<McpServer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deployedMcps, setDeployedMcps] = useState<McpServer[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Compute the full path for display (dev mode uses devPath, normal mode uses cachePath)
  const fullCachePath = useMemo(() => {
    if (developerMode) {
      // Dev mode: use mcpDevPath
      if (!mcpDevPath) return null;
      if (mcpDevPath.includes(':') || mcpDevPath.startsWith('/')) {
        return mcpDevPath;
      }
      // Relative path - needs project
      if (projectPath) {
        return `${projectPath}/${mcpDevPath}`.replace(/\\/g, '/');
      }
      return null;
    } else {
      // Normal mode: use mcpCachePath
      if (!mcpCachePath) return null;
      if (mcpCachePath.includes(':') || mcpCachePath.startsWith('/')) {
        return mcpSourcePath ? `${mcpCachePath}/${mcpSourcePath}` : mcpCachePath;
      }
      // Relative path - needs project
      if (projectPath) {
        return mcpSourcePath
          ? `${projectPath}/${mcpCachePath}/${mcpSourcePath}`.replace(/\\/g, '/')
          : `${projectPath}/${mcpCachePath}`.replace(/\\/g, '/');
      }
      return null;
    }
  }, [developerMode, mcpCachePath, mcpDevPath, mcpSourcePath, projectPath]);

  const handleOpenFolder = async () => {
    if (fullCachePath) {
      try {
        await electron.openFolder(fullCachePath.replace(/\//g, '\\'));
      } catch (error) {
        console.error("Failed to open folder:", error);
      }
    }
  };

  // Load template MCPs
  const loadTemplates = async (devMode = developerMode) => {
    setLoading(true);
    setLoadError(null);
    try {
      console.log(`[McpTab] Loading template MCPs ${devMode ? '(dev mode)' : ''}...`);
      const templates = await electron.loadTemplateMcps(
        devMode,
        mcpCachePath || undefined,
        mcpDevPath || undefined,
        projectPath || undefined,
        mcpSourcePath || undefined
      );
      console.log("[McpTab] Loaded templates:", templates);
      // setLibrary automatically extracts categories
      setLibrary(templates);
    } catch (err: any) {
      console.error("[McpTab] Failed to load templates:", err);
      setLoadError(err.message || "Failed to load MCP library");
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
  }, [developerMode, projectPath, mcpCachePath, mcpSourcePath, mcpDevPath]);

  // Load deployed MCPs when project path changes
  useEffect(() => {
    if (projectPath) {
      loadDeployedMcps();
    } else {
      setDeployedMcps([]);
    }
  }, [projectPath]);

  const loadDeployedMcps = async () => {
    if (!projectPath) return;

    try {
      const deployed = await electron.listMcpServers(projectPath);
      setDeployedMcps(deployed);
    } catch (err) {
      console.error("[McpTab] Failed to load deployed MCPs:", err);
      setDeployedMcps([]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTemplates(developerMode);
    } catch (err) {
      console.error("[McpTab] Failed to refresh MCPs:", err);
      alert(`Failed to refresh MCPs: ${err}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle developer mode
  const handleToggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

  // Get filtered MCPs from store
  const filteredMcps = getFilteredMcps();

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Check if MCP is deployed
  const isMcpDeployed = (mcpId: string): boolean => {
    return deployedMcps.some(deployed => deployed.id === mcpId);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stdio":
        return <Terminal className="h-3 w-3" />;
      case "http":
      case "sse":
        return <Globe className="h-3 w-3" />;
      default:
        return <Server className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading MCP server library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-purple-500" />
            MCP Server Library
          </h2>
          <p className="text-sm text-muted-foreground">
            {library.length > 0 ? (
              <>
                {library.length} server{library.length !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                {fullCachePath && <span className="ml-1">from <code className="text-xs bg-muted px-1 rounded">{fullCachePath}</code></span>}
              </>
            ) : (
              "No MCP servers loaded"
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          )}
          <Button
            onClick={handleToggleDeveloperMode}
            variant={developerMode ? "default" : "outline"}
            size="sm"
            className={developerMode ? "bg-purple-600 hover:bg-purple-700" : ""}
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
            {developerMode && !mcpDevPath && (
              <p className="text-muted-foreground text-sm mt-2">
                Please configure a Dev Path in Settings &gt; MCP to use Developer Mode.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories and Search on same row - Hidden in Dev Mode */}
      {!developerMode && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories - Left */}
          <Card className="border-purple-200 dark:border-purple-800/50">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Filter MCP servers by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All ({library.length})
              </button>
              {categories.map((cat) => {
                const count = library.filter((m) => m.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-purple-600 text-white"
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
        <Card className="border-purple-200 dark:border-purple-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Search MCP Servers</CardTitle>
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
                  placeholder="Search MCP servers..."
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
                Found {filteredMcps.length} server{filteredMcps.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* MCP Grid */}
      {!loadError && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(developerMode ? library : filteredMcps).map((mcp) => {
          const deployed = isMcpDeployed(mcp.id);
          return (
            <Card
              key={mcp.id}
              className={`hover:shadow-md transition-shadow cursor-pointer border-purple-200 dark:border-purple-800/30 ${
                deployed ? 'border-green-500/50 bg-green-500/5' : 'hover:border-purple-400 dark:hover:border-purple-600'
              }`}
              onClick={() => setSelectedMcp(mcp)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="h-4 w-4 text-purple-500" />
                      {mcp.name}
                      {deployed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {mcp.category && (
                        <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
                          {mcp.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTypeIcon(mcp.type)}
                        {mcp.type}
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
                  {mcp.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mcp.tags && mcp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mcp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {mcp.command && (
                  <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 px-2 py-1 rounded">
                    <span className="font-medium">$</span> {mcp.command} {mcp.args?.slice(0, 2).join(" ")}
                    {mcp.args && mcp.args.length > 2 && " ..."}
                  </div>
                )}
                {mcp.url && (
                  <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 px-2 py-1 rounded truncate">
                    {mcp.url}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* MCP Detail Modal */}
      {selectedMcp && (
        <McpDetailModal
          mcp={selectedMcp}
          projectPath={projectPath}
          onClose={() => setSelectedMcp(null)}
          devMode={developerMode}
          onRefresh={loadTemplates}
        />
      )}

      {/* Create MCP Modal */}
      {showCreateModal && (
        <CreateMcpModal
          onClose={() => setShowCreateModal(false)}
          onRefresh={loadTemplates}
        />
      )}

      {!loadError && filteredMcps.length === 0 && (
        <Card className="border-purple-200 dark:border-purple-800/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No MCP Servers Found</h3>
              <p className="text-muted-foreground">
                No MCP servers in this category yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
