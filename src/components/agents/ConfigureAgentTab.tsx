import { useState, useEffect } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/stores/agentStore";

export function ConfigureAgentTab() {
  const { library, categories, setCategories } = useAgentStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Get unique categories from library
  useEffect(() => {
    if (library.length > 0) {
      const uniqueCategories = Array.from(
        new Set(library.map((a) => a.category))
      ).sort();
      setCategories(uniqueCategories as any);
    }
  }, [library, setCategories]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predefined Agents Library</h2>
          <p className="text-muted-foreground mt-1">
            Manage your collection of reusable sub-agents
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
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
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
