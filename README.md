# TeamForge

Interface visuelle pour configurer et déployer des équipes d'agents IA sur vos projets git.

Application desktop multi-plateforme construite avec Electron et React. Gérez vos équipes d'agents IA, analysez automatiquement vos projets, et générez des configurations prêtes à l'emploi pour Claude Code, Gemini CLI et Cline.

## Concept TEAMS : Configurations d'Équipes Réutilisables

### Pourquoi les TEAMS ?

Le concept central de TeamForge repose sur les **TEAMS** : des configurations d'équipes complètes et réutilisables qui regroupent tous les éléments nécessaires pour un contexte de travail spécifique.

Une TEAM peut contenir :
- **Agents** : Spécialistes IA avec des compétences ciblées (frontend, backend, testing, etc.)
- **Skills** : Commandes slash personnalisées (`/commit`, `/review`, `/test`, etc.)
- **Hooks** : Automatisations déclenchées avant/après les actions de l'IA
- **MCP Servers** : Extensions de contexte (accès base de données, API, fichiers, etc.)
- **Sécurité** : Permissions et restrictions sur les outils et commandes

### Avantages des TEAMS

**Standardisation d'entreprise**
- Définissez des configurations approuvées par votre équipe technique
- Garantissez que tous les développeurs utilisent les mêmes pratiques IA
- Centralisez les bonnes pratiques dans des templates réutilisables

**Déploiement instantané**
- Passez d'un contexte à l'autre en un clic (frontend, backend, DevOps, etc.)
- Configurez un nouveau projet en quelques secondes
- Évitez les configurations manuelles répétitives

**Cohérence entre projets**
- Réutilisez les mêmes équipes sur tous vos projets
- Maintenez une approche uniforme de l'assistance IA
- Partagez vos configurations avec votre équipe

**Séparation des responsabilités**
- Les architectes définissent les TEAMS
- Les développeurs les utilisent sans configuration
- Les configurations évoluent indépendamment des projets

**Sécurité intégrée**
- Contrôlez précisément les permissions par TEAM
- Limitez les commandes autorisées selon le contexte
- Auditez et validez les configurations avant déploiement

## Fonctionnalités

