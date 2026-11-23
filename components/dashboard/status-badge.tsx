import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  approved:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  accepted:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  active:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  completed:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive ring-destructive/20",
  failed: "bg-destructive/10 text-destructive ring-destructive/20",
  closed: "bg-muted text-muted-foreground ring-border",
  refunded: "bg-muted text-muted-foreground ring-border",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const value = status.trim().toLowerCase()

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold capitalize ring-1 ring-inset",
        STATUS_STYLES[value] ?? STATUS_STYLES.closed,
        className
      )}
    >
      {value || "—"}
    </span>
  )
}
