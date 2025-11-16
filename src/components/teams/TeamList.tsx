import { useEffect, useState } from "react";
import { Plus, Users, ArrowRight, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTeamStore } from "@/stores/teamStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAgentStore } from "@/stores/agentStore";
import { listTeams, deleteTeam as deleteTeamAPI } from "@/services/electron";
import type { Team } from "@/types/team";

interface TeamListProps {
  onEditTeam: (team: Team) => void;
  onCreateTeam: () => void;
}

export function TeamList({ onEditTeam, onCreateTeam }: TeamListProps) {
  const { teams, setTeams, setCurrentTeam } = useTeamStore();
  const { projectPath } = useProjectStore();
  const { library } = useAgentStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, [projectPath]);

  const loadTeams = async () => {
    if (!projectPath) return;

    setIsLoading(true);
    try {
      const loadedTeams = await listTeams(projectPath);
      setTeams(loadedTeams);
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!projectPath) return;
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteTeamAPI(projectPath, teamId);
      setTeams(teams.filter((t) => t.id !== teamId));
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team");
    }
  };

  const handleSelectTeam = (team: Team) => {
    setCurrentTeam(team);
    onEditTeam(team);
  };

  const getAgentName = (agentId: string) => {
    const agent = library.find((a) => a.id === agentId);
    return agent?.name || agentId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading teams...</div>
      </div>
    );
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
        <Button onClick={onCreateTeam}>
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
              <Button onClick={onCreateTeam}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Team
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSelectTeam(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {team.workflow.length} Agent{team.workflow.length !== 1 ? "s" : ""}
                  </div>
                  {team.chainingEnabled && team.workflow.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Workflow Chain:
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {team.workflow
                          .sort((a, b) => a.order - b.order)
                          .map((node, index) => (
                            <div key={node.agentId} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                                {getAgentName(node.agentId)}
                              </span>
                              {index < team.workflow.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
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
