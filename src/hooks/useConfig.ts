import { useCallback } from "react";
import { useConfigStore } from "@/stores/configStore";
import * as tauri from "@/services/tauri";

export function useConfig() {
  const {
    config,
    presets,
    selectedPreset,
    validationResult,
    isSaving,
    isDirty,
    setConfig,
    updateConfig,
    setPresets,
    setSelectedPreset,
    setValidationResult,
    setIsSaving,
    resetConfig,
  } = useConfigStore();

  // Load TeamForge config from project
  const loadConfig = useCallback(
    async (projectPath: string) => {
      try {
        const loadedConfig = await tauri.loadTeamforgeConfig(projectPath);
        setConfig(loadedConfig);
        return loadedConfig;
      } catch (err) {
        console.error("Failed to load config:", err);
        throw err;
      }
    },
    [setConfig]
  );

  // Save TeamForge config
  const saveConfig = useCallback(
    async (projectPath: string) => {
      if (!config) {
        throw new Error("No config to save");
      }

      setIsSaving(true);
      try {
        await tauri.saveTeamforgeConfig(config, projectPath);
        setIsSaving(false);
        return true;
      } catch (err) {
        setIsSaving(false);
        console.error("Failed to save config:", err);
        throw err;
      }
    },
    [config, setIsSaving]
  );

  // Create default config
  const createDefaultConfig = useCallback(
    async (
      projectName: string,
      projectType: string,
      projectPath: string,
      technologies: string[]
    ) => {
      try {
        const newConfig = await tauri.createDefaultTeamforgeConfig(
          projectName,
          projectType,
          projectPath,
          technologies
        );
        setConfig(newConfig);
        return newConfig;
      } catch (err) {
        console.error("Failed to create default config:", err);
        throw err;
      }
    },
    [setConfig]
  );

  // Validate config
  const validateConfig = useCallback(async () => {
    if (!config) {
      return;
    }

    try {
      const warnings = await tauri.validateTeamforgeConfig(config);
      setValidationResult({
        valid: warnings.length === 0,
        errors: [],
        warnings: warnings.map((w) => ({
          field: "config",
          message: w,
        })),
      });
    } catch (err) {
      console.error("Failed to validate config:", err);
    }
  }, [config, setValidationResult]);

  // Check if TeamForge exists in project
  const checkTeamforgeExists = useCallback(async (projectPath: string) => {
    try {
      return await tauri.teamforgeExists(projectPath);
    } catch (err) {
      console.error("Failed to check TeamForge existence:", err);
      return false;
    }
  }, []);

  // Initialize TeamForge structure
  const initializeTeamforge = useCallback(async (projectPath: string) => {
    try {
      return await tauri.initializeTeamforge(projectPath);
    } catch (err) {
      console.error("Failed to initialize TeamForge:", err);
      throw err;
    }
  }, []);

  // Ensure .claude/agents/ directory exists
  const ensureClaudeAgentsDir = useCallback(async (projectPath: string) => {
    try {
      return await tauri.ensureClaudeAgentsDir(projectPath);
    } catch (err) {
      console.error("Failed to ensure .claude/agents/ directory:", err);
      throw err;
    }
  }, []);

  return {
    // State
    config,
    presets,
    selectedPreset,
    validationResult,
    isSaving,
    isDirty,

    // Actions
    loadConfig,
    saveConfig,
    createDefaultConfig,
    validateConfig,
    updateConfig,
    setPresets,
    setSelectedPreset,
    checkTeamforgeExists,
    initializeTeamforge,
    ensureClaudeAgentsDir,
    resetConfig,
  };
}
