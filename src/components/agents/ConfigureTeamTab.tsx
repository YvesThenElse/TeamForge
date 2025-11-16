import { useState } from "react";
import { TeamList } from "@/components/teams/TeamList";
import { TeamWorkflowEditor } from "@/components/teams/TeamWorkflowEditor";
import { useTeamStore } from "@/stores/teamStore";
import type { Team } from "@/types/team";

type ViewMode = "list" | "editor";

export function ConfigureTeamTab() {
  const { createTeam, setCurrentTeam } = useTeamStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isNewTeam, setIsNewTeam] = useState(false);

  const handleCreateTeam = () => {
    // Create a new empty team
    createTeam("New Team", "");
    setIsNewTeam(true);
    setViewMode("editor");
  };

  const handleEditTeam = (team: Team) => {
    setCurrentTeam(team);
    setIsNewTeam(false);
    setViewMode("editor");
  };

  const handleCloseEditor = () => {
    setCurrentTeam(null);
    setIsNewTeam(false);
    setViewMode("list");
  };

  return (
    <div className="h-full">
      {viewMode === "list" ? (
        <TeamList onEditTeam={handleEditTeam} onCreateTeam={handleCreateTeam} />
      ) : (
        <TeamWorkflowEditor
          team={useTeamStore.getState().currentTeam}
          isNewTeam={isNewTeam}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}
