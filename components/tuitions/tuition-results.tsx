import Link from "next/link"
import { Inbox } from "lucide-react"

import { TuitionCard } from "@/components/shared/tuition-card"
import type { Tuition } from "@/types"

import {
  buildTuitionsHref,
  EMPTY_FILTERS,
  type TuitionFilters,
} from "./tuition-query"

export type TuitionResultsProps = {
  tuitions: Tuition[]
  filters: TuitionFilters
}

export function TuitionResults({ tuitions, filters }: TuitionResultsProps) {
  if (tuitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold">No tuitions found</h2>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          No approved tuitions match these filters yet. Try a broader search or
          check back once tutors publish new batches.
        </p>
        <Link
          href={buildTuitionsHref(EMPTY_FILTERS)}
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          Clear all filters
        </Link>
      </div>
    )
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tuitions.map((tuition) => (
        <li key={tuition._id} className="flex">
          <TuitionCard tuition={tuition} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
