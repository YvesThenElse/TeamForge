import { memo } from "react";
import { Handle, Position } from "reactflow";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Agent } from "@/types";

interface AgentNodeData {
  agent?: Agent;
  order: number;
  onDelete: () => void;
}

export const AgentNode = memo(({ data }: { data: AgentNodeData }) => {
  const { agent, order, onDelete } = data;

  if (!agent) {
    return (
      <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-sm text-gray-500">Unknown Agent</div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="px-4 py-3 border-2 border-primary rounded-lg bg-white shadow-md min-w-[200px] max-w-[250px]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {order}
              </div>
              <div className="font-semibold text-sm">{agent.name}</div>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {agent.description}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {agent.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-muted rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