### Gestion des Agents
- **80+ agents pré-configurés** organisés par catégorie :
  - Langages (TypeScript, Python, Go, Rust, C#, Java, etc.)
  - Frontend (React, Vue, Angular, Svelte, Next.js, etc.)
  - Backend (Node.js, Django, FastAPI, Spring Boot, NestJS, etc.)
  - Base de données (SQL, MongoDB, PostgreSQL, Redis, Prisma)
  - DevOps (Docker, Kubernetes, Terraform, CI/CD, Linux)
  - Cloud (AWS, Azure, GCP, Serverless)
  - Testing (Unit, E2E, Automation)
  - Architecture (DDD, TDD, BDD, Microservices)
  - Sécurité (Security Expert, Auth Expert)
  - Et bien plus...
- Création d'agents personnalisés
- Configuration du modèle par agent (Sonnet, Opus, Haiku)

### Gestion des Skills
- Commandes slash personnalisées
- Scripts et automatisations
- Templates de code réutilisables

### Gestion des Hooks
- Déclenchement sur PreToolUse / PostToolUse
- Logging automatique des commandes
- Validations personnalisées

### Gestion des MCP Servers
- Configuration des serveurs Model Context Protocol
- Intégration avec des sources de données externes
- Extension des capacités de l'IA

### Déploiement Multi-Systèmes
- **Claude Code** : `.claude/agents/`, `.claude/skills/`, `settings.local.json`
- **Gemini CLI** : `GEMINI.md`, `~/.gemini/`
- **Cline** : `.clinerules`, `.vscode/mcp.json`

### Sécurité et Permissions
- Configuration des commandes autorisées/bloquées
- Gestion des permissions par élément
- Validation avant déploiement

## Mode Développeur

Le **Mode Développeur** permet de travailler sur vos propres bibliothèques de templates en local, sans passer par la synchronisation git.

### Activation
1. Ouvrez les **Settings** dans l'application
2. Activez **Developer Mode** dans l'onglet Preferences

### Fonctionnement

En mode standard, TeamForge synchronise les templates depuis un repository git :
```
Repository Git → Cache local (.teamforge/cache/) → Utilisation
```

En mode développeur, TeamForge charge directement depuis un dossier local :
```
Dossier Dev Path → Utilisation directe (pas de cache)
```

### Configuration des chemins Dev

Pour chaque type de ressource, vous pouvez configurer un **Dev Path** :

| Ressource | Paramètre | Exemple |
|-----------|-----------|---------|
| Agents | `agentDevPath` | `C:\Dev\MyAgents` |
| Skills | `skillDevPath` | `C:\Dev\MySkills` |
| Hooks | `hookDevPath` | `C:\Dev\MyHooks` |
| MCP | `mcpDevPath` | `C:\Dev\MyMCPs` |
| Constitutions | `constitutionDevPath` | `C:\Dev\MyConstitutions` |

### Cas d'usage

- **Création de nouveaux agents** : Testez vos agents en temps réel
- **Personnalisation d'entreprise** : Développez une bibliothèque interne
- **Contribution open source** : Préparez des templates avant PR
- **Debug** : Isolez les problèmes de configuration

## Installation

### Prérequis

- Node.js 18+ et npm
- Git

### Installation

```bash
git clone https://github.com/YvesThenElse/TeamForge.git
cd TeamForge
npm install
```

### Développement

```bash
npm start                      # Démarre l'application en mode développement
```

### Build

```bash
npm run electron:build         # Build de production (plateforme courante)
npm run build:win              # Build Windows (NSIS)
npm run build:mac              # Build macOS (DMG)
npm run build:linux            # Build Linux (AppImage)
```

## Utilisation

1. **Sélectionner un Projet** - Choisissez un dossier local ou clonez depuis une URL Git
2. **Explorer les Ressources** - Parcourez les agents, skills, hooks et MCP disponibles
3. **Créer une TEAM** - Assemblez vos éléments dans une configuration d'équipe
4. **Configurer la Sécurité** - Définissez les permissions et restrictions
5. **Déployer** - Exportez vers Claude Code, Gemini CLI ou Cline

## Structure du Projet

```
TeamForge/
├── src/                  # Frontend React
│   ├── components/       # Composants UI
│   │   ├── agents/       # Gestion des agents
│   │   ├── skills/       # Gestion des skills
│   │   ├── hooks/        # Gestion des hooks
│   │   ├── mcp/          # Gestion des MCP servers
│   │   ├── teams/        # Éditeur de TEAMS
│   │   └── settings/     # Configuration
│   ├── stores/           # État Zustand
│   ├── services/         # Communication Electron IPC
│   └── types/            # Types TypeScript
├── electron/             # Backend Electron
│   ├── main.js           # Process principal
│   ├── preload.js        # Bridge IPC sécurisé
│   └── handlers/         # Handlers IPC
├── examples/             # Bibliothèque de templates
│   ├── agents/           # 80+ agents pré-configurés
│   ├── skills/           # Skills exemple
│   └── hooks/            # Hooks exemple
└── .teamforge/           # Configuration locale
    ├── settings.json     # Paramètres TeamForge
    └── cache/            # Cache des templates synchronisés
```

## Stack Technique

**Backend** : Electron 28, Node.js, simple-git, glob, js-yaml
**Frontend** : React 18, TypeScript, Zustand, Tailwind CSS, Radix UI

## Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre l'application en développement |
| `npm run electron:build` | Build de production |
| `npm run build:win` | Build installeur Windows |
| `npm run build:mac` | Build application macOS |
| `npm run build:linux` | Build application Linux |
| `npm run clean` | Supprime les artefacts de build |
| `npm run check:frontend` | Vérification TypeScript |

## Contribution

TeamForge utilise Claude Code pour son propre développement avec des agents spécialisés.

Workflow de contribution standard :
1. Forkez le repository
2. Créez une branche feature
3. Effectuez vos modifications
4. Lancez les vérifications (`npm run check:frontend`)
5. Soumettez une pull request

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
