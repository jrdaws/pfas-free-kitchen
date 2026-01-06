import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DesignAnalysis } from './design-analyzer';
import type { VisionDocument } from '@/app/components/configurator/vision/types';

export type Mode = 'beginner' | 'advanced';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

// Brand color scheme options
export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "#0066CC",
    secondary: "#004999",
    accent: "#00A3E0",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#228B22",
    secondary: "#1B5E20",
    accent: "#4CAF50",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary: "#F97316",
    secondary: "#EA580C",
    accent: "#FDBA74",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    primary: "#7C3AED",
    secondary: "#5B21B6",
    accent: "#A78BFA",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    primary: "#3B82F6",
    secondary: "#1E40AF",
    accent: "#60A5FA",
    background: "#0F172A",
    foreground: "#F8FAFC",
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    primary: "#EC4899",
    secondary: "#BE185D",
    accent: "#F9A8D4",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  {
    id: "custom",
    name: "Custom Colors",
    primary: "#000000",
    secondary: "#333333",
    accent: "#666666",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
];

export type ModelTier = 'fast' | 'balanced' | 'quality';

// Composer mode determines how AI composes the preview
export type ComposerMode = 'registry' | 'hybrid' | 'auto';

export interface ComposerModeConfig {
  mode: ComposerMode;
  // Registry mode settings
  strictPatterns: boolean;      // Only use known patterns
  maxPatterns: number;          // Limit pattern count per page
  // Hybrid mode settings
  useInspirationStructure: boolean;  // Map inspiration to layout
  enableGapFiller: boolean;          // Generate custom components
  styleInheritance: 'full' | 'colors-only' | 'none';
  // Auto mode settings
  preferRegistry: boolean;      // Start with registry, fall back to hybrid
}

export const DEFAULT_COMPOSER_CONFIG: ComposerModeConfig = {
  mode: 'hybrid',
  strictPatterns: false,
  maxPatterns: 10,
  useInspirationStructure: true,
  enableGapFiller: true,
  styleInheritance: 'full',
  preferRegistry: true,
};

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
    steps: [1, 2, 3, 4], // Template, Research, Branding, Features
  },
  {
    id: 'configure',
    label: 'Configure',
    description: 'Set up integrations',
    icon: '/images/configurator/phases/phase-configure-icon.svg',
    steps: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // AI through Project Setup
  },
  {
    id: 'launch',
    label: 'Launch',
    description: 'Connect tools and ship',
    icon: '/images/configurator/phases/phase-launch-icon.svg',
    steps: [19, 20, 21, 22, 23], // Cursor, GitHub, Supabase, Vercel, Export
  },
] as const;

// Step definitions with phase association
export interface StepDef {
  number: number;
  label: string;
  phase: PhaseId;
}

