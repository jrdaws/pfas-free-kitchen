"use client";

import { Label } from "@/components/ui/label";
import { Target, Compass, TrendingUp, FileText } from "lucide-react";

interface ContextFieldsProps {
  vision: string;
  mission: string;
  successCriteria: string;
  onVisionChange: (vision: string) => void;
  onMissionChange: (mission: string) => void;
  onSuccessCriteriaChange: (criteria: string) => void;
}

export function ContextFields({
  vision,
  mission,
  successCriteria,
  onVisionChange,
  onMissionChange,
  onSuccessCriteriaChange,
}: ContextFieldsProps) {
  const allFilled = vision.trim() && mission.trim() && successCriteria.trim();
  const noneFilled = !vision.trim() && !mission.trim() && !successCriteria.trim();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Project Context
        </h2>
        <p className="text-terminal-dim mb-4">
          Define your vision, mission, and success criteria for better AI assistance
        </p>
        <p className="text-xs text-terminal-accent">
          Optional: These will be included in .dd/ handoff files for future AI collaboration
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Vision */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <Compass className="inline h-3 w-3 mr-1" />
              Vision Statement
            </span>
          </div>
          <div className="terminal-content space-y-3">
            <Label className="text-terminal-text">
              What is the long-term vision for this project?
            </Label>
            <textarea
              value={vision}
              onChange={(e) => onVisionChange(e.target.value)}
              placeholder="Example: Create the most developer-friendly SaaS platform that helps startups ship products 10x faster..."
              className="w-full min-h-[100px] p-4 rounded border-2 border-terminal-text/30 bg-terminal-bg text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none resize-y"
            />
            <p className="text-xs text-terminal-dim">
              Your aspirational goal - where do you want this project to be in 3-5 years?
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <Target className="inline h-3 w-3 mr-1" />
              Mission Statement
            </span>
          </div>
          <div className="terminal-content space-y-3">
            <Label className="text-terminal-text">
              What problem are you solving and for whom?
            </Label>
            <textarea
              value={mission}
              onChange={(e) => onMissionChange(e.target.value)}
              placeholder="Example: We help indie developers and small teams launch production-ready SaaS applications without spending months on boilerplate code..."
              className="w-full min-h-[100px] p-4 rounded border-2 border-terminal-text/30 bg-terminal-bg text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none resize-y"
            />
            <p className="text-xs text-terminal-dim">
              Your purpose - what value do you provide and who benefits?
            </p>
          </div>
        </div>

        {/* Success Criteria */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Success Criteria
            </span>
          </div>
          <div className="terminal-content space-y-3">
            <Label className="text-terminal-text">
              How will you measure success?
            </Label>
            <textarea
              value={successCriteria}
              onChange={(e) => onSuccessCriteriaChange(e.target.value)}
              placeholder="Example:
- 1,000 active users in first 6 months
- 50+ projects exported per week
- 4.5+ star rating from users
- Sub-2 second page load times
- 99.9% uptime"
              className="w-full min-h-[140px] p-4 rounded border-2 border-terminal-text/30 bg-terminal-bg text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none resize-y"
            />
            <p className="text-xs text-terminal-dim">
              Specific, measurable goals that define success (KPIs, metrics, milestones)
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className={`terminal-window ${allFilled ? "border-terminal-accent/30" : noneFilled ? "" : "border-terminal-warning/50"}`}>
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className={`text-xs ml-2 ${allFilled ? "text-terminal-accent" : noneFilled ? "text-terminal-dim" : "text-terminal-warning"}`}>
              <FileText className="inline h-3 w-3 mr-1" />
              {allFilled ? "Complete - Will be included in export" : noneFilled ? "Optional Context" : "Partially Complete"}
            </span>
          </div>
          <div className="terminal-content space-y-3">
            {allFilled && (
              <div className="text-sm text-terminal-text">
                <p className="mb-2 font-bold">These will be saved in your project as:</p>
                <ul className="space-y-1 text-xs font-mono">
                  <li className="text-terminal-accent">→ .dd/vision.md</li>
                  <li className="text-terminal-accent">→ .dd/mission.md</li>
                  <li className="text-terminal-accent">→ .dd/goals.md</li>
                </ul>
                <p className="mt-3 text-xs text-terminal-dim">
                  These files help AI assistants (like Cursor, Claude) understand your project's context for better suggestions.
                </p>
              </div>
            )}

            {!allFilled && !noneFilled && (
              <div className="text-sm text-terminal-warning">
                <p>You've started filling out context. Consider completing all fields for best results.</p>
              </div>
            )}

            {noneFilled && (
              <div className="text-sm text-terminal-dim">
                <p className="mb-2">This step is completely optional. Benefits of adding context:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>AI assistants provide more relevant suggestions</li>
                  <li>Team members understand project goals</li>
                  <li>Easier onboarding for new contributors</li>
                  <li>Better alignment on product direction</li>
                </ul>
                <p className="mt-3 text-xs">
                  You can skip this and add context later by creating files in the .dd/ directory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
