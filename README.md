# TeamForge

Visual interface to configure and deploy AI agent teams on your git projects.

Cross-platform desktop application built with Electron and React. Manage your AI agent teams, automatically analyze your projects, and generate ready-to-use configurations for Claude Code, Gemini CLI, and Cline.

## TEAMS Concept: Reusable Team Configurations

### Why TEAMS?

The core concept of TeamForge relies on **TEAMS**: complete and reusable team configurations that bundle all necessary elements for a specific work context.

A TEAM can contain:
- **Agents**: AI specialists with targeted skills (frontend, backend, testing, etc.)
- **Skills**: Custom slash commands (`/commit`, `/review`, `/test`, etc.)
- **Hooks**: Automations triggered before/after AI actions
- **MCP Servers**: Context extensions (database access, API, files, etc.)
- **Security**: Permissions and restrictions on tools and commands

### Benefits of TEAMS

**Enterprise Standardization**
- Define configurations approved by your technical team
- Ensure all developers use the same AI practices
- Centralize best practices in reusable templates

**Instant Deployment**
- Switch contexts with one click (frontend, backend, DevOps, etc.)
- Configure a new project in seconds
- Avoid repetitive manual configurations

**Cross-Project Consistency**
- Reuse the same teams across all your projects
- Maintain a uniform approach to AI assistance
- Share your configurations with your team

**Separation of Responsibilities**
- Architects define TEAMS
- Developers use them without configuration
- Configurations evolve independently from projects

**Built-in Security**
- Precisely control permissions per TEAM
- Limit authorized commands based on context
- Audit and validate configurations before deployment

## Features

### Agent Management
- **80+ pre-configured agents** organized by category:
  - Languages (TypeScript, Python, Go, Rust, C#, Java, etc.)
  - Frontend (React, Vue, Angular, Svelte, Next.js, etc.)
  - Backend (Node.js, Django, FastAPI, Spring Boot, NestJS, etc.)
  - Database (SQL, MongoDB, PostgreSQL, Redis, Prisma)
  - DevOps (Docker, Kubernetes, Terraform, CI/CD, Linux)
  - Cloud (AWS, Azure, GCP, Serverless)
  - Testing (Unit, E2E, Automation)
  - Architecture (DDD, TDD, BDD, Microservices)
  - Security (Security Expert, Auth Expert)
  - And much more...
- Custom agent creation
- Per-agent model configuration (Sonnet, Opus, Haiku)

### Skills Management
- Custom slash commands
- Scripts and automations
- Reusable code templates

### Hooks Management
- PreToolUse / PostToolUse triggers
- Automatic command logging
- Custom validations

### MCP Server Management
- Model Context Protocol server configuration
- Integration with external data sources
- AI capability extensions

### Multi-System Deployment
- **Claude Code**: `.claude/agents/`, `.claude/skills/`, `settings.local.json`
- **Gemini CLI**: `GEMINI.md`, `~/.gemini/`
- **Cline**: `.clinerules`, `.vscode/mcp.json`

### Security and Permissions
- Allowed/blocked command configuration
- Per-element permission management
- Pre-deployment validation

## Developer Mode

**Developer Mode** allows you to work on your own local template libraries without going through git synchronization.

### Activation
1. Open **Settings** in the application
2. Enable **Developer Mode** in the Preferences tab

### How It Works

In standard mode, TeamForge syncs templates from a git repository:
```
Git Repository -> Local cache (.teamforge/cache/) -> Usage
```

In developer mode, TeamForge loads directly from a local folder:
```
Dev Path Folder -> Direct usage (no cache)
```

### Dev Path Configuration

For each resource type, you can configure a **Dev Path**:

| Resource | Parameter | Example |
|----------|-----------|---------|
| Agents | `agentDevPath` | `C:\Dev\MyAgents` |
| Skills | `skillDevPath` | `C:\Dev\MySkills` |
| Hooks | `hookDevPath` | `C:\Dev\MyHooks` |
| MCP | `mcpDevPath` | `C:\Dev\MyMCPs` |
| Constitutions | `constitutionDevPath` | `C:\Dev\MyConstitutions` |

### Use Cases

- **Creating new agents**: Test your agents in real-time
- **Enterprise customization**: Develop an internal library
- **Open source contribution**: Prepare templates before PR
- **Debug**: Isolate configuration issues

## Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
git clone https://github.com/YvesThenElse/TeamForge.git
cd TeamForge
npm install
```

### Development

```bash
npm start                      # Start the application in development mode
```

### Build

```bash
npm run electron:build         # Production build (current platform)
npm run build:win              # Windows build (NSIS)
npm run build:mac              # macOS build (DMG)
npm run build:linux            # Linux build (AppImage)
```

## Usage

1. **Select a Project** - Choose a local folder or clone from a Git URL
2. **Explore Resources** - Browse available agents, skills, hooks, and MCPs
3. **Create a TEAM** - Assemble your elements into a team configuration
4. **Configure Security** - Define permissions and restrictions
5. **Deploy** - Export to Claude Code, Gemini CLI, or Cline

## Project Structure

```
TeamForge/
├── src/                  # React Frontend
│   ├── components/       # UI Components
│   │   ├── agents/       # Agent management
│   │   ├── skills/       # Skills management
│   │   ├── hooks/        # Hooks management
│   │   ├── mcp/          # MCP server management
│   │   ├── teams/        # TEAMS editor
│   │   └── settings/     # Configuration
│   ├── stores/           # Zustand state
│   ├── services/         # Electron IPC communication
│   └── types/            # TypeScript types
├── electron/             # Electron Backend
│   ├── main.js           # Main process
│   ├── preload.js        # Secure IPC bridge
│   └── handlers/         # IPC handlers
├── examples/             # Template library
│   ├── agents/           # 80+ pre-configured agents
│   ├── skills/           # Example skills
│   └── hooks/            # Example hooks
└── .teamforge/           # Local configuration
    ├── settings.json     # TeamForge settings
    └── cache/            # Synced template cache
```

## Tech Stack

**Backend**: Electron 28, Node.js, simple-git, glob, js-yaml
**Frontend**: React 18, TypeScript, Zustand, Tailwind CSS, Radix UI

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the application in development |
| `npm run electron:build` | Production build |
| `npm run build:win` | Build Windows installer |
| `npm run build:mac` | Build macOS application |
| `npm run build:linux` | Build Linux application |
| `npm run clean` | Remove build artifacts |
| `npm run check:frontend` | TypeScript verification |

## Contributing

TeamForge uses Claude Code for its own development with specialized agents.

Standard contribution workflow:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run verifications (`npm run check:frontend`)
5. Submit a pull request

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3).

TeamForge
Copyright (C) 2025

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
