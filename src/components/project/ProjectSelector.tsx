import { useState, useEffect } from "react";
import { FolderOpen, Loader2, Clock, X, CheckCircle, XCircle, Info, ExternalLink, Wrench, BookOpen, Eye, Code, Server, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AISystemLogo } from "@/components/ui/AILogos";
import { useProject } from "@/hooks/useProject";
import { getRecentProjects, removeRecentProject, type RecentProject } from "@/lib/recentProjects";
import type { AgentFile } from "@/types/agentFile";
import type { Skill } from "@/types/skill";
import type { McpServer } from "@/types/mcp";
import type { AISystem } from "@/types/constitution";
import { AgentDetailModal } from "@/components/agents/AgentDetailModal";
import { SkillDetailModal } from "@/components/skills/SkillDetailModal";
import * as electron from "@/services/electron";
import type { AllDeployedConfigs, DeployedClaudeConfig, DeployedClaudeGlobalConfig, DeployedGeminiConfig, DeployedClineConfig, DeployedGeminiGlobalConfig } from "@/services/electron";

// Type for deployed hooks from settings.json
interface DeployedHook {
  event: string;
  matcher: string;
  command: string;
  type: string;
}

export function ProjectSelector() {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [allDeployedConfigs, setAllDeployedConfigs] = useState<AllDeployedConfigs | null>(null);
  const [agents, setAgents] = useState<AgentFile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [hooks, setHooks] = useState<DeployedHook[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentFile | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [expandedSystem, setExpandedSystem] = useState<AISystem | null>("claude-code");
  const { projectPath, analysis, isAnalyzing, selectProjectFolder, analyzeProjectFolder } = useProject();

  useEffect(() => {
    setRecentProjects(getRecentProjects());

    // Load project config and deployed agents/skills/hooks/mcps
    if (projectPath) {
      loadProjectConfiguration();
      loadAllDeployedConfigs();
    } else {
      setAllDeployedConfigs(null);
      setAgents([]);
      setSkills([]);
      setHooks([]);
      setMcpServers([]);
    }
  }, [projectPath]);

  const loadAllDeployedConfigs = async () => {
    if (!projectPath) return;
    try {
      const configs = await electron.detectAllDeployedConfigs(projectPath);
      setAllDeployedConfigs(configs);
    } catch (err) {
      console.error("Failed to load deployed configs:", err);
    }
  };

  const loadProjectConfiguration = async () => {
    if (!projectPath) return;

    setLoadingConfig(true);
    try {
      const [agentFiles, skillFiles, hookList, mcpList] = await Promise.all([
        electron.listAgentFiles(projectPath),
        electron.listSkills(projectPath),
        electron.listHooks(projectPath).catch(() => [] as DeployedHook[]),
        electron.listMcpServers(projectPath).catch(() => [] as McpServer[]),
      ]);

      setAgents(agentFiles);
      setSkills(skillFiles);
      setHooks(hookList);
      setMcpServers(mcpList);
    } catch (err) {
      console.error("Failed to load project configuration:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!projectPath || !confirm("Remove this agent from the project?")) return;

    try {
      await electron.deleteAgentFile(projectPath, agentId);
      await loadProjectConfiguration();
      setSelectedAgent(null);
    } catch (err) {
      console.error("Failed to remove agent:", err);
      alert("Failed to remove agent");
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!projectPath || !confirm("Remove this skill from the project?")) return;

    try {
      await electron.deleteSkill(projectPath, skillId);
      await loadProjectConfiguration();
      setSelectedSkill(null);
    } catch (err) {
      console.error("Failed to remove skill:", err);
      alert("Failed to remove skill");
    }
  };

  const handleSelectFolder = async () => {
    console.log("[ProjectSelector] Browse Folder button clicked");
    try {
      await selectProjectFolder();
      console.log("[ProjectSelector] selectProjectFolder completed");
    } catch (err) {
      console.error("[ProjectSelector] Error:", err);
      alert(`Error selecting folder: ${err}`);
    }
  };

  const handleOpenFolder = async () => {
    if (!projectPath) return;
    try {
      await electron.openFolder(projectPath);
    } catch (err) {
      console.error("[ProjectSelector] Error opening folder:", err);
      alert(`Failed to open folder: ${err}`);
    }
  };

  const handleSelectRecentProject = async (recent: RecentProject) => {
    try {
      await analyzeProjectFolder(recent.path);
    } catch (err) {
      alert(`Failed to open project: ${err}`);
    }
  };

  const handleRemoveRecentProject = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentProject(path);
    setRecentProjects(getRecentProjects());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Select Your Project</h2>
        <p className="text-muted-foreground mt-2">
          Choose a local folder to configure
        </p>
      </div>

      {/* Recent Projects - Always visible */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Projects</span>
            </CardTitle>
            <CardDescription>
              Switch between your recent projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProjects.map((recent) => {
                const isSelected = projectPath === recent.path;
                return (
                  <div
                    key={recent.path}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => !isSelected && handleSelectRecentProject(recent)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{recent.name}</span>
                        {isSelected && (
                          <Badge variant="default" className="text-xs shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {recent.path}
                      </div>
                      {recent.projectType && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {recent.projectType}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemoveRecentProject(recent.path, e)}
                      className="ml-2 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Project / Browse for New Project */}
      <Card className={projectPath ? "border-primary/50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>{projectPath ? "Selected Project" : "Browse Project"}</span>
          </CardTitle>
          <CardDescription>
            {projectPath
              ? "Currently active project configuration"
              : "Select an existing project on your computer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectPath && (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md text-sm break-all">
                  <div className="font-medium mb-1">Path:</div>
                  {projectPath}
                </div>
                {analysis && (
                  (analysis.frameworks?.length > 0) ||
                  (analysis.languages && Object.keys(analysis.languages).length > 0) ||
                  analysis.files?.total
                ) && (
                  <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                    {analysis.frameworks && analysis.frameworks.length > 0 && (
                      <div>
                        <span className="font-medium">Frameworks:</span>{" "}
                        {analysis.frameworks.join(", ")}
                      </div>
                    )}
                    {analysis.languages && Object.keys(analysis.languages).length > 0 && (
                      <div>
                        <span className="font-medium">Languages:</span>{" "}
                        {Object.entries(analysis.languages)
                          .sort(([, a], [, b]) => b - a)
                          .map(([lang, percent]) => `${lang} (${percent}%)`)
                          .join(", ")}
                      </div>
                    )}
                    {analysis.files?.total && (
                      <div>
                        <span className="font-medium">Files:</span> {analysis.files.total}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleSelectFolder}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Browse Folder
                  </>
                )}
              </Button>
              {projectPath && (
                <Button
                  onClick={handleOpenFolder}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="shrink-0"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Folder
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Systems Deployed Configurations */}
      {projectPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Deployed AI Configurations
            </CardTitle>
            <CardDescription>
              Configuration files detected for each AI system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!allDeployedConfigs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Claude Code */}
                {(() => {
                  const claudeConfig = allDeployedConfigs["claude-code"];
                  const projectConfig = claudeConfig?.project as DeployedClaudeConfig | null;
                  const globalConfig = claudeConfig?.global as DeployedClaudeGlobalConfig | null;
                  const hasProjectConfig = projectConfig && (
                    projectConfig.directory?.exists ||
                    projectConfig.constitution?.exists ||
                    (projectConfig.agents?.count ?? 0) > 0 ||
                    (projectConfig.skills?.count ?? 0) > 0 ||
                    projectConfig.settings?.exists ||
                    projectConfig.mcp?.exists
                  );
                  const hasGlobalConfig = globalConfig && (
                    globalConfig.directory?.exists ||
                    globalConfig.constitution?.exists ||
                    (globalConfig.agents?.count ?? 0) > 0 ||
                    (globalConfig.skills?.count ?? 0) > 0 ||
                    globalConfig.settings?.exists ||
                    globalConfig.mcp?.exists
                  );
                  return (
                <div
                  className={`rounded-lg border ${hasProjectConfig ? "border-green-500/50 bg-green-500/5" : "border-border"}`}
                >
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedSystem(expandedSystem === "claude-code" ? null : "claude-code")}
                  >
                    <div className="flex items-center gap-3">
                      <AISystemLogo system="claude-code" className="h-5 w-5" />
                      <span className="font-medium">Claude Code</span>
                      {hasProjectConfig ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Deployed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not deployed</Badge>
                      )}
                      {hasGlobalConfig ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Global</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">No global</Badge>
                      )}
                    </div>
                    {expandedSystem === "claude-code" ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSystem === "claude-code" && allDeployedConfigs["claude-code"] && (
                    <div className="px-3 pb-3 pt-0 space-y-3">
                      {/* Project */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          Project Configuration
                        </div>
                        {(() => {
                          const config = allDeployedConfigs["claude-code"]?.project as DeployedClaudeConfig | null;
                          if (!config) return <p className="text-xs text-muted-foreground">No configuration detected</p>;
                          return (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {config.directory?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>.claude/</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.constitution?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>CLAUDE.md</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {(config.agents?.count ?? 0) > 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>agents/</code>
                                {(config.agents?.count ?? 0) > 0 && <span className="text-muted-foreground">({config.agents?.count})</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {(config.skills?.count ?? 0) > 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>skills/</code>
                                {(config.skills?.count ?? 0) > 0 && <span className="text-muted-foreground">({config.skills?.count})</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {config.settings?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>settings.json</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.mcp?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>.mcp.json</code>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Global */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <Home className="h-4 w-4 text-purple-500" />
                          Global Configuration
                        </div>
                        {(() => {
                          const config = allDeployedConfigs["claude-code"]?.global as DeployedClaudeGlobalConfig | null;
                          if (!config) return <p className="text-xs text-muted-foreground">No global configuration</p>;
                          return (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {config.directory?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>~/.claude/</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.constitution?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>~/CLAUDE.md</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {(config.agents?.count ?? 0) > 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>agents/</code>
                                {(config.agents?.count ?? 0) > 0 && <span className="text-muted-foreground">({config.agents?.count})</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {(config.skills?.count ?? 0) > 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>skills/</code>
                                {(config.skills?.count ?? 0) > 0 && <span className="text-muted-foreground">({config.skills?.count})</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {config.settings?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>settings.json</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.mcp?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>.mcp.json</code>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                  );
                })()}

                {/* Gemini CLI */}
                {(() => {
                  const geminiConfig = allDeployedConfigs["gemini-cli"];
                  const projectConfig = geminiConfig?.project as DeployedGeminiConfig | null;
                  const globalConfig = geminiConfig?.global as DeployedGeminiGlobalConfig | null;
                  const hasProjectConfig = projectConfig?.constitution?.exists;
                  const hasGlobalConfig = globalConfig && (
                    globalConfig.directory?.exists ||
                    globalConfig.constitution?.exists ||
                    globalConfig.settings?.exists
                  );
                  return (
                <div
                  className={`rounded-lg border ${hasProjectConfig ? "border-green-500/50 bg-green-500/5" : "border-border"}`}
                >
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedSystem(expandedSystem === "gemini-cli" ? null : "gemini-cli")}
                  >
                    <div className="flex items-center gap-3">
                      <AISystemLogo system="gemini-cli" className="h-5 w-5" />
                      <span className="font-medium">Gemini CLI</span>
                      {hasProjectConfig ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Deployed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not deployed</Badge>
                      )}
                      {hasGlobalConfig ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Global</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">No global</Badge>
                      )}
                    </div>
                    {expandedSystem === "gemini-cli" ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSystem === "gemini-cli" && allDeployedConfigs["gemini-cli"] && (
                    <div className="px-3 pb-3 pt-0 space-y-3">
                      {/* Project */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          Project Configuration
                        </div>
                        {(() => {
                          const config = allDeployedConfigs["gemini-cli"]?.project as DeployedGeminiConfig | null;
                          return (
                            <div className="flex items-center gap-2 text-xs">
                              {config?.constitution?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                              <code>GEMINI.md</code>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Global */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <Home className="h-4 w-4 text-purple-500" />
                          Global Configuration
                        </div>
                        {(() => {
                          const config = allDeployedConfigs["gemini-cli"]?.global as DeployedGeminiGlobalConfig | null;
                          if (!config) return <p className="text-xs text-muted-foreground">No global configuration</p>;
                          return (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {config.directory?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>~/.gemini/</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.constitution?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>GEMINI.md</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {config.settings?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>settings.json</code>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                  );
                })()}

                {/* Cline */}
                {(() => {
                  const clineConfig = allDeployedConfigs["cline"];
                  const projectConfig = clineConfig?.project as DeployedClineConfig | null;
                  const hasProjectConfig = projectConfig && (
                    projectConfig.rules?.exists ||
                    projectConfig.memoryBank?.exists ||
                    projectConfig.mcp?.exists
                  );
                  return (
                <div
                  className={`rounded-lg border ${hasProjectConfig ? "border-green-500/50 bg-green-500/5" : "border-border"}`}
                >
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedSystem(expandedSystem === "cline" ? null : "cline")}
                  >
                    <div className="flex items-center gap-3">
                      <AISystemLogo system="cline" className="h-5 w-5" />
                      <span className="font-medium">Cline</span>
                      {hasProjectConfig ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Deployed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not deployed</Badge>
                      )}
                    </div>
                    {expandedSystem === "cline" ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSystem === "cline" && allDeployedConfigs["cline"] && (
                    <div className="px-3 pb-3 pt-0">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          Project Configuration
                        </div>
                        {(() => {
                          const config = allDeployedConfigs["cline"]?.project as DeployedClineConfig | null;
                          if (!config) return <p className="text-xs text-muted-foreground">No configuration detected</p>;
                          return (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {config.rules?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>.clinerules</code>
                                {config.rules?.isFolder && <span className="text-muted-foreground">(folder)</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {config.memoryBank?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>memory-bank/</code>
                                {(config.memoryBank?.fileCount ?? 0) > 0 && <span className="text-muted-foreground">({config.memoryBank?.fileCount})</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {config.mcp?.exists ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                <code>.vscode/mcp.json</code>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployed Agents - Detailed Table */}
      {projectPath && agents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Deployed Agents ({agents.length})
            </CardTitle>
            <CardDescription>
              Agents in .claude/agents/ directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.model || "inherit"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {agent.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground">
                        {typeof agent.tools === 'string' && agent.tools === '*' ? 'All tools' : 'Custom tools'}
                      </span>
                      <Button
                        onClick={() => setSelectedAgent(agent)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployed Skills - Detailed Table */}
      {projectPath && skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Deployed Skills ({skills.length})
            </CardTitle>
            <CardDescription>
              Skills in .claude/skills/ directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.category && (
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {skill.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="flex gap-1">
                          {skill.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-muted text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={() => setSelectedSkill(skill)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployed Hooks - Detailed Table */}
      {projectPath && hooks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4" />
              Deployed Hooks ({hooks.length})
            </CardTitle>
            <CardDescription>
              Hooks in .claude/settings.json
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {hooks.map((hook, index) => (
                  <div
                    key={`${hook.event}-${hook.matcher}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{hook.event}</span>
                        <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                          {hook.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                        {hook.matcher || "*"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                        {hook.command}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployed MCP Servers - Detailed Table */}
      {projectPath && mcpServers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              Deployed MCP Servers ({mcpServers.length})
            </CardTitle>
            <CardDescription>
              MCP servers in .mcp.json
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {mcpServers.map((mcp) => (
                  <div
                    key={mcp.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mcp.name}</span>
                        <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                          {mcp.type}
                        </Badge>
                        {mcp.category && (
                          <Badge variant="outline" className="text-xs">
                            {mcp.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {mcp.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {mcp.type === "stdio" && mcp.command && (
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                          {mcp.command}
                        </code>
                      )}
                      {(mcp.type === "http" || mcp.type === "sse") && mcp.url && (
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                          {mcp.url}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={{
            id: selectedAgent.id,
            name: selectedAgent.name,
            description: selectedAgent.description,
            category: "General" as any,
            template: selectedAgent.systemPrompt,
            tags: [],
            suggestedFor: [],
            tools: selectedAgent.tools,
            model: selectedAgent.model as any,
          }}
          projectPath={projectPath}
          onClose={() => setSelectedAgent(null)}
          onAddAgent={() => alert("This agent is already deployed")}
          onRemoveAgent={handleRemoveAgent}
          isDeployed={true}
        />
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          projectPath={projectPath}
          onClose={() => setSelectedSkill(null)}
          onAddSkill={() => alert("This skill is already deployed")}
          onRemoveSkill={handleRemoveSkill}
          isDeployed={true}
        />
      )}
    </div>
  );
}
