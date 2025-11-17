import { useState } from "react";
import { Settings2, Shield, Sliders, Plug, Code } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { Card, CardContent } from "@/components/ui/Card";
import { ToolsPermissionsTab } from "./ToolsPermissionsTab";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { MCPServersTab } from "./MCPServersTab";
import { AdvancedSettingsTab } from "./AdvancedSettingsTab";

type SubTab = "tools" | "general" | "mcp" | "advanced";

export function ClaudeSettingsTab() {
  const { projectPath } = useProjectStore();
  const [activeTab, setActiveTab] = useState<SubTab>("tools");

  const tabs = [
    {
      id: "tools" as const,
      label: "Tools & Permissions",
      icon: Shield,
      description: "Configure tool access and permissions",
    },
    {
      id: "general" as const,
      label: "General",
      icon: Sliders,
      description: "Core Claude Code settings",
    },
    {
      id: "mcp" as const,
      label: "MCP Servers",
      icon: Plug,
      description: "Model Context Protocol servers",
    },
    {
      id: "advanced" as const,
      label: "Advanced",
      icon: Code,
      description: "Advanced configuration",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "tools":
        return <ToolsPermissionsTab />;
      case "general":
        return <GeneralSettingsTab />;
      case "mcp":
        return <MCPServersTab />;
      case "advanced":
        return <AdvancedSettingsTab />;
      default:
        return null;
    }
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please select a project first to configure Claude Code settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          Claude Code Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure Claude Code settings for this project (.claude/settings.json)
        </p>
      </div>

      {/* Sub-tabs */}
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
