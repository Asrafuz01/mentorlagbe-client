"use client"

import { useState } from "react"
import {
  CalendarDays,
  Check,
  CircleX,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
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
  normalizeApplication,
  normalizeOwnTuition,
  sendMutation,
  StatusBadge,
  useDashboardCollection,
  useDashboardIdentity,
} from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/dashboard-format"
import type { Application, Tuition } from "@/types"

export default function TutorApplicantsPage() {
  const { user } = useDashboardIdentity()
  const applications = useDashboardCollection<Application>(
    "/api/applications",
    normalizeApplication
  )
  const tuitions = useDashboardCollection<Tuition>(
    "/api/tuitions?mine=true",
    normalizeOwnTuition
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDecision, setPendingDecision] = useState<{
    applicationId: string
    status: "accepted" | "rejected"
  } | null>(null)
  const anyBusy = busyId !== null

  if (!user) return <DashboardSkeleton />

  const ownTuitions = tuitions.items.filter((item) =>
    isOwnRecord(item, user, "tutor")
  )
  const tuitionIds = new Set(ownTuitions.map((item) => item._id))
  const visible = applications.items.filter(
    (item) =>
      isOwnRecord(item, user, "tutor") ||
      (tuitionIds.size > 0 && tuitionIds.has(item.tuitionId))
  )

  function getTuitionTitle(application: Application): string {
    return (
      application.tuitionTitle ||
      ownTuitions.find((item) => item._id === application.tuitionId)?.title ||
      "Tuition"
    )
  }

  async function handleStatus(id: string, status: "accepted" | "rejected") {
    if (busyId) return
    setBusyId(id)
    try {
      await sendMutation(
        `/api/applications/${encodeURIComponent(id)}/status`,
        "PATCH",
        { status }
      )
      toast.success(
        status === "accepted"
          ? "Application accepted."
          : "Application rejected."
      )
      setPendingDecision(null)
      applications.reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the application status."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Manage Applicants"
        description="Review students who applied to your tuitions and respond to them."
      />

      {applications.loading || tuitions.loading ? (
        <DataLoading label="Loading applicants…" />
      ) : null}
      {!applications.loading && applications.error ? (
        <DataError message={applications.error} onRetry={applications.reload} />
      ) : null}
      {!tuitions.loading && tuitions.error ? (
        <DataError message={tuitions.error} onRetry={tuitions.reload} />
      ) : null}

      {!applications.loading && !applications.error ? (
        visible.length === 0 ? (
          <DataEmpty
            title="No applicants yet"
            description="Once students apply to your classes, you will see them here."
            href="/dashboard/tutor/my-tuitions"
            actionLabel="View My Tuitions"
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((application) => {
              const busy = busyId === application._id
              return (
                <li
                  key={application._id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {application.studentName || "Student"}
                        </h2>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="mt-1 text-xs font-medium text-primary">
                        Applied for {getTuitionTitle(application)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          setPendingDecision({
                            applicationId: application._id,
                            status: "accepted",
                          })
                        }
                        disabled={anyBusy || application.status !== "pending"}
                      >
                        {busy && pendingDecision?.status === "accepted" ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check aria-hidden="true" />
                        )}
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPendingDecision({
                            applicationId: application._id,
                            status: "rejected",
                          })
                        }
                        disabled={anyBusy || application.status !== "pending"}
                      >
                        {busy && pendingDecision?.status === "rejected" ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <CircleX aria-hidden="true" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-xs sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {application.studentEmail || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>{application.studentPhone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="break-words">
                        {application.preferredSchedule ||
                          "No schedule provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserRound
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Applied {formatDate(application.createdAt)}</span>
                    </div>
                    {application.studentNote || application.message ? (
                      <div className="flex gap-2 text-muted-foreground sm:col-span-2">
                        <MessageSquare
                          className="mt-0.5 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-4 break-words leading-relaxed">
                          {application.studentNote || application.message}
                        </span>
                      </div>
                    ) : null}
                  </dl>

                  {busy ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LoaderCircle
                        className="size-3 animate-spin"
                        aria-hidden="true"
                      />
                      Updating…
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDecision)}
        title={
          pendingDecision?.status === "rejected"
            ? "Reject this applicant?"
            : "Accept this applicant?"
        }
        description={
          pendingDecision?.status === "rejected"
            ? "The student will see that their application was rejected."
            : "The student will be notified that their application was accepted."
        }
        confirmLabel={
          pendingDecision?.status === "rejected" ? "Reject applicant" : "Accept applicant"
        }
        destructive={pendingDecision?.status === "rejected"}
        loading={Boolean(
          pendingDecision && busyId === pendingDecision.applicationId
        )}
        onConfirm={() => {
          if (pendingDecision) {
            void handleStatus(
              pendingDecision.applicationId,
              pendingDecision.status
            )
          }
        }}
        onCancel={() => setPendingDecision(null)}
      />
    </div>
  )
}
