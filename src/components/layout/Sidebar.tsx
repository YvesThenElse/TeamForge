import { FolderOpen, Settings, Users, Sparkles, Sliders, HelpCircle, Shield, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentStep: "project" | "agents" | "configure-agents" | "configure-teams" | "skills" | "security" | "settings" | "help";
  onStepChange: (step: "project" | "agents" | "configure-agents" | "configure-teams" | "skills" | "security" | "settings" | "help") => void;
  hasProjectSelected?: boolean;
}

export function Sidebar({ currentStep, onStepChange, hasProjectSelected = false }: SidebarProps) {
  const steps = [
    {
      id: "project" as const,
      label: "Select Project",
      icon: FolderOpen,
      description: "Choose your project",
    },
    {
      id: "agents" as const,
      label: "Project Configuration",
      icon: FileCheck,
      description: "Current project setup",
    },
    {
      id: "configure-agents" as const,
      label: "Configure Agent",
      icon: Sliders,
      description: "Agent library",
    },
    {
      id: "configure-teams" as const,
      label: "Configure Team",
      icon: Users,
      description: "Create teams",
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: Sparkles,
      description: "Manage skills",
    },
    {
      id: "security" as const,
      label: "Security",
      icon: Shield,
      description: "Agent permissions",
    },
    {
      id: "settings" as const,
      label: "Configuration",
      icon: Settings,
      description: "App settings",
    },
    {
      id: "help" as const,
      label: "Help",
      icon: HelpCircle,
      description: "Guide & info",
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card">
      <nav className="p-4 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDisabled = step.id !== "project" && !hasProjectSelected;

          return (
            <button
              key={step.id}
              onClick={() => !isDisabled && onStepChange(step.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-colors",
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{step.label}</div>
                <div
                  className={cn(
                    "text-xs mt-0.5",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {step.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
