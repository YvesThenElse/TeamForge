import { useEffect, useRef } from "react";
import { Users, Zap, Code, Shield, Shuffle, Server } from "lucide-react";

interface TeamContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddAgent: () => void;
  onAddSkill: () => void;
  onAddHook: () => void;
  onAddMcp?: () => void;
  onAddSecurity: () => void;
  onReorganize?: () => void;
}

export function TeamContextMenu({
  x,
  y,
  onClose,
  onAddAgent,
  onAddSkill,
  onAddHook,
  onAddMcp,
  onAddSecurity,
  onReorganize,
}: TeamContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuItems: Array<{
    icon: any;
    label: string;
    onClick: () => void;
    color: string;
  }> = [
    {
      icon: Users,
      label: "Add Agent",
      onClick: onAddAgent,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Zap,
      label: "Add Skill",
      onClick: onAddSkill,
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: Code,
      label: "Add Hook",
      onClick: onAddHook,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  if (onAddMcp) {
    menuItems.push({
      icon: Server,
      label: "Add MCP Server",
      onClick: onAddMcp,
      color: "text-purple-600 dark:text-purple-400",
    });
  }

  menuItems.push({
    icon: Shield,
    label: "Configure Global Security",
    onClick: onAddSecurity,
    color: "text-red-600 dark:text-red-400",
  });

  if (onReorganize) {
    menuItems.push({
      icon: Shuffle,
      label: "Reorganize Elements",
      onClick: onReorganize,
      color: "text-purple-600 dark:text-purple-400",
    });
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-background border rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <Icon className={`h-4 w-4 ${item.color}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
