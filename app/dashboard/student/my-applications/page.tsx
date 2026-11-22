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
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  StatusBadge,
  toDashboardUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { normalizeApplication, sendMutation } from "@/lib/dashboard-api"
import { formatDate, formatMoney } from "@/lib/dashboard-format"
import { cn } from "@/lib/utils"
import type { Application } from "@/types"

export default function MyApplicationsPage() {
  const { data: session } = useSession()
  const user = toDashboardUser(session?.user)
  const path = user?.id
    ? `/api/applications?studentId=${encodeURIComponent(user.id)}`
    : ""
  const applications = useDashboardCollection<Application>(
    path,
    normalizeApplication
  )
  const [busyId, setBusyId] = useState<string | null>(null)

  if (!user) return <DashboardSkeleton />

  async function handleCancel(id: string) {
    if (
      busyId ||
      !window.confirm("Cancel this application? This cannot be undone.")
    ) {
      return
    }
    setBusyId(id)
    try {
      await sendMutation(
        `/api/applications/${encodeURIComponent(id)}`,
        "DELETE"
      )
      toast.success("Application cancelled.")
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
            className={cn(buttonVariants({ variant: "outline" }), "h-9")}
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
        applications.items.length === 0 ? (
          <DataEmpty
            title="No applications yet"
            description="Find a tuition that fits your goals and send your first application."
            href="/tuitions"
            actionLabel="Browse Tuitions"
          />
        ) : (
          <ul className="space-y-3">
            {applications.items.map((application) => {
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
                        {application.tutorEmail || "—"}
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
                        onClick={() => handleCancel(application._id)}
                        disabled={isBusy}
                        className={cn(
                          buttonVariants({
                            variant: "destructive",
                            size: "sm",
                          }),
                          "h-8"
                        )}
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
    </div>
  )
}
