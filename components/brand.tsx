import Link from "next/link"
import { GraduationCap } from "lucide-react"

import { cn } from "@/lib/utils"

export type BrandProps = {
  /** Optional override for the destination (defaults to the home page). */
  href?: string
  className?: string
}

/**
 * Shared brand mark for the navbar, home page, and footer.
 * Keep the mark and the type scale here so every usage stays consistent.
 */
export function Brand({ href = "/", className }: BrandProps) {
  return (
    <Link
      href={href}
      aria-label="MentorLagbe home"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-3">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight sm:text-xl">
        Mentor<span className="text-primary">Lagbe</span>
      </span>
    </Link>
  )
}
