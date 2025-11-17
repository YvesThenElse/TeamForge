import { useEffect, useState } from "react";
import { AlertCircle, Loader2, GitBranch, ArrowRight, FolderOpen, CheckCircle, XCircle, Info, Circle, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import type { AgentFile } from "@/types/agentFile";
import type { ClaudeInfo } from "@/types/claudeInfo";
import type { TeamForgeConfig } from "@/types/config";
import type { Skill } from "@/types/skill";
import { AgentDetailModal } from "./AgentDetailModal";
import { SkillDetailModal } from "../skills/SkillDetailModal";

export function ProjectAgentsTab() {
  const { projectPath } = useProjectStore();
  const [agents, setAgents] = useState<AgentFile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentFile | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [claudeInfo, setClaudeInfo] = useState<ClaudeInfo | null>(null);
  const [config, setConfig] = useState<TeamForgeConfig | null>(null);

  useEffect(() => {
    if (projectPath) {
      loadAgents();
      loadSkills();
      loadClaudeInfo();
      loadConfig();
    }
  }, [projectPath]);

  const loadAgents = async () => {
    if (!projectPath) return;

    setLoading(true);
    try {
      const agentFiles = await electron.listAgentFiles(projectPath);
      setAgents(agentFiles);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    if (!projectPath) return;

    try {
      const skillFiles = await electron.listSkills(projectPath);
      setSkills(skillFiles);
    } catch (err) {
      console.error("Failed to load skills:", err);
    }
  };

  const loadClaudeInfo = async () => {
    if (!projectPath) return;

    try {
      const info = await electron.getClaudeInfo(projectPath);
      setClaudeInfo(info);
    } catch (err) {
      console.error("Failed to load Claude info:", err);
    }
  };

  const loadConfig = async () => {
    if (!projectPath) return;

    try {
      const cfg = await electron.loadTeamforgeConfig(projectPath);
      setConfig(cfg);
    } catch (err) {
      // Config will be created automatically if it doesn't exist
      // No need to log error, just set to null
      setConfig(null);
    }
  };

  const handleAgentClick = (agent: AgentFile) => {
    setSelectedAgent(agent);
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!projectPath) return;

    if (!confirm("Are you sure you want to remove this agent from the project?")) {
      return;
    }

    try {
      await electron.deleteAgentFile(projectPath, agentId);
      await loadAgents();
      await loadConfig();
      setSelectedAgent(null);
    } catch (err) {
      console.error("Failed to remove agent:", err);
      alert("Failed to remove agent. Check console for details.");
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!projectPath) return;

    if (!confirm("Are you sure you want to remove this skill from the project?")) {
      return;
    }

    try {
      await electron.deleteSkill(projectPath, skillId);
      await loadSkills();
      setSelectedSkill(null);
    } catch (err) {
      console.error("Failed to remove skill:", err);
      alert("Failed to remove skill. Check console for details.");
    }
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">
            Please select a project first to manage agents
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deployed agents...</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No Agents Deployed</CardTitle>
            <CardDescription>
              This project doesn't have any sub-agents configured in .claude/agents/
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sub-agents are specialized AI assistants that Claude Code can delegate to
                for specific tasks. They are stored as markdown files in the .claude/agents/
                directory.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">To add agents:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Browse the agent library in "Configure Agent"</li>
                  <li>Select agents that fit your project needs</li>
                  <li>Deploy them via git or copy from templates</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Deployed Configuration</h2>
        <p className="text-muted-foreground mt-1">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} and {skills.length} skill{skills.length !== 1 ? 's' : ''} configured
        </p>
      </div>

      {/* Claude Info Card */}
      {claudeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Claude Code Configuration</span>
            </CardTitle>
            <CardDescription>
              Project configuration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Directory Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  {claudeInfo.exists ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">.claude/ directory</p>
                    <p className="text-xs text-muted-foreground">
                      {claudeInfo.exists ? "Present" : "Not found"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {claudeInfo.agentsDir ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">agents/ directory</p>
                    <p className="text-xs text-muted-foreground">
                      {claudeInfo.agentsDir ? `Present (${agents.length})` : "Not found"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {claudeInfo.skillsDir ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Info className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">skills/ directory</p>
                    <p className="text-xs text-muted-foreground">
                      {claudeInfo.skillsDir ? `Present (${skills.length})` : "Optional"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {claudeInfo.settingsFile ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Info className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">settings file</p>
                    <p className="text-xs text-muted-foreground">
                      {claudeInfo.settingsFile ? "Present" : "Optional"}
                    </p>
                  </div>
                </div>

                {claudeInfo.claudePath && (
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Path</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {claudeInfo.claudePath}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Content */}
              {claudeInfo.settings && Object.keys(claudeInfo.settings).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Settings:</p>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    {Object.entries(claudeInfo.settings).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Message */}
              {!claudeInfo.exists && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    The .claude/ directory is not present in this project. Claude Code uses
                    this directory to store agent configurations and settings.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5" />
                <span>Agent Workflow</span>
              </CardTitle>
              <CardDescription>
                {config?.workflow?.enabled
                  ? "Sequential workflow - agents execute in order"
                  : "Independent agents - no specific execution order"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{agents.length} agents</Badge>
              {config?.workflow?.enabled && (
                <Badge variant="default" className="bg-blue-500">
                  Workflow Enabled
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Visual workflow display */}
          <div className={`flex flex-wrap gap-3 items-center p-4 rounded-lg ${
            config?.workflow?.enabled
              ? 'bg-blue-500/10 border-2 border-blue-500/20'
              : 'bg-muted/30 border-2 border-dashed border-muted-foreground/20'
          }`}>
            {agents.map((agent, index) => {
              const workflowStep = config?.workflow?.sequence?.find(
                (step) => step.agentId === agent.id
              );
              const order = workflowStep?.order;

              return (
                <div key={agent.id} className="flex items-center">
                  <button
                    onClick={() => handleAgentClick(agent)}
                    className={`group relative px-4 py-3 bg-card rounded-lg hover:shadow-md transition-all cursor-pointer ${
                      config?.workflow?.enabled
                        ? 'border-2 border-blue-500'
                        : 'border-2 border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {config?.workflow?.enabled ? (
                        <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                          {order !== undefined ? order + 1 : index + 1}
                        </div>
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {agent.model || "sonnet"}
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground max-w-xs truncate">
                        {agent.description}
                      </p>
                      {config?.workflow?.enabled && order !== undefined && (
                        <p className="text-xs text-blue-500 mt-1">
                          Execution order: {order + 1}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Connector arrow - only show for workflow */}
                  {config?.workflow?.enabled && index < agents.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-blue-500 mx-2 font-bold" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Workflow Info */}
          {config?.workflow?.enabled ? (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-medium">Sequential Workflow Active</p>
                  <p className="text-xs mt-1 text-blue-500">
                    Agents will execute in the numbered order shown above. Each agent can pass context to the next.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Independent Agents</p>
                  <p className="text-xs mt-1">
                    These agents work independently without a specific execution order. Configure a workflow in the "Configure Team" tab to enable sequential execution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployed Items Grid */}
      <div className="space-y-6">
        {/* Agents Section */}
        {agents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Agents ({agents.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleAgentClick(agent)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {agent.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Model:</span>
                        <Badge variant="outline">{agent.model || "inherit"}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tools:</span>
                        <span className="text-xs truncate ml-2 max-w-[150px]">
                          {agent.tools === "all" ? "All tools" : agent.tools}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Click to view details
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Skills ({skills.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <Card
                  key={skill.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{skill.name}</CardTitle>
                        {skill.category && (
                          <div className="mt-1">
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                        )}
                        <CardDescription className="line-clamp-2 mt-1">
                          {skill.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {skill.allowedTools && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Tools:</span>{" "}
                          {skill.allowedTools.split(",").slice(0, 2).map(t => t.trim()).join(", ")}
                          {skill.allowedTools.split(",").length > 2 && "..."}
                        </div>
                      )}
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {skill.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-muted text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Click to view details
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

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
          onAddAgent={() => {
            // Agent is already deployed, no action needed
            alert("This agent is already deployed in the project");
          }}
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
          onAddSkill={() => {
            // Skill is already deployed, no action needed
            alert("This skill is already deployed in the project");
          }}
          onRemoveSkill={handleRemoveSkill}
          isDeployed={true}
        />
      )}
    </div>
  );
}
