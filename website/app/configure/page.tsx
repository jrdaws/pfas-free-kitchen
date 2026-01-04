"use client";

import dynamic from "next/dynamic";
import { useConfiguratorStore, Step, ModelTier } from "@/lib/configurator-state";
import { TEMPLATES } from "@/lib/templates";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { analyzeProject, type ResearchResult } from "@/lib/research-client";

// Dynamically import components to avoid SSR issues
const AccordionSidebar = dynamic(() => import("@/app/components/configurator/AccordionSidebar").then(mod => ({ default: mod.AccordionSidebar })), { ssr: false });
const MobileSidebar = dynamic(() => import("@/app/components/configurator/MobileSidebar").then(mod => ({ default: mod.MobileSidebar })), { ssr: false });
const ModeToggle = dynamic(() => import("@/app/components/configurator/ModeToggle").then(mod => ({ default: mod.ModeToggle })), { ssr: false });
const TemplateSelector = dynamic(() => import("@/app/components/configurator/TemplateSelector").then(mod => ({ default: mod.TemplateSelector })), { ssr: false });
const InspirationUpload = dynamic(() => import("@/app/components/configurator/InspirationUpload").then(mod => ({ default: mod.InspirationUpload })), { ssr: false });
const ProjectDetails = dynamic(() => import("@/app/components/configurator/ProjectDetails").then(mod => ({ default: mod.ProjectDetails })), { ssr: false });
const IntegrationPanel = dynamic(() => import("@/app/components/configurator/IntegrationPanel").then(mod => ({ default: mod.IntegrationPanel })), { ssr: false });
const EnvironmentKeys = dynamic(() => import("@/app/components/configurator/EnvironmentKeys").then(mod => ({ default: mod.EnvironmentKeys })), { ssr: false });
const AIPreview = dynamic(() => import("@/app/components/configurator/AIPreview").then(mod => ({ default: mod.AIPreview })), { ssr: false });
const ComponentAwarePreview = dynamic(() => import("@/app/components/configurator/ComponentAwarePreview").then(mod => ({ default: mod.ComponentAwarePreview })), { ssr: false });
const ProjectGenerator = dynamic(() => import("@/app/components/configurator/ProjectGenerator").then(mod => ({ default: mod.ProjectGenerator })), { ssr: false });
const ContextFields = dynamic(() => import("@/app/components/configurator/ContextFields").then(mod => ({ default: mod.ContextFields })), { ssr: false });
const GenerateFramework = dynamic(() => import("@/app/components/configurator/GenerateFramework").then(mod => ({ default: mod.GenerateFramework })), { ssr: false });
const LivePreviewPanel = dynamic(() => import("@/app/components/configurator/LivePreviewPanel").then(mod => ({ default: mod.LivePreviewPanel })), { ssr: false });
const PreviewToggleButton = dynamic(() => import("@/app/components/configurator/LivePreviewPanel").then(mod => ({ default: mod.PreviewToggleButton })), { ssr: false });
const PreviewCard = dynamic(() => import("@/app/components/configurator/PreviewCard").then(mod => ({ default: mod.PreviewCard })), { ssr: false });
const ProjectOverviewBox = dynamic(() => import("@/app/components/configurator/ProjectOverviewBox").then(mod => ({ default: mod.ProjectOverviewBox })), { ssr: false });
const ThemeToggle = dynamic(() => import("@/components/ui/theme-toggle").then(mod => ({ default: mod.ThemeToggle })), { ssr: false });
const ResearchResults = dynamic(() => import("@/app/components/configurator/ResearchResults").then(mod => ({ default: mod.ResearchResults })), { ssr: false });

