import { create } from "zustand";
import { TeamForgeConfig, TeamPreset, ValidationResult } from "@/types";

interface ConfigState {
  config: TeamForgeConfig | null;
  presets: TeamPreset[];
  selectedPreset: TeamPreset | null;
  validationResult: ValidationResult | null;
  isSaving: boolean;
  isDirty: boolean; // Has unsaved changes

  // Actions
  setConfig: (config: TeamForgeConfig | null) => void;
  updateConfig: (updates: Partial<TeamForgeConfig>) => void;
  setPresets: (presets: TeamPreset[]) => void;
  setSelectedPreset: (preset: TeamPreset | null) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  presets: [],
  selectedPreset: null,
  validationResult: null,
  isSaving: false,
  isDirty: false,

  setConfig: (config) => set({ config, isDirty: false }),

  updateConfig: (updates) =>
    set((state) => ({
      config: state.config ? { ...state.config, ...updates } : null,
      isDirty: true,
    })),

  setPresets: (presets) => set({ presets }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  setValidationResult: (result) => set({ validationResult: result }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),

  resetConfig: () =>
    set({
      config: null,
      selectedPreset: null,
      validationResult: null,
      isDirty: false,
    }),
}));
