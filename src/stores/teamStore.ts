import { create } from "zustand";
import { Team, TeamWorkflowNode } from "@/types/team";

interface DeployedTeam {
  teamId: string;
  teamName: string;
  deployedAt: string | null;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  deployedTeam: DeployedTeam | null;
  isLoading: boolean;

  // Actions
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  setDeployedTeam: (deployed: DeployedTeam | null) => void;
  createTeam: (name: string, description: string) => Team;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Workflow actions
  addAgentToWorkflow: (agentId: string, position: { x: number; y: number }) => void;
  removeAgentFromWorkflow: (agentId: string) => void;
  updateAgentPosition: (agentId: string, position: { x: number; y: number }) => void;
  reorderWorkflow: (agentOrder: string[]) => void;
  clearWorkflow: () => void;

  // Computed
  getTeamById: (teamId: string) => Team | undefined;
  getWorkflowAgents: () => TeamWorkflowNode[];
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  deployedTeam: null,
  isLoading: false,

  setTeams: (teams) => set({ teams }),

  setCurrentTeam: (team) => set({ currentTeam: team }),

  setDeployedTeam: (deployed) => set({ deployedTeam: deployed }),

  createTeam: (name, description) => {
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name,
      description,
      chainingEnabled: true, // Default enabled
      workflow: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      teams: [...state.teams, newTeam],
      currentTeam: newTeam,
    }));

    return newTeam;
  },

  updateTeam: (teamId, updates) =>
    set((state) => {
      const teams = state.teams.map((team) =>
        team.id === teamId
          ? { ...team, ...updates, updatedAt: new Date().toISOString() }
          : team
      );

      // Update currentTeam if it's the one being updated
      const currentTeam =
        state.currentTeam?.id === teamId
          ? teams.find((t) => t.id === teamId) || null
          : state.currentTeam;

      return { teams, currentTeam };
    }),

  deleteTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== teamId),
      currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  // Workflow actions
  addAgentToWorkflow: (agentId, position) =>
    set((state) => {
      console.log('[teamStore] addAgentToWorkflow called:', agentId, position);
      if (!state.currentTeam) {
        console.log('[teamStore] No currentTeam, returning');
        return state;
      }

      // Check if agent already exists
      if (state.currentTeam.workflow.some((node) => node.agentId === agentId)) {
        console.log('[teamStore] Agent already exists in workflow');
        return state;
      }

      const maxOrder = Math.max(
        0,
        ...state.currentTeam.workflow.map((node) => node.order)
      );

      const newNode: TeamWorkflowNode = {
        agentId,
        position,
        order: maxOrder + 1,
      };

      const updatedTeam: Team = {
        ...state.currentTeam,
        workflow: [...state.currentTeam.workflow, newNode],
        updatedAt: new Date().toISOString(),
      };

      console.log('[teamStore] Updated workflow:', updatedTeam.workflow);
      console.log('[teamStore] Workflow length:', updatedTeam.workflow.length);

      return {
        currentTeam: updatedTeam,
        teams: state.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
      };
    }),

  removeAgentFromWorkflow: (agentId) =>
    set((state) => {
      if (!state.currentTeam) return state;

      const updatedWorkflow = state.currentTeam.workflow.filter(
        (node) => node.agentId !== agentId
      );

      // Reorder remaining nodes
      const reorderedWorkflow = updatedWorkflow.map((node, index) => ({
        ...node,
        order: index + 1,
      }));

      const updatedTeam: Team = {
        ...state.currentTeam,
        workflow: reorderedWorkflow,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentTeam: updatedTeam,
        teams: state.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
      };
    }),

  updateAgentPosition: (agentId, position) =>
    set((state) => {
      if (!state.currentTeam) return state;

      const updatedWorkflow = state.currentTeam.workflow.map((node) =>
        node.agentId === agentId ? { ...node, position } : node
      );

      const updatedTeam: Team = {
        ...state.currentTeam,
        workflow: updatedWorkflow,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentTeam: updatedTeam,
        teams: state.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
      };
    }),

  reorderWorkflow: (agentOrder) =>
    set((state) => {
      if (!state.currentTeam) return state;

      const updatedWorkflow = state.currentTeam.workflow.map((node) => {
        const newOrder = agentOrder.indexOf(node.agentId);
        return {
          ...node,
          order: newOrder !== -1 ? newOrder + 1 : node.order,
        };
      });

      const updatedTeam: Team = {
        ...state.currentTeam,
        workflow: updatedWorkflow,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentTeam: updatedTeam,
        teams: state.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
      };
    }),

  clearWorkflow: () =>
    set((state) => {
      if (!state.currentTeam) return state;

      const updatedTeam: Team = {
        ...state.currentTeam,
        workflow: [],
        updatedAt: new Date().toISOString(),
      };

      return {
        currentTeam: updatedTeam,
        teams: state.teams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        ),
      };
    }),

  // Computed
  getTeamById: (teamId) => {
    const { teams } = get();
    return teams.find((team) => team.id === teamId);
  },

  getWorkflowAgents: () => {
    const { currentTeam } = get();
    if (!currentTeam) return [];
    return [...currentTeam.workflow].sort((a, b) => a.order - b.order);
  },
}));
