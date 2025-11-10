import { FolderOpen, Bot, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentStep: "project" | "agents" | "config" | "export";
  onStepChange: (step: "project" | "agents" | "config" | "export") => void;
}

export function Sidebar({ currentStep, onStepChange }: SidebarProps) {
  const steps = [
    {
      id: "project" as const,
      label: "Select Project",
      icon: FolderOpen,
      description: "Choose your project",
    },
    {
      id: "agents" as const,
      label: "Choose Agents",
      icon: Bot,
      description: "Pick your team",
    },
    {
      id: "config" as const,
      label: "Configure",
      icon: Settings,
      description: "Customize settings",
    },
    {
      id: "export" as const,
      label: "Generate",
      icon: FileText,
      description: "Export configuration",
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card">
      <nav className="p-4 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-colors",
                isActive
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
