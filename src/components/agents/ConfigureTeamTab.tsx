import { useState } from "react";
import { TeamList } from "@/components/teams/TeamList";
import { TeamWorkflowEditor } from "@/components/teams/TeamWorkflowEditor";
import { useTeamStore } from "@/stores/teamStore";
import type { Team } from "@/types/team";

type ViewMode = "list" | "editor";

export function ConfigureTeamTab() {
  const { createTeam, setCurrentTeam, currentTeam } = useTeamStore();
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

  if (viewMode === "list") {
    return <TeamList onEditTeam={handleEditTeam} onCreateTeam={handleCreateTeam} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TeamWorkflowEditor
        team={currentTeam}
        isNewTeam={isNewTeam}
        onClose={handleCloseEditor}
      />
    </div>
  );
}
