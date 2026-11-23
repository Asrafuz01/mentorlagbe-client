"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Power,
  Trash,
  X,
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
  normalizeOwnTuition,
  sendMutation,
  StatusBadge,
  useDashboardCollection,
  useDashboardIdentity,
} from "@/components/dashboard"
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/components/tuitions"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatMoney } from "@/lib/dashboard-format"
import { cn } from "@/lib/utils"
import type { Tuition } from "@/types"

const FIELD_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
const LABEL_CLASS = "mb-1 block text-xs font-medium"

type EditForm = {
  title: string
  subject: string
  classLevel: string
  mode: "Online" | "Offline"
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
  bannerImage: string
}

function toEditForm(tuition: Tuition): EditForm {
  return {
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    description: tuition.description,
    bannerImage: tuition.bannerImage,
  }
}

export default function MyTuitionsPage() {
  const { user } = useDashboardIdentity()
  const tuitions = useDashboardCollection<Tuition>(
    "/api/tuitions?mine=true&limit=50",
    normalizeOwnTuition
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<
    "save" | "toggle" | "delete" | null
  >(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Tuition | null>(null)

  if (!user) return <DashboardSkeleton />

  const ownTuitions = tuitions.items.filter((item) =>
    isOwnRecord(item, user, "tutor")
  )
  const anyBusy = busyId !== null

  function startEdit(tuition: Tuition) {
    setEditingId(tuition._id)
    setEditForm(toEditForm(tuition))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    if (!editForm || busyId) return
    if (
      !editForm.title.trim() ||
      !editForm.location.trim() ||
      !editForm.description.trim() ||
      Number(editForm.monthlyFee) <= 0 ||
      Number(editForm.daysPerWeek) <= 0
    ) {
      toast.error("Enter a title, location, description, fee, and valid days.")
      return
    }
    setBusyId(id)
    setBusyAction("save")
    try {
      await sendMutation(`/api/tuitions/${encodeURIComponent(id)}`, "PATCH", {
        title: editForm.title.trim(),
        subject: editForm.subject,
        classLevel: editForm.classLevel,
        mode: editForm.mode,
        location: editForm.location.trim(),
        monthlyFee: Number(editForm.monthlyFee),
        daysPerWeek: Number(editForm.daysPerWeek),
        description: editForm.description.trim(),
        bannerImage: editForm.bannerImage.trim(),
      })
      toast.success("Tuition updated.")
      setEditingId(null)
      setEditForm(null)
      tuitions.reload()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update the tuition."
      )
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  async function handleToggle(tuition: Tuition) {
    if (busyId) return
    setBusyId(tuition._id)
    setBusyAction("toggle")
    try {
      await sendMutation(
        `/api/tuitions/${encodeURIComponent(tuition._id)}`,
        "PATCH",
        {
          isActive: !tuition.isActive,
        }
      )
      toast.success(tuition.isActive ? "Tuition closed." : "Tuition activated.")
      tuitions.reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not change availability."
      )
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  async function handleDelete(tuition: Tuition) {
    if (busyId) return
    setBusyId(tuition._id)
    setBusyAction("delete")
    try {
      await sendMutation(
        `/api/tuitions/${encodeURIComponent(tuition._id)}`,
        "DELETE"
      )
      toast.success("Tuition deleted.")
      setPendingDelete(null)
      tuitions.reload()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the tuition."
      )
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  function setEditField<K extends keyof EditForm>(
    field: K,
    value: EditForm[K]
  ) {
    setEditForm((current) =>
      current ? { ...current, [field]: value } : current
    )
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Tuitions"
        description="Edit your listings, manage availability, and track approval status."
        actions={
          <Link
            href="/dashboard/tutor/post-tuition"
            className={cn(buttonVariants(), "h-9")}
          >
            <Plus aria-hidden="true" />
            Post a Tuition
          </Link>
        }
      />

      {tuitions.loading ? <DataLoading label="Loading your tuitions…" /> : null}
      {!tuitions.loading && tuitions.error ? (
        <DataError message={tuitions.error} onRetry={tuitions.reload} />
      ) : null}

      {!tuitions.loading && !tuitions.error ? (
        ownTuitions.length === 0 ? (
          <DataEmpty
            title="No tuitions yet"
            description="Create your first class and submit it for approval."
            href="/dashboard/tutor/post-tuition"
            actionLabel="Post a Tuition"
          />
        ) : (
          <ul className="space-y-4">
            {ownTuitions.map((tuition) => {
              const busy = busyId === tuition._id
              const editing = editingId === tuition._id
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
                        {tuition.mode}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {tuition.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {tuition.daysPerWeek} day
                          {tuition.daysPerWeek === 1 ? "" : "s"}/week
                        </span>
                        <span className="font-medium text-foreground">
                          {formatMoney(tuition.monthlyFee)}/month
                        </span>
                      </div>
                      {tuition.approvalStatus === "rejected" ? (
                        <p className="mt-2 text-xs text-destructive">
                          This listing was not approved. Update the details and
                          resubmit.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          editing ? setEditingId(null) : startEdit(tuition)
                        }
                        disabled={anyBusy}
                      >
                        {editing ? (
                          <X aria-hidden="true" />
                        ) : (
                          <Pencil aria-hidden="true" />
                        )}
                        {editing ? "Cancel" : "Edit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(tuition)}
                        disabled={anyBusy}
                      >
                        {busy && busyAction === "toggle" ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Power aria-hidden="true" />
                        )}
                        {tuition.isActive ? "Close" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setPendingDelete(tuition)}
                        disabled={anyBusy}
                      >
                        {busy && busyAction === "delete" ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash aria-hidden="true" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>

                  {editing && editForm ? (
                    <form
                      onSubmit={(event) => handleSave(event, tuition._id)}
                      className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2"
                    >
                      <div className="sm:col-span-2">
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-title-${tuition._id}`}
                        >
                          Title
                        </label>
                        <input
                          id={`edit-title-${tuition._id}`}
                          value={editForm.title}
                          onChange={(event) =>
                            setEditField("title", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-subject-${tuition._id}`}
                        >
                          Subject
                        </label>
                        <select
                          id={`edit-subject-${tuition._id}`}
                          value={editForm.subject}
                          onChange={(event) =>
                            setEditField("subject", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        >
                          {SUBJECT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-class-${tuition._id}`}
                        >
                          Class Level
                        </label>
                        <select
                          id={`edit-class-${tuition._id}`}
                          value={editForm.classLevel}
                          onChange={(event) =>
                            setEditField("classLevel", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        >
                          {CLASS_LEVEL_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-mode-${tuition._id}`}
                        >
                          Mode
                        </label>
                        <select
                          id={`edit-mode-${tuition._id}`}
                          value={editForm.mode}
                          onChange={(event) =>
                            setEditField(
                              "mode",
                              event.target.value as EditForm["mode"]
                            )
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        >
                          {MODE_OPTIONS.filter((option) => option.value).map(
                            (option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-location-${tuition._id}`}
                        >
                          Location
                        </label>
                        <input
                          id={`edit-location-${tuition._id}`}
                          value={editForm.location}
                          onChange={(event) =>
                            setEditField("location", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-fee-${tuition._id}`}
                        >
                          Monthly Fee (৳)
                        </label>
                        <input
                          id={`edit-fee-${tuition._id}`}
                          type="number"
                          min="0"
                          value={editForm.monthlyFee}
                          onChange={(event) =>
                            setEditField("monthlyFee", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div>
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-days-${tuition._id}`}
                        >
                          Days / Week
                        </label>
                        <input
                          id={`edit-days-${tuition._id}`}
                          type="number"
                          min="1"
                          max="7"
                          value={editForm.daysPerWeek}
                          onChange={(event) =>
                            setEditField("daysPerWeek", event.target.value)
                          }
                          disabled={busy}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-description-${tuition._id}`}
                        >
                          Description
                        </label>
                        <textarea
                          id={`edit-description-${tuition._id}`}
                          rows={3}
                          value={editForm.description}
                          onChange={(event) =>
                            setEditField("description", event.target.value)
                          }
                          disabled={busy}
                          className={cn(FIELD_CLASS, "h-auto resize-y py-2")}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className={LABEL_CLASS}
                          htmlFor={`edit-banner-${tuition._id}`}
                        >
                          Tuition Image URL
                        </label>
                        <input
                          id={`edit-banner-${tuition._id}`}
                          type="url"
                          value={editForm.bannerImage}
                          onChange={(event) =>
                            setEditField("bannerImage", event.target.value)
                          }
                          placeholder="https://example.com/tuition.jpg"
                          disabled={busy}
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button type="submit" disabled={anyBusy} className="h-9">
                          {busy && busyAction === "save" ? (
                            <LoaderCircle
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : null}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this tuition?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete tuition"
        destructive
        loading={Boolean(pendingDelete && busyId === pendingDelete._id)}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
