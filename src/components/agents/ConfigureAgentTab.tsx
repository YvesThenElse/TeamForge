import { useState, useEffect } from "react";
import { FolderPlus, Loader2, RefreshCw, Search, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/stores/agentStore";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import { AgentDetailModal } from "./AgentDetailModal";
import type { Agent } from "@/types";
import type { AgentFile } from "@/types/agentFile";

export function ConfigureAgentTab() {
  const { library, categories, setLibrary, setCategories, isLoading, setIsLoading } = useAgentStore();
  const { projectPath } = useProjectStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentSource, setAgentSource] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deployedAgents, setDeployedAgents] = useState<AgentFile[]>([]);

  // Load agent library
  const loadAgentLibrary = async () => {
    setIsLoading(true);
    try {
      console.log("[ConfigureAgentTab] Loading agent library...");
      const libraryData = await electron.getAgentLibrary();
      console.log("[ConfigureAgentTab] Loaded library:", libraryData);
      setLibrary(libraryData.agents);
      setAgentSource(libraryData.source || "unknown");

      // Extract unique categories from agents
      const uniqueCategories = Array.from(
        new Set(libraryData.agents.map((a) => a.category).filter(Boolean))
      ).sort();
      console.log("[ConfigureAgentTab] Categories:", uniqueCategories);
      setCategories(uniqueCategories as any);
    } catch (err) {
      console.error("[ConfigureAgentTab] Failed to load agent library:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadAgentLibrary();
  }, []);

  // Load deployed agents when project path changes
  useEffect(() => {
    if (projectPath) {
      loadDeployedAgents();
    } else {
      setDeployedAgents([]);
    }
  }, [projectPath]);

  const loadDeployedAgents = async () => {
    if (!projectPath) return;

    try {
      const deployed = await electron.listAgentFiles(projectPath);
      setDeployedAgents(deployed);
    } catch (err) {
      console.error("[ConfigureAgentTab] Failed to load deployed agents:", err);
      setDeployedAgents([]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await electron.reloadAgents();
      await loadAgentLibrary();
    } catch (err) {
      console.error("[ConfigureAgentTab] Failed to refresh agents:", err);
      alert(`Failed to refresh agents: ${err}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter by category first
  let filteredAgents = selectedCategory === "all"
    ? library
    : library.filter((a) => a.category === selectedCategory);

  // Then filter by search query (only if 3+ characters)
  if (searchQuery.trim().length >= 3) {
    const query = searchQuery.toLowerCase();
    filteredAgents = filteredAgents.filter((agent) =>
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      agent.category.toLowerCase().includes(query)
    );
  }

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleAddAgent = async (agent: Agent) => {
    if (!projectPath) {
      alert("Please select a project first");
      return;
    }

    try {
      // Create frontmatter for the agent file
      const frontmatter = {
        name: agent.name,
        description: agent.description,
        tools: Array.isArray(agent.tools) ? agent.tools.join(", ") : (agent.tools || "all"),
        model: agent.model || "sonnet",
      };

      // Save agent file to project's .claude/agents/ directory
      const result = await electron.saveAgentFileContent(
        projectPath,
        agent.id,
        frontmatter,
        agent.template || ""
      );

      if (result.success) {
        alert(`Agent "${agent.name}" added successfully to ${result.filePath}`);
        setSelectedAgent(null);
        // Reload deployed agents
        loadDeployedAgents();
      }
    } catch (err) {
      console.error("Failed to add agent:", err);
      alert(`Failed to add agent: ${err}`);
    }
  };

  // Check if agent is deployed
  const isAgentDeployed = (agentId: string): boolean => {
    return deployedAgents.some(deployed => deployed.id === agentId);
  };

  if (isLoading && library.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading agent library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Library</h2>
          <p className="text-muted-foreground mt-1">
            {library.length} agent{library.length !== 1 ? 's' : ''} loaded
            {agentSource && (
              <span className="ml-1">
                from <span className="font-medium">{agentSource === 'git' ? 'Git repository' : 'local templates'}</span>
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Categories and Search on same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories - Left */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Filter agents by category
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
                const count = library.filter((a) => a.category === cat).length;
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
            <CardTitle className="text-lg">Search Agents</CardTitle>
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
                  placeholder="Search agents..."
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
                Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => {
          const deployed = isAgentDeployed(agent.id);
          return (
            <Card
              key={agent.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                deployed ? 'border-green-500/50 bg-green-500/5' : ''
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {agent.name}
                      {deployed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{agent.category}</Badge>
                      {deployed && (
                        <Badge variant="default" className="bg-green-500">
                          Deployed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3 mt-2">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agent.tags && agent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.tags.map((tag) => (
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
          );
        })}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          projectPath={projectPath}
          onClose={() => setSelectedAgent(null)}
          onAddAgent={handleAddAgent}
        />
      )}

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
              <p className="text-muted-foreground">
                No agents in this category yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
