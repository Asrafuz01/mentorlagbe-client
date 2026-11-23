import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Inbox, Sparkles } from "lucide-react"

import { TuitionCard } from "@/components/shared/tuition-card"
import { getFeaturedTuitions } from "@/lib/tuition-api"
import { cn } from "@/lib/utils"

import {
  SECONDARY_CTA_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_SUBHEADING_CLASS,
} from "./hero-section"

const GRID_CLASS = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"

function TuitionCardSkeleton() {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-40 w-full animate-pulse bg-muted sm:h-44" />
      <div className="flex flex-1 flex-col p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-8 animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-muted" />
        <div className="mt-auto pt-5">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </li>
  )
}

function FeaturedTuitionsSkeleton() {
  return (
    <div role="status" aria-label="Loading featured tuitions">
      <span className="sr-only">Loading featured tuitions…</span>
      <ul className={GRID_CLASS} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <TuitionCardSkeleton key={index} />
        ))}
      </ul>
    </div>
  )
}

function FeaturedTuitionsFallback() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold">No featured tuitions yet</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
        Approved tuitions will show up here as soon as tutors publish them.
        Browse the full directory to find the right fit in the meantime.
      </p>
    </div>
  )
}

async function FeaturedTuitionsGrid() {
  const tuitions = await getFeaturedTuitions()

  if (tuitions.length === 0) {
    return <FeaturedTuitionsFallback />
  }

  return (
    <ul className={GRID_CLASS}>
      {tuitions.map((tuition) => (
        <li key={tuition._id} className="flex">
          <TuitionCard tuition={tuition} className="w-full" />
        </li>
      ))}
    </ul>
  )
}

export function FeaturedTuitionsSection() {
  return (
    <section
      aria-labelledby="featured-tuitions-heading"
      className="border-t border-border/80 bg-muted/30 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              Featured right now
            </span>
            <h2
              id="featured-tuitions-heading"
              className={cn("mt-5 text-balance", SECTION_HEADING_CLASS)}
            >
              Featured Tuitions
            </h2>
            <p className={cn("mt-4", SECTION_SUBHEADING_CLASS)}>
              Hand-picked, approved batches and 1-on-1 sessions from verified
              tutors. New listings appear as soon as they go live.
            </p>
          </div>
          <Link href="/tuitions" className={SECONDARY_CTA_CLASS}>
            View All Tuitions
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12">
          <Suspense fallback={<FeaturedTuitionsSkeleton />}>
            <FeaturedTuitionsGrid />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

export default FeaturedTuitionsSection
