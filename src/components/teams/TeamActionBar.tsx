import { Save, Rocket, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TeamActionBarProps {
  teamName: string;
  teamDescription: string;
  onTeamNameChange: (name: string) => void;
  onTeamDescriptionChange: (description: string) => void;
  onSave: () => void;
  onDeploy: () => void;
  onViewConfig: () => void;
  onCancel: () => void;
}

export function TeamActionBar({
  teamName,
  teamDescription,
  onTeamNameChange,
  onTeamDescriptionChange,
  onSave,
  onDeploy,
  onViewConfig,
  onCancel,
}: TeamActionBarProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-start gap-4">
        {/* Team info */}
        <div className="flex-1 space-y-2">
          <Input
            type="text"
            placeholder="Team Name *"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            className="font-semibold"
          />
          <Input
            type="text"
            placeholder="Team Description"
            value={teamDescription}
            onChange={(e) => onTeamDescriptionChange(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onViewConfig}>
            <Eye className="mr-2 h-4 w-4" />
            View Config
          </Button>

          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>

          <Button size="sm" onClick={onDeploy}>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy
          </Button>

          <div className="w-px h-8 bg-border" />

          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
