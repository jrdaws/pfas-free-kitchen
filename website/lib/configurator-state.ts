import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'beginner' | 'advanced';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Inspiration {
  id: string;
  type: 'image' | 'url' | 'figma';
  value: string;
  preview?: string;
}

export interface ConfiguratorState {
  // Step tracking
  currentStep: Step;
  completedSteps: Set<Step>;

  // Mode
  mode: Mode;

  // Step 1: Template
  template: string;

  // Step 2: Inspirations
  inspirations: Inspiration[];
  description: string;

  // Step 3: Project details
  projectName: string;
  outputDir: string;

  // Step 4: Integrations
  integrations: Record<string, string>;

  // Step 5: Environment keys (never persisted)
  envKeys: Record<string, string>;

  // Step 6: AI Preview
  previewHtml: string | null;
  previewComponents: { name: string; code: string }[];
  generationSeed: number | null;
  generationVersion: string | null;
  auditLog: { action: string; reasoning: string; timestamp: number }[];
  isGenerating: boolean;
  iterationHistory: string[];
  userApiKey: string;
  remainingDemoGenerations: number | null;

  // Step 7: Context
  vision: string;
  mission: string;
  successCriteria: string;

  // Actions
  setStep: (step: Step) => void;
  completeStep: (step: Step) => void;
  setMode: (mode: Mode) => void;
  setTemplate: (template: string) => void;
  addInspiration: (inspiration: Inspiration) => void;
  removeInspiration: (id: string) => void;
  setDescription: (description: string) => void;
  setProjectName: (name: string) => void;
  setOutputDir: (dir: string) => void;
  setIntegration: (type: string, provider: string) => void;
  setEnvKey: (key: string, value: string) => void;
  setPreview: (data: {
    html: string;
    components: { name: string; code: string }[];
    seed: number;
    version: string;
    auditLog: { action: string; reasoning: string; timestamp: number }[];
  }) => void;
  setGenerating: (isGenerating: boolean) => void;
  addIteration: (prompt: string) => void;
  setUserApiKey: (key: string) => void;
  setRemainingDemoGenerations: (count: number | null) => void;
  setVision: (vision: string) => void;
  setMission: (mission: string) => void;
  setSuccessCriteria: (criteria: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1 as Step,
  completedSteps: new Set<Step>(),
  mode: 'beginner' as Mode,
  template: 'saas',
  inspirations: [],
  description: '',
  projectName: '',
  outputDir: './my-app',
  integrations: {},
  envKeys: {},
  previewHtml: null,
  previewComponents: [],
  generationSeed: null,
  generationVersion: null,
  auditLog: [],
  isGenerating: false,
  iterationHistory: [],
  userApiKey: '',
  remainingDemoGenerations: null,
  vision: '',
  mission: '',
  successCriteria: '',
};

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      completeStep: (step) => set((state) => ({
        completedSteps: new Set([...state.completedSteps, step]),
      })),

      setMode: (mode) => set({ mode }),

      setTemplate: (template) => set({ template }),

      addInspiration: (inspiration) => set((state) => ({
        inspirations: [...state.inspirations, inspiration],
      })),

      removeInspiration: (id) => set((state) => ({
        inspirations: state.inspirations.filter((i) => i.id !== id),
      })),

      setDescription: (description) => set({ description }),

      setProjectName: (name) => {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        set({ projectName: slug, outputDir: `./${slug}` });
      },

      setOutputDir: (dir) => set({ outputDir: dir }),

      setIntegration: (type, provider) => set((state) => ({
        integrations: {
          ...state.integrations,
          [type]: provider,
        },
      })),

      setEnvKey: (key, value) => set((state) => ({
        envKeys: {
          ...state.envKeys,
          [key]: value,
        },
      })),

      setPreview: (data) => set({
        previewHtml: data.html,
        previewComponents: data.components,
        generationSeed: data.seed,
        generationVersion: data.version,
        auditLog: data.auditLog,
        isGenerating: false,
      }),

      setGenerating: (isGenerating) => set({ isGenerating }),

      addIteration: (prompt) => set((state) => ({
        iterationHistory: [...state.iterationHistory, prompt],
      })),

      setUserApiKey: (key) => set({ userApiKey: key }),

      setRemainingDemoGenerations: (count) => set({ remainingDemoGenerations: count }),

      setVision: (vision) => set({ vision }),

      setMission: (mission) => set({ mission }),

      setSuccessCriteria: (criteria) => set({ successCriteria: criteria }),

      reset: () => set(initialState),
    }),
    {
      name: 'configurator-storage',
      partialize: (state) => ({
        // Persist everything except env keys and sensitive preview state
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        mode: state.mode,
        template: state.template,
        inspirations: state.inspirations,
        description: state.description,
        projectName: state.projectName,
        outputDir: state.outputDir,
        integrations: state.integrations,
        userApiKey: state.userApiKey, // Persist user's API key choice
        vision: state.vision,
        mission: state.mission,
        successCriteria: state.successCriteria,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert completedSteps array back to Set
        if (state && Array.isArray(state.completedSteps)) {
          state.completedSteps = new Set(state.completedSteps);
        }
      },
    }
  )
);
