"use client"

import Link from "next/link"
import { House, RotateCcw, TriangleExclamationPoint } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Reads a display-safe message from any thrown value without leaking details. */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === "string" && error.trim()) return error
  return "An unexpected error interrupted this page."
}

export type ErrorBoundaryProps = {
  error: unknown
  /** Next.js 16 recovery callback that re-renders the route segment. */
  retry: () => void
  /** Legacy/alternate recovery callback supplied by some Next.js versions. */
  reset?: () => void
}

export default function Error({ error, retry, reset }: ErrorBoundaryProps) {
  function handleRetry() {
    if (typeof reset === "function") {
      reset()
      return
    }
    retry()
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 px-4 py-14 sm:px-6">
      <div
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <TriangleExclamationPoint className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          We couldn&apos;t load this page. Try again — if the problem continues,
          head back home and start fresh.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-xs leading-relaxed break-words text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className={cn(buttonVariants({ size: "lg" }), "h-11")}
          >
            <RotateCcw aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11"
            )}
          >
            <House aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
