/**
 * Context-Aware AI Prompt Builder
 * 
 * Builds system prompts that include accumulated context
 * for more coherent AI generations.
 */

import type { SessionContext, Correction } from "./types";

export interface PromptContext {
  context: SessionContext;
  taskType: "research" | "preview" | "component" | "export" | "refinement";
  additionalInstructions?: string;
}

/**
 * Build a context-aware system prompt
 */
export function buildContextAwarePrompt(promptContext: PromptContext): string {
  const { context, taskType, additionalInstructions } = promptContext;
  const { understanding, corrections, interactions } = context;

  const sections: string[] = [];

  // Section 1: Project Understanding
  sections.push(buildUnderstandingSection(understanding));

  // Section 2: User Corrections (what they've taught us)
  if (corrections.length > 0) {
    sections.push(buildCorrectionsSection(corrections));
  }

  // Section 3: Recent Interactions Summary
  if (interactions.length > 0) {
    sections.push(buildInteractionsSummary(interactions, taskType));
  }

  // Section 4: Task-Specific Instructions
  sections.push(buildTaskInstructions(taskType, understanding));

  // Section 5: Additional Instructions
  if (additionalInstructions) {
    sections.push(`## Additional Instructions\n${additionalInstructions}`);
  }

  // Section 6: Output Guidelines
  sections.push(buildOutputGuidelines(taskType));

  return sections.join("\n\n");
}

function buildUnderstandingSection(understanding: SessionContext["understanding"]): string {
  const lines: string[] = ["## Project Understanding"];
  
  if (understanding.projectName) {
    lines.push(`- **Project Name**: ${understanding.projectName}`);
  }
  
  lines.push(`- **Project Type**: ${understanding.projectType}`);
  
  if (understanding.problem) {
    lines.push(`- **Problem Being Solved**: ${understanding.problem}`);
  }
  
  if (understanding.targetAudience) {
    lines.push(`- **Target Audience**: ${understanding.targetAudience} (${understanding.audienceType})`);
  }
  
  lines.push(`- **Business Model**: ${understanding.businessModel}`);
  
  if (understanding.keyFeatures.length > 0) {
    lines.push(`- **Key Features**: ${understanding.keyFeatures.join(", ")}`);
  }
  
  if (understanding.designPreferences.style) {
    lines.push(`- **Design Style**: ${understanding.designPreferences.style}`);
  }
  
  if (understanding.designPreferences.colors.length > 0) {
    lines.push(`- **Brand Colors**: ${understanding.designPreferences.colors.join(", ")}`);
  }
  
  if (understanding.competitors.length > 0) {
    lines.push(`- **Competitors**: ${understanding.competitors.join(", ")}`);
  }
  
  if (understanding.differentiators.length > 0) {
    lines.push(`- **Differentiators**: ${understanding.differentiators.join(", ")}`);
  }
  
  if (understanding.technicalRequirements.length > 0) {
    lines.push(`- **Technical Requirements**: ${understanding.technicalRequirements.join(", ")}`);
  }

  return lines.join("\n");
}

function buildCorrectionsSection(corrections: Correction[]): string {
  // Only include recent, applied corrections
  const recentCorrections = corrections
    .filter((c) => c.applied)
    .slice(-10);

  if (recentCorrections.length === 0) return "";

  const lines: string[] = [
    "## User Corrections (Apply These)",
    "The user has made the following corrections. Always use the corrected values:",
    "",
  ];

  for (const correction of recentCorrections) {
    lines.push(`- **${correction.field}**: "${correction.original}" → "${correction.corrected}"`);
  }

  return lines.join("\n");
}

