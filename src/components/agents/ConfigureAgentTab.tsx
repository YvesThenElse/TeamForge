import { useState, useEffect } from "react";
import { Plus, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/stores/agentStore";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import { AgentDetailModal } from "./AgentDetailModal";
import type { Agent } from "@/types";

export function ConfigureAgentTab() {
  const { library, categories, setLibrary, setCategories } = useAgentStore();
  const { projectPath } = useProjectStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Load template agents on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        console.log("[ConfigureAgentTab] Loading template agents...");
        const templates = await electron.loadTemplateAgents();
        console.log("[ConfigureAgentTab] Loaded templates:", templates);
        setLibrary(templates);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(templates.map((a) => a.category))
        ).sort();
        setCategories(uniqueCategories as any);
      } catch (err) {
        console.error("[ConfigureAgentTab] Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [setLibrary, setCategories]);

  const filteredAgents =
    selectedCategory === "all"
      ? library
      : library.filter((a) => a.category === selectedCategory);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategories = [...categories, newCategoryName.trim()];
    setCategories(newCategories as any);
    setNewCategoryName("");
    setIsAddingCategory(false);
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
        tools: agent.tools || "all",
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
      }
    } catch (err) {
      console.error("Failed to add agent:", err);
      alert(`Failed to add agent: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading agent templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predefined Agents Library</h2>
          <p className="text-muted-foreground mt-1">
            {library.length} agent{library.length !== 1 ? 's' : ''} loaded from templates
          </p>
        </div>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize agents by category
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingCategory && (
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Category name (e.g., development)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory}>Add</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}

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

      {/* Agents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card
            key={agent.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{agent.category}</Badge>
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
        ))}
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
