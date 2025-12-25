import { useState } from "react";
import { TeamList } from "@/components/teams/TeamList";
import { TeamEditor } from "@/components/teams/TeamEditor";
import { useTeamStore } from "@/stores/teamStore";
import type { Team } from "@/types/team";

type ViewMode = "list" | "editor";

export function TeamTab() {
  const { createTeam, setCurrentTeam } = useTeamStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const handleCreateTeam = () => {
    // Create a new empty team
    createTeam("New Team", "");
    setViewMode("editor");
  };

  const handleEditTeam = (team: Team) => {
    setCurrentTeam(team);
    setViewMode("editor");
  };

  const handleCloseEditor = () => {
    setCurrentTeam(null);
    setViewMode("list");
  };

  if (viewMode === "list") {
    return <TeamList onEditTeam={handleEditTeam} onCreateTeam={handleCreateTeam} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TeamEditor onClose={handleCloseEditor} />
    </div>
  );
}
