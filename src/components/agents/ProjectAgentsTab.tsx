import { useEffect, useState } from "react";
import { AlertCircle, Loader2, FolderOpen, CheckCircle, XCircle, BookOpen, Wrench, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import type { AgentFile } from "@/types/agentFile";
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
  const [claudeDirExists, setClaudeDirExists] = useState(false);

  useEffect(() => {
    if (projectPath) {
      loadConfiguration();
    }
  }, [projectPath]);

  const loadConfiguration = async () => {
    if (!projectPath) return;

    setLoading(true);
    try {
      // Load all config in parallel
      const [agentFiles, skillFiles, claudeInfo] = await Promise.all([
        electron.listAgentFiles(projectPath),
        electron.listSkills(projectPath),
        electron.getClaudeInfo(projectPath),
      ]);

      setAgents(agentFiles);
      setSkills(skillFiles);
      setClaudeDirExists(claudeInfo.exists);
    } catch (err) {
      console.error("Failed to load configuration:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!projectPath || !confirm("Remove this agent from the project?")) return;

    try {
      await electron.deleteAgentFile(projectPath, agentId);
      await loadConfiguration();
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
      await loadConfiguration();
      setSelectedSkill(null);
    } catch (err) {
      console.error("Failed to remove skill:", err);
      alert("Failed to remove skill");
    }
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">Select a project to view its configuration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const hasNoConfig = agents.length === 0 && skills.length === 0;

  if (hasNoConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>No Configuration Deployed</CardTitle>
            <CardDescription>
              This project has no agents or skills in .claude/
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Quick Start:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to "Configure Agent" to browse the agent library</li>
                <li>Select agents that fit your project needs</li>
                <li>Deploy them to .claude/agents/</li>
                <li>Optionally add skills from the "Skills" tab</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Configuration</h2>
          <p className="text-muted-foreground text-sm">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}, {skills.length} skill{skills.length !== 1 ? 's' : ''}
            {!claudeDirExists && <span className="text-yellow-600 ml-2">⚠ .claude/ missing</span>}
          </p>
        </div>
        {claudeDirExists && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">.claude/ configured</span>
          </div>
        )}
      </div>

      {/* Status Overview - Very Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusBadge
              icon={claudeDirExists ? CheckCircle : XCircle}
              label=".claude/"
              status={claudeDirExists ? "Present" : "Missing"}
              variant={claudeDirExists ? "success" : "error"}
            />
            <StatusBadge
              icon={agents.length > 0 ? CheckCircle : XCircle}
              label="Agents"
              status={agents.length > 0 ? `${agents.length} deployed` : "None"}
              variant={agents.length > 0 ? "success" : "warning"}
            />
            <StatusBadge
              icon={skills.length > 0 ? CheckCircle : AlertCircle}
              label="Skills"
              status={skills.length > 0 ? `${skills.length} deployed` : "None"}
              variant={skills.length > 0 ? "success" : "muted"}
            />
            <StatusBadge
              icon={Wrench}
              label="Settings"
              status="Configure →"
              variant="muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Table - Compact */}
      {agents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Deployed Agents ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Skills Table - Compact */}
      {skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Deployed Skills ({skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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

// Helper component for status badges
function StatusBadge({
  icon: Icon,
  label,
  status,
  variant,
}: {
  icon: any;
  label: string;
  status: string;
  variant: "success" | "error" | "warning" | "muted";
}) {
  const colors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    muted: "text-muted-foreground",
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colors[variant]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{status}</p>
      </div>
    </div>
  );
}
