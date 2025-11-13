import { useEffect, useState } from "react";
import { Plus, FileText, Trash2, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjectStore } from "@/stores/projectStore";
import * as electron from "@/services/electron";
import type { AgentFile } from "@/types/agentFile";
import { AgentEditor } from "./AgentEditor";

export function ProjectAgentsTab() {
  const { projectPath } = useProjectStore();
  const [agents, setAgents] = useState<AgentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (projectPath) {
      loadAgents();
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

  const handleDeleteAgent = async (agentId: string) => {
    if (!projectPath) return;
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      await electron.deleteAgentFile(projectPath, agentId);
      await loadAgents();
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
        setIsEditing(false);
      }
    } catch (err) {
      alert(`Failed to delete agent: ${err}`);
    }
  };

  const handleEditAgent = (agent: AgentFile) => {
    setSelectedAgent(agent);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    const newAgent: AgentFile = {
      id: `agent-${Date.now()}`,
      filename: "",
      filePath: "",
      name: "new-agent",
      description: "",
      tools: "all",
      model: "inherit",
      systemPrompt: "You are a helpful AI assistant.",
      frontmatter: {
        name: "new-agent",
        description: "",
      },
    };
    setSelectedAgent(newAgent);
    setIsEditing(true);
  };

  const handleSaveAgent = async () => {
    await loadAgents();
    setIsEditing(false);
  };

  if (isEditing && selectedAgent) {
    return (
      <AgentEditor
        agent={selectedAgent}
        onSave={handleSaveAgent}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

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
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Agents Found</CardTitle>
            <CardDescription>
              This project doesn't have any sub-agents configured yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sub-agents are specialized AI assistants that Claude Code can delegate to
              for specific tasks. Create your first agent to get started.
            </p>
            <Button onClick={handleCreateNew} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create First Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Sub-Agents</h2>
          <p className="text-muted-foreground mt-1">
            {agents.length} {agents.length === 1 ? "agent" : "agents"} configured
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditAgent(agent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {agent.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{agent.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools:</span>
                  <span className="font-medium truncate ml-2">
                    {agent.tools === "all" ? "All tools" : agent.tools}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
