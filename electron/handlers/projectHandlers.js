import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import toml from 'toml';

export function registerProjectHandlers(ipcMain) {
  ipcMain.handle('project:analyze', async (event, { path: projectPath }) => {
    try {
      const analysis = await analyzeProject(projectPath);
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  });
}

// ============================================================================
// Main Analysis Function
// ============================================================================

async function analyzeProject(projectPath) {
  let technologies = [];
  const fileCounts = {};
  let totalFiles = 0;

  // Check for manifest files and extract technologies
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fileExists(packageJsonPath)) {
    const techs = await parsePackageJson(packageJsonPath);
    technologies.push(...techs);
  }

  const requirementsPath = path.join(projectPath, 'requirements.txt');
  if (await fileExists(requirementsPath)) {
    const techs = await parseRequirementsTxt(requirementsPath);
    technologies.push(...techs);
  }

  const cargoPath = path.join(projectPath, 'Cargo.toml');
  if (await fileExists(cargoPath)) {
    const techs = await parseCargoToml(cargoPath);
    technologies.push(...techs);
  }

  const goModPath = path.join(projectPath, 'go.mod');
  if (await fileExists(goModPath)) {
    const techs = await parseGoMod(goModPath);
    technologies.push(...techs);
  }

  // Count file types (limit depth for performance)
  try {
    const files = await glob('**/*', {
      cwd: projectPath,
      nodir: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/target/**'],
      maxDepth: 5,
    });

    totalFiles = files.length;

    files.forEach((file) => {
      const ext = path.extname(file).slice(1); // Remove leading dot
      if (ext) {
        fileCounts[ext] = (fileCounts[ext] || 0) + 1;
      }
    });
  } catch (error) {
    console.error('Error counting files:', error);
  }

  // Detect project type
  const projectType = detectProjectType(technologies, fileCounts);

  // Suggest agents
  const suggestedAgents = suggestAgents(projectType, technologies);

  // Deduplicate technologies
  technologies = [...new Set(technologies)].sort();

  return {
    project_type: projectType,
    detected_technologies: technologies,
    file_counts: fileCounts,
    total_files: totalFiles,
    suggested_agents: suggestedAgents,
  };
}

// ============================================================================
// Parser Functions
// ============================================================================

async function parsePackageJson(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const pkg = JSON.parse(content);
  const technologies = [];

  const frameworkMap = {
    react: 'react',
    vue: 'vue',
    angular: 'angular',
    svelte: 'svelte',
    next: 'next',
    nuxt: 'nuxt',
    express: 'express',
    fastify: 'fastify',
    koa: 'koa',
    nest: 'nestjs',
    '@nestjs/core': 'nestjs',
    typescript: 'typescript',
    vite: 'vite',
    webpack: 'webpack',
    jest: 'jest',
    vitest: 'vitest',
    cypress: 'cypress',
    playwright: 'playwright',
    '@tauri-apps/cli': 'tauri',
    electron: 'electron',
  };

  // Extract from dependencies
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const dep in allDeps) {
    if (frameworkMap[dep]) {
      technologies.push(frameworkMap[dep]);
    }
  }

  // Detect Node.js
  if (pkg.scripts && (pkg.scripts.dev || pkg.scripts.start)) {
    technologies.push('node');
  }

  return technologies;
}

async function parseRequirementsTxt(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const technologies = ['python'];

  const frameworkKeywords = {
    django: 'django',
    flask: 'flask',
    fastapi: 'fastapi',
    tornado: 'tornado',
    pyramid: 'pyramid',
    pandas: 'pandas',
    numpy: 'numpy',
    tensorflow: 'tensorflow',
    pytorch: 'pytorch',
    'scikit-learn': 'sklearn',
  };

  const lines = content.split('\n');
  for (const line of lines) {
    const pkg = line.split('==')[0].trim().toLowerCase();
    for (const [keyword, framework] of Object.entries(frameworkKeywords)) {
      if (pkg.includes(keyword)) {
        technologies.push(framework);
      }
    }
  }

  return technologies;
}

async function parseCargoToml(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const cargo = toml.parse(content);
  const technologies = ['rust'];

  const frameworkKeywords = {
    'actix-web': 'actix',
    rocket: 'rocket',
    axum: 'axum',
    warp: 'warp',
    tokio: 'tokio',
    'async-std': 'async-std',
    tauri: 'tauri',
  };

  if (cargo.dependencies) {
    for (const [keyword, framework] of Object.entries(frameworkKeywords)) {
      if (cargo.dependencies[keyword]) {
        technologies.push(framework);
      }
    }
  }

  return technologies;
}

async function parseGoMod(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const technologies = ['go'];

  const frameworkKeywords = {
    'gin-gonic/gin': 'gin',
    'gofiber/fiber': 'fiber',
    'labstack/echo': 'echo',
    'gorilla/mux': 'gorilla',
  };

  const lines = content.split('\n');
  for (const line of lines) {
    for (const [keyword, framework] of Object.entries(frameworkKeywords)) {
      if (line.includes(keyword)) {
        technologies.push(framework);
      }
    }
  }

  return technologies;
}

// ============================================================================
// Project Type Detection
// ============================================================================

function detectProjectType(technologies, fileCounts) {
  const hasFrontend = technologies.some((t) =>
    ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'].includes(t)
  );

  const hasBackend = technologies.some((t) =>
    ['express', 'fastify', 'koa', 'nestjs', 'django', 'flask', 'fastapi', 'actix', 'rocket'].includes(t)
  );

  const hasMobile =
    technologies.some((t) => ['react-native', 'flutter'].includes(t)) ||
    fileCounts.swift > 0 ||
    fileCounts.kotlin > 0;

  const hasDesktop = technologies.some((t) => ['tauri', 'electron'].includes(t));

  if (hasFrontend && hasBackend) return 'WebFullstack';
  if (hasBackend && !hasMobile && !hasDesktop) return 'BackendApi';
  if (hasFrontend && !hasBackend && !hasMobile && !hasDesktop) return 'Frontend';
  if (hasMobile) return 'Mobile';
  if (hasDesktop) return 'Desktop';

  // Check if library
  const totalFiles = Object.values(fileCounts).reduce((sum, count) => sum + count, 0);
  if (totalFiles < 10) return 'Library';

  return 'Unknown';
}

// ============================================================================
// Agent Suggestion
// ============================================================================

function suggestAgents(projectType, technologies) {
  const agents = new Set();

  // Core agents for all projects
  agents.add('code-reviewer');
  agents.add('test-engineer');

  // Type-specific agents
  switch (projectType) {
    case 'WebFullstack':
      agents.add('fullstack-developer');
      agents.add('api-designer');
      agents.add('frontend-developer');
      agents.add('backend-developer');
      break;
    case 'BackendApi':
      agents.add('backend-developer');
      agents.add('api-designer');
      agents.add('database-designer');
      break;
    case 'Frontend':
      agents.add('frontend-developer');
      agents.add('ux-designer');
      break;
    case 'Mobile':
      agents.add('mobile-developer');
      agents.add('ux-designer');
      break;
    case 'Desktop':
      agents.add('frontend-developer');
      agents.add('backend-developer');
      break;
    case 'Library':
      agents.add('tech-writer');
      agents.add('api-documenter');
      break;
    default:
      agents.add('fullstack-developer');
  }

  // Technology-specific agents
  if (technologies.some((t) => t.includes('docker'))) {
    agents.add('docker-specialist');
  }

  if (technologies.some((t) => ['postgres', 'mysql', 'mongodb'].includes(t))) {
    agents.add('database-designer');
  }

  if (technologies.some((t) => ['jest', 'vitest', 'pytest', 'cypress', 'playwright'].includes(t))) {
    agents.add('e2e-tester');
  }

  return Array.from(agents).sort();
}

// ============================================================================
// Utilities
// ============================================================================

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
