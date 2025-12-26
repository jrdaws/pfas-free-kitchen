import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Orange background, white text
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_14px_hsl(var(--primary)/0.25)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(var(--primary)/0.35)]",
        // Secondary: Card background with border
        secondary:
          "bg-card text-foreground border border-border hover:border-primary hover:text-primary",
        // Outline: Transparent with border
        outline:
          "border border-border bg-transparent text-foreground hover:bg-card hover:border-primary hover:text-primary",
        // Ghost: No background, subtle hover
        ghost: 
          "text-foreground-secondary hover:bg-card hover:text-foreground",
        // Destructive: Red background
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        // Success: Green background
        success:
          "bg-success text-white shadow-[0_4px_14px_hsl(var(--success)/0.25)] hover:opacity-90 hover:-translate-y-0.5",
        // Link: Text only with underline
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  if (asChild) {
    // Cast to any to handle React 18/19 type mismatch with @radix-ui/react-slot
    const SlotComponent = Slot as React.ComponentType<Record<string, unknown>>
    return (
      <SlotComponent
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

export { Button, buttonVariants }
