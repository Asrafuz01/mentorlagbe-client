import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const TONE_STYLES = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const

export type DashboardStatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  href?: string
  tone?: keyof typeof TONE_STYLES
  className?: string
}

/** Shared metric tile for student, tutor, and admin overview pages. */
export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = "default",
  className,
}: DashboardStatCardProps) {
  const cardClass = cn(
    "flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm",
    href && "transition-colors hover:border-primary/40 hover:bg-muted/40",
    className
  )

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            TONE_STYLES[tone]
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {href ? (
          <ArrowUpRight
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
      {hint ? (
        <p className="mt-auto pt-2 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(cardClass, "group")}>
        {content}
      </Link>
    )
  }

  return <div className={cardClass}>{content}</div>
}
