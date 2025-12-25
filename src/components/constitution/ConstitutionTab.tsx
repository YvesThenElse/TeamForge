import { useState, useEffect, useMemo } from "react";
import { FolderPlus, Loader2, RefreshCw, Search, X, Plus, Code, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useConstitutionStore } from "@/stores/constitutionStore";
import { useProjectStore } from "@/stores/projectStore";
import { useSettingsStore } from "@/stores/settingsStore";
import * as electron from "@/services/electron";
import { ConstitutionDetailModal } from "./ConstitutionDetailModal";
import { CreateConstitutionModal } from "./CreateConstitutionModal";
import type { Constitution, ConstitutionCategory } from "@/types/constitution";

export function ConstitutionTab() {
  const {
    library,
    categories,
    setLibrary,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    getFilteredConstitutions
  } = useConstitutionStore();
  const { projectPath } = useProjectStore();
  const { developerMode, setDeveloperMode, constitutionCachePath, constitutionDevPath, constitutionSourcePath } = useSettingsStore();
  const [selectedConstitution, setSelectedConstitution] = useState<Constitution | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Compute the full path for display (dev mode uses devPath, normal mode uses cachePath)
  const fullCachePath = useMemo(() => {
    if (developerMode) {
      // Dev mode: use constitutionDevPath
      if (!constitutionDevPath) return null;
      if (constitutionDevPath.includes(':') || constitutionDevPath.startsWith('/')) {
        return constitutionDevPath;
      }
      // Relative path - needs project
      if (projectPath) {
        return `${projectPath}/${constitutionDevPath}`.replace(/\\/g, '/');
      }
      return null;
    } else {
      // Normal mode: use constitutionCachePath
      if (!constitutionCachePath) return null;
      if (constitutionCachePath.includes(':') || constitutionCachePath.startsWith('/')) {
        return constitutionSourcePath ? `${constitutionCachePath}/${constitutionSourcePath}` : constitutionCachePath;
      }
      // Relative path - needs project
      if (projectPath) {
        return constitutionSourcePath
          ? `${projectPath}/${constitutionCachePath}/${constitutionSourcePath}`.replace(/\\/g, '/')
          : `${projectPath}/${constitutionCachePath}`.replace(/\\/g, '/');
      }
      return null;
    }
  }, [developerMode, constitutionCachePath, constitutionDevPath, constitutionSourcePath, projectPath]);

  const handleOpenFolder = async () => {
    if (fullCachePath) {
      try {
        await electron.openFolder(fullCachePath.replace(/\//g, '\\'));
      } catch (error) {
        console.error("Failed to open folder:", error);
      }
    }
  };

  const loadConstitutionLibrary = async (devMode = developerMode) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log(`[ConstitutionTab] Loading constitution library ${devMode ? '(dev mode)' : ''}... cachePath:`, constitutionCachePath, 'sourcePath:', constitutionSourcePath, 'projectPath:', projectPath);
      const libraryData = await electron.getConstitutionLibrary(devMode, constitutionCachePath, constitutionDevPath, projectPath || undefined, constitutionSourcePath);
      console.log("[ConstitutionTab] Loaded library:", libraryData);
      setLibrary(libraryData.constitutions);
      setCategories(libraryData.categories as ConstitutionCategory[]);
    } catch (err: any) {
      console.error("[ConstitutionTab] Failed to load constitution library:", err);
      setLoadError(err.message || "Failed to load constitution library");
      setLibrary([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when settings change
  useEffect(() => {
    if (projectPath) {
      loadConstitutionLibrary();
    }
  }, [developerMode, constitutionCachePath, constitutionSourcePath, projectPath]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await electron.reloadConstitutions(developerMode, constitutionCachePath, constitutionDevPath, projectPath || undefined, constitutionSourcePath);
      await loadConstitutionLibrary(developerMode);
    } catch (err) {
      console.error("[ConstitutionTab] Failed to refresh constitutions:", err);
      alert(`Failed to refresh constitutions: ${err}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle developer mode
  const handleToggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredConstitutions = getFilteredConstitutions();

  if (isLoading && library.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading constitution library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Constitution Library</h2>
          <p className="text-sm text-muted-foreground">
            {library.length > 0 ? (
              <>
                {library.length} constitution{library.length !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                {fullCachePath && <span className="ml-1">from <code className="text-xs bg-muted px-1 rounded">{fullCachePath}</code></span>}
              </>
            ) : (
              "No constitutions loaded"
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
            {developerMode && !constitutionDevPath && (
              <p className="text-muted-foreground text-sm mt-2">
                Please configure a Dev Path in Settings &gt; Constitutions to use Developer Mode.
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
                Filter constitutions by category
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
                  const count = library.filter((c) => c.category === cat).length;
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
              <CardTitle className="text-lg">Search Constitutions</CardTitle>
              <CardDescription>
                Search by name, description, tags, or content (minimum 3 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search constitutions..."
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
                  Found {filteredConstitutions.length} constitution{filteredConstitutions.length !== 1 ? 's' : ''}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Constitutions Grid */}
      {!loadError && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(developerMode ? library : filteredConstitutions).map((constitution) => (
            <Card
              key={constitution.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedConstitution(constitution)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {constitution.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{constitution.category}</Badge>
                      {constitution.targetSystem && (
                        <Badge variant="secondary">
                          {constitution.targetSystem}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3 mt-2">
                  {constitution.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {constitution.tags && constitution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {constitution.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Constitution Detail Modal */}
      {selectedConstitution && (
        <ConstitutionDetailModal
          constitution={selectedConstitution}
          projectPath={projectPath}
          onClose={() => setSelectedConstitution(null)}
          devMode={developerMode}
          onRefresh={loadConstitutionLibrary}
        />
      )}

      {/* Create Constitution Modal */}
      {showCreateModal && (
        <CreateConstitutionModal
          onClose={() => setShowCreateModal(false)}
          onRefresh={loadConstitutionLibrary}
        />
      )}

      {!loadError && filteredConstitutions.length === 0 && !developerMode && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Constitutions Found</h3>
              <p className="text-muted-foreground">
                No constitutions in this category yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
