import { FolderOpen, Users, Sparkles, Sliders, HelpCircle, Shield, Zap, Settings2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentStep: "project" | "configure-agents" | "configure-teams" | "skills" | "hooks" | "agent-tools" | "claude-settings" | "settings" | "help";
  onStepChange: (step: "project" | "configure-agents" | "configure-teams" | "skills" | "hooks" | "agent-tools" | "claude-settings" | "settings" | "help") => void;
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
      id: "configure-teams" as const,
      label: "Teams",
      icon: Users,
      description: "Create teams",
      isPrimary: true,
    },
    {
      id: "configure-agents" as const,
      label: "Agents",
      icon: Sliders,
      description: "Agent library",
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: Sparkles,
      description: "Manage skills",
    },
    {
      id: "hooks" as const,
      label: "Hooks",
      icon: Zap,
      description: "Lifecycle hooks",
    },
    {
      id: "agent-tools" as const,
      label: "Agent Tools",
      icon: Shield,
      description: "Agent permissions",
    },
    {
      id: "claude-settings" as const,
      label: "Claude Settings",
      icon: Settings2,
      description: "Claude Code config",
    },
    {
      id: "settings" as const,
      label: "App Settings",
      icon: Wrench,
      description: "TeamForge config",
    },
    {
      id: "help" as const,
      label: "Help",
      icon: HelpCircle,
      description: "Guide & info",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
      <nav className="p-4 space-y-1.5">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDisabled = step.id !== "project" && !hasProjectSelected;
          const isPrimary = 'isPrimary' in step && step.isPrimary;

          return (
            <button
              key={step.id}
              onClick={() => !isDisabled && onStepChange(step.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-start space-x-3 rounded-xl p-3 text-left transition-all duration-200 relative",
                isDisabled
                  ? "opacity-40 cursor-not-allowed text-slate-600"
                  : isActive
                  ? "bg-slate-700 text-white shadow-lg border border-slate-600"
                  : isPrimary
                  ? "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-accent/20 bg-accent/5"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {/* Orange accent bar for active item */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-accent rounded-r-full shadow-sm" />
              )}

              <Icon className={cn(
                "h-6 w-6 mt-0.5 flex-shrink-0 transition-transform duration-200",
                isActive && "scale-110",
                isPrimary && !isActive && !isDisabled && "text-accent/70"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium",
                  isPrimary && !isActive && !isDisabled && "text-slate-200"
                )}>{step.label}</div>
                <div
                  className={cn(
                    "text-xs mt-0.5",
                    isActive
                      ? "text-slate-300"
                      : isPrimary
                      ? "text-slate-400"
                      : "text-slate-500"
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
