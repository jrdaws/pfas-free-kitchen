/**
 * Test Mocks for Composer Tests
 * 
 * Provides mock data for testing the pattern composition system.
 */

import { getAvailablePatterns } from '../../../website/lib/composer/selector.js'

// ============================================================================
// Vision Document Mocks
// ============================================================================

export function createMockVision(overrides = {}) {
  return {
    projectName: 'Test SaaS App',
    description: 'A project management tool for remote teams',
    audience: 'Remote teams and distributed companies',
    tone: 'professional',
    goals: ['Convert visitors to signups', 'Showcase key features'],
    keywords: ['productivity', 'remote work', 'collaboration'],
    ...overrides,
  }
}

export function createPlayfulVision() {
  return createMockVision({
    projectName: 'FunApp',
    description: 'A gamified productivity app for students',
    audience: 'College students',
    tone: 'playful',
    keywords: ['fun', 'games', 'motivation'],
  })
}

export function createLuxuryVision() {
  return createMockVision({
    projectName: 'LuxuryBrand',
    description: 'High-end fashion e-commerce platform',
    audience: 'Affluent consumers',
    tone: 'luxurious',
    keywords: ['luxury', 'fashion', 'exclusive'],
  })
}

export function createTechnicalVision() {
  return createMockVision({
    projectName: 'DevTools',
    description: 'Developer tools and APIs for building applications',
    audience: 'Software developers',
    tone: 'technical',
    keywords: ['developer', 'API', 'tools'],
  })
}

// ============================================================================
// Research Result Mocks
// ============================================================================

export function createMockResearch(overrides = {}) {
  return {
    insights: [
      'Target audience values simplicity and fast onboarding',
      'Competitors use 3-tier pricing models',
      'Social proof is critical for B2B conversion',
    ],
    recommendations: [
      'Include testimonials from known companies',
      'Highlight integrations with popular tools',
      'Emphasize security and data privacy',
    ],
    ...overrides,
  }
}

export function createEmptyResearch() {
  return {
    insights: [],
    recommendations: [],
  }
}

export function createCompetitorResearch() {
  return {
    insights: [
      'Competitor A uses video testimonials',
      'Competitor B has free tier with conversion funnel',
    ],
    recommendations: [
      'Consider video content',
      'Add free tier to pricing',
    ],
    competitorAnalysis: [
      {
        name: 'Competitor A',
        strengths: ['Strong social proof', 'Video content'],
        patterns: ['hero-video', 'testimonials-carousel'],
      },
      {
        name: 'Competitor B',
        strengths: ['Free tier', 'Clear pricing'],
        patterns: ['pricing-three-tier', 'features-comparison'],
      },
    ],
  }
}

// ============================================================================
// Selector Input Mocks
// ============================================================================

export function createMockSelectorInput(overrides = {}) {
  return {
    vision: createMockVision(),
    pageType: 'home',
    availablePatterns: getAvailablePatterns(),
    ...overrides,
  }
}

export function createMockSaaSInput(overrides = {}) {
  return createMockSelectorInput({
    vision: createMockVision({
      description: 'B2B SaaS application for team productivity',
    }),
    ...overrides,
  })
}

export function createMockEcommerceInput(overrides = {}) {
  return createMockSelectorInput({
    vision: createMockVision({
      projectName: 'ShopNow',
      description: 'E-commerce platform for handmade goods',
      audience: 'Craft enthusiasts and gift buyers',
      tone: 'friendly',
    }),
    ...overrides,
  })
}

export function createMockBlogInput(overrides = {}) {
  return createMockSelectorInput({
    vision: createMockVision({
      projectName: 'TechBlog',
      description: 'Technical blog for software developers',
      audience: 'Software developers',
      tone: 'technical',
    }),
    ...overrides,
  })
}

// ============================================================================
// Composition Output Mocks
// ============================================================================

export function createMockComposition() {
  return {
    sections: [
      {
        patternId: 'nav-standard',
        reason: 'Standard navigation for consistent UX',
        variant: 'solid',
        order: 1,
        confidenceScore: 95,
      },
      {
        patternId: 'hero-centered',
        reason: 'Professional centered hero for SaaS',
        variant: 'dark',
        order: 2,
        confidenceScore: 90,
      },
      {
        patternId: 'features-grid',
        reason: 'Grid layout for 3 key features',
        variant: 'light',
        order: 3,
        confidenceScore: 85,
      },
      {
        patternId: 'testimonials-grid',
        reason: 'Social proof for B2B conversion',
        variant: 'light',
        order: 4,
        confidenceScore: 88,
      },
      {
        patternId: 'cta-simple',
        reason: 'Clear call to action for conversion',
        variant: 'gradient',
        order: 5,
        confidenceScore: 92,
      },
      {
        patternId: 'footer-multi-column',
        reason: 'Comprehensive footer with links',
        variant: 'dark',
        order: 6,
        confidenceScore: 95,
      },
    ],
    layoutRecommendation: 'layout-marketing',
  }
}

export function createMockPricingComposition() {
  return {
    sections: [
      {
        patternId: 'nav-standard',
        reason: 'Consistent navigation',
        variant: 'solid',
        order: 1,
        confidenceScore: 95,
      },
      {
        patternId: 'pricing-three-tier',
        reason: 'Standard SaaS pricing layout',
        variant: 'light',
        order: 2,
        confidenceScore: 92,
      },
      {
        patternId: 'faq-accordion',
        reason: 'Answer common pricing questions',
        variant: 'light',
        order: 3,
        confidenceScore: 85,
      },
      {
        patternId: 'cta-simple',
        reason: 'Conversion after pricing view',
        variant: 'gradient',
        order: 4,
        confidenceScore: 88,
      },
      {
        patternId: 'footer-multi-column',
        reason: 'Standard footer',
        variant: 'dark',
        order: 5,
        confidenceScore: 95,
      },
    ],
    layoutRecommendation: 'layout-marketing',
  }
}

// ============================================================================
// Props Generation Mocks
// ============================================================================

export function createMockHeroProps() {
  return {
    headline: 'Build Better Products Faster',
    subheadline: 'The all-in-one platform for remote teams to collaborate and ship',
    ctaText: 'Get Started Free',
    ctaLink: '/signup',
    secondaryCta: 'Watch Demo',
  }
}

export function createMockFeaturesProps() {
  return {
    title: 'Why Teams Choose Us',
    subtitle: 'Everything you need to work together, from anywhere',
    features: [
      {
        title: 'Real-time Collaboration',
        description: 'Work together seamlessly with instant updates',
        icon: 'users',
      },
      {
        title: 'Integrated Tools',
        description: 'Connect with your favorite apps',
        icon: 'link',
      },
      {
        title: 'Analytics Dashboard',
        description: 'Track progress and measure success',
        icon: 'chart',
      },
    ],
  }
}

export function createMockPricingProps() {
  return {
    title: 'Simple, Transparent Pricing',
    plans: [
      {
        name: 'Starter',
        price: 9,
        period: 'month',
        features: ['Up to 5 users', 'Basic analytics', 'Email support'],
        cta: 'Start Free Trial',
      },
      {
        name: 'Pro',
        price: 29,
        period: 'month',
        features: ['Up to 25 users', 'Advanced analytics', 'Priority support'],
        cta: 'Start Free Trial',
        popular: true,
      },
      {
        name: 'Enterprise',
        price: 99,
        period: 'month',
        features: ['Unlimited users', 'Custom analytics', 'Dedicated support'],
        cta: 'Contact Sales',
      },
    ],
    showToggle: true,
  }
}

