import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Agent } from "@/types";

interface AgentSelectorPopupProps {
  agents: Agent[];
  selectedAgentIds: string[];
  onSelect: (agentId: string) => void;
  onClose: () => void;
}

export function AgentSelectorPopup({
  agents,
  selectedAgentIds,
  onSelect,
  onClose,
}: AgentSelectorPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(agents.map((a) => a.category));
    return ["All", ...Array.from(cats).sort()];
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [agents, selectedCategory, searchQuery]);

  const handleSelect = (agentId: string) => {
    onSelect(agentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Select Agent</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and filters */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search agents (min 3 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === "All"
                ? agents.length
                : agents.filter((a) => a.category === category).length;

              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-auto p-4">
          {filteredAgents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No agents found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);

                return (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelect(agent.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {agent.name}
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {agent.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {agent.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
