# TeamForge

Visual interface to configure Claude Code sub-agents for git projects.

Cross-platform desktop application built with Tauri 2.0 and React. Manage AI agent teams, analyze projects automatically, and generate ready-to-use Claude Code configurations.

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
- Rust 1.70+ and cargo
- Git

#### Windows Setup

Install C++ build tools (required for Tauri):

**Option 1: Visual Studio Build Tools (Recommended)**
```bash
# 1. Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
# 2. Install: Desktop development with C++, Windows SDK, MSVC build tools
# 3. Configure Rust:
rustup default stable-msvc
```

**Option 2: MinGW-w64**
```bash
# 1. Download from https://www.mingw-w64.org/downloads/
# 2. Add bin/ to PATH
# 3. Configure Rust:
rustup default stable-gnu
```

### Installation

```bash
git clone https://github.com/yourusername/teamforge.git
cd teamforge
npm install
```

### Development

```bash
npm start
```

### Build

```bash
npm run tauri:build
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
│   └── types/            # TypeScript types
├── src-tauri/            # Rust backend
│   ├── commands/         # Tauri commands
│   ├── services/         # Business logic
│   ├── models/           # Data structures
│   └── embedded/         # Agent library
└── .claude/agents/       # TeamForge self-development agents
```

## Technology Stack

**Backend**: Tauri 2.0, Rust, git2, serde
**Frontend**: React 18, TypeScript, Zustand, Tailwind CSS, Radix UI

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run tauri:build` | Build production app |
| `npm run clean` | Remove build artifacts |
| `npm run check:frontend` | TypeScript type check |
| `npm run check:backend` | Rust cargo check |

## Contributing

TeamForge uses Claude Code for its own development with 5 specialized agents:
- `fullstack-developer` - General development
- `rust-specialist` - Backend development
- `react-specialist` - Frontend development
- `code-reviewer` - Code reviews
- `tech-writer` - Documentation

Standard contribution workflow:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run checks
5. Submit pull request

## Troubleshooting

**Build errors on Windows**: Install Visual Studio Build Tools (see Prerequisites)

**Rust not found**: Install from https://rustup.rs/

**dlltool.exe error**: Configure MSVC toolchain with `rustup default stable-msvc`

## License

MIT