// Import section components for inline sidebar content
const ResearchSection = dynamic(() => import("@/app/components/configurator/sections/ResearchSection").then(mod => ({ default: mod.ResearchSection })), { ssr: false });
import type { ResearchStats } from "@/app/components/configurator/sections/ResearchSection";
const CoreFeaturesSection = dynamic(() => import("@/app/components/configurator/sections/CoreFeaturesSection").then(mod => ({ default: mod.CoreFeaturesSection })), { ssr: false });
const IntegrateAISection = dynamic(() => import("@/app/components/configurator/sections/IntegrateAISection").then(mod => ({ default: mod.IntegrateAISection })), { ssr: false });
const ToolSetupSection = dynamic(() => import("@/app/components/configurator/sections/ToolSetupSection").then(mod => ({ default: mod.ToolSetupSection })), { ssr: false });
const SupabaseSetup = dynamic(() => import("@/app/components/configurator/setup/SupabaseSetup").then(mod => ({ default: mod.SupabaseSetup })), { ssr: false });
const TemplateSection = dynamic(() => import("@/app/components/configurator/sections/TemplateSection").then(mod => ({ default: mod.TemplateSection })), { ssr: false });
const ProjectSetupSection = dynamic(() => import("@/app/components/configurator/sections/ProjectSetupSection").then(mod => ({ default: mod.ProjectSetupSection })), { ssr: false });
const ExportSection = dynamic(() => import("@/app/components/configurator/sections/ExportSection").then(mod => ({ default: mod.ExportSection })), { ssr: false });
const BrandingSection = dynamic(() => import("@/app/components/configurator/sections/BrandingSection").then(mod => ({ default: mod.BrandingSection })), { ssr: false });
const PaymentsSection = dynamic(() => import("@/app/components/configurator/sections/PaymentsSection").then(mod => ({ default: mod.PaymentsSection })), { ssr: false });
const EmailSection = dynamic(() => import("@/app/components/configurator/sections/EmailSection").then(mod => ({ default: mod.EmailSection })), { ssr: false });
const AnalyticsSection = dynamic(() => import("@/app/components/configurator/sections/AnalyticsSection").then(mod => ({ default: mod.AnalyticsSection })), { ssr: false });
const AuthProviderSection = dynamic(() => import("@/app/components/configurator/sections/AuthProviderSection").then(mod => ({ default: mod.AuthProviderSection })), { ssr: false });
const StorageSection = dynamic(() => import("@/app/components/configurator/sections/StorageSection").then(mod => ({ default: mod.StorageSection })), { ssr: false });
const SearchSection = dynamic(() => import("@/app/components/configurator/sections/SearchSection").then(mod => ({ default: mod.SearchSection })), { ssr: false });
const CMSSection = dynamic(() => import("@/app/components/configurator/sections/CMSSection").then(mod => ({ default: mod.CMSSection })), { ssr: false });
const MonitoringSection = dynamic(() => import("@/app/components/configurator/sections/MonitoringSection").then(mod => ({ default: mod.MonitoringSection })), { ssr: false });
const ImageOptSection = dynamic(() => import("@/app/components/configurator/sections/ImageOptSection").then(mod => ({ default: mod.ImageOptSection })), { ssr: false });
const BackgroundJobsSection = dynamic(() => import("@/app/components/configurator/sections/BackgroundJobsSection").then(mod => ({ default: mod.BackgroundJobsSection })), { ssr: false });
const NotificationsSection = dynamic(() => import("@/app/components/configurator/sections/NotificationsSection").then(mod => ({ default: mod.NotificationsSection })), { ssr: false });
const FeatureFlagsSection = dynamic(() => import("@/app/components/configurator/sections/FeatureFlagsSection").then(mod => ({ default: mod.FeatureFlagsSection })), { ssr: false });

// Map section IDs to step numbers (23-section layout with all providers)
const SECTION_TO_STEP: Record<string, number> = {
  // Setup Phase (1-4)
  "template": 1,
  "research": 2,
  "branding": 3,
  "core-features": 4,
  // Configure Phase (5-18)
  "integrate-ai": 5,
  "payments": 6,
  "email": 7,
  "analytics": 8,
  "auth-provider": 9,
  "storage": 10,
  "search": 11,
  "cms": 12,
  "monitoring": 13,
  "image-opt": 14,
  "background-jobs": 15,
  "notifications": 16,
  "feature-flags": 17,
  "project-setup": 18,
  // Launch Phase (19-23)
  "cursor": 19,
  "github": 20,
  "supabase": 21,
  "vercel": 22,
  "export": 23,
};

const STEP_TO_SECTION: Record<number, string> = {
  // Setup Phase
  1: "template",
  2: "research",
  3: "branding",
  4: "core-features",
  // Configure Phase
  5: "integrate-ai",
  6: "payments",
  7: "email",
  8: "analytics",
  9: "auth-provider",
  10: "storage",
  11: "search",
  12: "cms",
  13: "monitoring",
  14: "image-opt",
  15: "background-jobs",
  16: "notifications",
  17: "feature-flags",
  18: "project-setup",
  // Launch Phase
  19: "cursor",
  20: "github",
  21: "supabase",
  22: "vercel",
  23: "export",
};

