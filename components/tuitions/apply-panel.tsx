"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { AUTH_PATHS } from "@/components/navbar/nav-config"
import { API_BASE_URL } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { authenticatedFetch } from "@/lib/express-auth"
import { TUITION_API_URL } from "@/lib/tuition-api"
import { cn } from "@/lib/utils"

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"

const READONLY_CLASS = cn(FIELD_CLASS, "bg-muted/60 text-muted-foreground")

export type ApplyPanelProps = {
  tuitionId: string
  tuitionTitle: string
}

export function ApplyPanel({ tuitionId, tuitionTitle }: ApplyPanelProps) {
  const { data: session, isPending } = useSession()
  const [studentPhone, setStudentPhone] = useState("")
  const [preferredSchedule, setPreferredSchedule] = useState("")
  const [studentNote, setStudentNote] = useState("")
  const [errors, setErrors] = useState<{
    studentPhone?: string
    preferredSchedule?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [roleCheck, setRoleCheck] = useState<{
    email: string
    role: string
    checked: boolean
  } | null>(null)

  const user = session?.user
  const email =
    typeof user?.email === "string" ? user.email.trim().toLowerCase() : ""
  const sessionRole = (user?.role ?? "").trim().toLowerCase()
  const currentRoleCheck = roleCheck?.email === email ? roleCheck : null
  const role = currentRoleCheck?.role || sessionRole
  const isRestrictedRole = role === "tutor" || role === "admin"
  const isCheckingRole = Boolean(email) && !currentRoleCheck?.checked

  // BetterAuth sessions can omit the custom role field, so ask the Express
  // profile for the authoritative value before showing the application form.
  useEffect(() => {
    if (isPending || !email) return

    let cancelled = false

    async function loadRole() {
      let nextRole = ""
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/users/me`,
          { cache: "no-store" }
        )
        const payload: unknown = await response.json().catch(() => null)
        if (!response.ok || !payload || typeof payload !== "object") return

        const value = (payload as Record<string, unknown>).role
        const normalized =
          typeof value === "string" ? value.trim().toLowerCase() : ""
        if (
          normalized === "student" ||
          normalized === "tutor" ||
          normalized === "admin"
        ) {
          nextRole = normalized
        }
      } catch {
        // Keep the session role as a fallback if the profile request fails.
      } finally {
        if (!cancelled) setRoleCheck({ email, role: nextRole, checked: true })
      }
    }

    void loadRole()
    return () => {
      cancelled = true
    }
  }, [email, isPending])

  if (isPending || (user && isCheckingRole)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-5 h-11 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Ready to apply?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in with a student account to apply for this tuition and message
          the tutor.
        </p>
        <Link
          href={AUTH_PATHS.signIn}
          className={cn(
            "mt-5 flex h-11 w-full items-center justify-center text-sm",
            "rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          )}
        >
          Sign In as Student to Apply
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          No account yet?{" "}
          <Link
            href={`${AUTH_PATHS.signUp}?role=student`}
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    )
  }

  // Only hard-block known non-students; the API enforces the role when the
  // session payload does not include one.
  if (isRestrictedRole) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Students only</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Only student accounts can apply for tuitions. Tutors and admins can
          browse listings but cannot submit applications.
        </p>
        <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-sm">
        <CheckCircle2
          className="mx-auto size-10 text-primary"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-lg font-semibold">Application sent</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your application for{" "}
          <span className="font-medium">{tuitionTitle}</span> has been
          submitted. The tutor will be in touch soon.
        </p>
      </div>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || submitted) return

    const nextErrors: { studentPhone?: string; preferredSchedule?: string } = {}
    if (!studentPhone.trim())
      nextErrors.studentPhone = "Phone number is required."
    if (!preferredSchedule.trim())
      nextErrors.preferredSchedule = "Tell the tutor when you are available."

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please complete the required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authenticatedFetch(
        `${TUITION_API_URL}/api/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tuitionId,
            studentName: user?.name ?? "",
            studentEmail: user?.email ?? "",
            studentPhone: studentPhone.trim(),
            preferredSchedule: preferredSchedule.trim(),
            studentNote: studentNote.trim(),
          }),
        }
      )

      const result: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          result && typeof result === "object" && "message" in result
            ? String((result as { message: unknown }).message)
            : "Could not submit your application."
        throw new Error(message)
      }

      toast.success("Application submitted successfully!")
      setSubmitted(true)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your application. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Apply for this tuition</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Send the tutor a short introduction and your preferred schedule.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="studentName"
            className="mb-1.5 block text-xs font-medium"
          >
            Student Name
          </label>
          <input
            id="studentName"
            value={user?.name ?? ""}
            readOnly
            className={READONLY_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor="studentEmail"
            className="mb-1.5 block text-xs font-medium"
          >
            Student Email
          </label>
          <input
            id="studentEmail"
            type="email"
            value={user?.email ?? ""}
            readOnly
            className={READONLY_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor="studentPhone"
            className="mb-1.5 block text-xs font-medium"
          >
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            id="studentPhone"
            type="tel"
            value={studentPhone}
            onChange={(event) => setStudentPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            aria-invalid={Boolean(errors.studentPhone)}
            disabled={isSubmitting}
            className={cn(
              FIELD_CLASS,
              errors.studentPhone && "border-destructive"
            )}
          />
          {errors.studentPhone ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.studentPhone}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="preferredSchedule"
            className="mb-1.5 block text-xs font-medium"
          >
            Preferred Schedule <span className="text-destructive">*</span>
          </label>
          <input
            id="preferredSchedule"
            value={preferredSchedule}
            onChange={(event) => setPreferredSchedule(event.target.value)}
            placeholder="e.g. Weekday evenings, 6–8 PM"
            aria-invalid={Boolean(errors.preferredSchedule)}
            disabled={isSubmitting}
            className={cn(
              FIELD_CLASS,
              errors.preferredSchedule && "border-destructive"
            )}
          />
          {errors.preferredSchedule ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.preferredSchedule}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="studentNote"
            className="mb-1.5 block text-xs font-medium"
          >
            Note to Tutor{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <textarea
            id="studentNote"
            rows={3}
            value={studentNote}
            onChange={(event) => setStudentNote(event.target.value)}
            placeholder="Tell the tutor about your goals…"
            disabled={isSubmitting}
            className={cn(FIELD_CLASS, "h-auto resize-y py-2")}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Sending application…
            </>
          ) : (
            "Apply Now"
          )}
        </Button>
      </form>
    </div>
  )
}
