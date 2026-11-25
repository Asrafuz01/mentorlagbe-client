import { LoaderCircle } from "lucide-react"

/** Dashboard-shaped loading state, also used while the session guard resolves. */
export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh bg-muted/20"
    >
      <span className="sr-only">Loading your dashboard…</span>

      <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-2">
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="hidden h-6 w-28 animate-pulse rounded bg-muted sm:block" />
          </div>
        </div>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
          <LoaderCircle
            className="size-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Preparing your workspace…
          </p>
          <div className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