export const STEPS: readonly StepDef[] = [
  // Setup Phase (1-4)
  { number: 1, label: 'Template', phase: 'setup' },
  { number: 2, label: 'Research', phase: 'setup' },
  { number: 3, label: 'Branding', phase: 'setup' },
  { number: 4, label: 'Features', phase: 'setup' },
  // Configure Phase (5-18)
  { number: 5, label: 'AI', phase: 'configure' },
  { number: 6, label: 'Payments', phase: 'configure' },
  { number: 7, label: 'Email', phase: 'configure' },
  { number: 8, label: 'Analytics', phase: 'configure' },
  { number: 9, label: 'Auth', phase: 'configure' },
  { number: 10, label: 'Storage', phase: 'configure' },
  { number: 11, label: 'Search', phase: 'configure' },
  { number: 12, label: 'CMS', phase: 'configure' },
  { number: 13, label: 'Monitoring', phase: 'configure' },
  { number: 14, label: 'Images', phase: 'configure' },
  { number: 15, label: 'Jobs', phase: 'configure' },
  { number: 16, label: 'Notifications', phase: 'configure' },
  { number: 17, label: 'Flags', phase: 'configure' },
  { number: 18, label: 'Project', phase: 'configure' },
  // Launch Phase (19-23)
  { number: 19, label: 'Cursor', phase: 'launch' },
  { number: 20, label: 'GitHub', phase: 'launch' },
  { number: 21, label: 'Supabase', phase: 'launch' },
  { number: 22, label: 'Vercel', phase: 'launch' },
  { number: 23, label: 'Export', phase: 'launch' },
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
  
  // Design analysis from inspiration screenshots
  designAnalysis: DesignAnalysis | null;
  
  // Vision document from guided builder
  visionDocument: VisionDocument | null;
  
  // AI provider settings (5DS clone)
  aiProvider: string;
  aiApiKey: string;
  
  // Composer mode settings
  composerConfig: ComposerModeConfig;

  // Branding settings
  colorScheme: string; // ColorScheme id
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };

  // Service provider selections
  paymentProvider?: string;
  emailProvider?: string;
  analyticsProvider?: string;
  authProvider?: string;
  storageProvider?: string;
  searchProvider?: string;
  cmsProvider?: string;
  monitoringProvider?: string;
  imageOptProvider?: string;
  backgroundJobsProvider?: string;
  notificationsProvider?: string;
  featureFlagsProvider?: string;

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
  setDesignAnalysis: (analysis: DesignAnalysis | null) => void;
  setVisionDocument: (doc: VisionDocument | null) => void;
  
  // AI provider actions
  setAiProvider: (provider: string) => void;
  setAiApiKey: (key: string) => void;
  
  // Composer mode actions
  setComposerMode: (mode: ComposerMode) => void;
  setComposerConfig: (config: Partial<ComposerModeConfig>) => void;
  
  // Branding actions
  setColorScheme: (schemeId: string) => void;
  setCustomColor: (colorKey: keyof ConfiguratorState['customColors'], value: string) => void;
  
  // Service provider actions
  setPaymentProvider: (provider: string | undefined) => void;
  setEmailProvider: (provider: string | undefined) => void;
  setAnalyticsProvider: (provider: string | undefined) => void;
  setAuthProvider: (provider: string | undefined) => void;
  setStorageProvider: (provider: string | undefined) => void;
  setSearchProvider: (provider: string | undefined) => void;
  setCmsProvider: (provider: string | undefined) => void;
  setMonitoringProvider: (provider: string | undefined) => void;
  setImageOptProvider: (provider: string | undefined) => void;
  setBackgroundJobsProvider: (provider: string | undefined) => void;
  setNotificationsProvider: (provider: string | undefined) => void;
  setFeatureFlagsProvider: (provider: string | undefined) => void;
  
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
    supabase: false,
    vercel: false,
  },
  researchDomain: '',
  inspirationUrls: [],
  designAnalysis: null,
  visionDocument: null,
  aiProvider: '',
  aiApiKey: '',
  composerConfig: DEFAULT_COMPOSER_CONFIG,
  colorScheme: 'sunset-orange',
  customColors: {
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FDBA74',
    background: '#FFFFFF',
    foreground: '#1A1A1A',
  },
  paymentProvider: undefined,
  emailProvider: undefined,
  analyticsProvider: undefined,
  authProvider: undefined,
  storageProvider: undefined,
  searchProvider: undefined,
  cmsProvider: undefined,
  monitoringProvider: undefined,
  imageOptProvider: undefined,
  backgroundJobsProvider: undefined,
  notificationsProvider: undefined,
  featureFlagsProvider: undefined,
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

      setDesignAnalysis: (analysis) => set({ designAnalysis: analysis }),

      setVisionDocument: (doc) => set((state) => ({ 
        visionDocument: doc,
        // Also sync the text vision for backwards compatibility
        vision: doc ? doc.problem : state.vision,
      })),

      setAiProvider: (provider) => set((state) => ({ 
        aiProvider: provider,
        integrations: { ...state.integrations, ai: provider || '' }
      })),

      setAiApiKey: (key) => set({ aiApiKey: key }),

      setComposerMode: (mode) => set((state) => ({
        composerConfig: { ...state.composerConfig, mode },
      })),

      setComposerConfig: (config) => set((state) => ({
        composerConfig: { ...state.composerConfig, ...config },
      })),

      setColorScheme: (schemeId) => {
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId);
        if (scheme && schemeId !== 'custom') {
          set({
            colorScheme: schemeId,
            customColors: {
              primary: scheme.primary,
              secondary: scheme.secondary,
              accent: scheme.accent,
              background: scheme.background,
              foreground: scheme.foreground,
            },
          });
        } else {
          set({ colorScheme: schemeId });
        }
      },

      setCustomColor: (colorKey, value) => set((state) => ({
        colorScheme: 'custom',
        customColors: {
          ...state.customColors,
          [colorKey]: value,
        },
      })),

      // Provider setters - also update integrations record for compatibility with existing preview/generation system
      setPaymentProvider: (provider) => set((state) => ({ 
        paymentProvider: provider,
        integrations: { ...state.integrations, payments: provider || '' }
      })),
      setEmailProvider: (provider) => set((state) => ({ 
        emailProvider: provider,
        integrations: { ...state.integrations, email: provider || '' }
      })),
      setAnalyticsProvider: (provider) => set((state) => ({ 
        analyticsProvider: provider,
        integrations: { ...state.integrations, analytics: provider || '' }
      })),
      setAuthProvider: (provider) => set((state) => ({ 
        authProvider: provider,
        integrations: { ...state.integrations, auth: provider || '' }
      })),
      setStorageProvider: (provider) => set((state) => ({ 
        storageProvider: provider,
        integrations: { ...state.integrations, storage: provider || '' }
      })),
      setSearchProvider: (provider) => set((state) => ({ 
        searchProvider: provider,
        integrations: { ...state.integrations, search: provider || '' }
      })),
      setCmsProvider: (provider) => set((state) => ({ 
        cmsProvider: provider,
        integrations: { ...state.integrations, cms: provider || '' }
      })),
      setMonitoringProvider: (provider) => set((state) => ({ 
        monitoringProvider: provider,
        integrations: { ...state.integrations, monitoring: provider || '' }
      })),
      setImageOptProvider: (provider) => set((state) => ({ 
        imageOptProvider: provider,
        integrations: { ...state.integrations, imageOpt: provider || '' }
      })),
      setBackgroundJobsProvider: (provider) => set((state) => ({ 
        backgroundJobsProvider: provider,
        integrations: { ...state.integrations, backgroundJobs: provider || '' }
      })),
      setNotificationsProvider: (provider) => set((state) => ({ 
        notificationsProvider: provider,
        integrations: { ...state.integrations, notifications: provider || '' }
      })),
      setFeatureFlagsProvider: (provider) => set((state) => ({ 
        featureFlagsProvider: provider,
        integrations: { ...state.integrations, featureFlags: provider || '' }
      })),

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
        designAnalysis: state.designAnalysis,
        visionDocument: state.visionDocument,
        aiProvider: state.aiProvider,
        composerConfig: state.composerConfig,
        colorScheme: state.colorScheme,
        customColors: state.customColors,
        paymentProvider: state.paymentProvider,
        emailProvider: state.emailProvider,
        analyticsProvider: state.analyticsProvider,
        authProvider: state.authProvider,
        storageProvider: state.storageProvider,
        searchProvider: state.searchProvider,
        cmsProvider: state.cmsProvider,
        monitoringProvider: state.monitoringProvider,
        imageOptProvider: state.imageOptProvider,
        backgroundJobsProvider: state.backgroundJobsProvider,
        notificationsProvider: state.notificationsProvider,
        featureFlagsProvider: state.featureFlagsProvider,
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
