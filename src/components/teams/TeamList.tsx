import { useEffect, useState } from "react";
import { Plus, Users, ArrowRight, Trash2, Edit, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTeamStore } from "@/stores/teamStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAgentStore } from "@/stores/agentStore";
import { listTeams, deleteTeam as deleteTeamAPI, getDeployedTeam } from "@/services/electron";
import { DeployDialog } from "@/components/teams/DeployDialog";
import type { Team } from "@/types/team";
import type { MultiDeploymentResult } from "@/services/electron";

interface TeamListProps {
  onEditTeam: (team: Team) => void;
  onCreateTeam: () => void;
}

export function TeamList({ onEditTeam, onCreateTeam }: TeamListProps) {
  const { teams, setTeams, setCurrentTeam, deployedTeam, setDeployedTeam } = useTeamStore();
  const { projectPath } = useProjectStore();
  const { library } = useAgentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deployDialogTeam, setDeployDialogTeam] = useState<Team | null>(null);

  useEffect(() => {
    loadTeams();
    loadDeployedTeam();
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

  const loadDeployedTeam = async () => {
    if (!projectPath) return;

    try {
      const deployed = await getDeployedTeam(projectPath);
      setDeployedTeam(deployed);
    } catch (error) {
      console.error("Failed to load deployed team:", error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!projectPath) return;

    if (deployedTeam?.teamId === teamId) {
      alert("Cannot delete the currently deployed team. Please deploy another team first.");
      return;
    }

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

  const handleDeployTeam = (team: Team) => {
    // Check both old workflow and new agents structure
    const hasElements =
      (team.agents && team.agents.length > 0) ||
      (team.workflow && team.workflow.length > 0);

    if (!hasElements) {
      alert("This team has no agents. Please edit the team and add agents before deploying.");
      return;
    }

    setDeployDialogTeam(team);
  };

  const handleDeployComplete = async (result: MultiDeploymentResult) => {
    if (result.success) {
      // Reload deployed team status
      const deployed = await getDeployedTeam(projectPath!);
      setDeployedTeam(deployed);
    }
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
          {teams.map((team) => {
            const isDeployed = deployedTeam?.teamId === team.id;

            return (
              <Card key={team.id} className={`hover:shadow-md transition-shadow ${isDeployed ? 'border-green-500 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{team.name}</CardTitle>
                        {isDeployed && (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Deployed
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSelectTeam(team)}
                        title="Edit team"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeam(team.id)}
                        title="Delete team"
                        disabled={isDeployed}
                      >
                        <Trash2 className={`h-4 w-4 ${isDeployed ? 'text-muted-foreground' : 'text-destructive'}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Show new structure if available */}
                    {team.agents && (
                      <div className="text-sm space-y-1">
                        <div className="font-medium">
                          {team.agents.length} Agent{team.agents.length !== 1 ? "s" : ""}
                          {team.skills && team.skills.length > 0 && `, ${team.skills.length} Skill${team.skills.length !== 1 ? "s" : ""}`}
                          {team.hooks && team.hooks.length > 0 && `, ${team.hooks.length} Hook${team.hooks.length !== 1 ? "s" : ""}`}
                        </div>
                      </div>
                    )}

                    {/* Show legacy workflow if no new structure */}
                    {!team.agents && team.workflow && team.workflow.length > 0 && (
                      <div>
                        <div className="text-sm font-medium">
                          {team.workflow.length} Agent{team.workflow.length !== 1 ? "s" : ""} (Legacy)
                        </div>
                        {team.chainingEnabled && (
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
                                    {index < (team.workflow?.length || 0) - 1 && (
                                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={() => handleDeployTeam(team)}
                        disabled={isDeployed || (!team.agents?.length && !team.workflow?.length)}
                        size="sm"
                        className="w-full"
                        variant={isDeployed ? "outline" : "default"}
                      >
                        {isDeployed ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Already Deployed
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Deploy Team
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deploy Dialog */}
      {deployDialogTeam && (
        <DeployDialog
          team={deployDialogTeam}
          onClose={() => setDeployDialogTeam(null)}
          onDeployComplete={handleDeployComplete}
        />
      )}
    </div>
  );
}
