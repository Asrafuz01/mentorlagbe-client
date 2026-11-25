"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  CalendarDays,
  LoaderCircle,
  Star,
  Trash,
} from "lucide-react"
import { toast } from "sonner"

import { useBookmarks } from "@/components/bookmarks"
import {
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  useDashboardCollection,
  useDashboardIdentity,
} from "@/components/dashboard"
import { Button, buttonVariants } from "@/components/ui/button"
import { normalizeSavedTuition } from "@/lib/bookmark-api"
import { sendMutation } from "@/lib/dashboard-api"
import { formatDate, formatMoney } from "@/lib/dashboard-format"
import type { SavedTuition } from "@/types"

export default function SavedTuitionsPage() {
  const { user } = useDashboardIdentity()
  const saved = useDashboardCollection<SavedTuition>(
    "/api/bookmarks",
    normalizeSavedTuition
  )
  const { refresh } = useBookmarks()
  const [busyId, setBusyId] = useState<string | null>(null)

  if (!user) return <DashboardSkeleton />

  async function handleUnsave(item: SavedTuition) {
    if (busyId) return
    setBusyId(item._id)
    try {
      await sendMutation(
        `/api/bookmarks/${encodeURIComponent(item.tuitionId)}`,
        "DELETE"
      )
      toast.success("Removed from your saved tuitions.")
      await Promise.all([saved.reload(), refresh()])
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not remove this saved tuition."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Saved Tuitions"
        description="Keep the tuitions you are interested in here and revisit them anytime."
        actions={
          <Link
            href="/tuitions"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse Tuitions
          </Link>
        }
      />

      {saved.loading ? (
        <DataLoading label="Loading your saved tuitions…" />
      ) : null}

      {!saved.loading && saved.error ? (
        <DataError message={saved.error} onRetry={saved.reload} />
      ) : null}

      {!saved.loading && !saved.error ? (
        saved.items.length === 0 ? (
          <DataEmpty
            title="No saved tuitions yet"
            description="Tap the bookmark icon on any tuition to shortlist it for later."
            href="/tuitions"
            actionLabel="Browse Tuitions"
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {saved.items.map((item) => {
              const tuition = item.tuition
              const isBusy = busyId === item._id
              const title = tuition?.title || item.tuitionTitle || "Tuition"

              return (
                <li
                  key={item._id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Bookmark
                        className="mt-0.5 size-4 shrink-0 fill-primary/20 text-primary"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold" title={title}>
                          {title}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.subject || tuition?.subject || "General"} ·{" "}
                          {tuition?.tutorName || "MentorLagbe tutor"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Saved {formatDate(item.createdAt)}
                      </span>
                      {Boolean(tuition?.reviewCount) && (
                        <span className="inline-flex items-center gap-1.5">
                          <Star
                            className="size-3.5 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                          {(tuition?.averageRating ?? 0).toFixed(1)} (
                          {tuition?.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Link
                      href={`/tuitions/${item.tuitionId}`}
                      className={buttonVariants({
                        variant: "default",
                        size: "sm",
                      })}
                    >
                      View Details
                    </Link>
                    <span className="mr-auto text-sm font-semibold text-primary">
                      {tuition?.monthlyFee
                        ? formatMoney(tuition.monthlyFee)
                        : "—"}
                      <span className="font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleUnsave(item)}
                    >
                      {isBusy ? (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash className="size-4" aria-hidden="true" />
                      )}
                      Unsave
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )
      ) : null}
    </div>
  )
}
