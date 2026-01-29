/**
 * Lighthouse CI Configuration
 * 
 * Run with: npx lhci autorun
 * 
 * Prerequisites:
 *   npm install -g @lhci/cli
 *   
 * Or use locally:
 *   npx @lhci/cli autorun
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test (assumes dev server running on localhost:3000)
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/search',
        'http://localhost:3000/search?q=skillet',
        'http://localhost:3000/compare',
        'http://localhost:3000/learn/what-is-pfas',
        'http://localhost:3000/about',
      ],
      // Number of runs per URL for consistent results
      numberOfRuns: 3,
      // Start server command (optional, if server not already running)
      // startServerCommand: 'npm run start',
      // Wait for server to be ready
      // startServerReadyPattern: 'ready on',
      settings: {
        // Use mobile device emulation
        preset: 'desktop',
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Skip certain audits in CI
        skipAudits: [
          'uses-http2', // Dev server may not use HTTP/2
          'redirects-http', // Dev server uses HTTP
        ],
      },
    },
    assert: {
      // Performance budgets and requirements
      assertions: {
        // Category scores (0-1 scale)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        
        // Resource hints
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        
        // Images
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // JavaScript
        'unused-javascript': 'warn',
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        
        // Accessibility
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        
        // SEO
        'meta-description': 'error',
        'crawlable-anchors': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
      },
    },
    upload: {
      // Don't upload to Lighthouse CI server by default
      target: 'temporary-public-storage',
    },
  },
};
