"use client"

import Link from "next/link"
import {
  ArrowRight,
  CircleCheck,
  ClipboardList,
  Crown,
  FileText,
  Plus,
} from "lucide-react"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardStatCard,
  DataError,
  getPlanLabel,
  isOwnRecord,
  normalizeApplication,
  normalizeOwnTuition,
  toDashboardUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { Application, Tuition } from "@/types"

export default function TutorOverviewPage() {
  const { data: session } = useSession()
  const user = toDashboardUser(session?.user)
  const tuitions = useDashboardCollection<Tuition>(
    "/api/tuitions?mine=true",
    normalizeOwnTuition
  )
  const applicants = useDashboardCollection<Application>(
    "/api/applications",
    normalizeApplication
  )

  if (!user) return <DashboardSkeleton />

  const ownTuitions = tuitions.items.filter((item) =>
    isOwnRecord(item, user, "tutor")
  )
  const ownApplicants = applicants.items.filter((item) =>
    isOwnRecord(item, user, "tutor")
  )
  const approved = ownTuitions.filter(
    (item) => item.approvalStatus === "approved" && item.isActive
  ).length
  const isPro = user.plan !== "free"

  const actions = [
    {
      label: "Post a Tuition",
      description: "Create another class and reach motivated students.",
      href: "/dashboard/tutor/post-tuition",
      icon: Plus,
    },
    {
      label: "My Tuitions",
      description: "Manage listings, availability, and descriptions.",
      href: "/dashboard/tutor/my-tuitions",
      icon: FileText,
    },
    {
      label: "Manage Applicants",
      description: "Review and respond to student applications.",
      href: "/dashboard/tutor/applicants",
      icon: ClipboardList,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`Welcome back, ${user.name || "tutor"}`}
        description="Your teaching workspace at a glance."
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total Tuitions Posted"
          value={tuitions.loading ? "—" : ownTuitions.length}
          icon={FileText}
          tone="primary"
          hint="Every class listing you have created."
          href="/dashboard/tutor/my-tuitions"
        />
        <DashboardStatCard
          label="Active / Approved Tuitions"
          value={tuitions.loading ? "—" : approved}
          icon={CircleCheck}
          tone="success"
          hint="Listings currently visible to students."
          href="/dashboard/tutor/my-tuitions"
        />
        <DashboardStatCard
          label="Total Applicants Received"
          value={applicants.loading ? "—" : ownApplicants.length}
          icon={ClipboardList}
          tone="warning"
          hint="Students who applied to your classes."
          href="/dashboard/tutor/applicants"
        />
        <DashboardStatCard
          label="Current Plan"
          value={isPro ? "Pro" : "Free"}
          icon={Crown}
          tone={isPro ? "primary" : "default"}
          hint={getPlanLabel(user.plan)}
          href={isPro ? undefined : "/pricing?plan=tutor-pro"}
        />
      </div>

      {tuitions.error ? (
        <DataError message={tuitions.error} onRetry={tuitions.reload} />
      ) : null}
      {applicants.error ? (
        <DataError message={applicants.error} onRetry={applicants.reload} />
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map(({ label, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