// Step titles for breadcrumb
const STEP_TITLES: Record<number, string> = {
  1: "Template",
  2: "Research",
  3: "Branding",
  4: "Integrations",
  5: "AI",
  6: "Payments",
  7: "Email",
  8: "Analytics",
  9: "Auth",
  10: "Storage",
  11: "Search",
  12: "CMS",
  13: "Monitoring",
  14: "Images",
  15: "Jobs",
  16: "Notifications",
  17: "Flags",
  18: "Project",
  19: "Cursor",
  20: "GitHub",
  21: "Supabase",
  22: "Vercel",
  23: "Export",
};

// Phase names for breadcrumb
const getPhaseForStep = (step: number): string => {
  if (step <= 4) return "Setup";
  if (step <= 18) return "Configure";
  return "Launch";
};

// Total number of steps
const TOTAL_STEPS = 23;

// Smart pre-fill prompts based on template selection (Option C UX improvement)
const DOMAIN_PROMPTS: Record<string, string> = {
  saas: "SaaS product for [describe your users and what problem you solve]",
  ecommerce: "Online store selling [describe your products and target customers]",
  blog: "Blog about [describe your topic and target audience]",
  dashboard: "Dashboard for managing [describe what data or operations]",
  "landing-page": "Landing page for [describe your product or service]",
  "api-backend": "API backend for [describe what service it provides]",
  "seo-directory": "Directory of [describe what you're listing and for whom]",
};

