/**
 * Pattern Test Fixtures
 * 
 * Provides example props and test data for pattern testing.
 */

// ============================================================================
// Example Props by Pattern Type
// ============================================================================

export const EXAMPLE_PROPS = {
  // Hero patterns
  'hero-centered': {
    headline: 'Build Something Amazing',
    subheadline: 'The fastest way to launch your next project',
    ctaText: 'Get Started',
    ctaLink: '/signup',
    secondaryCta: 'Learn More',
  },
  'hero-split-image': {
    headline: 'Transform Your Workflow',
    subheadline: 'Powerful tools for modern teams',
    ctaText: 'Try Free',
    image: '/hero-image.png',
    imageAlt: 'Product screenshot',
  },

  // Features patterns
  'features-grid': {
    title: 'Why Choose Us',
    subtitle: 'Everything you need to succeed',
    features: [
      { title: 'Fast', description: 'Lightning quick performance', icon: 'zap' },
      { title: 'Secure', description: 'Enterprise-grade security', icon: 'shield' },
      { title: 'Scalable', description: 'Grows with your business', icon: 'trending-up' },
    ],
  },
  'features-alternating': {
    features: [
      {
        title: 'Feature One',
        description: 'Description of feature one',
        image: '/feature-1.png',
        imageAlt: 'Feature 1',
      },
      {
        title: 'Feature Two',
        description: 'Description of feature two',
        image: '/feature-2.png',
        imageAlt: 'Feature 2',
      },
    ],
  },

  // Pricing patterns
  'pricing-three-tier': {
    title: 'Simple Pricing',
    plans: [
      { name: 'Basic', price: 9, features: ['Feature 1', 'Feature 2'], cta: 'Start' },
      { name: 'Pro', price: 29, features: ['All Basic', 'Feature 3'], cta: 'Start', popular: true },
      { name: 'Enterprise', price: 99, features: ['All Pro', 'Feature 4'], cta: 'Contact' },
    ],
    showToggle: true,
  },

  // Testimonials patterns
  'testimonials-grid': {
    title: 'What Our Customers Say',
    testimonials: [
      { quote: 'Amazing product!', author: 'John Doe', company: 'Acme Inc', avatar: '/avatar-1.png' },
      { quote: 'Changed our workflow', author: 'Jane Smith', company: 'Tech Co', avatar: '/avatar-2.png' },
    ],
  },
  'testimonials-carousel': {
    testimonials: [
      { quote: 'Five stars!', author: 'Alice Johnson', company: 'StartupXYZ', avatar: '/avatar-3.png' },
      { quote: 'Highly recommend', author: 'Bob Wilson', company: 'BigCorp', avatar: '/avatar-4.png' },
    ],
  },

  // CTA patterns
  'cta-simple': {
    headline: 'Ready to Get Started?',
    subheadline: 'Join thousands of happy customers',
    ctaText: 'Sign Up Now',
    ctaLink: '/signup',
  },

  // FAQ patterns
  'faq-accordion': {
    title: 'Frequently Asked Questions',
    items: [
      { question: 'How does it work?', answer: 'It works like magic.' },
      { question: 'What is the pricing?', answer: 'See our pricing page.' },
    ],
  },

  // Footer patterns
  'footer-multi-column': {
    projectName: 'MyApp',
    description: 'Building the future, one feature at a time.',
    links: [
      { group: 'Product', items: ['Features', 'Pricing', 'Demo'] },
      { group: 'Company', items: ['About', 'Blog', 'Careers'] },
      { group: 'Legal', items: ['Privacy', 'Terms'] },
    ],
    showSocial: true,
  },

  // Navigation patterns
  'nav-standard': {
    projectName: 'MyApp',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
    ],
    showAuth: true,
  },

  // Stats patterns
  'stats-simple': {
    stats: [
      { value: '10K+', label: 'Active Users' },
      { value: '99.9%', label: 'Uptime' },
      { value: '24/7', label: 'Support' },
    ],
  },
}

// ============================================================================
// Get Example Props by Pattern ID
// ============================================================================

export function getExampleProps(patternId, template = 'saas') {
  const props = EXAMPLE_PROPS[patternId]
  
  if (!props) {
    // Generate generic props based on pattern ID
    return generateGenericProps(patternId)
  }
  
  return props
}

function generateGenericProps(patternId) {
  return {
    title: `${patternId} Section`,
    content: `Content for ${patternId}`,
  }
}

// ============================================================================
// Required Props Only (for minimal rendering tests)
// ============================================================================

export function getRequiredPropsOnly(pattern) {
  const requiredProps = {}
  
  pattern.slots
    .filter(slot => slot.required)
    .forEach(slot => {
      switch (slot.type) {
        case 'text':
        case 'richText':
          requiredProps[slot.name] = slot.defaultValue || 'Required text'
          break
        case 'image':
          requiredProps[slot.name] = slot.defaultValue || '/placeholder.png'
          break
        case 'boolean':
          requiredProps[slot.name] = slot.defaultValue !== undefined ? slot.defaultValue : true
          break
        case 'number':
          requiredProps[slot.name] = slot.defaultValue !== undefined ? slot.defaultValue : 0
          break
        case 'array':
          requiredProps[slot.name] = slot.defaultValue || []
          break
        default:
          requiredProps[slot.name] = slot.defaultValue || null
      }
    })
  
  return requiredProps
}

// ============================================================================
// Variant Test Cases
// ============================================================================

export const VARIANT_TEST_CASES = {
  light: { className: 'bg-white text-gray-900' },
  dark: { className: 'bg-gray-900 text-white' },
  gradient: { className: 'bg-gradient-to-r from-primary to-secondary' },
  transparent: { className: 'bg-transparent' },
  solid: { className: 'bg-white shadow-sm' },
}

export function getVariantTestCase(variant) {
  return VARIANT_TEST_CASES[variant] || { className: '' }
}

