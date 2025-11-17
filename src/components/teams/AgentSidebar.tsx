import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/stores/agentStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Agent } from "@/types";
import type { AgentFile } from "@/types/agentFile";

interface AgentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddAgent: (agentId: string) => void;
  deployedAgents: AgentFile[];
}

export function AgentSidebar({ isOpen, onToggle, onAddAgent, deployedAgents }: AgentSidebarProps) {
  const { library } = useAgentStore();
  const currentTeam = useTeamStore((state) => state.currentTeam);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Extract unique categories from library
  const categories = useMemo(() => {
    const cats = new Set(library.map((agent) => agent.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [library]);

  const filteredAgents = useMemo(() => {
    let agents = library;

    // Filter by category
    if (selectedCategory !== "all") {
      agents = agents.filter((agent) => agent.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      agents = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return agents;
  }, [library, searchQuery, selectedCategory]);

  const isAgentInWorkflow = (agentId: string) => {
    return currentTeam?.workflow.some((node) => node.agentId === agentId) || false;
  };

  const isAgentDeployed = (agentId: string) => {
    return deployedAgents.some((deployed) => deployed.id === agentId);
  };

  return (
    <div
      className={`flex flex-col border-l bg-background transition-all duration-300 ${
        isOpen ? "w-80" : "w-12"
      }`}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-between p-2 border-b">
        {isOpen && <span className="text-sm font-semibold px-2">Available Agents</span>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar content */}
      {isOpen && (
        <>
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Category Filter - Collapsable */}
          <div className="border-b">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Categories
              </div>
              {isCategoryOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isCategoryOpen && (
              <div className="p-3 pt-0">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
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
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
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
              </div>
            )}
          </div>

          {/* Agent list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredAgents.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No agents found
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isAdded={isAgentInWorkflow(agent.id)}
                  isDeployed={isAgentDeployed(agent.id)}
                  onAdd={() => onAddAgent(agent.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  isAdded: boolean;
  isDeployed: boolean;
  onAdd: () => void;
}

function AgentCard({ agent, isAdded, isDeployed, onAdd }: AgentCardProps) {
  return (
    <div className={`p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
      isDeployed ? 'border-green-500/50 bg-green-500/5' : ''
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate flex items-center gap-1">
            {agent.name}
            {isDeployed && (
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
            )}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {agent.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {isDeployed && (
              <Badge variant="default" className="bg-green-500 text-white text-xs h-5">
                Deployed
              </Badge>
            )}
            {agent.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-muted rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onAdd}
          disabled={isAdded}
          className="shrink-0"
        >
          <Plus className={`h-4 w-4 ${isAdded ? "text-muted-foreground" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
