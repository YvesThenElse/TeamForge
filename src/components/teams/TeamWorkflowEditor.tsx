import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { AgentNode } from "./AgentNode";
import { AgentSidebar } from "./AgentSidebar";
import { TeamActionBar } from "./TeamActionBar";
import { ConfigPreviewDialog } from "./ConfigPreviewDialog";
import { AgentDetailsDialog } from "./AgentDetailsDialog";
import { useTeamStore } from "@/stores/teamStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAgentStore } from "@/stores/agentStore";
import { saveTeam, deployTeam, listAgentFiles } from "@/services/electron";
import type { Team } from "@/types/team";
import type { AgentFile } from "@/types/agentFile";
import type { Agent } from "@/types";

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
};

interface TeamWorkflowEditorProps {
  team: Team | null;
  isNewTeam: boolean;
  onClose: () => void;
}

export function TeamWorkflowEditor({ onClose }: TeamWorkflowEditorProps) {
  // Get current team and its workflow
  const currentTeam = useTeamStore((state) => state.currentTeam);
  const addAgentToWorkflow = useTeamStore((state) => state.addAgentToWorkflow);
  const removeAgentFromWorkflow = useTeamStore((state) => state.removeAgentFromWorkflow);
  const updateAgentPosition = useTeamStore((state) => state.updateAgentPosition);
  const projectPath = useProjectStore((state) => state.projectPath);
  const library = useAgentStore((state) => state.library);

  // Get workflow directly from currentTeam (not as a separate subscription)
  const workflow = currentTeam?.workflow || [];

  console.log('[TeamWorkflowEditor] Render - currentTeam:', currentTeam?.id, currentTeam?.name, 'workflow length:', workflow.length);
  console.log('[TeamWorkflowEditor] Library length:', library.length);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfigPreviewOpen, setIsConfigPreviewOpen] = useState(false);
  const [teamName, setTeamName] = useState(currentTeam?.name || "");
  const [teamDescription, setTeamDescription] = useState(currentTeam?.description || "");
  const [deployedAgents, setDeployedAgents] = useState<AgentFile[]>([]);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null);

  // Update team name and description when currentTeam changes
  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name || "");
      setTeamDescription(currentTeam.description || "");
    }
  }, [currentTeam]);

  // Load deployed agents when project path changes
  useEffect(() => {
    const loadDeployedAgents = async () => {
      if (!projectPath) {
        setDeployedAgents([]);
        return;
      }

      try {
        const deployed = await listAgentFiles(projectPath);
        setDeployedAgents(deployed);
      } catch (err) {
        console.error("[TeamWorkflowEditor] Failed to load deployed agents:", err);
        setDeployedAgents([]);
      }
    };

    loadDeployedAgents();
  }, [projectPath]);

  // Handler for showing agent details
  const handleNodeClick = useCallback((agent: Agent) => {
    setSelectedAgentForDetails(agent);
  }, []);

  // Initialize nodes and edges from team workflow
  useEffect(() => {
    console.log('[TeamWorkflowEditor] useEffect triggered!');
    console.log('[TeamWorkflowEditor] currentTeam:', currentTeam?.id, currentTeam?.name);
    console.log('[TeamWorkflowEditor] workflow length:', workflow.length);
    console.log('[TeamWorkflowEditor] library length:', library.length);

    if (!currentTeam) {
      console.log('[TeamWorkflowEditor] No currentTeam, clearing nodes/edges');
      setNodes([]);
      setEdges([]);
      return;
    }

    if (!workflow || workflow.length === 0) {
      console.log('[TeamWorkflowEditor] No workflow, clearing nodes/edges');
      setNodes([]);
      setEdges([]);
      return;
    }

    const workflowIds = workflow.map(n => n.agentId).join(',');
    console.log('[TeamWorkflowEditor] Workflow IDs:', workflowIds);

    const workflowNodes: Node[] = workflow.map((node) => {
      const agent = library.find((a) => a.id === node.agentId);
      console.log('[TeamWorkflowEditor] Creating node for agent:', node.agentId, 'found:', !!agent, agent?.name);
      return {
        id: node.agentId,
        type: "agentNode",
        position: node.position,
        data: {
          agent,
          order: node.order,
          onDelete: () => removeAgentFromWorkflow(node.agentId),
          onClick: () => agent && handleNodeClick(agent),
        },
      };
    });

    const workflowEdges: Edge[] = [];
    const sortedNodes = [...workflow].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      workflowEdges.push({
        id: `${sortedNodes[i].agentId}-${sortedNodes[i + 1].agentId}`,
        source: sortedNodes[i].agentId,
        target: sortedNodes[i + 1].agentId,
        animated: true,
      });
    }

    console.log('[TeamWorkflowEditor] Setting nodes:', workflowNodes.length, 'edges:', workflowEdges.length);
    console.log('[TeamWorkflowEditor] Nodes:', workflowNodes);
    setNodes(workflowNodes);
    setEdges(workflowEdges);
  }, [currentTeam, library, removeAgentFromWorkflow, setNodes, setEdges, handleNodeClick]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      updateAgentPosition(node.id, node.position);
    },
    [updateAgentPosition]
  );

  const handleAddAgent = (agentId: string) => {
    console.log('[TeamWorkflowEditor] handleAddAgent called:', agentId);
    console.log('[TeamWorkflowEditor] Current nodes.length:', nodes.length);
    console.log('[TeamWorkflowEditor] Current workflow length:', workflow.length);

    // Calculate position for new node with better spacing
    // Node dimensions: min-w-[200px] max-w-[250px], height ~120px
    const NODE_WIDTH = 280;  // Width + margin
    const NODE_HEIGHT = 180; // Height + margin
    const NODES_PER_ROW = 4; // Max nodes per row before wrapping
    const START_X = 100;
    const START_Y = 100;

    const index = workflow.length;
    const row = Math.floor(index / NODES_PER_ROW);
    const col = index % NODES_PER_ROW;

    const x = START_X + col * NODE_WIDTH;
    const y = START_Y + row * NODE_HEIGHT;

    console.log('[TeamWorkflowEditor] Calculated position:', { x, y, row, col });

    addAgentToWorkflow(agentId, { x, y });
  };

  const handleSave = async () => {
    if (!projectPath || !currentTeam) return;

    // Update team name and description
    const updatedTeam: Team = {
      ...currentTeam,
      name: teamName || currentTeam.name,
      description: teamDescription || currentTeam.description,
    };

    try {
      await saveTeam(projectPath, updatedTeam);
      alert("Team saved successfully!");
    } catch (error) {
      console.error("Failed to save team:", error);
      alert("Failed to save team");
    }
  };

  const handleDeploy = async () => {
    if (!projectPath || !currentTeam) return;

    try {
      const message = await deployTeam(projectPath, currentTeam, library);
      alert(message);
    } catch (error) {
      console.error("Failed to deploy team:", error);
      alert("Failed to deploy team");
    }
  };

  const handleViewConfig = () => {
    setIsConfigPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <TeamActionBar
        teamName={teamName}
        teamDescription={teamDescription}
        onTeamNameChange={setTeamName}
        onTeamDescriptionChange={setTeamDescription}
        onSave={handleSave}
        onDeploy={handleDeploy}
        onViewConfig={handleViewConfig}
        onCancel={onClose}
      />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1" style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        <AgentSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onAddAgent={handleAddAgent}
          deployedAgents={deployedAgents}
        />
      </div>

      <ConfigPreviewDialog
        isOpen={isConfigPreviewOpen}
        onClose={() => setIsConfigPreviewOpen(false)}
        team={currentTeam}
      />

      {selectedAgentForDetails && (
        <AgentDetailsDialog
          agent={selectedAgentForDetails}
          onClose={() => setSelectedAgentForDetails(null)}
        />
      )}
    </div>
  );
}
