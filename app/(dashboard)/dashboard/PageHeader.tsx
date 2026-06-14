import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageHeaderProps {
  eyebrow?: string
  eyebrowIcon?: ReactNode
  eyebrowColor?: string   // Tailwind classes for eyebrow pill color
  title: ReactNode        // Can be a string or JSX (for gradients)
  subtitle?: string
  rightContent?: ReactNode
  className?: string
  compact?: boolean       // Tighter padding for pages that have their own hero card below
}

/**
 * Shared premium page header component.
 * Pattern: eyebrow pill → bold title → muted subtitle → optional right-side element.
 * Designed for mobile-first, scales cleanly to desktop.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon,
  eyebrowColor = "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30",
  title,
  subtitle,
  rightContent,
  className,
  compact = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        compact ? "mb-5" : "mb-6 sm:mb-8",
        className
      )}
    >
      {/* Left: eyebrow + title + subtitle */}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest border mb-2.5",
              eyebrowColor
            )}
          >
            {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
            {eyebrow}
          </div>
        )}

        <h1
          className={cn(
            "font-bold text-foreground leading-tight tracking-tight",
            compact
              ? "text-xl sm:text-2xl"
              : "text-2xl sm:text-3xl"
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: optional badge / stat / CTA */}
      {rightContent && (
        <div className="shrink-0 self-start pt-0.5">{rightContent}</div>
      )}
    </div>
  )
}
