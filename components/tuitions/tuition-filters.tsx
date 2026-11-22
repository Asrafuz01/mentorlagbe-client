"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  buildTuitionsHref,
  CLASS_LEVEL_OPTIONS,
  EMPTY_FILTERS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  withCurrentOption,
  type TuitionFilters,
} from "./tuition-query"

const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30"

export type TuitionFiltersProps = {
  filters: TuitionFilters
}

export function TuitionFilters({ filters }: TuitionFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(filters.search)
  const hasFilters = Object.values(filters).some(Boolean)

  function update(next: Partial<TuitionFilters>) {
    router.push(buildTuitionsHref({ ...filters, ...next }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    update({ search: search.trim() })
  }

  function handleReset() {
    setSearch("")
    router.push(buildTuitionsHref(EMPTY_FILTERS))
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or subject…"
            aria-label="Search tuitions by title or subject"
            className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>
        <Button type="submit" className="h-10 sm:px-6">
          Search
        </Button>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select
          value={filters.subject}
          onChange={(event) => update({ subject: event.target.value })}
          aria-label="Filter by subject"
          className={SELECT_CLASS}
        >
          <option value="">All subjects</option>
          {withCurrentOption(SUBJECT_OPTIONS, filters.subject).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filters.classLevel}
          onChange={(event) => update({ classLevel: event.target.value })}
          aria-label="Filter by class level"
          className={SELECT_CLASS}
        >
          <option value="">All class levels</option>
          {withCurrentOption(CLASS_LEVEL_OPTIONS, filters.classLevel).map(
            (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            )
          )}
        </select>

        <select
          value={filters.mode}
          onChange={(event) => update({ mode: event.target.value })}
          aria-label="Filter by mode"
          className={SELECT_CLASS}
        >
          {MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {filters.mode &&
          !MODE_OPTIONS.some((option) => option.value === filters.mode) ? (
            <option value={filters.mode}>{filters.mode}</option>
          ) : null}
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Filters update instantly — results come from the server.
        </p>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasFilters}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary hover:underline",
            !hasFilters && "pointer-events-none opacity-40"
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset filters
        </button>
      </div>
    </div>
  )
}
