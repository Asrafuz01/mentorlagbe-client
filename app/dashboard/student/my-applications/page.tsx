"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  LoaderCircle,
  Mail,
  Trash,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import {
  ConfirmDialog,
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  isOwnRecord,
  StatusBadge,
  useDashboardCollection,
  useDashboardIdentity,
} from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { normalizeApplication, sendMutation } from "@/lib/dashboard-api"
import { formatDate, formatMoney } from "@/lib/dashboard-format"
import type { Application } from "@/types"

export default function MyApplicationsPage() {
  const { user } = useDashboardIdentity()
  const applications = useDashboardCollection<Application>(
    "/api/applications",
    normalizeApplication
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingCancel, setPendingCancel] = useState<Application | null>(null)
  const anyBusy = busyId !== null

  if (!user) return <DashboardSkeleton />

  const visible = applications.items.filter((item) =>
    isOwnRecord(item, user, "student")
  )

  async function handleCancel(id: string) {
    if (busyId) return
    setBusyId(id)
    try {
      await sendMutation(
        `/api/applications/${encodeURIComponent(id)}`,
        "DELETE"
      )
      toast.success("Application cancelled.")
      setPendingCancel(null)
      applications.reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not cancel the application."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Applications"
        description="Track every tuition you have applied to and cancel pending requests."
        actions={
          <Link
            href="/tuitions"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse Tuitions
          </Link>
        }
      />

      {applications.loading ? (
        <DataLoading label="Loading your applications…" />
      ) : null}

      {!applications.loading && applications.error ? (
        <DataError message={applications.error} onRetry={applications.reload} />
      ) : null}

      {!applications.loading && !applications.error ? (
        visible.length === 0 ? (
          <DataEmpty
            title="No applications yet"
            description="Find a tuition that fits your goals and send your first application."
            href="/tuitions"
            actionLabel="Browse Tuitions"
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((application) => {
              const isBusy = busyId === application._id
              return (
                <li
                  key={application._id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">
                        {application.tuitionTitle || "Tuition"}
                      </h2>
                      <StatusBadge status={application.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="size-3.5" aria-hidden="true" />
                        {application.tutorName || "Tutor"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5" aria-hidden="true" />
                        <span className="truncate">
                          {application.tutorEmail || "—"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Applied {formatDate(application.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <div className="text-right">
                      <p className="text-[0.7rem] text-muted-foreground">
                        Monthly Fee
                      </p>
                      <p className="text-sm font-semibold">
                        {application.monthlyFee
                          ? formatMoney(application.monthlyFee)
                          : "—"}
                      </p>
                    </div>
                    {application.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => setPendingCancel(application)}
                        disabled={anyBusy}
                        className={buttonVariants({
                          variant: "destructive",
                          size: "sm",
                        })}
                      >
                        {isBusy ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash aria-hidden="true" />
                        )}
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {application.status === "accepted"
                          ? "Tutor accepted"
                          : "Not available"}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this application?"
        description={
          pendingCancel
            ? `Your request for "${pendingCancel.tuitionTitle || "this tuition"}" will be withdrawn.`
            : undefined
        }
        confirmLabel="Cancel application"
        destructive
        loading={Boolean(pendingCancel && busyId === pendingCancel._id)}
        onConfirm={() => {
          if (pendingCancel) void handleCancel(pendingCancel._id)
        }}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  )
}
