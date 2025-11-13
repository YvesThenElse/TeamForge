import { useState } from "react";
import { Plus, Users, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AgentTeam } from "@/types/agentFile";

export function ConfigureTeamTab() {
  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const handleCreateTeam = () => {
    setIsCreatingTeam(true);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  if (isCreatingTeam) {
    return <TeamEditor onSave={() => setIsCreatingTeam(false)} onCancel={() => setIsCreatingTeam(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Teams</h2>
          <p className="text-muted-foreground mt-1">
            Create teams of agents with workflow chaining
          </p>
        </div>
        <Button onClick={handleCreateTeam}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Created</h3>
              <p className="text-muted-foreground mb-4">
                Teams allow you to group agents together and define workflows with
                chaining. Create your first team to get started.
              </p>
              <Button onClick={handleCreateTeam}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Team
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Agents:</div>
                  <div className="flex flex-wrap gap-2">
                    {team.agents.map((agentId) => (
                      <span
                        key={agentId}
                        className="px-2 py-1 bg-muted rounded text-sm"
                      >
                        {agentId}
                      </span>
                    ))}
                  </div>
                  {team.chain && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Workflow Chain:</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {team.chain.agents.map((agentId, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
                              {agentId}
                            </span>
                            {index < team.chain!.agents.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface TeamEditorProps {
  onSave: (team: AgentTeam) => void;
  onCancel: () => void;
}

function TeamEditor({ onSave, onCancel }: TeamEditorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const selectedAgents: string[] = []; // TODO: Implement agent selection
  const [enableChain, setEnableChain] = useState(false);
  const chainAgents: string[] = []; // TODO: Implement chain configuration

  const handleSave = () => {
    if (!name.trim()) {
      alert("Team name is required");
      return;
    }

    const team: AgentTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      agents: selectedAgents,
      chain: enableChain && chainAgents.length > 0
        ? { agents: chainAgents }
        : undefined,
    };

    onSave(team);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Agent Team</h2>
          <p className="text-muted-foreground mt-1">
            Group agents together with optional workflow chaining
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Team</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Team Name *</label>
            <Input
              type="text"
              placeholder="Full Stack Development Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              type="text"
              placeholder="Team for full-stack web development tasks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Chaining</CardTitle>
          <CardDescription>
            Define a sequence of agents to be invoked in order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={enableChain}
              onChange={(e) => setEnableChain(e.target.checked)}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium">
              Enable workflow chaining
            </label>
          </div>

          {enableChain && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                Example: "First use the code-analyzer agent to find issues, then use
                the optimizer agent to fix them"
              </p>
              <div className="text-sm text-muted-foreground">
                Add agents in the order they should be invoked
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
