import { X, Shield, AlertTriangle, Settings, Users, Zap, Code } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ElementSecurity } from "@/types/team";
import type { Agent } from "@/types";

interface TeamElementCardProps {
  type: "agent" | "skill" | "hook" | "security";
  id: string;
  library?: Agent[]; // For agents only
  security?: ElementSecurity;
  configured?: boolean; // For global security
  onRemove: () => void;
  onConfigureSecurity: () => void;
}

const CARD_STYLES = {
  agent: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: Users,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  skill: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    icon: Zap,
    iconColor: "text-green-600 dark:text-green-400",
  },
  hook: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    icon: Code,
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  security: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: Shield,
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function TeamElementCard({
  type,
  id,
  library,
  security,
  configured,
  onRemove,
  onConfigureSecurity,
}: TeamElementCardProps) {
  const style = CARD_STYLES[type];
  const Icon = style.icon;

  // Get element name
  let name = id;
  if (type === "agent" && library) {
    const agent = library.find((a) => a.id === id);
    name = agent?.name || id;
  } else if (type === "security") {
    name = "Global Security";
  }

  // Check for warnings
  const hasWarning =
    type === "security"
      ? configured === false
      : security
      ? !security.configured
      : false;

  return (
    <Card
      className={`
        relative w-48 h-24 p-3
        ${style.bg} ${style.border} border-2
        transition-all hover:shadow-md
        group
      `}
    >
      {/* Header with icon and remove button */}
      <div className="flex items-start justify-between mb-2">
        <Icon className={`h-5 w-5 ${style.iconColor}`} />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Element name */}
      <div className="text-sm font-semibold truncate mb-1">{name}</div>

      {/* Security/Config indicators */}
      <div className="flex items-center gap-1">
        {hasWarning && (
          <div
            className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500 cursor-pointer"
            onClick={onConfigureSecurity}
            title="Security configuration needed"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Config needed</span>
          </div>
        )}

        {!hasWarning && (security?.configured || configured) && (
          <div
            className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
            onClick={onConfigureSecurity}
            title="Edit security configuration"
          >
            <Shield className="h-3 w-3" />
            <span>Configured</span>
          </div>
        )}

        {type !== "security" && !security && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onConfigureSecurity}
          >
            <Settings className="h-3 w-3 mr-1" />
            Security
          </Button>
        )}
      </div>
    </Card>
  );
}
