"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  DynamicPreviewRendererProps, 
  BrandingConfig, 
  PageConfig,
  SectionConfig,
  DEFAULT_BRANDING 
} from "@/lib/patterns/types";
import { SectionRenderer } from "./SectionRenderer";
import { DraggableSectionList } from "./DraggableSectionList";
import { SectionPickerModal } from "./SectionPickerModal";
import { AddSectionButton } from "./AddSectionButton";

/**
 * ThemeProvider
 * Applies branding as CSS custom properties
 */
function ThemeProvider({
  branding,
  children,
}: {
  branding: BrandingConfig;
  children: React.ReactNode;
}) {
  const style = useMemo(
    () =>
      ({
        "--preview-primary": branding.colors.primary,
        "--preview-secondary": branding.colors.secondary,
        "--preview-accent": branding.colors.accent,
        "--preview-background": branding.colors.background,
        "--preview-foreground": branding.colors.foreground,
        "--preview-muted": branding.colors.muted,
        "--preview-border": branding.colors.border,
        "--preview-card": branding.colors.card,
        "--preview-destructive": branding.colors.destructive,
        "--preview-success": branding.colors.success,
        "--font-heading": branding.fonts.heading,
        "--font-body": branding.fonts.body,
        "--font-mono": branding.fonts.mono,
        "--container-max": branding.spacing.containerMax,
        backgroundColor: branding.colors.background,
        color: branding.colors.foreground,
        fontFamily: branding.fonts.body,
      }) as React.CSSProperties,
    [branding]
  );

  return (
    <div style={style} className="min-h-full">
      {children}
    </div>
  );
}

/**
 * Viewport container with responsive sizing
 */
function ViewportContainer({
  viewport,
  children,
}: {
  viewport: "desktop" | "tablet" | "mobile";
  children: React.ReactNode;
}) {
  const viewportWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  }[viewport];

  const containerStyle: React.CSSProperties =
    viewport !== "desktop"
      ? {
          width: viewportWidth,
          margin: "0 auto",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }
      : {};

  return <div style={containerStyle}>{children}</div>;
}

/**
 * DynamicPreviewRenderer
 * 
 * Renders a complete page from a ProjectDefinition.
 * - Applies branding as CSS variables
 * - Supports viewport switching
 * - Supports editable mode with section selection
 */
