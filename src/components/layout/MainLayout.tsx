import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ProjectSelector } from "@/components/project/ProjectSelector";
import { ProjectAgentsTab } from "@/components/agents/ProjectAgentsTab";
import { ConfigureAgentTab } from "@/components/agents/ConfigureAgentTab";
import { ConfigureTeamTab } from "@/components/agents/ConfigureTeamTab";
import { SkillsTab } from "@/components/skills/SkillsTab";
import { HooksTab } from "@/components/hooks/HooksTab";
import { SecurityTab } from "@/components/security/SecurityTab";
import { ClaudeSettingsTab } from "@/components/claude-settings/ClaudeSettingsTab";
import { SettingsTab } from "@/components/settings/SettingsTab";
import { HelpTab } from "@/components/help/HelpTab";
import { useProjectStore } from "@/stores/projectStore";

export function MainLayout() {
  const [currentStep, setCurrentStep] = useState<
    "project" | "agents" | "configure-agents" | "configure-teams" | "skills" | "hooks" | "agent-tools" | "claude-settings" | "settings" | "help"
  >("project");

  const { projectPath } = useProjectStore();

  const renderContent = () => {
    switch (currentStep) {
      case "project":
        return <ProjectSelector />;
      case "agents":
        return <ProjectAgentsTab />;
      case "configure-agents":
        return <ConfigureAgentTab />;
      case "configure-teams":
        return <ConfigureTeamTab />;
      case "skills":
        return <SkillsTab />;
      case "hooks":
        return <HooksTab />;
      case "agent-tools":
        return <SecurityTab />;
      case "claude-settings":
        return <ClaudeSettingsTab />;
      case "settings":
        return <SettingsTab />;
      case "help":
        return <HelpTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          hasProjectSelected={!!projectPath}
        />
        <main className="flex-1 overflow-hidden flex flex-col relative bg-background">
          <div className="container mx-auto p-6 flex-1 flex flex-col overflow-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
