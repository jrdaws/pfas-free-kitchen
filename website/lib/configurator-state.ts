import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'beginner' | 'advanced';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ModelTier = 'fast' | 'balanced' | 'quality';

export type PhaseId = 'setup' | 'configure' | 'launch';

// Phase definitions
export interface Phase {
  id: PhaseId;
  label: string;
  description: string;
  icon: string;
  steps: readonly number[];
}

export const PHASES: readonly Phase[] = [
  {
    id: 'setup',
    label: 'Setup',
    description: 'Choose your foundation',
    icon: '/images/configurator/phases/phase-setup-icon.svg',
    steps: [1, 2, 3], // Template, Inspiration, Project
  },
  {
    id: 'configure',
    label: 'Configure',
    description: 'Set up integrations',
    icon: '/images/configurator/phases/phase-configure-icon.svg',
    steps: [4, 5], // Integrations, Environment
  },
  {
    id: 'launch',
    label: 'Launch',
    description: 'Preview and ship',
    icon: '/images/configurator/phases/phase-launch-icon.svg',
    steps: [6, 7, 8], // Preview, Context, Export
  },
] as const;

// Step definitions with phase association
export interface StepDef {
  number: number;
  label: string;
  phase: PhaseId;
}

export const STEPS: readonly StepDef[] = [
  { number: 1, label: 'Template', phase: 'setup' },
  { number: 2, label: 'Inspiration', phase: 'setup' },
  { number: 3, label: 'Project', phase: 'setup' },
  { number: 4, label: 'Integrations', phase: 'configure' },
  { number: 5, label: 'Environment', phase: 'configure' },
  { number: 6, label: 'Preview', phase: 'launch' },
  { number: 7, label: 'Context', phase: 'launch' },
  { number: 8, label: 'Export', phase: 'launch' },
] as const;

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
  modelTier: ModelTier;

  // Step 7: Context
  vision: string;
  mission: string;
  successCriteria: string;

  // Feature selections (5DS clone)
  selectedFeatures: Record<string, string[]>; // category -> feature IDs

  // Tool setup status (5DS clone)
  toolStatus: Record<string, boolean>;
  
  // Research domain (5DS clone)
  researchDomain: string;
  inspirationUrls: string[];
  
  // AI provider settings (5DS clone)
  aiProvider: string;
  aiApiKey: string;

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
  setPreviewHtml: (html: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  addIteration: (prompt: string) => void;
  setUserApiKey: (key: string) => void;
  setRemainingDemoGenerations: (count: number | null) => void;
  setModelTier: (tier: ModelTier) => void;
  setVision: (vision: string) => void;
  setMission: (mission: string) => void;
  setSuccessCriteria: (criteria: string) => void;
  
  // Feature selection actions
  toggleFeature: (category: string, featureId: string) => void;
  setFeatures: (category: string, featureIds: string[]) => void;
  clearFeatures: () => void;
  
  // Tool status actions
  setToolComplete: (toolId: string, isComplete: boolean) => void;
  
  // Research actions
  setResearchDomain: (domain: string) => void;
  setInspirationUrls: (urls: string[]) => void;
  
  // AI provider actions
  setAiProvider: (provider: string) => void;
  setAiApiKey: (key: string) => void;
  
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
  modelTier: 'balanced' as ModelTier,
  vision: '',
  mission: '',
  successCriteria: '',
  selectedFeatures: {},
  toolStatus: {
    cursor: false,
    github: false,
    'claude-code': false,
    supabase: false,
    vercel: false,
  },
  researchDomain: '',
  inspirationUrls: [],
  aiProvider: '',
  aiApiKey: '',
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

      setPreviewHtml: (html) => set({ previewHtml: html }),

      setGenerating: (isGenerating) => set({ isGenerating }),

      addIteration: (prompt) => set((state) => ({
        iterationHistory: [...state.iterationHistory, prompt],
      })),

      setUserApiKey: (key) => set({ userApiKey: key }),

      setRemainingDemoGenerations: (count) => set({ remainingDemoGenerations: count }),

      setModelTier: (tier) => set({ modelTier: tier }),

      setVision: (vision) => set({ vision }),

      setMission: (mission) => set({ mission }),

      setSuccessCriteria: (criteria) => set({ successCriteria: criteria }),

      toggleFeature: (category, featureId) => set((state) => {
        const currentFeatures = state.selectedFeatures[category] || [];
        const isSelected = currentFeatures.includes(featureId);
        
        return {
          selectedFeatures: {
            ...state.selectedFeatures,
            [category]: isSelected
              ? currentFeatures.filter((id) => id !== featureId)
              : [...currentFeatures, featureId],
          },
        };
      }),

      setFeatures: (category, featureIds) => set((state) => ({
        selectedFeatures: {
          ...state.selectedFeatures,
          [category]: featureIds,
        },
      })),

      clearFeatures: () => set({ selectedFeatures: {} }),

      setToolComplete: (toolId, isComplete) => set((state) => ({
        toolStatus: {
          ...state.toolStatus,
          [toolId]: isComplete,
        },
      })),

      setResearchDomain: (domain) => set({ researchDomain: domain }),

      setInspirationUrls: (urls) => set({ inspirationUrls: urls }),

      setAiProvider: (provider) => set({ aiProvider: provider }),

      setAiApiKey: (key) => set({ aiApiKey: key }),

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
        modelTier: state.modelTier, // Persist model tier preference
        vision: state.vision,
        mission: state.mission,
        successCriteria: state.successCriteria,
        selectedFeatures: state.selectedFeatures,
        toolStatus: state.toolStatus,
        researchDomain: state.researchDomain,
        inspirationUrls: state.inspirationUrls,
        aiProvider: state.aiProvider,
        // Note: aiApiKey is NOT persisted for security
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
