import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ProjectSelector } from "@/components/project/ProjectSelector";
import { ProjectAgentsTab } from "@/components/agents/ProjectAgentsTab";
import { ConfigureAgentTab } from "@/components/agents/ConfigureAgentTab";
import { ConfigureTeamTab } from "@/components/agents/ConfigureTeamTab";
import { useProjectStore } from "@/stores/projectStore";

export function MainLayout() {
  const [currentStep, setCurrentStep] = useState<
    "project" | "agents" | "configure-agents" | "configure-teams"
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
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          hasProjectSelected={!!projectPath}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
