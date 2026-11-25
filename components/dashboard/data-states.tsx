"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Inbox,
  LoaderCircle,
  RotateCcw,
  TriangleExclamationPoint,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SHELL_CLASS =
  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"

export function DataLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className={SHELL_CLASS}>
      <LoaderCircle
        className="size-7 animate-spin text-primary"
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading data</span>
    </div>
  )
}

export type DataEmptyProps = {
  title: string
  description?: string
  href?: string
  actionLabel?: string
}

export function DataEmpty({
  title,
  description,
  href,
  actionLabel,
}: DataEmptyProps) {
  return (
    <div className={SHELL_CLASS}>
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {href && actionLabel ? (
        <Link
          href={href}
          className={cn(buttonVariants({ size: "default" }), "mt-5")}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export function DataError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void | Promise<void>
}) {
  const [retrying, setRetrying] = useState(false)

  async function handleRetry() {
    if (retrying || !onRetry) return
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div role="alert" className={SHELL_CLASS}>
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleExclamationPoint className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold">Couldn&apos;t load data</h2>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "mt-5"
          )}
        >
          <RotateCcw
            className={retrying ? "animate-spin" : undefined}
            aria-hidden="true"
          />
          {retrying ? "Retrying…" : "Try Again"}
        </button>
      ) : null}
    </div>
  )
}
