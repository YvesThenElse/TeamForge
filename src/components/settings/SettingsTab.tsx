import { useState } from "react";
import { Settings, Sliders, Sparkles, Zap, Wrench } from "lucide-react";
import { AgentsSettingsTab } from "./AgentsSettingsTab";
import { SkillsSettingsTab } from "./SkillsSettingsTab";
import { HooksSettingsTab } from "./HooksSettingsTab";
import { PreferencesTab } from "./PreferencesTab";

type SubTab = "agents" | "skills" | "hooks" | "preferences";

export function SettingsTab() {
  const [activeTab, setActiveTab] = useState<SubTab>("agents");

  const tabs = [
    {
      id: "agents" as const,
      label: "Agents",
      icon: Sliders,
      description: "Agent repository and dev settings",
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: Sparkles,
      description: "Skills repository and dev settings",
    },
    {
      id: "hooks" as const,
      label: "Hooks",
      icon: Zap,
      description: "Hooks repository and dev settings",
    },
    {
      id: "preferences" as const,
      label: "Preferences",
      icon: Wrench,
      description: "Application preferences",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "agents":
        return <AgentsSettingsTab />;
      case "skills":
        return <SkillsSettingsTab />;
      case "hooks":
        return <HooksSettingsTab />;
      case "preferences":
        return <PreferencesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure TeamForge sources, repositories, and preferences
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}
