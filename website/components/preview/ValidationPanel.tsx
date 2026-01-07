"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  runAllValidations, 
  hasAutoFix, 
  type ValidationRule, 
  type ValidationResult,
  type ValidationSummary,
} from "@/lib/patterns/validation";
import type { ProjectDefinition } from "@/lib/patterns/types";
import { 
  Check, 
  X, 
  AlertTriangle, 
  Info,
  Wrench,
  Download,
  Shield,
  FileText,
  Palette,
  Gauge,
} from "lucide-react";

interface ValidationPanelProps {
  definition: ProjectDefinition;
  onFix?: (ruleId: string) => void;
  onExport?: () => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  content: <FileText className="w-4 h-4" />,
  branding: <Palette className="w-4 h-4" />,
  accessibility: <Shield className="w-4 h-4" />,
  seo: <FileText className="w-4 h-4" />,
  performance: <Gauge className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  content: "Content",
  branding: "Branding",
  accessibility: "Accessibility",
  seo: "SEO",
  performance: "Performance",
};

export function ValidationPanel({ 
  definition, 
  onFix, 
  onExport,
  className,
}: ValidationPanelProps) {
  const validation = useMemo(() => runAllValidations(definition), [definition]);

  const { passed, failed, warnings, canExport, results } = validation;
  const total = results.length;
  const progressPercent = (passed / total) * 100;

  // Group issues by category
  const issuesByCategory = useMemo(() => {
    const grouped: Record<string, typeof results> = {};
    results
      .filter((r) => !r.result.valid || r.result.warnings.length > 0)
      .forEach((item) => {
        const cat = item.rule.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });
    return grouped;
  }, [results]);

  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      {/* Summary Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Export Readiness</h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="w-4 h-4" />
            {passed} passed
          </span>
          {failed > 0 && (
            <span className="flex items-center gap-1 text-sm text-destructive">
              <X className="w-4 h-4" />
              {failed} errors
            </span>
          )}
          {warnings > 0 && (
            <span className="flex items-center gap-1 text-sm text-warning">
              <AlertTriangle className="w-4 h-4" />
              {warnings} warnings
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            "h-full transition-all duration-300",
            canExport ? "bg-success" : "bg-destructive"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Issues List */}
      {(failed > 0 || warnings > 0) && (
        <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
          {Object.entries(issuesByCategory).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                {CATEGORY_ICONS[category]}
                <span className="text-sm font-medium text-foreground-secondary">
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
              <div className="space-y-2 pl-6">
                {items.map((item) => (
                  <ValidationItem
                    key={item.rule.id}
                    rule={item.rule}
                    result={item.result}
                    onFix={onFix}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Passed Message */}
      {canExport && failed === 0 && warnings === 0 && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
          <Check className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">All checks passed!</p>
            <p className="text-xs text-muted-foreground">Your project is ready for export.</p>
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={!canExport}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
          canExport
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {canExport ? (
          <>
            <Download className="w-4 h-4" />
            Ready to Export
          </>
        ) : (
          `Fix ${failed} error(s) to export`
        )}
      </button>
    </div>
  );
}

interface ValidationItemProps {
  rule: ValidationRule;
  result: ValidationResult;
  onFix?: (ruleId: string) => void;
}

function ValidationItem({ rule, result, onFix }: ValidationItemProps) {
  const isError = !result.valid;
  const messages = [...result.errors, ...result.warnings];
  const canFix = hasAutoFix(rule.id);

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        isError
          ? "bg-destructive/10 border-destructive/20"
          : "bg-warning/10 border-warning/20"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isError ? (
            <X className="w-4 h-4 text-destructive flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          )}
          <div>
            <p className="text-sm text-foreground">{rule.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{rule.category}</p>
          </div>
        </div>
        {canFix && onFix && (
          <button
            onClick={() => onFix(rule.id)}
            className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 rounded text-primary flex items-center gap-1"
          >
            <Wrench className="w-3 h-3" />
            Fix
          </button>
        )}
      </div>
      {messages.length > 0 && (
        <ul className="mt-2 pl-6 text-xs text-muted-foreground space-y-0.5">
          {messages.map((msg, i) => (
            <li key={i}>• {msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Compact version for sidebar
export function ValidationBadge({ definition }: { definition: ProjectDefinition }) {
  const validation = useMemo(() => runAllValidations(definition), [definition]);
  
  if (validation.canExport) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 border border-success/20 rounded-full">
        <Check className="w-3 h-3 text-success" />
        <span className="text-xs text-success font-medium">Ready</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/10 border border-destructive/20 rounded-full">
      <X className="w-3 h-3 text-destructive" />
      <span className="text-xs text-destructive font-medium">{validation.failed} issues</span>
    </div>
  );
}

export default ValidationPanel;