export default function ConfigurePage() {
  const [aiTab, setAiTab] = useState<"component" | "preview" | "generate">("component");
  const [showLivePreview, setShowLivePreview] = useState(false);
  
  // Research state
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchStats, setResearchStats] = useState<ResearchStats | null>(null);
  
  // Track navigation direction for slide animations
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right");
  const [animationKey, setAnimationKey] = useState(0);
  const prevStepRef = useRef<number | null>(null);

  const {
    currentStep,
    completedSteps,
    mode,
    template,
    inspirations,
    description,
    projectName,
    outputDir,
    integrations,
    envKeys,
    vision,
    mission,
    successCriteria,
    modelTier,
    selectedFeatures,
    toolStatus,
    researchDomain,
    inspirationUrls,
    aiProvider,
    aiApiKey,
    colorScheme,
    customColors,
    paymentProvider,
    emailProvider,
    analyticsProvider,
    authProvider,
    storageProvider,
    searchProvider,
    cmsProvider,
    monitoringProvider,
    imageOptProvider,
    backgroundJobsProvider,
    notificationsProvider,
    featureFlagsProvider,
    setStep,
    completeStep,
    setMode,
    setTemplate,
    addInspiration,
    removeInspiration,
    setDescription,
    setProjectName,
    setOutputDir,
    setIntegration,
    setEnvKey,
    setVision,
    setMission,
    setSuccessCriteria,
    setModelTier,
    toggleFeature,
    clearFeatures,
    setToolComplete,
    setResearchDomain,
    setInspirationUrls,
    setAiProvider,
    setAiApiKey,
    setColorScheme,
    setCustomColor,
    setPaymentProvider,
    setEmailProvider,
    setAnalyticsProvider,
    setAuthProvider,
    setStorageProvider,
    setSearchProvider,
    setCmsProvider,
    setMonitoringProvider,
    setImageOptProvider,
    setBackgroundJobsProvider,
    setNotificationsProvider,
    setFeatureFlagsProvider,
  } = useConfiguratorStore();

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  // Smart pre-fill: When template changes, suggest a domain prompt (Option C)
  useEffect(() => {
    // Only pre-fill if:
    // 1. A template is selected
    // 2. Domain is empty OR domain matches an old pre-fill prompt
    const currentPrompt = DOMAIN_PROMPTS[template];
    const isOldPrefill = Object.values(DOMAIN_PROMPTS).includes(researchDomain);
    
    if (template && currentPrompt && (!researchDomain || isOldPrefill)) {
      setResearchDomain(currentPrompt);
    }
  }, [template]); // Only trigger when template changes

  // Track step changes and set animation direction
  useEffect(() => {
    if (prevStepRef.current !== null && prevStepRef.current !== currentStep) {
      setAnimationDirection(currentStep > prevStepRef.current ? "right" : "left");
      setAnimationKey((k) => k + 1);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Calculate section badges for all sections
  const sectionBadges = useMemo(() => {
    const totalFeatures = Object.values(selectedFeatures).flat().length;
    const integrationCount = Object.values(integrations).filter(Boolean).length;
    const toolsReady = Object.values(toolStatus).filter(Boolean).length;
    
    return {
      // Research - show if domain is set
      "research": researchDomain ? "✓" : undefined,
      // Branding - show scheme name or "Custom"
      "branding": colorScheme && colorScheme !== 'sunset-orange' ? (colorScheme === 'custom' ? 'Custom' : '✓') : undefined,
      // Core Features - show count
      "core-features": totalFeatures > 0 ? totalFeatures : undefined,
      // Integrate AI - show provider or count
      "integrate-ai": aiProvider ? "✓" : undefined,
      // Service providers - show checkmark when selected
      "payments": paymentProvider ? "✓" : undefined,
      "email": emailProvider ? "✓" : undefined,
      "analytics": analyticsProvider ? "✓" : undefined,
      "auth-provider": authProvider ? "✓" : undefined,
      "storage": storageProvider ? "✓" : undefined,
      "search": searchProvider ? "✓" : undefined,
      "cms": cmsProvider ? "✓" : undefined,
      "monitoring": monitoringProvider ? "✓" : undefined,
      "image-opt": imageOptProvider ? "✓" : undefined,
      "background-jobs": backgroundJobsProvider ? "✓" : undefined,
      "notifications": notificationsProvider ? "✓" : undefined,
      "feature-flags": featureFlagsProvider ? "✓" : undefined,
      // Tool sections - show "Ready" when complete
      "cursor": toolStatus.cursor ? "Ready" : undefined,
      "github": toolStatus.github ? "Ready" : undefined,
      "claude-code": toolStatus["claude-code"] ? "Ready" : undefined,
      "supabase": toolStatus.supabase ? "Ready" : undefined,
      "vercel": toolStatus.vercel ? "Ready" : undefined,
    };
  }, [selectedFeatures, integrations, toolStatus, researchDomain, aiProvider, colorScheme, paymentProvider, emailProvider, analyticsProvider, authProvider, storageProvider, searchProvider, cmsProvider, monitoringProvider, imageOptProvider, backgroundJobsProvider, notificationsProvider, featureFlagsProvider]);

  // Calculate progress
  const progress = (completedSteps.size / TOTAL_STEPS) * 100;

  // Auto-complete steps when providers are selected
  useEffect(() => {
    // Map providers to their step numbers (Step type = 1-23)
    if (aiProvider && !completedSteps.has(5)) completeStep(5 as Step);
    if (paymentProvider && !completedSteps.has(6)) completeStep(6 as Step);
    if (emailProvider && !completedSteps.has(7)) completeStep(7 as Step);
    if (analyticsProvider && !completedSteps.has(8)) completeStep(8 as Step);
    if (authProvider && !completedSteps.has(9)) completeStep(9 as Step);
    if (storageProvider && !completedSteps.has(10)) completeStep(10 as Step);
    if (searchProvider && !completedSteps.has(11)) completeStep(11 as Step);
    if (cmsProvider && !completedSteps.has(12)) completeStep(12 as Step);
    if (monitoringProvider && !completedSteps.has(13)) completeStep(13 as Step);
    if (imageOptProvider && !completedSteps.has(14)) completeStep(14 as Step);
    if (backgroundJobsProvider && !completedSteps.has(15)) completeStep(15 as Step);
    if (notificationsProvider && !completedSteps.has(16)) completeStep(16 as Step);
    if (featureFlagsProvider && !completedSteps.has(17)) completeStep(17 as Step);
  }, [aiProvider, paymentProvider, emailProvider, analyticsProvider, authProvider, storageProvider, searchProvider, cmsProvider, monitoringProvider, imageOptProvider, backgroundJobsProvider, notificationsProvider, featureFlagsProvider, completedSteps, completeStep]);

  // Auto-complete step 4 (core-features) when features are selected
  useEffect(() => {
    const hasFeatures = Object.values(selectedFeatures).flat().length > 0;
    if (hasFeatures && !completedSteps.has(4)) {
      completeStep(4 as Step);
    }
  }, [selectedFeatures, completedSteps, completeStep]);

  // Handle research API call
  const handleStartResearch = useCallback(async () => {
    if (!researchDomain.trim()) return;
    
    setIsResearching(true);
    setResearchError(null);
    setResearchStats(null);
    
    try {
      const result = await analyzeProject({
        domain: researchDomain,
        inspirationUrls: inspirationUrls.length > 0 ? inspirationUrls : undefined,
        vision: vision || description || undefined,
      });
      
      if (result.success) {
        setResearchResult(result);
        
        // Build stats from results
        const { analysis } = result;
        const urlCount = analysis.urlAnalysis?.length || 0;
        const featuresFromUrls = analysis.urlAnalysis?.reduce((acc, u) => acc + (u.features?.length || 0), 0) || 0;
        const patternsFromUrls = analysis.urlAnalysis?.reduce((acc, u) => acc + (u.designPatterns?.length || 0), 0) || 0;
        const suggestedFeaturesCount = analysis.recommendations?.suggestedFeatures?.reduce((acc, cat) => acc + (cat.features?.length || 0), 0) || 0;
        
        setResearchStats({
          sitesAnalyzed: urlCount || inspirationUrls.length,
          pagesExtracted: urlCount,
          featuresIdentified: featuresFromUrls + (analysis.domainInsights?.commonFeatures?.length || 0),
          designPatterns: patternsFromUrls,
          recommendedTemplate: analysis.recommendations?.suggestedTemplate || template,
          suggestedFeatures: suggestedFeaturesCount,
          integrationsFound: analysis.recommendations?.suggestedIntegrations?.length || 0,
        });
        
        completeStep(2);
      } else {
        setResearchError(result.error || "Research failed");
      }
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : "Research failed");
    } finally {
      setIsResearching(false);
    }
  }, [researchDomain, inspirationUrls, vision, description, template, completeStep]);
  
  // Reset research to try again
  const handleResetResearch = useCallback(() => {
    setResearchResult(null);
    setResearchStats(null);
    setResearchError(null);
  }, []);

  // Handle applying research recommendations
  const handleApplyRecommendations = useCallback((recommendations: {
    template: string;
    features: Record<string, string[]>;
    integrations: string[];
  }) => {
    // Apply template if valid
    if (recommendations.template && TEMPLATES[recommendations.template as keyof typeof TEMPLATES]) {
      setTemplate(recommendations.template);
      completeStep(1);
    }
    
    // Apply features
    Object.entries(recommendations.features).forEach(([category, features]) => {
      features.forEach(feature => {
        // Only toggle if not already selected
        if (!selectedFeatures[category]?.includes(feature)) {
          toggleFeature(category, feature);
        }
      });
    });
    
    // Apply integrations
    recommendations.integrations.forEach(integration => {
      // Map integration names to our integration keys
      const integrationMap: Record<string, string> = {
        "stripe": "payments",
        "uploadthing": "storage",
        "resend": "email",
        "analytics": "analytics",
        "sentry": "monitoring",
      };
      const key = integrationMap[integration.toLowerCase()];
      if (key) {
        setIntegration(key, integration);
      }
    });
    
    completeStep(3); // Core features step
  }, [setTemplate, toggleFeature, setIntegration, completeStep, selectedFeatures]);

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      // Setup Phase (1-4)
      case 1: return template !== ""; // Template required
      case 2: return true; // Research optional
      case 3: return true; // Branding optional
      case 4: return Object.values(selectedFeatures).flat().length > 0; // Features required
      // Configure Phase (5-18) - all optional except Project Setup
      case 5: return true; // AI optional
      case 6: return true; // Payments optional
      case 7: return true; // Email optional
      case 8: return true; // Analytics optional
      case 9: return true; // Auth optional
      case 10: return true; // Storage optional
      case 11: return true; // Search optional
      case 12: return true; // CMS optional
      case 13: return true; // Monitoring optional
      case 14: return true; // Images optional
      case 15: return true; // Jobs optional
      case 16: return true; // Notifications optional
      case 17: return true; // Flags optional
      case 18: return projectName.length > 0 && outputDir.length > 0; // Project required
      // Launch Phase (19-23)
      case 19: return toolStatus.cursor; // Cursor required
      case 20: return toolStatus.github; // GitHub required
      case 21: return true; // Supabase optional
      case 22: return true; // Vercel optional
      case 23: return true; // Export
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    completeStep(currentStep);
    const nextStep = (currentStep + 1) as Step;
    if (nextStep <= TOTAL_STEPS) {
      setStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = (currentStep - 1) as Step;
    if (prevStep >= 1) {
      setStep(prevStep);
    }
  };

  const handleToolComplete = (toolId: string) => {
    setToolComplete(toolId, true);
    completeStep(SECTION_TO_STEP[toolId] as Step);
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Render inline section content for accordion
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "template":
        return (
          <TemplateSection
            selectedTemplate={template}
            onTemplateChange={(t) => {
              setTemplate(t);
              completeStep(1);
            }}
          />
        );
      case "research":
        return (
          <ResearchSection
            domain={researchDomain}
            onDomainChange={setResearchDomain}
            vision={vision}
            onVisionChange={setVision}
            inspirationUrls={inspirationUrls}
            onInspirationUrlsChange={setInspirationUrls}
            onStartResearch={handleStartResearch}
            onShowMe={() => {
              // Scroll to results in main content area
              const resultsEl = document.getElementById("research-results");
              resultsEl?.scrollIntoView({ behavior: "smooth" });
            }}
            onResetResearch={handleResetResearch}
            isLoading={isResearching}
            isComplete={!!researchResult?.success}
            stats={researchStats || undefined}
          />
        );
      case "branding":
        return (
          <BrandingSection
            selectedScheme={colorScheme}
            onSchemeChange={(schemeId) => {
              setColorScheme(schemeId);
              completeStep(3);
            }}
            customColors={customColors}
            onCustomColorChange={setCustomColor}
          />
        );
      case "core-features":
        return (
          <CoreFeaturesSection
            selectedFeatures={selectedFeatures}
            onToggleFeature={toggleFeature}
            onClearCategory={(category) => {
              // Clear features for a specific category
              const currentFeatures = selectedFeatures[category] || [];
              currentFeatures.forEach((featureId) => {
                toggleFeature(category, featureId);
              });
            }}
          />
        );
      case "integrate-ai":
        return (
          <IntegrateAISection
            selectedProvider={aiProvider}
            onProviderChange={setAiProvider}
            apiKey={aiApiKey}
            onApiKeyChange={setAiApiKey}
            isKeyValid={aiApiKey.length > 10}
          />
        );
      case "payments":
        return (
          <PaymentsSection
            selectedProvider={paymentProvider}
            onProviderChange={setPaymentProvider}
          />
        );
      case "email":
        return (
          <EmailSection
            selectedProvider={emailProvider}
            onProviderChange={setEmailProvider}
          />
        );
      case "analytics":
        return (
          <AnalyticsSection
            selectedProvider={analyticsProvider}
            onProviderChange={setAnalyticsProvider}
          />
        );
      case "auth-provider":
        return (
          <AuthProviderSection
            selectedProvider={authProvider}
            onProviderChange={setAuthProvider}
          />
        );
      case "storage":
        return (
          <StorageSection
            selectedProvider={storageProvider}
            onProviderChange={setStorageProvider}
          />
        );
      case "search":
        return (
          <SearchSection
            selectedProvider={searchProvider}
            onProviderChange={setSearchProvider}
          />
        );
      case "cms":
        return (
          <CMSSection
            selectedProvider={cmsProvider}
            onProviderChange={setCmsProvider}
          />
        );
      case "monitoring":
        return (
          <MonitoringSection
            selectedProvider={monitoringProvider}
            onProviderChange={setMonitoringProvider}
          />
        );
      case "image-opt":
        return (
          <ImageOptSection
            selectedProvider={imageOptProvider}
            onProviderChange={setImageOptProvider}
          />
        );
      case "background-jobs":
        return (
          <BackgroundJobsSection
            selectedProvider={backgroundJobsProvider}
            onProviderChange={setBackgroundJobsProvider}
          />
        );
      case "notifications":
        return (
          <NotificationsSection
            selectedProvider={notificationsProvider}
            onProviderChange={setNotificationsProvider}
          />
        );
      case "feature-flags":
        return (
          <FeatureFlagsSection
            selectedProvider={featureFlagsProvider}
            onProviderChange={setFeatureFlagsProvider}
          />
        );
      case "cursor":
        return (
          <ToolSetupSection
            toolId="cursor"
            isComplete={toolStatus.cursor}
            onMarkComplete={() => handleToolComplete("cursor")}
          />
        );
      case "github":
        return (
          <ToolSetupSection
            toolId="github"
            isComplete={toolStatus.github}
            onMarkComplete={() => handleToolComplete("github")}
          />
        );
      case "claude-code":
        return (
          <ToolSetupSection
            toolId="claude-code"
            isComplete={toolStatus["claude-code"]}
            onMarkComplete={() => handleToolComplete("claude-code")}
          />
        );
      case "supabase":
        return (
          <SupabaseSetup
            onComplete={(project) => {
              console.log("Supabase project connected:", project);
              handleToolComplete("supabase");
            }}
            onToolStatusChange={(complete) => {
              if (complete) {
                handleToolComplete("supabase");
              }
            }}
          />
        );
      case "vercel":
        return (
          <ToolSetupSection
            toolId="vercel"
            isComplete={toolStatus.vercel}
            onMarkComplete={() => handleToolComplete("vercel")}
          />
        );
      case "project-setup":
        return (
          <ProjectSetupSection
            projectName={projectName}
            onProjectNameChange={setProjectName}
            outputDir={outputDir}
            onOutputDirChange={setOutputDir}
            envKeys={envKeys}
            onEnvKeyChange={setEnvKey}
          />
        );
      case "export":
        return (
          <ExportSection
            projectName={projectName}
            template={template}
            featureCount={Object.values(selectedFeatures).flat().length}
            isReady={completedSteps.size >= 5}
            onExport={(method) => {
              console.log("Export with method:", method);
              completeStep(TOTAL_STEPS as Step);
            }}
            onShowPreview={() => setShowLivePreview(true)}
          />
        );
      default:
        return null;
    }
  };

  // Render main content area based on current step
  const renderMainContent = () => {
    const currentSection = STEP_TO_SECTION[currentStep];
    
    switch (currentSection) {
      case "research":
        return (
          <div className="space-y-6" id="research-results">
            {/* Before research: Show instructions */}
            {!researchResult && !isResearching && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-foreground mb-2">Research Your Project</h2>
                <p className="text-foreground-secondary mb-4">
                  Use the sidebar to describe your niche and add inspiration URLs.
                  Our AI will analyze competitors and recommend features.
                </p>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">1</span>
                    Enter your domain in the sidebar
                  </h3>
                  <p className="text-sm text-foreground-secondary ml-8 mb-4">
                    Be specific! &quot;Pet food subscription for senior dogs&quot; is better than &quot;pet store&quot;
                  </p>
                  
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">2</span>
                    Add inspiration websites (optional)
                  </h3>
                  <p className="text-sm text-foreground-secondary ml-8 mb-4">
                    Competitor sites help us understand your market and recommend features
                  </p>
                  
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">3</span>
                    Click &quot;Research&quot; to start AI analysis
                  </h3>
                  <p className="text-sm text-foreground-secondary ml-8">
                    We&apos;ll crawl sites, extract insights, and recommend a template + features
                  </p>
                </div>
              </div>
            )}

            {/* During research: Show loading state */}
            {isResearching && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Your Project...</h2>
                <p className="text-foreground-secondary mb-6">
                  Our AI is researching your domain and analyzing inspiration sites.
                </p>
                <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Processing...</div>
                      <div className="text-sm text-foreground-secondary">This may take 10-30 seconds</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-foreground-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Analyzing domain: {researchDomain}
                    </div>
                    {inspirationUrls.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Crawling {inspirationUrls.length} inspiration site(s)...
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted" />
                      Generating recommendations...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Research Error */}
            {researchError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                <strong>Research Failed:</strong> {researchError}
                <button 
                  onClick={handleResetResearch}
                  className="ml-4 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Research Results */}
            {researchResult && researchResult.success && (
              <ResearchResults
                result={researchResult}
                onApplyRecommendations={handleApplyRecommendations}
                appliedFeatures={selectedFeatures}
              />
            )}
          </div>
        );
        
      case "core-features":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Integrations</h2>
              <p className="text-foreground-secondary">
                Choose the features you want in your project. You can always add more later.
              </p>
            </div>
            {/* Show feature preview or template info */}
            {selectedTemplate && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-foreground-secondary">{selectedTemplate.description}</p>
              </div>
            )}
          </div>
        );
        
      case "integrate-ai":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">AI Integration</h2>
              <p className="text-foreground-secondary">
                Configure your AI provider for intelligent features in your app.
              </p>
            </div>
            {/* Show configured AI provider info */}
            {aiProvider && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Selected Provider</h3>
                <p className="text-sm text-foreground-secondary capitalize">{aiProvider}</p>
              </div>
            )}
          </div>
        );
        
      case "payments":
      case "email":
      case "analytics":
      case "auth-provider":
      case "storage":
      case "search":
      case "cms":
      case "monitoring":
      case "image-opt":
      case "background-jobs":
      case "notifications":
      case "feature-flags":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {STEP_TITLES[currentStep]} Integration
              </h2>
              <p className="text-foreground-secondary">
                Choose a provider in the sidebar. All integrations are optional - skip what you don&apos;t need.
              </p>
            </div>
            
            {/* Show configured providers summary */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Configured Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "AI", value: aiProvider },
                  { label: "Payments", value: paymentProvider },
                  { label: "Email", value: emailProvider },
                  { label: "Analytics", value: analyticsProvider },
                  { label: "Auth", value: authProvider },
                  { label: "Storage", value: storageProvider },
                  { label: "Search", value: searchProvider },
                  { label: "CMS", value: cmsProvider },
                  { label: "Monitoring", value: monitoringProvider },
                  { label: "Images", value: imageOptProvider },
                  { label: "Jobs", value: backgroundJobsProvider },
                  { label: "Notifications", value: notificationsProvider },
                  { label: "Flags", value: featureFlagsProvider },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      value ? "bg-success/10 text-success" : "bg-background-alt text-foreground-secondary"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        value ? "bg-success text-white" : "bg-border"
                      }`}
                    >
                      {value ? "✓" : ""}
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "cursor":
      case "github":
      case "supabase":
      case "vercel":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {STEP_TITLES[currentStep]}
              </h2>
              <p className="text-foreground-secondary">
                Follow the steps in the sidebar to set up {STEP_TITLES[currentStep]}.
              </p>
            </div>
            
            {/* Show Generate Framework when on final step */}
            {currentSection === "vercel" && (
              <GenerateFramework />
            )}
            
            {/* Show progress overview for tool setup steps */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Tools Setup Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(toolStatus).map(([tool, isComplete]) => (
                  <div
                    key={tool}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      isComplete ? "bg-success/10 text-success" : "bg-background-alt text-foreground-secondary"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isComplete ? "bg-success text-white" : "bg-border"
                      }`}
                    >
                      {isComplete ? "✓" : ""}
                    </div>
                    <span className="capitalize">{tool.replace("-", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Accordion Sidebar with inline section content */}
      <AccordionSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={(step) => setStep(step as Step)}
        sectionBadges={sectionBadges}
      >
        {renderSectionContent}
      </AccordionSidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background-alt">
          {/* Mobile menu */}
          <MobileSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={(step) => setStep(step as Step)}
            sectionBadges={sectionBadges}
          >
            {renderSectionContent}
          </MobileSidebar>

          {/* Breadcrumb */}
          <div className="flex-1">
            <div className="text-sm text-foreground-muted">
              {getPhaseForStep(currentStep)} › {STEP_TITLES[currentStep]}
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {STEP_TITLES[currentStep]}
            </h1>
          </div>

          {/* Preview Toggle */}
          <PreviewToggleButton 
            isVisible={showLivePreview} 
            onToggle={() => setShowLivePreview(!showLivePreview)} 
          />

          {/* Feature/Service Counts - distinct labels to avoid confusion */}
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <span className="font-medium text-primary">{Object.values(selectedFeatures).flat().length}</span>
              <span>features</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <span className="font-medium text-primary">{Object.values(integrations).filter(Boolean).length}</span>
              <span>services</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {/* Scrollable Content with Preview Card */}
        <main className="flex-1 overflow-auto">
          <div className="flex gap-6 px-6 py-8">
            {/* Main Content */}
            <div 
              key={animationKey}
              className={`flex-1 max-w-3xl ${
                animationDirection === "right" ? "slide-in-right" : "slide-in-left"
              }`}
            >
              {renderMainContent()}
            </div>

            {/* Right Panel - Preview Card & Overview (hidden on mobile) */}
            <div className="hidden xl:flex flex-col gap-4 w-80 shrink-0 sticky top-0 h-fit">
              <PreviewCard />
              <ProjectOverviewBox showAnalysis={currentStep > 2} />
            </div>
          </div>
        </main>

      </div>

      {/* Live Preview Panel - Using polished components */}
      <LivePreviewPanel
        template={template}
        integrations={integrations}
        selectedFeatures={selectedFeatures}
        projectName={projectName}
        description={description}
        vision={vision}
        mission={mission}
        inspirations={inspirations}
        branding={{ colorScheme, customColors }}
        isVisible={showLivePreview}
        onToggle={() => setShowLivePreview(!showLivePreview)}
      />
    </div>
  );
}
