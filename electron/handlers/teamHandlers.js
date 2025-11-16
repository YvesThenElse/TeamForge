import fs from 'fs/promises';
import path from 'path';

export function registerTeamHandlers(ipcMain) {
  // List all teams
  ipcMain.handle('team:list', async (event, { projectPath }) => {
    try {
      const teamsDir = path.join(projectPath, '.teamforge', 'teams');

      // Create teams directory if it doesn't exist
      try {
        await fs.mkdir(teamsDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      // Read all JSON files in teams directory
      const files = await fs.readdir(teamsDir);
      const teamFiles = files.filter((file) => file.endsWith('.json'));

      const teams = await Promise.all(
        teamFiles.map(async (file) => {
          const filePath = path.join(teamsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content);
        })
      );

      return teams;
    } catch (error) {
      throw new Error(`Failed to list teams: ${error.message}`);
    }
  });

  // Load a specific team
  ipcMain.handle('team:load', async (event, { projectPath, teamId }) => {
    try {
      const teamPath = path.join(
        projectPath,
        '.teamforge',
        'teams',
        `${teamId}.json`
      );
      const content = await fs.readFile(teamPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load team: ${error.message}`);
    }
  });

  // Save a team
  ipcMain.handle('team:save', async (event, { projectPath, team }) => {
    try {
      const teamsDir = path.join(projectPath, '.teamforge', 'teams');

      // Create teams directory if it doesn't exist
      await fs.mkdir(teamsDir, { recursive: true });

      const teamPath = path.join(teamsDir, `${team.id}.json`);
      const content = JSON.stringify(team, null, 2);

      await fs.writeFile(teamPath, content, 'utf-8');

      return 'Team saved successfully';
    } catch (error) {
      throw new Error(`Failed to save team: ${error.message}`);
    }
  });

  // Delete a team
  ipcMain.handle('team:delete', async (event, { projectPath, teamId }) => {
    try {
      const teamPath = path.join(
        projectPath,
        '.teamforge',
        'teams',
        `${teamId}.json`
      );

      await fs.unlink(teamPath);

      return 'Team deleted successfully';
    } catch (error) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  });

  // Deploy a team (generate agent files with chaining)
  ipcMain.handle('team:deploy', async (event, { projectPath, team, agentLibrary }) => {
    try {
      const agentsDir = path.join(projectPath, '.claude', 'agents');

      // Create agents directory if it doesn't exist
      await fs.mkdir(agentsDir, { recursive: true });

      // Sort workflow by order
      const sortedWorkflow = [...team.workflow].sort((a, b) => a.order - b.order);

      // Generate agent files with chaining instructions
      for (let i = 0; i < sortedWorkflow.length; i++) {
        const node = sortedWorkflow[i];
        const agent = agentLibrary.find((a) => a.id === node.agentId);

        if (!agent) continue;

        let content = agent.template;

        // Add chaining instructions if enabled
        if (team.chainingEnabled && i < sortedWorkflow.length - 1) {
          const nextNode = sortedWorkflow[i + 1];
          const nextAgent = agentLibrary.find((a) => a.id === nextNode.agentId);

          if (nextAgent) {
            content += `\n\n## Workflow Chaining\n\n`;
            content += `After completing your task, hand off to the next agent: **${nextAgent.name}**\n`;
            content += `\nNext agent's role: ${nextAgent.description}\n`;
          }
        }

        // Write agent file
        const agentPath = path.join(agentsDir, `${agent.id}.md`);
        await fs.writeFile(agentPath, content, 'utf-8');
      }

      return `Deployed ${sortedWorkflow.length} agents successfully`;
    } catch (error) {
      throw new Error(`Failed to deploy team: ${error.message}`);
    }
  });
}