function buildInteractionsSummary(
  interactions: SessionContext["interactions"],
  currentTask: string
): string {
  // Get recent relevant interactions
  const recentInteractions = interactions
    .filter((i) => i.userFeedback !== "rejected")
    .slice(-5);

  if (recentInteractions.length === 0) return "";

  const lines: string[] = [
    "## Recent Context",
    "Summary of recent AI interactions in this session:",
    "",
  ];

  for (const interaction of recentInteractions) {
    const status = interaction.userFeedback === "accepted" 
      ? "✓ Accepted" 
      : interaction.userFeedback === "modified" 
        ? "📝 Modified" 
        : "Pending";
    
    lines.push(`- [${interaction.type}] ${status}`);
    
    // Include brief output summary for relevant types
    if (interaction.type === "research" && interaction.output.data) {
      const data = interaction.output.data as Record<string, unknown>;
      if (data.suggestedTemplate) {
        lines.push(`  └ Suggested template: ${data.suggestedTemplate}`);
      }
    }
  }

  return lines.join("\n");
}

function buildTaskInstructions(
  taskType: PromptContext["taskType"],
  understanding: SessionContext["understanding"]
): string {
  switch (taskType) {
    case "research":
      return `## Task: Domain Research
Analyze the domain and provide recommendations that match the user's vision.
Use the project understanding above to guide your analysis.
Focus on ${understanding.audienceType} audience patterns.`;

    case "preview":
      return `## Task: Preview Generation
Generate component props for a ${understanding.projectType} preview.
Use the project name "${understanding.projectName || 'the project'}" exactly as provided.
Apply the ${understanding.designPreferences.style} design style.
Content should speak to ${understanding.targetAudience || "the target audience"}.`;

    case "component":
      return `## Task: Component Customization
Customize this component for ${understanding.projectName || "the project"}.
Match the ${understanding.designPreferences.style} style.
Content should address: ${understanding.problem || "the user's needs"}.`;

    case "export":
      return `## Task: Export Configuration
Prepare this project for export.
Include all context in the README and comments.
Reference the ${understanding.businessModel} business model in pricing setup.`;

    case "refinement":
      return `## Task: Content Refinement
The user is refining previous output.
Apply any corrections they've made.
Maintain consistency with previous decisions.`;

    default:
      return "";
  }
}

function buildOutputGuidelines(taskType: PromptContext["taskType"]): string {
  const lines: string[] = ["## Output Guidelines"];

  lines.push("- Be consistent with the project understanding above");
  lines.push("- Apply all user corrections");
  lines.push("- Use the exact project name if provided");
  lines.push("- Match the specified design style");

  switch (taskType) {
    case "research":
      lines.push("- Focus recommendations on the target audience");
      lines.push("- Suggest features that address the stated problem");
      break;
    case "preview":
      lines.push("- Generate content that speaks to the target audience");
      lines.push("- Use realistic, professional copy");
      lines.push("- CTAs should match the business model");
      break;
    case "component":
      lines.push("- Keep styling consistent with other components");
      lines.push("- Use brand colors if specified");
      break;
    case "export":
      lines.push("- Include setup instructions for selected integrations");
      lines.push("- Document configuration decisions");
      break;
  }

  return lines.join("\n");
}

/**
 * Build a condensed context string for token-limited scenarios
 */
export function buildCondensedContext(context: SessionContext): string {
  const { understanding, corrections } = context;
  
  const parts: string[] = [];

  // Essential info
  if (understanding.projectName) {
    parts.push(`Project: ${understanding.projectName}`);
  }
  parts.push(`Type: ${understanding.projectType}`);
  
  if (understanding.targetAudience) {
    parts.push(`Audience: ${understanding.targetAudience}`);
  }
  
  if (understanding.designPreferences.style) {
    parts.push(`Style: ${understanding.designPreferences.style}`);
  }
  
  if (understanding.businessModel) {
    parts.push(`Model: ${understanding.businessModel}`);
  }

  // Key corrections
  const recentCorrections = corrections.slice(-3);
  if (recentCorrections.length > 0) {
    const correctionStr = recentCorrections
      .map((c) => `${c.field}="${c.corrected}"`)
      .join(", ");
    parts.push(`Corrections: ${correctionStr}`);
  }

  return parts.join(" | ");
}

/**
 * Enhance an existing prompt with context
 */
export function enhancePromptWithContext(
  originalPrompt: string,
  context: SessionContext,
  taskType: PromptContext["taskType"]
): string {
  const contextSection = buildContextAwarePrompt({
    context,
    taskType,
  });

  return `${contextSection}\n\n---\n\n${originalPrompt}`;
}

