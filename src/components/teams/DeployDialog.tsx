import { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, Check, Rocket, Home, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AISystemLogo } from "@/components/ui/AILogos";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import type { AISystem } from "@/types/constitution";
import type { Team } from "@/types/team";
import type { SystemCapabilities, DeploymentValidation, MultiDeploymentResult } from "@/services/electron";

interface DeployDialogProps {
  team: Team;
  onClose: () => void;
  onDeployComplete?: (result: MultiDeploymentResult) => void;
}

type DeploymentLocation = "project" | "global" | "both";

interface AISystemConfig {
  id: AISystem;
  name: string;
  description: string;
  locations: {
    project?: { path: string; description: string };
    global?: { path: string; description: string };
  };
  defaultLocation: DeploymentLocation;
}

const AI_SYSTEMS: AISystemConfig[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    description: "Claude's CLI for coding assistance",
    locations: {
      project: {
        path: ".claude/ + CLAUDE.md",
        description: "Project-specific configuration",
      },
    },
    defaultLocation: "project",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    description: "Google's Gemini CLI tool",
    locations: {
      project: {
        path: "GEMINI.md",
        description: "Project-specific constitution",
      },
      global: {
        path: "~/.gemini/",
        description: "Global settings and MCP servers",
      },
    },
    defaultLocation: "both",
  },
  {
    id: "cline",
    name: "Cline",
    description: "VS Code AI coding assistant",
    locations: {
      project: {
        path: ".clinerules + .vscode/mcp.json",
        description: "Project-specific rules and MCP",
      },
    },
    defaultLocation: "project",
  },
];

