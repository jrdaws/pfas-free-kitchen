# Component Patterns

> Reusable UI patterns and best practices for building consistent components in dawson-does-framework.

**Last Updated**: 2024-12-22

---

## Table of Contents

1. [Component Categories](#component-categories)
2. [UI Primitives (shadcn/ui)](#ui-primitives-shadcnui)
3. [Component Structure](#component-structure)
4. [Common State Patterns](#common-state-patterns)
5. [Form Patterns](#form-patterns)
6. [Card Patterns](#card-patterns)
7. [Navigation Patterns](#navigation-patterns)
8. [Layout Patterns](#layout-patterns)
9. [Styling Guidelines](#styling-guidelines)

---

## Component Categories

### UI Primitives (shadcn/ui)
Located in `components/ui/` - These are base components from shadcn/ui:
- `button.tsx` - Button with variants
- `input.tsx` - Form input
- `label.tsx` - Form label

### Feature Components
Located in `app/components/` - Complex, feature-specific components:
- `configurator/` - Project configuration UI
- `editor/` - Visual editor components

---

## UI Primitives (shadcn/ui)

### Importing UI Components

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

### Button Variants

```typescript
// Default primary button
<Button>Click Me</Button>

// Variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon className="h-4 w-4" /></Button>

// States
<Button disabled>Disabled</Button>
<Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading</Button>
```

### Input Component

```typescript
<Input
  type="text"
  placeholder="Enter value"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="font-mono"
/>
```

### Label Component

```typescript
<Label htmlFor="input-id">Label Text</Label>
<Input id="input-id" />
```

---

## Component Structure

### Standard Component Pattern

```typescript
"use client"; // Only if using hooks or client-side features

import { useState } from "react";
import { Button } from "@/components/ui/button";

// 1. Type definitions at top
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

// 2. Component definition
export function FeatureCard({
  title,
  description,
  icon,
  onClick
}: FeatureCardProps) {
  // 3. Hooks first
  const [isHovered, setIsHovered] = useState(false);

  // 4. Event handlers
  const handleClick = () => {
    onClick?.();
  };

  // 5. Render
  return (
    <div
      className="border rounded-lg p-4 hover:border-terminal-accent transition-colors"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-terminal-dim">{description}</p>
    </div>
  );
}
```

### Using Class Variance Authority (CVA)

For components with multiple variants, use CVA like shadcn/ui does:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border-2 transition-all", // Base styles
  {
    variants: {
      variant: {
        default: "border-terminal-text/30 hover:border-terminal-text/50",
        selected: "border-terminal-accent bg-terminal-accent/10",
        error: "border-terminal-error bg-terminal-error/10",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export function Card({ variant, size, children }: CardProps) {
  return (
    <div className={cardVariants({ variant, size })}>
      {children}
    </div>
  );
}
```

---

## Common State Patterns

### Loading States

```typescript
// Skeleton loading
export function LoadingCard() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-terminal-text/20 rounded w-3/4" />
      <div className="h-3 bg-terminal-text/20 rounded w-1/2" />
    </div>
  );
}

// Spinner with text
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-terminal-accent" />
      <span className="text-terminal-dim">{message}</span>
    </div>
  );
}

// Button loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### Error States

```typescript
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-8 w-8 text-terminal-error mx-auto mb-2" />
      <p className="text-sm text-terminal-dim mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

// Inline error message (for forms)
{showError && (
  <div className="flex items-start gap-2 text-terminal-error text-xs">
    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <p>{errorMessage}</p>
  </div>
)}
```

### Empty States

```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="font-semibold text-terminal-text mb-2">{title}</h3>
      <p className="text-sm text-terminal-dim mb-4">{description}</p>
      {action}
    </div>
  );
}

// Usage
<EmptyState
  title="No projects yet"
  description="Create your first project to get started"
  icon={<FolderOpen className="h-12 w-12 text-terminal-dim" />}
  action={<Button onClick={handleCreate}>Create Project</Button>}
/>
```

---

## Form Patterns

### Basic Form Structure

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
}

export function MyForm() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const [touched, setTouched] = useState({ name: false, email: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isValidName = formData.name.length > 0;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const showNameError = touched.name && !isValidName;
  const showEmailError = touched.email && !isValidEmail;

  const canSubmit = isValidName && isValidEmail && !isSubmitting;

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      // Submit logic
      await submitForm(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={() => setTouched({ ...touched, name: true })}
          placeholder="Enter your name"
          className="font-mono"
        />
        {showNameError && (
          <div className="flex items-start gap-2 text-terminal-error text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Name is required</p>
          </div>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onBlur={() => setTouched({ ...touched, email: true })}
          placeholder="you@example.com"
          className="font-mono"
        />
        {showEmailError && (
          <div className="flex items-start gap-2 text-terminal-error text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Please enter a valid email</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={!canSubmit}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
```

### Form Field with Live Preview

```typescript
const [projectName, setProjectName] = useState("");

// Slug transformation
const slugifiedName = projectName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

return (
  <div className="space-y-2">
    <Label htmlFor="projectName">Project Name</Label>
    <Input
      id="projectName"
      value={projectName}
      onChange={(e) => setProjectName(e.target.value)}
      placeholder="my-awesome-project"
      className="font-mono"
    />
    {projectName && (
      <p className="text-xs text-terminal-dim">
        Slug: <span className="text-terminal-accent font-mono">{slugifiedName}</span>
      </p>
    )}
  </div>
);
```

---

## Card Patterns

### Terminal Window Pattern

The terminal window is a signature design pattern in this project:

```typescript
<div className="terminal-window">
  <div className="terminal-header">
    <div className="terminal-dot bg-terminal-error"></div>
    <div className="terminal-dot bg-terminal-warning"></div>
    <div className="terminal-dot bg-terminal-text"></div>
    <span className="text-xs text-terminal-dim ml-2">Window Title</span>
  </div>
  <div className="terminal-content">
    {/* Content goes here */}
  </div>
</div>
```

### Terminal Window with Variants

```typescript
// Default terminal window
<div className="terminal-window">
  <div className="terminal-header">
    <div className="terminal-dot bg-terminal-error"></div>
    <div className="terminal-dot bg-terminal-warning"></div>
    <div className="terminal-dot bg-terminal-text"></div>
    <span className="text-xs text-terminal-dim ml-2">Default</span>
  </div>
  <div className="terminal-content">Content</div>
</div>

// Accent border (for success/selected states)
<div className="terminal-window border-terminal-accent/30">
  <div className="terminal-header">
    <div className="terminal-dot bg-terminal-error"></div>
    <div className="terminal-dot bg-terminal-warning"></div>
    <div className="terminal-dot bg-terminal-text"></div>
    <span className="text-xs text-terminal-accent ml-2">Selected</span>
  </div>
  <div className="terminal-content">Content</div>
</div>

// Error border
<div className="terminal-window border-terminal-error/50">
  <div className="terminal-header">
    <div className="terminal-dot bg-terminal-error"></div>
    <div className="terminal-dot bg-terminal-warning"></div>
    <div className="terminal-dot bg-terminal-text"></div>
    <span className="text-xs text-terminal-error ml-2">Error</span>
  </div>
  <div className="terminal-content">
    <div className="flex items-start gap-2 text-terminal-error text-sm">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold mb-1">Error message here</p>
        <p className="text-xs">Additional details...</p>
      </div>
    </div>
  </div>
</div>
```

### Selectable Card Pattern

```typescript
interface SelectableCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function SelectableCard({
  id,
  title,
  description,
  icon,
  isSelected,
  onSelect
}: SelectableCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`
        p-6 rounded-lg border-2 transition-all text-left
        hover:scale-105 hover:shadow-lg
        ${
          isSelected
            ? "border-terminal-accent bg-terminal-accent/10 shadow-lg shadow-terminal-accent/20"
            : "border-terminal-text/30 hover:border-terminal-text/50"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            p-3 rounded-lg
            ${
              isSelected
                ? "bg-terminal-accent/20 text-terminal-accent"
                : "bg-terminal-text/10 text-terminal-text"
            }
          `}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg text-terminal-text mb-1">
            {title}
          </h3>
          <p className="text-sm text-terminal-dim">{description}</p>
        </div>
        {isSelected && (
          <Check className="h-5 w-5 text-terminal-accent" />
        )}
      </div>
    </button>
  );
}
```

### Badge Pattern

```typescript
// Category badge
<span className="text-xs px-2 py-1 rounded bg-terminal-text/10 text-terminal-text font-mono">
  {category}
</span>

// Accent badge (recommended)
<span className="inline-flex items-center gap-1 px-2 py-1 bg-terminal-accent/20 border border-terminal-accent/50 rounded text-xs text-terminal-accent font-mono">
  Recommended
</span>

// Required badge
<span className="text-xs text-terminal-error font-mono">
  * Required
</span>
```

---

## Navigation Patterns

### Step Indicator

```typescript
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Template" },
  { number: 2, label: "Project" },
  { number: 3, label: "Export" },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step.number);
          const isCurrent = currentStep === step.number;
          const isClickable = isCompleted || isCurrent;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  border-2 font-mono text-sm transition-all
                  ${
                    isCurrent
                      ? "border-terminal-accent bg-terminal-accent text-terminal-bg font-bold"
                      : isCompleted
                      ? "border-terminal-text bg-terminal-text text-terminal-bg cursor-pointer hover:scale-110"
                      : "border-terminal-text/30 text-terminal-dim"
                  }
                  ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
                `}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </button>

              {/* Step label */}
              <div
                className={`
                  hidden md:block ml-2 text-xs font-mono whitespace-nowrap
                  ${
                    isCurrent
                      ? "text-terminal-accent font-bold"
                      : isCompleted
                      ? "text-terminal-text"
                      : "text-terminal-dim"
                  }
                `}
              >
                {step.label}
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 md:mx-4 transition-colors
                    ${isCompleted ? "bg-terminal-text" : "bg-terminal-text/30"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Tab Navigation

```typescript
const tabs = ["Overview", "Settings", "Advanced"] as const;
type Tab = typeof tabs[number];

const [activeTab, setActiveTab] = useState<Tab>("Overview");

<div className="flex gap-2 border-b border-terminal-text/30 mb-6">
  {tabs.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`
        px-4 py-2 font-mono text-sm transition-colors
        border-b-2 -mb-px
        ${
          activeTab === tab
            ? "border-terminal-accent text-terminal-accent font-bold"
            : "border-transparent text-terminal-dim hover:text-terminal-text"
        }
      `}
    >
      {tab}
    </button>
  ))}
</div>
```

---

## Layout Patterns

### Section Header

```typescript
<div className="text-center mb-8">
  <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
    Section Title
  </h2>
  <p className="text-terminal-dim">
    Description of this section
  </p>
</div>
```

### Grid Layout

```typescript
// 2-column responsive grid
<div className="grid md:grid-cols-2 gap-4">
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>

// 3-column responsive grid
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Centered Container

```typescript
<div className="max-w-2xl mx-auto">
  {/* Content constrained to 2xl width and centered */}
</div>

<div className="max-w-4xl mx-auto">
  {/* Content constrained to 4xl width and centered */}
</div>
```

### Space-y Pattern

```typescript
// Vertical spacing between children
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Common space-y values
// space-y-2: 0.5rem (8px)
// space-y-3: 0.75rem (12px)
// space-y-4: 1rem (16px)
// space-y-6: 1.5rem (24px)
// space-y-8: 2rem (32px)
```

---

## Styling Guidelines

### Utility-First with Tailwind

Always use Tailwind utility classes. Avoid custom CSS unless absolutely necessary.

```typescript
// ✅ GOOD: Utility classes
<div className="p-4 rounded-lg border-2 border-terminal-accent bg-terminal-accent/10">

// ❌ BAD: Custom styles
<div style={{ padding: "1rem", borderRadius: "0.5rem" }}>
```

### The cn() Utility

Use the `cn()` utility from `@/lib/utils` to merge class names conditionally:

```typescript
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-classes always-applied",
    isActive && "active-classes",
    isError && "error-classes",
    className // Allow parent to override
  )}
>
```

### Terminal Theme Colors

```typescript
// Text colors
text-terminal-text        // Primary text
text-terminal-dim         // Muted/secondary text
text-terminal-accent      // Accent color (blue/cyan)
text-terminal-error       // Error red
text-terminal-warning     // Warning yellow
text-terminal-bg          // Background

// Background colors
bg-terminal-bg            // Primary background
bg-terminal-text          // Text color as background
bg-terminal-accent        // Accent background
bg-terminal-accent/10     // 10% opacity accent
bg-terminal-accent/20     // 20% opacity accent

// Border colors
border-terminal-text/30   // 30% opacity text
border-terminal-accent    // Accent border
border-terminal-error     // Error border
```

### Font Families

```typescript
font-display  // For headings (defined in tailwind.config)
font-mono     // For code, commands, technical text
// Default sans-serif for body text
```

### Common Transition Classes

```typescript
transition-colors         // Smooth color transitions
transition-all           // Smooth all property transitions
hover:scale-105          // Slight scale up on hover
hover:shadow-lg          // Shadow on hover
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>

// Common breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile only</div>
```

---

## Best Practices

### 1. Component Organization

- Keep components small and focused (< 200 lines)
- Extract reusable patterns into separate components
- Co-locate related components in feature directories

### 2. Props Interface

- Always define explicit TypeScript interfaces for props
- Use optional chaining for optional props (`onClick?.()`)
- Destructure props in function signature

### 3. State Management

- Use local state (`useState`) for component-specific state
- Use React Context for shared state across multiple components
- Keep state close to where it's used

### 4. Accessibility

- Always use semantic HTML
- Include `aria-label` for icon-only buttons
- Ensure keyboard navigation works
- Use proper heading hierarchy

```typescript
// ✅ GOOD: Semantic and accessible
<button
  onClick={handleClick}
  aria-label="Delete item"
  disabled={isDeleting}
>
  <Trash className="h-4 w-4" />
</button>

// ❌ BAD: Non-semantic, not accessible
<div onClick={handleClick}>
  <Trash className="h-4 w-4" />
</div>
```

### 5. Performance

- Use `"use client"` directive only when necessary
- Memoize expensive computations with `useMemo`
- Avoid inline arrow functions in render for event handlers

```typescript
// ✅ GOOD: Handler defined outside render
const handleClick = () => {
  doSomething();
};

return <button onClick={handleClick}>Click</button>;

// ❌ BAD: New function created every render
return <button onClick={() => doSomething()}>Click</button>;
```

---

## Examples

### Complete Component Example

See these files for complete working examples:

- `app/components/configurator/TemplateSelector.tsx` - Selectable cards with icons
- `app/components/configurator/ProjectDetails.tsx` - Form with validation
- `app/components/configurator/IntegrationSelector.tsx` - Complex multi-select UI
- `app/components/configurator/ExportView.tsx` - Multiple action options
- `app/components/configurator/StepIndicator.tsx` - Progress navigation

### Quick Reference

```typescript
// Selectable card with terminal theme
<button
  onClick={() => onSelect(id)}
  className={cn(
    "p-6 rounded-lg border-2 transition-all text-left hover:scale-105",
    isSelected
      ? "border-terminal-accent bg-terminal-accent/10"
      : "border-terminal-text/30 hover:border-terminal-text/50"
  )}
>
  <div className="flex items-start gap-4">
    <div className={cn(
      "p-3 rounded-lg",
      isSelected ? "bg-terminal-accent/20 text-terminal-accent" : "bg-terminal-text/10"
    )}>
      {icon}
    </div>
    <div>
      <h3 className="font-display font-bold text-terminal-text">{title}</h3>
      <p className="text-sm text-terminal-dim">{description}</p>
    </div>
  </div>
</button>
```

---

## Related Documentation

- [Coding Standards](../standards/CODING_STANDARDS.md) - TypeScript style guide
- [shadcn/ui Documentation](https://ui.shadcn.com) - UI component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

*For questions or suggestions, see the main project documentation.*
