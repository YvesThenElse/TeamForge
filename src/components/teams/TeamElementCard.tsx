import { useState, useRef, useEffect } from "react";
import { Shield, AlertTriangle, Users, Zap, Code, Trash2, Settings, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ElementSecurity } from "@/types/team";
import type { Agent } from "@/types";
import type { Skill } from "@/types/skill";
import type { Hook } from "@/types/hook";

interface TeamElementCardProps {
  type: "agent" | "skill" | "hook" | "security";
  id: string;
  library?: Agent[]; // For agents
  skillLibrary?: Skill[]; // For skills
  hookLibrary?: Hook[]; // For hooks
  security?: ElementSecurity;
  configured?: boolean; // For global security
  onRemove: () => void;
  onConfigureSecurity: () => void;
}

const CARD_STYLES = {
  agent: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30",
    border: "border-blue-200 dark:border-blue-700",
    icon: Users,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    size: "", // Standard card
    label: "Agent",
  },
  skill: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/30",
    border: "border-emerald-200 dark:border-emerald-700",
    icon: Zap,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    size: "", // Standard card
    label: "Skill",
  },
  hook: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/30",
    border: "border-amber-200 dark:border-amber-700",
    icon: Code,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    size: "", // Standard card
    label: "Hook",
  },
  security: {
    bg: "bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-900/30",
    border: "border-rose-200 dark:border-rose-700",
    icon: Shield,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    size: "col-span-2", // Wide card
    label: "Security",
  },
};

export function TeamElementCard({
  type,
  id,
  library,
  skillLibrary,
  hookLibrary,
  security,
  configured,
  onRemove,
  onConfigureSecurity,
}: TeamElementCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const style = CARD_STYLES[type];
  const Icon = style.icon;

  // Get element info
  let name = id;
  let description = "";
  let category = "";
  let tags: string[] = [];

  if (type === "agent" && library) {
    const agent = library.find((a) => a.id === id);
    name = agent?.name || id;
    description = agent?.description || "";
    category = agent?.category || "";
    tags = agent?.tags || [];
  } else if (type === "skill" && skillLibrary) {
    const skill = skillLibrary.find((s) => s.id === id);
    name = skill?.name || id;
    description = skill?.description || "";
    category = skill?.category || "";
  } else if (type === "hook" && hookLibrary) {
    const hook = hookLibrary.find((h) => h.id === id);
    name = hook?.name || id;
    description = hook?.description || "";
    category = hook?.category || "";
  } else if (type === "security") {
    name = "Global Security";
    description = "Configure global security settings including permissions (allow/deny/ask rules) and environment variables.";
  }

  // Check for warnings
  const hasWarning =
    type === "security"
      ? configured === false
      : security
      ? !security.configured
      : false;

  // Left-click: show details popup
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetails(true);
  };

  // Right-click: show context menu
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  const handleConfigureSecurity = () => {
    setContextMenu(null);
    onConfigureSecurity();
  };

  const handleRemove = () => {
    setContextMenu(null);
    onRemove();
  };

  return (
    <>
      <Card
        ref={cardRef}
        className={`
          relative p-3 cursor-pointer overflow-hidden
          ${style.bg} ${style.border} border
          ${style.size}
          transition-all duration-200
          hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
          rounded-xl
        `}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        {/* Type badge + status */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.iconColor} opacity-70`}>
            {style.label}
          </span>
          {hasWarning && (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          )}
          {!hasWarning && (security?.configured || configured) && (
            <Shield className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          )}
        </div>

        {/* Icon container */}
        <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center mb-2 flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
        </div>

        {/* Element name */}
        <div className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate" title={name}>
          {name}
        </div>
      </Card>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleConfigureSecurity}
          >
            <Settings className="h-4 w-4 text-blue-600" />
            <span>Configure Security</span>
          </button>
          {type !== "security" && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}

      {/* Details Popup */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDetails(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`${style.bg} p-4 border-b ${style.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.iconColor} opacity-70`}>
                      {style.label}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {description && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
                </div>
              )}

              {category && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</h4>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span key={tag} className={`inline-block px-2 py-0.5 text-xs rounded-full ${style.iconBg} ${style.iconColor}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security status */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Security</h4>
                {hasWarning ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Not configured</span>
                  </div>
                ) : (security?.configured || configured) ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Configured</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No security rules</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => { setShowDetails(false); onConfigureSecurity(); }}>
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