export function DeployDialog({ team, onClose, onDeployComplete }: DeployDialogProps) {
  const { projectPath } = useProjectStore();
  const [selectedSystems, setSelectedSystems] = useState<AISystem[]>(["claude-code"]);
  const [deploymentLocations, setDeploymentLocations] = useState<Record<AISystem, DeploymentLocation>>({
    "claude-code": "project",
    "gemini-cli": "both",
    "cline": "project",
  });
  const [capabilities, setCapabilities] = useState<Record<AISystem, SystemCapabilities> | null>(null);
  const [validation, setValidation] = useState<DeploymentValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<MultiDeploymentResult | null>(null);

  // Load capabilities on mount
  useEffect(() => {
    const loadCapabilities = async () => {
      if (!projectPath) return;

      try {
        const caps = await electron.getAllDeploymentCapabilities(projectPath);
        setCapabilities(caps);
      } catch (error) {
        console.error("Failed to load capabilities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCapabilities();
  }, [projectPath]);

  // Validate when selection changes
  useEffect(() => {
    const validateSelection = async () => {
      if (!projectPath || selectedSystems.length === 0) {
        setValidation(null);
        return;
      }

      try {
        // Build deployment team object
        const deploymentTeam = {
          id: team.id,
          name: team.name,
          agents: team.agents,
          skills: team.skills,
          hooks: team.hooks,
          mcpServers: team.mcpServers,
          security: team.security,
        };

        const result = await electron.validateDeployment(deploymentTeam, selectedSystems, projectPath);
        setValidation(result);
      } catch (error) {
        console.error("Failed to validate deployment:", error);
      }
    };

    validateSelection();
  }, [selectedSystems, team, projectPath]);

  const handleToggleSystem = (system: AISystem) => {
    setSelectedSystems((prev) =>
      prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]
    );
  };

  const handleDeploy = async () => {
    if (!projectPath || selectedSystems.length === 0) return;

    setIsDeploying(true);

    try {
      const deploymentTeam = {
        id: team.id,
        name: team.name,
        agents: team.agents,
        skills: team.skills,
        hooks: team.hooks,
        mcpServers: team.mcpServers,
        security: team.security,
      };

      // Build options with deployment locations
      const options: Record<string, any> = { clearExisting: true };

      // Add Gemini-specific options
      if (selectedSystems.includes("gemini-cli")) {
        const geminiLocation = deploymentLocations["gemini-cli"];
        options.deployGlobal = geminiLocation === "global" || geminiLocation === "both";
        options.deployProject = geminiLocation === "project" || geminiLocation === "both";
      }

      const result = await electron.deployMultiple(
        deploymentTeam,
        selectedSystems,
        projectPath,
        options
      );

      setDeployResult(result);

      if (onDeployComplete) {
        onDeployComplete(result);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      setDeployResult({
        success: false,
        results: {} as Record<AISystem, any>,
        validation: { valid: false, warnings: [], errors: [String(error)] },
        errors: [{ system: "claude-code" as AISystem, error: String(error) }],
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeploying) {
      onClose();
    }
  };

  const getCapabilityBadges = (system: AISystem) => {
    if (!capabilities) return null;
    const caps = capabilities[system];
    if (!caps) return null;

    const badges = [];
    if (caps.agents) badges.push("Agents");
    if (caps.skills) badges.push("Skills");
    if (caps.hooks) badges.push("Hooks");
    if (caps.mcpServers) badges.push("MCP");
    if (caps.constitution) badges.push("Constitution");
    if (caps.memory) badges.push("Memory");

    return badges;
  };

  const getSystemWarnings = (system: AISystem) => {
    if (!validation) return [];
    return validation.warnings.filter((w) => w.system === system);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading deployment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Deploy Team</h2>
            <p className="text-muted-foreground mt-1">
              Select target AI systems for "{team.name}"
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isDeploying}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Deployment Result */}
          {deployResult && (
            <Card className={deployResult.success ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  {deployResult.success ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {deployResult.success ? "Deployment Successful" : "Deployment Failed"}
                  </span>
                </div>
                {deployResult.errors.length > 0 && (
                  <ul className="text-sm text-red-600 space-y-1">
                    {deployResult.errors.map((e, i) => (
                      <li key={i}>{e.system}: {e.error}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Selection */}
          {!deployResult && (
            <>
              <div className="space-y-3">
                {AI_SYSTEMS.map((system) => {
                  const isSelected = selectedSystems.includes(system.id);
                  const caps = getCapabilityBadges(system.id);
                  const warnings = getSystemWarnings(system.id);

                  return (
                    <Card
                      key={system.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => handleToggleSystem(system.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                            <AISystemLogo system={system.id} className="h-5 w-5" />
                            {system.name}
                          </CardTitle>
                          {isSelected && <Check className="h-5 w-5 text-primary" />}
                        </div>
                        <CardDescription>{system.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {/* Deployment Locations */}
                        {isSelected && (system.locations.project && system.locations.global) && (
                          <div
                            className="p-3 rounded-lg bg-muted/50 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                              Deployment Location
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`location-${system.id}`}
                                  checked={deploymentLocations[system.id] === "project"}
                                  onChange={() => setDeploymentLocations(prev => ({
                                    ...prev,
                                    [system.id]: "project"
                                  }))}
                                  className="h-3 w-3"
                                />
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Project only</span>
                                <code className="text-xs bg-muted px-1 rounded ml-auto">
                                  {system.locations.project?.path}
                                </code>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`location-${system.id}`}
                                  checked={deploymentLocations[system.id] === "global"}
                                  onChange={() => setDeploymentLocations(prev => ({
                                    ...prev,
                                    [system.id]: "global"
                                  }))}
                                  className="h-3 w-3"
                                />
                                <Home className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Global only</span>
                                <code className="text-xs bg-muted px-1 rounded ml-auto">
                                  {system.locations.global?.path}
                                </code>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`location-${system.id}`}
                                  checked={deploymentLocations[system.id] === "both"}
                                  onChange={() => setDeploymentLocations(prev => ({
                                    ...prev,
                                    [system.id]: "both"
                                  }))}
                                  className="h-3 w-3"
                                />
                                <div className="flex gap-0.5">
                                  <FolderOpen className="h-4 w-4 text-blue-500" />
                                  <Home className="h-4 w-4 text-purple-500" />
                                </div>
                                <span className="text-sm">Both</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  Project + Global
                                </span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Single location display */}
                        {isSelected && !(system.locations.project && system.locations.global) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FolderOpen className="h-4 w-4 text-blue-500" />
                            <span>Project:</span>
                            <code className="text-xs bg-muted px-1 rounded">
                              {system.locations.project?.path}
                            </code>
                          </div>
                        )}

                        {/* Capability badges */}
                        {caps && (
                          <div className="flex flex-wrap gap-1">
                            {caps.map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Warnings */}
                        {warnings.length > 0 && (
                          <div className="space-y-1">
                            {warnings.map((w, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs text-amber-600"
                              >
                                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{w.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Global Warnings */}
              {validation && validation.warnings.length > 0 && (
                <Card className="border-amber-500/50 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Compatibility Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Some features are not supported by all selected systems and will be skipped.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          {deployResult ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isDeploying}>
                Cancel
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || selectedSystems.length === 0}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy to {selectedSystems.length} System{selectedSystems.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
