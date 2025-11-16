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
import { shallow } from "zustand/shallow";
import { AgentNode } from "./AgentNode";
import { AgentSidebar } from "./AgentSidebar";
import { TeamActionBar } from "./TeamActionBar";
import { ConfigPreviewDialog } from "./ConfigPreviewDialog";
import { useTeamStore } from "@/stores/teamStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAgentStore } from "@/stores/agentStore";
import { saveTeam, deployTeam } from "@/services/electron";
import type { Team } from "@/types/team";

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
};

interface TeamWorkflowEditorProps {
  team: Team | null;
  isNewTeam: boolean;
  onClose: () => void;
}

export function TeamWorkflowEditor({ onClose }: TeamWorkflowEditorProps) {
  // Subscribe to workflow array directly with shallow comparison
  const workflow = useTeamStore(
    (state) => state.currentTeam?.workflow || [],
    shallow
  );
  const currentTeam = useTeamStore((state) => state.currentTeam);
  const addAgentToWorkflow = useTeamStore((state) => state.addAgentToWorkflow);
  const removeAgentFromWorkflow = useTeamStore((state) => state.removeAgentFromWorkflow);
  const updateAgentPosition = useTeamStore((state) => state.updateAgentPosition);
  const projectPath = useProjectStore((state) => state.projectPath);
  const library = useAgentStore((state) => state.library);

  console.log('[TeamWorkflowEditor] Render - currentTeam:', currentTeam?.id, 'workflow length:', workflow.length);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfigPreviewOpen, setIsConfigPreviewOpen] = useState(false);
  const [teamName, setTeamName] = useState(currentTeam?.name || "");
  const [teamDescription, setTeamDescription] = useState(currentTeam?.description || "");

  const handleDeleteNode = useCallback((agentId: string) => {
    removeAgentFromWorkflow(agentId);
  }, [removeAgentFromWorkflow]);

  // Initialize nodes and edges from team workflow
  useEffect(() => {
    console.log('[TeamWorkflowEditor] useEffect triggered! workflow length:', workflow.length);

    if (!currentTeam) {
      console.log('[TeamWorkflowEditor] No currentTeam, clearing nodes/edges');
      setNodes([]);
      setEdges([]);
      return;
    }

    const workflowIds = workflow.map(n => n.agentId).join(',');
    console.log('[TeamWorkflowEditor] Workflow IDs:', workflowIds);

    const workflowNodes: Node[] = workflow.map((node) => {
      const agent = library.find((a) => a.id === node.agentId);
      console.log('[TeamWorkflowEditor] Creating node for agent:', node.agentId, agent?.name);
      return {
        id: node.agentId,
        type: "agentNode",
        position: node.position,
        data: {
          agent,
          order: node.order,
          onDelete: () => handleDeleteNode(node.agentId),
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
  }, [workflow, library, handleDeleteNode, setNodes, setEdges, currentTeam]);

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

    // Calculate position for new node
    const x = 100 + workflow.length * 250;
    const y = 100;
    console.log('[TeamWorkflowEditor] Calculated position:', { x, y });

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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
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
        />
      </div>

      <ConfigPreviewDialog
        isOpen={isConfigPreviewOpen}
        onClose={() => setIsConfigPreviewOpen(false)}
        team={currentTeam}
      />
    </div>
  );
}
