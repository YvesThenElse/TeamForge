# TeamForge

Visual interface to configure Claude Code sub-agents for git projects.

Cross-platform desktop application built with Electron and React. Manage AI agent teams, analyze projects automatically, and generate ready-to-use Claude Code configurations.

## Features

- Smart project analysis (auto-detect technologies and project type)
- 30+ pre-built agents (development, testing, documentation, DevOps)
- Agent workflow management (sequential ordering)
- Git integration (clone repositories, create commits)
- Configuration validation
- Cross-platform support (Windows, macOS, Linux)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
git clone https://github.com/yourusername/teamforge.git
cd teamforge
npm install
```

### Development

```bash
npm start                      # Start Electron app in development mode
```

### Build

```bash
npm run electron:build         # Build production application
```

## Usage

1. **Select Project** - Choose local folder or clone from Git URL
2. **Analyze** - Auto-detect project type and technologies
3. **Choose Agents** - Select from 30+ pre-built agents or create custom ones
4. **Configure Workflow** - Define sequential execution order (optional)
5. **Generate** - Export to `.claude/agents/` and `.teamforge/config.json`

## Project Structure

```
TeamForge/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Zustand state
│   ├── services/         # Electron IPC wrappers
│   └── types/            # TypeScript types
├── electron/             # Electron backend
│   ├── main.js           # Main process entry
│   ├── preload.js        # Secure IPC bridge
│   └── handlers/         # IPC handlers (git, project, agent, config)
│       └── agents/       # Embedded agent library
└── .claude/agents/       # TeamForge self-development agents
```

## Technology Stack

**Backend**: Electron 28, Node.js, simple-git, glob, js-yaml, toml
**Frontend**: React 18, TypeScript, Zustand, Tailwind CSS, Radix UI

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Electron app in development |
| `npm run electron:build` | Build production app |
| `npm run clean` | Remove build artifacts |
| `npm run check:frontend` | TypeScript type check |

## Contributing

TeamForge uses Claude Code for its own development with 5 specialized agents:
- `fullstack-developer` - General development
- `frontend-developer` - React frontend
- `backend-developer` - Node.js/Electron backend
- `code-reviewer` - Code reviews
- `tech-writer` - Documentation

Standard contribution workflow:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run checks (`npm run check:frontend`)
5. Submit pull request

## Development Benefits

**Simpler Setup:**
- No Rust toolchain required
- No C++ build tools needed
- Pure JavaScript/TypeScript stack

**Faster Development:**
- Hot reload with Vite
- Chrome DevTools for debugging
- No Rust compilation time

**Easier Distribution:**
- Electron Builder handles packaging
- Supports Windows, macOS, Linux

## License

MIT
