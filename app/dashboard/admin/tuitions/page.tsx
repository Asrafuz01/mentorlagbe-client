"use client"

import { useState } from "react"
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  LoaderCircle,
  Mail,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  formatDate,
  formatMoney,
  normalizeTuition,
  sendMutation,
  StatusBadge,
  useDashboardCollection,
} from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApprovalStatus, Tuition } from "@/types"

const FILTERS: readonly { value: ApprovalStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

export default function AdminTuitionsPage() {
  const tuitions = useDashboardCollection<Tuition>(
    "/api/admin/tuitions",
    normalizeTuition
  )
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending")
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleDecision(id: string, approvalStatus: ApprovalStatus) {
    if (busyId) return
    setBusyId(id)
    try {
      await sendMutation(
        `/api/admin/tuitions/${encodeURIComponent(id)}/status`,
        "PATCH",
        { approvalStatus }
      )
      toast.success(
        approvalStatus === "approved"
          ? "Tuition approved and published."
          : "Tuition rejected."
      )
      tuitions.reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the tuition status."
      )
    } finally {
      setBusyId(null)
    }
  }

  const visible =
    filter === "all"
      ? tuitions.items
      : tuitions.items.filter((item) => item.approvalStatus === filter)

  if (tuitions.loading && tuitions.items.length === 0) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Tuition Approvals"
        description="Review new listings and decide what goes live on MentorLagbe."
      />

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter tuitions by status"
      >
        {FILTERS.map((option) => {
          const count =
            option.value === "all"
              ? tuitions.items.length
              : tuitions.items.filter(
                  (item) => item.approvalStatus === option.value
                ).length
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                filter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
              <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {tuitions.loading ? <DataLoading label="Loading tuitions…" /> : null}
      {!tuitions.loading && tuitions.error ? (
        <DataError message={tuitions.error} onRetry={tuitions.reload} />
      ) : null}

      {!tuitions.loading && !tuitions.error ? (
        visible.length === 0 ? (
          <DataEmpty
            title={
              filter === "pending"
                ? "No pending approvals"
                : `No ${filter} tuitions`
            }
            description={
              filter === "pending"
                ? "New tutor submissions will appear here for review."
                : "Try another status filter."
            }
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((tuition) => {
              const busy = busyId === tuition._id
              return (
                <li
                  key={tuition._id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {tuition.title}
                        </h2>
                        <StatusBadge status={tuition.approvalStatus} />
                        <StatusBadge
                          status={tuition.isActive ? "active" : "closed"}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {tuition.subject} · {tuition.classLevel} ·{" "}
                        {tuition.mode} · {formatMoney(tuition.monthlyFee)}/month
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="size-3.5" aria-hidden="true" />
                          {tuition.tutorName || "Tutor"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3.5" aria-hidden="true" />
                          {tuition.tutorEmail || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Submitted {formatDate(tuition.createdAt)}
                        </span>
                      </div>
                      {tuition.description ? (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {tuition.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDecision(tuition._id, "approved")}
                        disabled={busy || tuition.approvalStatus === "approved"}
                      >
                        {busy ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <CircleCheck aria-hidden="true" />
                        )}
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDecision(tuition._id, "rejected")}
                        disabled={busy || tuition.approvalStatus === "rejected"}
                      >
                        <CircleX aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
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
