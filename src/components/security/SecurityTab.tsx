import { useState, useEffect } from "react";
import { Shield, Save, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSecurityStore } from "@/stores/securityStore";
import { useProjectStore } from "@/stores/projectStore";
import { AVAILABLE_TOOLS, type ToolName } from "@/types/security";
import * as electron from "@/services/electron";

export function SecurityTab() {
  const { projectPath } = useProjectStore();
  const { config, setAgentTools, addToolToAgent, removeToolFromAgent, addToolToAllAgents, removeToolFromAllAgents, setAgents } = useSecurityStore();
  const [selectedTool, setSelectedTool] = useState<ToolName | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load agents from project on mount
  useEffect(() => {
    const loadAgents = async () => {
      if (!projectPath) return;

      try {
        // Load configured agents
        const agentFiles = await electron.listAgentFiles(projectPath);

        const agents = agentFiles.map((file) => ({
          agentId: file.id,
          agentName: file.frontmatter.name || file.id,
          tools: parseTools(file.frontmatter.tools),
        }));

        setAgents(agents);
      } catch (error) {
        console.error("Failed to load agents:", error);
      }
    };

    loadAgents();
  }, [projectPath, setAgents]);

  const parseTools = (tools: any): string[] => {
    if (typeof tools === 'string') {
      if (tools === '*') return ['*'];
      // Parse string like "Read, Write, Bash"
      return tools.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (Array.isArray(tools)) {
      return tools;
    }
    return ['*']; // Default to all tools
  };

  const handleToggleTool = (agentId: string, tool: string, isChecked: boolean) => {
    if (isChecked) {
      addToolToAgent(agentId, tool);
    } else {
      removeToolFromAgent(agentId, tool);
    }
  };

  const handleAddToolToAll = () => {
    if (!selectedTool) return;
    addToolToAllAgents(selectedTool, true);
    setSaveMessage({ type: 'success', text: `Added "${selectedTool}" to all agents` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleRemoveToolFromAll = () => {
    if (!selectedTool) return;
    removeToolFromAllAgents(selectedTool);
    setSaveMessage({ type: 'success', text: `Removed "${selectedTool}" from all agents` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!projectPath) {
      setSaveMessage({ type: 'error', text: 'No project selected' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Save each agent's tool configuration
      for (const agent of config.agents) {
        const agentFile = await electron.readAgentFile(projectPath, agent.agentId);

        const updatedFrontmatter = {
          ...agentFile.frontmatter,
          tools: agent.tools.length === 1 && agent.tools[0] === '*'
            ? '*'
            : agent.tools,
        };

        await electron.saveAgentFileContent(
          projectPath,
          agent.agentId,
          updatedFrontmatter,
          agentFile.systemPrompt
        );
      }

      setSaveMessage({ type: 'success', text: 'Security configuration saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to save security config:", error);
      setSaveMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const getToolsForAgent = (agentId: string): string[] => {
    const agent = config.agents.find(a => a.agentId === agentId);
    return agent?.tools || [];
  };

  const isToolChecked = (agentId: string, tool: string): boolean => {
    const tools = getToolsForAgent(agentId);
    return tools.includes(tool) || tools.includes('*');
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please select a project first to configure agent security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (config.agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Configured</h3>
              <p className="text-muted-foreground">
                Configure some agents first before managing their security settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Configuration
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage tool permissions for {config.agents.length} configured agent{config.agents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
            : 'bg-red-500/10 text-red-600 border border-red-500/20'
        }`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Main Layout: Agents List (Left) + Global Tools (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agents List (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Permissions</CardTitle>
              <CardDescription>
                Configure which tools each agent can access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.agents.map((agent) => {
                const hasWildcard = agent.tools.includes('*');

                return (
                  <Card key={agent.agentId} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {hasWildcard ? (
                            <span className="text-primary font-medium">All Tools (*)</span>
                          ) : (
                            <span>{agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {AVAILABLE_TOOLS.map((tool) => {
                          const isChecked = isToolChecked(agent.agentId, tool.name);
                          const isDisabled = hasWildcard && tool.name !== '*';

                          return (
                            <label
                              key={tool.name}
                              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-primary/10 border-primary'
                                  : 'hover:bg-muted'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) =>
                                  handleToggleTool(agent.agentId, tool.name, e.target.checked)
                                }
                                className="h-4 w-4"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {tool.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Global Tools Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Tool Globally
              </CardTitle>
              <CardDescription>
                Add a tool to all agents at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Tool
                </label>
                <select
                  value={selectedTool || ''}
                  onChange={(e) => setSelectedTool(e.target.value as ToolName)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Select a tool --</option>
                  {AVAILABLE_TOOLS.map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToolToAll}
                  disabled={!selectedTool}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to All
                </Button>
                <Button
                  onClick={handleRemoveToolFromAll}
                  disabled={!selectedTool}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove from All
                </Button>
              </div>

              {/* Security Best Practices */}
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Security Best Practices</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Grant only the tools each agent needs (principle of least privilege)</li>
                      <li>Use wildcard (*) carefully - it grants all tools including Bash</li>
                      <li>Read-only agents should only have: Read, Grep, Glob</li>
                      <li>Development agents typically need: Read, Write, Edit, Bash</li>
                      <li>Review agent configurations regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
