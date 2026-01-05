/**
 * Pattern Registry
 * 
 * Central registry of all available patterns.
 * Organized by atomic design category.
 */

import type { Pattern } from './types';

/**
 * All registered patterns
 */
export const PATTERN_REGISTRY: Record<string, Pattern> = {
  // ============================================================
  // ATOMS - Smallest UI units
  // ============================================================
  'button-primary': {
    id: 'button-primary',
    name: 'Primary Button',
    category: 'atom',
    description: 'Primary action button with hover states',
    version: '1.0.0',
    slots: [
      { name: 'text', type: 'text', required: true, description: 'Button label' },
      { name: 'href', type: 'text', required: false, description: 'Link destination' },
      { name: 'onClick', type: 'object', required: false, description: 'Click handler' },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'large', name: 'Large', className: 'px-8 py-4 text-lg' },
      { id: 'small', name: 'Small', className: 'px-4 py-2 text-sm' },
    ],
    component: 'atoms/button-primary',
    dependencies: [],
    tags: ['button', 'cta', 'action'],
    bestFor: ['forms', 'cta', 'navigation'],
  },

  'button-secondary': {
    id: 'button-secondary',
    name: 'Secondary Button',
    category: 'atom',
    description: 'Secondary action button with outline style',
    version: '1.0.0',
    slots: [
      { name: 'text', type: 'text', required: true },
      { name: 'href', type: 'text', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'ghost', name: 'Ghost', className: 'border-0' },
    ],
    component: 'atoms/button-secondary',
    dependencies: [],
    tags: ['button', 'secondary', 'action'],
    bestFor: ['alternative-actions', 'cancel'],
  },

  'badge': {
    id: 'badge',
    name: 'Badge',
    category: 'atom',
    description: 'Small label for status or categories',
    version: '1.0.0',
    slots: [
      { name: 'text', type: 'text', required: true },
      { name: 'color', type: 'text', required: false, defaultValue: 'primary' },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'solid', name: 'Solid' },
      { id: 'outline', name: 'Outline' },
      { id: 'subtle', name: 'Subtle' },
    ],
    component: 'atoms/badge',
    dependencies: [],
    tags: ['badge', 'label', 'status'],
    bestFor: ['status', 'categories', 'tags'],
  },

  'input': {
    id: 'input',
    name: 'Text Input',
    category: 'atom',
    description: 'Text input field with label',
    version: '1.0.0',
    slots: [
      { name: 'label', type: 'text', required: false },
      { name: 'placeholder', type: 'text', required: false },
      { name: 'type', type: 'text', required: false, defaultValue: 'text' },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'floating', name: 'Floating Label' },
    ],
    component: 'atoms/input',
    dependencies: [],
    tags: ['input', 'form', 'text'],
    bestFor: ['forms', 'search', 'data-entry'],
  },

  // ============================================================
  // MOLECULES - Combined atoms
  // ============================================================
  'nav-link': {
    id: 'nav-link',
    name: 'Navigation Link',
    category: 'molecule',
    description: 'Navigation link with active state',
    version: '1.0.0',
    slots: [
      { name: 'label', type: 'text', required: true },
      { name: 'href', type: 'text', required: true },
      { name: 'icon', type: 'component', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'with-icon', name: 'With Icon' },
    ],
    component: 'molecules/nav-link',
    dependencies: [],
    tags: ['navigation', 'link', 'menu'],
    bestFor: ['headers', 'sidebars', 'navigation'],
  },

  'price-card': {
    id: 'price-card',
    name: 'Price Card',
    category: 'molecule',
    description: 'Single pricing tier card',
    version: '1.0.0',
    slots: [
      { name: 'name', type: 'text', required: true, aiGenerate: true },
      { name: 'price', type: 'number', required: true },
      { name: 'interval', type: 'text', required: false, defaultValue: 'month' },
      { name: 'features', type: 'array', required: true, aiGenerate: true },
      { name: 'ctaText', type: 'text', required: false, defaultValue: 'Get Started' },
      { name: 'highlighted', type: 'boolean', required: false },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'highlighted', name: 'Highlighted' },
    ],
    component: 'molecules/price-card',
    dependencies: [],
    tags: ['pricing', 'card', 'subscription'],
    bestFor: ['pricing-pages', 'saas'],
  },

  'testimonial-card': {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'molecule',
    description: 'Single testimonial with quote and author',
    version: '1.0.0',
    slots: [
      { name: 'quote', type: 'text', required: true, aiGenerate: true },
      { name: 'author', type: 'text', required: true },
      { name: 'role', type: 'text', required: false },
      { name: 'company', type: 'text', required: false },
      { name: 'avatar', type: 'image', required: false },
      { name: 'rating', type: 'number', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'with-rating', name: 'With Rating' },
    ],
    component: 'molecules/testimonial-card',
    dependencies: [],
    tags: ['testimonial', 'social-proof', 'quote'],
    bestFor: ['trust', 'social-proof'],
  },

  'feature-card': {
    id: 'feature-card',
    name: 'Feature Card',
    category: 'molecule',
    description: 'Feature highlight with icon and description',
    version: '1.0.0',
    slots: [
      { name: 'title', type: 'text', required: true, aiGenerate: true },
      { name: 'description', type: 'text', required: true, aiGenerate: true },
      { name: 'icon', type: 'text', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'horizontal', name: 'Horizontal' },
    ],
    component: 'molecules/feature-card',
    dependencies: ['lucide-react'],
    tags: ['feature', 'card', 'benefits'],
    bestFor: ['features', 'benefits', 'capabilities'],
  },

  'search-bar': {
    id: 'search-bar',
    name: 'Search Bar',
    category: 'molecule',
    description: 'Search input with icon and button',
    version: '1.0.0',
    slots: [
      { name: 'placeholder', type: 'text', required: false, defaultValue: 'Search...' },
      { name: 'buttonText', type: 'text', required: false },
    ],
    compatibleWith: ['all'],
    requires: ['input', 'button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'inline', name: 'Inline' },
    ],
    component: 'molecules/search-bar',
    dependencies: ['lucide-react'],
    tags: ['search', 'input', 'form'],
    bestFor: ['headers', 'search-pages', 'navigation'],
  },

  // ============================================================
  // ORGANISMS - Complex components
  // ============================================================
  'header-simple': {
    id: 'header-simple',
    name: 'Simple Header',
    category: 'organism',
    description: 'Clean header with logo and navigation',
    version: '1.0.0',
    slots: [
      { name: 'logo', type: 'component', required: true },
      { name: 'navItems', type: 'array', required: true },
      { name: 'ctaText', type: 'text', required: false },
      { name: 'ctaHref', type: 'text', required: false },
    ],
    compatibleWith: ['all'],
    requires: ['nav-link', 'button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'transparent', name: 'Transparent' },
      { id: 'sticky', name: 'Sticky' },
    ],
    component: 'organisms/header-simple',
    dependencies: [],
    tags: ['header', 'navigation', 'nav'],
    bestFor: ['marketing', 'landing-pages'],
  },

  'header-with-search': {
    id: 'header-with-search',
    name: 'Header with Search',
    category: 'organism',
    description: 'Header with integrated search bar',
    version: '1.0.0',
    slots: [
      { name: 'logo', type: 'component', required: true },
      { name: 'navItems', type: 'array', required: true },
      { name: 'searchPlaceholder', type: 'text', required: false },
    ],
    compatibleWith: ['all'],
    requires: ['nav-link', 'search-bar'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'centered', name: 'Centered Search' },
    ],
    component: 'organisms/header-with-search',
    dependencies: ['lucide-react'],
    tags: ['header', 'search', 'navigation'],
    bestFor: ['ecommerce', 'docs', 'marketplaces'],
  },

  'footer-minimal': {
    id: 'footer-minimal',
    name: 'Minimal Footer',
    category: 'organism',
    description: 'Clean footer with copyright and social links',
    version: '1.0.0',
    slots: [
      { name: 'companyName', type: 'text', required: true },
      { name: 'socialLinks', type: 'array', required: false },
      { name: 'links', type: 'array', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'centered', name: 'Centered' },
    ],
    component: 'organisms/footer-minimal',
    dependencies: [],
    tags: ['footer', 'minimal', 'copyright'],
    bestFor: ['simple-sites', 'landing-pages'],
  },

  'footer-full': {
    id: 'footer-full',
    name: 'Full Footer',
    category: 'organism',
    description: 'Comprehensive footer with sitemap and newsletter',
    version: '1.0.0',
    slots: [
      { name: 'logo', type: 'component', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'linkGroups', type: 'array', required: true },
      { name: 'socialLinks', type: 'array', required: false },
      { name: 'showNewsletter', type: 'boolean', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'dark', name: 'Dark' },
    ],
    component: 'organisms/footer-full',
    dependencies: [],
    tags: ['footer', 'sitemap', 'newsletter'],
    bestFor: ['marketing', 'saas', 'corporate'],
  },

  'auth-form': {
    id: 'auth-form',
    name: 'Auth Form',
    category: 'organism',
    description: 'Login/signup form with social providers',
    version: '1.0.0',
    slots: [
      { name: 'mode', type: 'text', required: false, defaultValue: 'login' },
      { name: 'providers', type: 'array', required: false },
      { name: 'showRememberMe', type: 'boolean', required: false },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['input', 'button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'split', name: 'Split (with image)' },
    ],
    component: 'organisms/auth-form',
    dependencies: [],
    tags: ['auth', 'login', 'signup', 'form'],
    bestFor: ['authentication', 'onboarding'],
  },

  // ============================================================
  // SECTIONS - Full page sections
  // ============================================================
  'hero-centered': {
    id: 'hero-centered',
    name: 'Centered Hero',
    category: 'section',
    description: 'Text centered hero with CTA buttons',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true, aiPrompt: 'Write a compelling headline (5-10 words)' },
      { name: 'subtext', type: 'text', required: true, aiGenerate: true, aiPrompt: 'Write supporting text (15-25 words)' },
      { name: 'primaryCta', type: 'object', required: true },
      { name: 'secondaryCta', type: 'object', required: false },
      { name: 'badge', type: 'text', required: false },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['button-primary', 'button-secondary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'dark', name: 'Dark Background' },
      { id: 'gradient', name: 'Gradient Background' },
    ],
    component: 'sections/hero-centered',
    thumbnail: 'thumbnails/hero-centered.png',
    dependencies: [],
    tags: ['hero', 'landing', 'cta'],
    bestFor: ['saas', 'startup', 'product'],
  },

  'hero-split-image': {
    id: 'hero-split-image',
    name: 'Split Hero with Image',
    category: 'section',
    description: 'Text on left, image on right',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: true, aiGenerate: true },
      { name: 'primaryCta', type: 'object', required: true },
      { name: 'image', type: 'image', required: true },
      { name: 'features', type: 'array', required: false, aiGenerate: true },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['button-primary'],
    variants: [
      { id: 'default', name: 'Image Right' },
      { id: 'reversed', name: 'Image Left' },
    ],
    component: 'sections/hero-split-image',
    thumbnail: 'thumbnails/hero-split-image.png',
    dependencies: [],
    tags: ['hero', 'image', 'split'],
    bestFor: ['b2b', 'enterprise', 'product-demo'],
  },

  'hero-video-background': {
    id: 'hero-video-background',
    name: 'Video Background Hero',
    category: 'section',
    description: 'Full-width video background with overlay',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: true, aiGenerate: true },
      { name: 'primaryCta', type: 'object', required: true },
      { name: 'videoSrc', type: 'text', required: true },
      { name: 'posterImage', type: 'image', required: false },
    ],
    compatibleWith: ['agency', 'all'],
    requires: ['button-primary'],
    variants: [
      { id: 'dark-overlay', name: 'Dark Overlay' },
      { id: 'gradient-overlay', name: 'Gradient Overlay' },
    ],
    component: 'sections/hero-video-background',
    thumbnail: 'thumbnails/hero-video.png',
    dependencies: ['lucide-react'],
    tags: ['hero', 'video', 'immersive'],
    bestFor: ['creative', 'agency', 'media'],
  },

  'hero-animated': {
    id: 'hero-animated',
    name: 'Animated Hero',
    category: 'section',
    description: 'Modern hero with animated gradients',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: true, aiGenerate: true },
      { name: 'primaryCta', type: 'object', required: true },
      { name: 'secondaryCta', type: 'object', required: false },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['button-primary'],
    variants: [
      { id: 'purple', name: 'Purple Gradient' },
      { id: 'blue', name: 'Blue Gradient' },
      { id: 'green', name: 'Green Gradient' },
    ],
    component: 'sections/hero-animated',
    thumbnail: 'thumbnails/hero-animated.png',
    dependencies: [],
    tags: ['hero', 'animated', 'gradient'],
    bestFor: ['tech', 'startup', 'modern'],
  },

  'hero-product-showcase': {
    id: 'hero-product-showcase',
    name: 'Product Showcase Hero',
    category: 'section',
    description: 'Hero with prominent product image',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: true, aiGenerate: true },
      { name: 'primaryCta', type: 'object', required: true },
      { name: 'productImage', type: 'image', required: true },
      { name: 'features', type: 'array', required: false },
    ],
    compatibleWith: ['ecommerce', 'saas', 'all'],
    requires: ['button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'floating', name: 'Floating Product' },
    ],
    component: 'sections/hero-product-showcase',
    thumbnail: 'thumbnails/hero-product.png',
    dependencies: [],
    tags: ['hero', 'product', 'showcase'],
    bestFor: ['ecommerce', 'product-launch', 'apps'],
  },

  'features-grid-3': {
    id: 'features-grid-3',
    name: '3-Column Feature Grid',
    category: 'section',
    description: 'Three column grid with icons',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false, aiGenerate: true },
      { name: 'features', type: 'array', required: true, aiGenerate: true, validation: { minItems: 3, maxItems: 9 } },
    ],
    compatibleWith: ['all'],
    requires: ['feature-card'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'cards', name: 'With Cards' },
    ],
    component: 'sections/features-grid-3',
    thumbnail: 'thumbnails/features-grid-3.png',
    dependencies: ['lucide-react'],
    tags: ['features', 'grid', 'benefits'],
    bestFor: ['saas', 'product', 'capabilities'],
  },

  'features-grid-4': {
    id: 'features-grid-4',
    name: '4-Column Feature Grid',
    category: 'section',
    description: 'Four column feature grid',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'features', type: 'array', required: true, aiGenerate: true, validation: { minItems: 4, maxItems: 8 } },
    ],
    compatibleWith: ['all'],
    requires: ['feature-card'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'compact', name: 'Compact' },
    ],
    component: 'sections/features-grid-4',
    thumbnail: 'thumbnails/features-grid-4.png',
    dependencies: ['lucide-react'],
    tags: ['features', 'grid', '4-column'],
    bestFor: ['enterprise', 'complex-products'],
  },

  'features-alternating': {
    id: 'features-alternating',
    name: 'Alternating Features',
    category: 'section',
    description: 'Left-right alternating feature sections',
    version: '1.0.0',
    slots: [
      { name: 'features', type: 'array', required: true, aiGenerate: true },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'with-images', name: 'With Images' },
    ],
    component: 'sections/features-alternating',
    thumbnail: 'thumbnails/features-alternating.png',
    dependencies: [],
    tags: ['features', 'alternating', 'detailed'],
    bestFor: ['storytelling', 'detailed-features'],
  },

  'features-bento': {
    id: 'features-bento',
    name: 'Bento Box Features',
    category: 'section',
    description: 'Asymmetric bento grid layout',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'items', type: 'array', required: true, aiGenerate: true, validation: { minItems: 4, maxItems: 6 } },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'dark', name: 'Dark Theme' },
    ],
    component: 'sections/features-bento',
    thumbnail: 'thumbnails/features-bento.png',
    dependencies: [],
    tags: ['features', 'bento', 'modern'],
    bestFor: ['modern', 'creative', 'apple-style'],
  },

  'pricing-simple': {
    id: 'pricing-simple',
    name: 'Simple Pricing',
    category: 'section',
    description: 'Clean 2-3 tier pricing cards',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'plans', type: 'array', required: true, aiGenerate: true, validation: { minItems: 2, maxItems: 3 } },
    ],
    compatibleWith: ['saas', 'all'],
    requires: ['price-card'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'with-toggle', name: 'With Billing Toggle' },
    ],
    component: 'sections/pricing-simple',
    thumbnail: 'thumbnails/pricing-simple.png',
    dependencies: ['lucide-react'],
    tags: ['pricing', 'subscription', 'tiers'],
    bestFor: ['saas', 'subscription'],
  },

  'pricing-comparison': {
    id: 'pricing-comparison',
    name: 'Pricing Comparison',
    category: 'section',
    description: 'Feature comparison matrix',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true },
      { name: 'plans', type: 'array', required: true },
      { name: 'categories', type: 'array', required: true },
    ],
    compatibleWith: ['saas', 'all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
    ],
    component: 'sections/pricing-comparison',
    thumbnail: 'thumbnails/pricing-comparison.png',
    dependencies: ['lucide-react'],
    tags: ['pricing', 'comparison', 'enterprise'],
    bestFor: ['b2b', 'enterprise', 'complex'],
  },

  'pricing-calculator': {
    id: 'pricing-calculator',
    name: 'Pricing Calculator',
    category: 'section',
    description: 'Interactive usage-based pricing',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true },
      { name: 'metrics', type: 'array', required: true },
      { name: 'basePrice', type: 'number', required: true },
    ],
    compatibleWith: ['saas', 'all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
    ],
    component: 'sections/pricing-calculator',
    thumbnail: 'thumbnails/pricing-calculator.png',
    dependencies: [],
    tags: ['pricing', 'calculator', 'usage-based'],
    bestFor: ['api', 'infrastructure', 'usage-based'],
  },

  'testimonials-carousel': {
    id: 'testimonials-carousel',
    name: 'Testimonial Carousel',
    category: 'section',
    description: 'Sliding testimonial cards',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: false },
      { name: 'testimonials', type: 'array', required: true, aiGenerate: true, validation: { minItems: 3 } },
    ],
    compatibleWith: ['all'],
    requires: ['testimonial-card'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'large', name: 'Large Quotes' },
    ],
    component: 'sections/testimonials-carousel',
    thumbnail: 'thumbnails/testimonials-carousel.png',
    dependencies: ['lucide-react'],
    tags: ['testimonials', 'carousel', 'social-proof'],
    bestFor: ['social-proof', 'trust'],
  },

  'testimonials-grid': {
    id: 'testimonials-grid',
    name: 'Testimonial Grid',
    category: 'section',
    description: 'Static grid of testimonials',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: false },
      { name: 'testimonials', type: 'array', required: true, aiGenerate: true, validation: { minItems: 3, maxItems: 6 } },
    ],
    compatibleWith: ['all'],
    requires: ['testimonial-card'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'masonry', name: 'Masonry' },
    ],
    component: 'sections/testimonials-grid',
    thumbnail: 'thumbnails/testimonials-grid.png',
    dependencies: ['lucide-react'],
    tags: ['testimonials', 'grid', 'static'],
    bestFor: ['volume', 'trust'],
  },

  'logos-marquee': {
    id: 'logos-marquee',
    name: 'Logo Marquee',
    category: 'section',
    description: 'Scrolling customer logo showcase',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: false, defaultValue: 'Trusted by industry leaders' },
      { name: 'logos', type: 'array', required: true, validation: { minItems: 4 } },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'static', name: 'Static Grid' },
    ],
    component: 'sections/logos-marquee',
    thumbnail: 'thumbnails/logos-marquee.png',
    dependencies: [],
    tags: ['logos', 'social-proof', 'trust'],
    bestFor: ['b2b', 'enterprise', 'trust'],
  },

  'cta-centered': {
    id: 'cta-centered',
    name: 'Centered CTA',
    category: 'section',
    description: 'Headline with centered button',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'buttonText', type: 'text', required: true, defaultValue: 'Get Started' },
      { name: 'buttonHref', type: 'text', required: true },
    ],
    compatibleWith: ['all'],
    requires: ['button-primary'],
    variants: [
      { id: 'primary', name: 'Primary Background' },
      { id: 'dark', name: 'Dark Background' },
      { id: 'gradient', name: 'Gradient Background' },
    ],
    component: 'sections/cta-centered',
    thumbnail: 'thumbnails/cta-centered.png',
    dependencies: [],
    tags: ['cta', 'conversion', 'action'],
    bestFor: ['conversion', 'signups'],
  },

  'cta-split-image': {
    id: 'cta-split-image',
    name: 'Split CTA with Image',
    category: 'section',
    description: 'CTA with side image',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'buttonText', type: 'text', required: true },
      { name: 'buttonHref', type: 'text', required: true },
      { name: 'image', type: 'image', required: true },
    ],
    compatibleWith: ['all'],
    requires: ['button-primary'],
    variants: [
      { id: 'default', name: 'Image Right' },
      { id: 'reversed', name: 'Image Left' },
    ],
    component: 'sections/cta-split-image',
    thumbnail: 'thumbnails/cta-split.png',
    dependencies: [],
    tags: ['cta', 'image', 'split'],
    bestFor: ['demos', 'product-showcase'],
  },

  'cta-newsletter': {
    id: 'cta-newsletter',
    name: 'Newsletter CTA',
    category: 'section',
    description: 'Email signup form',
    version: '1.0.0',
    slots: [
      { name: 'headline', type: 'text', required: true, aiGenerate: true },
      { name: 'subtext', type: 'text', required: false },
      { name: 'buttonText', type: 'text', required: false, defaultValue: 'Subscribe' },
      { name: 'placeholder', type: 'text', required: false, defaultValue: 'Enter your email' },
    ],
    compatibleWith: ['all'],
    requires: ['input', 'button-primary'],
    variants: [
      { id: 'default', name: 'Default' },
      { id: 'inline', name: 'Inline' },
    ],
    component: 'sections/cta-newsletter',
    thumbnail: 'thumbnails/cta-newsletter.png',
    dependencies: [],
    tags: ['cta', 'newsletter', 'email'],
    bestFor: ['content', 'blog', 'updates'],
  },

  // ============================================================
  // LAYOUTS - Page wrappers
  // ============================================================
  'layout-marketing': {
    id: 'layout-marketing',
    name: 'Marketing Layout',
    category: 'layout',
    description: 'Public-facing page layout',
    version: '1.0.0',
    slots: [
      { name: 'header', type: 'component', required: true },
      { name: 'footer', type: 'component', required: true },
      { name: 'children', type: 'component', required: true },
    ],
    compatibleWith: ['all'],
    requires: ['header-simple', 'footer-minimal'],
    variants: [
      { id: 'default', name: 'Default' },
    ],
    component: 'layouts/marketing-layout',
    dependencies: [],
    tags: ['layout', 'marketing', 'public'],
    bestFor: ['landing-pages', 'marketing'],
  },

  'layout-dashboard': {
    id: 'layout-dashboard',
    name: 'Dashboard Layout',
    category: 'layout',
    description: 'Authenticated app layout with sidebar',
    version: '1.0.0',
    slots: [
      { name: 'sidebar', type: 'component', required: true },
      { name: 'header', type: 'component', required: false },
      { name: 'children', type: 'component', required: true },
    ],
    compatibleWith: ['saas', 'all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Sidebar' },
      { id: 'topnav', name: 'Top Navigation' },
    ],
    component: 'layouts/dashboard-layout',
    dependencies: ['lucide-react'],
    tags: ['layout', 'dashboard', 'app'],
    bestFor: ['saas', 'admin', 'app'],
  },

  'layout-docs': {
    id: 'layout-docs',
    name: 'Documentation Layout',
    category: 'layout',
    description: 'Docs layout with sidebar navigation',
    version: '1.0.0',
    slots: [
      { name: 'sidebar', type: 'component', required: true },
      { name: 'children', type: 'component', required: true },
      { name: 'toc', type: 'component', required: false },
    ],
    compatibleWith: ['all'],
    requires: [],
    variants: [
      { id: 'default', name: 'Default' },
    ],
    component: 'layouts/docs-layout',
    dependencies: ['lucide-react'],
    tags: ['layout', 'docs', 'documentation'],
    bestFor: ['documentation', 'guides'],
  },
};

/**
 * Get all patterns
 */
export function getAllPatterns(): Pattern[] {
  return Object.values(PATTERN_REGISTRY);
}

/**
 * Get pattern by ID
 */
export function getPattern(id: string): Pattern | undefined {
  return PATTERN_REGISTRY[id];
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: Pattern['category']): Pattern[] {
  return Object.values(PATTERN_REGISTRY).filter((p) => p.category === category);
}

/**
 * Get compatible patterns for a template type
 */
export function getCompatiblePatterns(templateType: string, category?: Pattern['category']): Pattern[] {
  return Object.values(PATTERN_REGISTRY).filter((p) => {
    const compatible = p.compatibleWith.includes('all') || p.compatibleWith.includes(templateType as any);
    if (!compatible) return false;
    if (category && p.category !== category) return false;
    return true;
  });
}

/**
 * Search patterns by tags
 */
export function searchPatterns(query: string): Pattern[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(PATTERN_REGISTRY).filter((p) => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some((t) => t.includes(lowerQuery))
  );
}

export default PATTERN_REGISTRY;

