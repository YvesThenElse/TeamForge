# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TeamForge is a cross-platform desktop application built with Electron and React that provides a visual interface to configure Claude Code sub-agents for git projects. It allows users to manage AI agent teams, analyze projects automatically, and generate ready-to-use Claude Code configurations.

## Development Commands

### Setup and Installation
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm start                      # Start Electron dev server (runs Vite + Electron)
npm run dev                    # Start Vite dev server only (frontend)
```

### Type Checking
```bash
npm run check:frontend         # TypeScript type check (tsc --noEmit)
```

### Building
```bash
npm run electron:build         # Build production Electron application
npm run build                  # Build frontend only (tsc && vite build)
```

### Cleaning
```bash
npm run clean                  # Remove node_modules, dist, and build
npm run clean:install          # Clean and reinstall dependencies
```

## Architecture Overview

### Backend (Node.js/Electron)

**Main Process (`electron/main.js`):**
- Application entry point and window management
- Registers all IPC handlers for communication with renderer
- Handles application lifecycle events

**Layer Structure:**
- **Handlers** (`electron/handlers/`) - IPC handlers exposed to frontend
  - `gitHandlers.js` - Git operations (clone, status, commit) via simple-git
  - `projectHandlers.js` - Project analysis (detect technologies, count files)
  - `agentHandlers.js` - Agent library operations (get, search, generate)
  - `configHandlers.js` - TeamForge config management (.teamforge/config.json)

- **Preload Script** (`electron/preload.js`) - Secure IPC bridge
  - Exposes safe API to renderer via contextBridge
  - Prevents direct access to Node.js/Electron internals

**Key Handler Functions:**
- **Git**: Uses `simple-git` library for all git operations
- **Project Analysis**: Uses `glob`, `js-yaml`, and `toml` for file scanning and manifest parsing
- **Agent Library**: Loads embedded `agents/library.json` with 30+ pre-built agents
- **Config**: Manages `.teamforge/config.json` and `.claude/agents/` directory

**Embedded Resources:**
- `electron/handlers/agents/library.json` - 30+ pre-built agent templates
- Agents have: id, name, description, tags, category, template content, suggested_for technologies

### Frontend (React/TypeScript)

**State Management (Zustand):**
- `agentStore.ts` - Agent library, selection, filtering, and workflow ordering
- `configStore.ts` - TeamForge configuration state
- `projectStore.ts` - Project path, analysis results, git status

**Electron Integration:**
- All backend commands accessed via `src/services/electron.ts`
- Uses `window.electronAPI` exposed by preload script
- Type-safe wrappers around Electron IPC
- Groups commands by category (git, project, agent, config)

**Key Components:**
- `ProjectSelector` - Project selection (folder picker or git clone)
- `AgentWorkflow` - Agent ordering and workflow management
- Main layout uses Sidebar for navigation

**Path Alias:**
- `@/*` resolves to `./src/*` (configured in tsconfig.json and vite.config.ts)

### Data Flow

1. User selects project → Frontend calls `analyzeProject()` → Backend parses manifest files and counts file types
2. Frontend loads agent library → `getAgentLibrary()` → Backend returns embedded agents from JSON
3. User selects agents → Frontend stores in `agentStore` with optional ordering
4. User generates config → Frontend calls `saveTeamforgeConfig()` → Backend writes to `.teamforge/config.json`
5. User generates agent files → `generateAgentFile()` per agent → Backend writes to `.claude/agents/*.md`

### Configuration Files

**TeamForge Config** (`.teamforge/config.json`):
- Stores: project metadata, selected agents, workflow order, custom agent instructions
- Generated and validated by config handlers

**Agent Files** (`.claude/agents/*.md`):
- Generated from agent templates in embedded library
- Can include custom instructions per agent

## Technology Stack

**Backend:**
- Electron 28.x, Node.js (ES Modules)
- Dependencies: simple-git (git ops), js-yaml (YAML parsing), toml (TOML parsing), glob (file matching)

**Frontend:**
- React 18, TypeScript 5.3
- Zustand (state management)
- Tailwind CSS + Radix UI (styling/components)
- Vite (bundler), Monaco Editor (code editing)

**Build & Distribution:**
- Electron Builder for packaging
- Supports Windows (NSIS), macOS (DMG), Linux (AppImage)

## Development Notes

**No Native Dependencies:**
- Pure JavaScript/TypeScript stack - no Rust, no C++ build tools required
- Much simpler setup compared to previous Tauri version

**Hot Reload:**
- Vite provides fast HMR for frontend
- Electron automatically reloads on main process changes

**Debugging:**
- Chrome DevTools available in development mode
- Console logs from main process appear in terminal
- Renderer process logs in DevTools console

## Project-Specific Agents

This repository can use 5 specialized Claude Code agents for self-development (defined in `.claude/agents/`):
- `fullstack-developer` - General development tasks
- `frontend-developer` - React frontend and TypeScript
- `backend-developer` - Node.js backend and Electron main process
- `code-reviewer` - Code quality and best practices
- `tech-writer` - Documentation updates
