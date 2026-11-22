import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { buildTuitionsHref, type TuitionFilters } from "./tuition-query"

function getPageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: (number | "…")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) pages.push("…")
  for (let current = start; current <= end; current++) pages.push(current)
  if (end < totalPages - 1) pages.push("…")
  pages.push(totalPages)

  return pages
}

export type TuitionPaginationProps = {
  filters: TuitionFilters
  page: number
  totalPages: number
}

export function TuitionPagination({
  filters,
  page,
  totalPages,
}: TuitionPaginationProps) {
  if (totalPages <= 1) return null

  const navClass = cn(
    buttonVariants({ variant: "outline", size: "default" }),
    "h-9 gap-1.5 px-3 text-sm"
  )

  return (
    <nav
      aria-label="Tuition pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={buildTuitionsHref(filters, page - 1)}
          className={navClass}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </span>
      )}

      {getPageNumbers(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildTuitionsHref(filters, item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              navClass,
              "size-9 justify-center px-0 tabular-nums",
              item === page &&
                "border-primary bg-primary text-primary-foreground"
            )}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildTuitionsHref(filters, page + 1)}
          className={navClass}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-40")}>
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  )
}
