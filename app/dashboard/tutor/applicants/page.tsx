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
  toDashboardUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { formatDate } from "@/lib/dashboard-format"
import type { Application, Tuition } from "@/types"

export default function TutorApplicantsPage() {
  const { data: session } = useSession()
  const user = toDashboardUser(session?.user)
  const tutorId = user?.id ? encodeURIComponent(user.id) : ""
  const applications = useDashboardCollection<Application>(
    tutorId ? `/api/applications?tutorId=${tutorId}` : "",
    normalizeApplication
  )
  const tuitions = useDashboardCollection<Tuition>(
    tutorId ? `/api/tuitions?tutorId=${tutorId}` : "",
    normalizeOwnTuition
  )
  const [busyId, setBusyId] = useState<string | null>(null)

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
    if (busyId || !window.confirm(`Mark this application as ${status}?`)) return
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
                          handleStatus(application._id, "accepted")
                        }
                        disabled={busy || application.status === "accepted"}
                      >
                        <Check aria-hidden="true" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleStatus(application._id, "rejected")
                        }
                        disabled={busy || application.status === "rejected"}
                      >
                        <CircleX aria-hidden="true" />
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
                      <span>
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
                        <span className="leading-relaxed">
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
    </div>
  )
}
