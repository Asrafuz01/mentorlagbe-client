import { LoaderCircle } from "lucide-react"

/** Global route-level loading state shown while server components stream in. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh flex-col bg-background"
    >
      <span className="sr-only">Loading MentorLagbe…</span>

      {/* Navbar placeholder */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="hidden gap-3 sm:flex">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Page skeleton */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <LoaderCircle
            className="size-9 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Preparing your page…
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="h-36 animate-pulse rounded-xl bg-muted" />
              <div className="mt-4 h-5 w-4/5 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-muted" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
