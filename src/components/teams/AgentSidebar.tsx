import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAgentStore } from "@/stores/agentStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Agent } from "@/types";

interface AgentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddAgent: (agentId: string) => void;
}

export function AgentSidebar({ isOpen, onToggle, onAddAgent }: AgentSidebarProps) {
  const { library } = useAgentStore();
  const { currentTeam } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return library;

    const query = searchQuery.toLowerCase();
    return library.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [library, searchQuery]);

  const isAgentInWorkflow = (agentId: string) => {
    return currentTeam?.workflow.some((node) => node.agentId === agentId) || false;
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
  onAdd: () => void;
}

function AgentCard({ agent, isAdded, onAdd }: AgentCardProps) {
  return (
    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{agent.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {agent.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
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
