import { ArrowUp, ArrowDown, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/stores/agentStore";
import { cn } from "@/lib/utils";

export function AgentWorkflow() {
  const {
    workflowEnabled,
    setWorkflowEnabled,
    getOrderedAgents,
    moveAgentUp,
    moveAgentDown,
    removeAgent,
    agentOrder,
  } = useAgentStore();

  const orderedAgents = getOrderedAgents();

  if (orderedAgents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Agent Workflow</span>
          </CardTitle>
          <CardDescription>
            No agents selected. Choose agents to create a workflow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Workflow className="h-5 w-5" />
              <span>Agent Workflow</span>
            </CardTitle>
            <CardDescription>
              Define the sequential order for your agents
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Enable Workflow</span>
            <button
              onClick={() => setWorkflowEnabled(!workflowEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                workflowEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  workflowEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orderedAgents.map((agent, index) => {
            const order = agentOrder.get(agent.id) || 0;
            const isFirst = index === 0;
            const isLast = index === orderedAgents.length - 1;

            return (
              <div
                key={agent.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  workflowEnabled ? "bg-card" : "bg-muted/50"
                )}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                      workflowEnabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {order}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {agent.description}
                    </div>
                  </div>
                  <Badge variant="outline">{agent.category}</Badge>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveAgentUp(agent.id)}
                    disabled={!workflowEnabled || isFirst}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveAgentDown(agent.id)}
                    disabled={!workflowEnabled || isLast}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgent(agent.id)}
                    title="Remove agent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {workflowEnabled && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Workflow enabled:</strong> Agents will be invoked in the order shown
              above, from 1 to {orderedAgents.length}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