export function DynamicPreviewRenderer({
  definition,
  currentPage = "/",
  viewport = "desktop",
  editable = false,
  onDefinitionChange,
}: DynamicPreviewRendererProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState(0);

  // Find the current page
  const page = useMemo(() => {
    return definition.pages.find((p) => p.path === currentPage);
  }, [definition.pages, currentPage]);

  // Sort sections by order if specified
  const sortedSections = useMemo(() => {
    if (!page) return [];
    return [...page.sections].sort(
      (a, b) => (a.customizations?.order ?? 0) - (b.customizations?.order ?? 0)
    );
  }, [page]);

  // Handle section props change
  const handleSectionPropsChange = (sectionId: string, newProps: Record<string, unknown>) => {
    if (!onDefinitionChange) return;

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;

      return {
        ...p,
        sections: p.sections.map((s) =>
          s.id === sectionId ? { ...s, props: newProps } : s
        ),
      };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  };

  // Handle sections reorder via drag-drop
  const handleSectionsChange = useCallback((newSections: SectionConfig[]) => {
    if (!onDefinitionChange) return;

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;
      return { ...p, sections: newSections };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  }, [definition, currentPage, onDefinitionChange]);

  // Handle individual section change
  const handleSectionChange = useCallback((index: number, section: SectionConfig) => {
    if (!onDefinitionChange) return;

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;
      const newSections = [...p.sections];
      newSections[index] = section;
      return { ...p, sections: newSections };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  }, [definition, currentPage, onDefinitionChange]);

  // Handle section duplicate
  const handleSectionDuplicate = useCallback((index: number) => {
    if (!onDefinitionChange || !page) return;

    const sectionToDupe = page.sections[index];
    const duplicated: SectionConfig = {
      ...sectionToDupe,
      id: `${sectionToDupe.id}-copy-${Date.now()}`,
    };

    const newSections = [...page.sections];
    newSections.splice(index + 1, 0, duplicated);

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;
      return { ...p, sections: newSections };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  }, [definition, currentPage, page, onDefinitionChange]);

  // Handle section delete
  const handleSectionDelete = useCallback((index: number) => {
    if (!onDefinitionChange || !page) return;

    const newSections = page.sections.filter((_, i) => i !== index);

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;
      return { ...p, sections: newSections };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  }, [definition, currentPage, page, onDefinitionChange]);

  // Handle opening add section picker
  const handleOpenAddSection = useCallback((index: number) => {
    setInsertIndex(index);
    setPickerOpen(true);
  }, []);

  // Handle adding a new section
  const handleAddSection = useCallback((patternId: string, defaultProps?: Record<string, unknown>) => {
    if (!onDefinitionChange || !page) return;

    const newSection: SectionConfig = {
      id: `section-${Date.now()}`,
      patternId,
      props: defaultProps || {},
    };

    const newSections = [...page.sections];
    newSections.splice(insertIndex, 0, newSection);

    const updatedPages = definition.pages.map((p) => {
      if (p.path !== currentPage) return p;
      return { ...p, sections: newSections };
    });

    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  }, [definition, currentPage, page, insertIndex, onDefinitionChange]);

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p>Page not found: {currentPage}</p>
        </div>
      </div>
    );
  }

  return (
    <ViewportContainer viewport={viewport}>
      <ThemeProvider branding={definition.branding || DEFAULT_BRANDING}>
        {/* Navigation (if defined) */}
        {definition.navigation && (
          <SectionRenderer
            section={{
              id: "nav",
              patternId: definition.navigation.patternId,
              props: definition.navigation.props,
            }}
            branding={definition.branding || DEFAULT_BRANDING}
            editable={editable}
          />
        )}

        {/* Page Sections */}
        <main>
          {editable ? (
            <DraggableSectionList
              sections={sortedSections}
              branding={definition.branding || DEFAULT_BRANDING}
              editable={editable}
              onSectionsChange={handleSectionsChange}
              onSectionChange={handleSectionChange}
              onSectionDuplicate={handleSectionDuplicate}
              onSectionDelete={handleSectionDelete}
            />
          ) : (
            sortedSections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                branding={definition.branding || DEFAULT_BRANDING}
                editable={false}
              />
            ))
          )}
        </main>

        {/* Footer (if defined) */}
        {definition.footer && (
          <SectionRenderer
            section={{
              id: "footer",
              patternId: definition.footer.patternId,
              props: definition.footer.props,
            }}
            branding={definition.branding || DEFAULT_BRANDING}
            editable={editable}
          />
        )}

        {/* Empty state */}
        {sortedSections.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p>No sections defined for this page</p>
              {editable && <p className="text-sm mt-2">Add sections from the pattern library</p>}
            </div>
          </div>
        )}
      </ThemeProvider>
    </ViewportContainer>
  );
}

/**
 * Create a minimal project definition for testing
 */
export function createTestDefinition(): import("@/lib/patterns/types").ProjectDefinition {
  return {
    meta: {
      name: "Test Project",
      description: "A test project for previewing patterns",
      template: "saas",
    },
    branding: DEFAULT_BRANDING,
    pages: [
      {
        path: "/",
        title: "Home",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-centered-gradient",
            props: {
              headline: "Build Amazing Products",
              subheadline: "The fastest way to ship your next big idea",
              primaryCta: { text: "Get Started", href: "/signup" },
              secondaryCta: { text: "Learn More", href: "/features" },
              badge: "Now in public beta",
            },
          },
          {
            id: "features-1",
            patternId: "features-icon-grid",
            props: {
              title: "Everything you need",
              subtitle: "Built for modern teams",
              features: [
                { title: "Lightning Fast", description: "Optimized for speed at every level" },
                { title: "Secure", description: "Enterprise-grade security built in" },
                { title: "Scalable", description: "Grows with your business" },
              ],
            },
          },
        ],
      },
    ],
  };
}

export default DynamicPreviewRenderer;

