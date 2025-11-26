import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Team } from "@/types/team";

interface ConfigPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function ConfigPreviewDialog({ isOpen, onClose, team }: ConfigPreviewDialogProps) {
  if (!isOpen || !team) return null;

  const configJSON = JSON.stringify(team, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Team Configuration Preview</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Team Details</h3>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {team.name}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {team.description}
                </div>
                <div>
                  <span className="font-medium">Chaining Enabled:</span>{" "}
                  {team.chainingEnabled ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Agents:</span> {team.workflow?.length || 0}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Workflow Order</h3>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                {(team.workflow || [])
                  .sort((a, b) => a.order - b.order)
                  .map((node, index) => (
                    <div key={node.agentId}>
                      {index + 1}. {node.agentId}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">JSON Configuration</h3>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                {configJSON}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
