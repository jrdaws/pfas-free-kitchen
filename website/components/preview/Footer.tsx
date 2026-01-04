"use client";

interface FooterProps {
  projectName: string;
  links?: string[];
  showSocial?: boolean;
  description?: string;
  integrations?: Record<string, string>;
}

// Provider metadata for footer display
const PROVIDER_INFO: Record<string, Record<string, { name: string; color: string; icon: string }>> = {
  analytics: {
    "posthog": { name: "PostHog", color: "#F54E00", icon: "🦔" },
    "plausible": { name: "Plausible", color: "#5850EC", icon: "📊" },
    "google-analytics": { name: "GA4", color: "#F9AB00", icon: "📈" },
  },
  monitoring: {
    "sentry": { name: "Sentry", color: "#362D59", icon: "🐛" },
    "logrocket": { name: "LogRocket", color: "#764ABC", icon: "🎬" },
    "highlight": { name: "Highlight", color: "#6C4FF7", icon: "✨" },
    "axiom": { name: "Axiom", color: "#0066FF", icon: "📋" },
  },
};

export function Footer({
  projectName,
  links = [],
  showSocial = true,
  description,
  integrations = {},
}: FooterProps) {
  // Get analytics and monitoring provider info
  const analyticsProvider = integrations.analytics;
  const monitoringProvider = integrations.monitoring;
  const analyticsInfo = analyticsProvider ? PROVIDER_INFO.analytics[analyticsProvider] : null;
  const monitoringInfo = monitoringProvider ? PROVIDER_INFO.monitoring[monitoringProvider] : null;

  return (
    <footer className="w-full px-6 py-12 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {projectName?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
              <span className="text-white font-semibold">{projectName || "Project"}</span>
            </div>
            {description && (
              <p className="text-foreground-muted text-sm mb-3">{description}</p>
            )}
            {/* Integration badges */}
            {(analyticsInfo || monitoringInfo) && (
              <div className="flex flex-wrap gap-2">
                {analyticsInfo && (
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${analyticsInfo.color}20`, color: analyticsInfo.color }}
                  >
                    {analyticsInfo.icon} {analyticsInfo.name}
                  </span>
                )}
                {monitoringInfo && (
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${monitoringInfo.color}20`, color: monitoringInfo.color }}
                  >
                    {monitoringInfo.icon} {monitoringInfo.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-8">
              {links.map((link, i) => (
                <span
                  key={i}
                  className="text-stone-400 hover:text-white text-sm cursor-pointer transition-colors"
                >
                  {link}
                </span>
              ))}
            </div>
          )}

          {/* Social */}
          {showSocial && (
            <div className="flex gap-4">
              {/* Twitter/X */}
              <div className="w-10 h-10 rounded-lg bg-stone-50/5 hover:bg-stone-50/10 flex items-center justify-center cursor-pointer transition-colors">
                <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              {/* GitHub */}
              <div className="w-10 h-10 rounded-lg bg-stone-50/5 hover:bg-stone-50/10 flex items-center justify-center cursor-pointer transition-colors">
                <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              {/* LinkedIn */}
              <div className="w-10 h-10 rounded-lg bg-stone-50/5 hover:bg-stone-50/10 flex items-center justify-center cursor-pointer transition-colors">
                <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-foreground-secondary text-sm text-center">
            © {new Date().getFullYear()} {projectName || "Project"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

