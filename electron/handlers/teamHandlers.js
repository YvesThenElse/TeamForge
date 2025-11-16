import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

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

  // Deploy a team as a skill (create .claude/skills/team-name/SKILL.md)
  ipcMain.handle('team:deploy', async (event, { projectPath, team, agentLibrary }) => {
    try {
      // Create skill ID from team name (lowercase, hyphens only)
      const skillId = team.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const skillsDir = path.join(projectPath, '.claude', 'skills');
      const skillPath = path.join(skillsDir, skillId);
      const skillFilePath = path.join(skillPath, 'SKILL.md');

      // Create skill directory
      await fs.mkdir(skillPath, { recursive: true });

      // Sort workflow by order
      const sortedWorkflow = [...team.workflow].sort((a, b) => a.order - b.order);

      // Build workflow description
      let workflowDescription = `This skill coordinates a team of ${sortedWorkflow.length} specialized agents working in sequence:\n\n`;

      sortedWorkflow.forEach((node, index) => {
        const agent = agentLibrary.find((a) => a.id === node.agentId);
        if (agent) {
          workflowDescription += `${index + 1}. **${agent.name}**: ${agent.description}\n`;
        }
      });

      // Build detailed instructions
      let instructions = `# ${team.name}\n\n`;
      instructions += `${team.description || 'Team workflow for coordinating multiple agents.'}\n\n`;
      instructions += `## Team Workflow\n\n`;
      instructions += workflowDescription;
      instructions += `\n## How to Use This Team\n\n`;
      instructions += `This team workflow should be used when the task requires the coordinated effort of multiple specialized agents. `;
      instructions += `Each agent in the sequence builds upon the work of the previous agent, creating a comprehensive solution.\n\n`;

      if (team.chainingEnabled) {
        instructions += `## Workflow Execution\n\n`;
        instructions += `The agents should be invoked in the following order:\n\n`;

        sortedWorkflow.forEach((node, index) => {
          const agent = agentLibrary.find((a) => a.id === node.agentId);
          if (agent) {
            instructions += `### Step ${index + 1}: ${agent.name}\n\n`;
            instructions += `**Role**: ${agent.description}\n\n`;

            if (index < sortedWorkflow.length - 1) {
              const nextAgent = agentLibrary.find((a) => a.id === sortedWorkflow[index + 1].agentId);
              instructions += `**Next Step**: After completing this step, hand off to ${nextAgent.name}.\n\n`;
            } else {
              instructions += `**Final Step**: This is the final agent in the workflow. Complete the task and present the final results.\n\n`;
            }
          }
        });
      }

      instructions += `## Agent Details\n\n`;
      sortedWorkflow.forEach((node) => {
        const agent = agentLibrary.find((a) => a.id === node.agentId);
        if (agent) {
          instructions += `### ${agent.name}\n\n`;
          instructions += `- **ID**: ${agent.id}\n`;
          instructions += `- **Category**: ${agent.category}\n`;
          instructions += `- **Tools**: ${Array.isArray(agent.tools) ? agent.tools.join(', ') : agent.tools}\n`;
          instructions += `- **Model**: ${agent.model || 'sonnet'}\n\n`;
        }
      });

      // Create frontmatter
      const frontmatter = {
        name: team.name,
        description: `Team workflow: ${team.description || 'Coordinated agent workflow'}`,
      };

      // Format skill file
      const yamlContent = yaml.dump(frontmatter, { lineWidth: -1 });
      const skillContent = `---\n${yamlContent}---\n\n${instructions}`;

      // Write skill file
      await fs.writeFile(skillFilePath, skillContent, 'utf-8');

      return `Team deployed as skill: ${skillId}\nLocation: .claude/skills/${skillId}/SKILL.md`;
    } catch (error) {
      throw new Error(`Failed to deploy team: ${error.message}`);
    }
  });
}
