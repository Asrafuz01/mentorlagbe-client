"use client"

import Link from "next/link"
import {
  ArrowRight,
  CircleCheck,
  ClipboardList,
  Clock,
  Crown,
  FileText,
  Search,
} from "lucide-react"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardStatCard,
  DataError,
  getPlanLabel,
  isOwnRecord,
  toDashboardUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { useSession } from "@/lib/auth-client"
import { normalizeApplication } from "@/lib/dashboard-api"
import type { Application } from "@/types"

const STAT_CLASS = "min-h-32"

export default function StudentOverviewPage() {
  const { data: session } = useSession()
  const user = toDashboardUser(session?.user)
  const applications = useDashboardCollection<Application>(
    "/api/applications",
    normalizeApplication
  )

  if (!user) return <DashboardSkeleton />

  const items = applications.items.filter((item) =>
    isOwnRecord(item, user, "student")
  )
  const accepted = items.filter((item) => item.status === "accepted").length
  const pending = items.filter((item) => item.status === "pending").length
  const isPro = user.plan !== "free"

  const actions = [
    {
      label: "Browse Tuitions",
      description: "Explore new classes from verified tutors.",
      href: "/tuitions",
      icon: Search,
    },
    {
      label: "My Applications",
      description: "Review responses and application status.",
      href: "/dashboard/student/my-applications",
      icon: ClipboardList,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`Welcome back, ${user.name || "student"}`}
        description="Here is a quick look at your learning journey on MentorLagbe."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total Applied Tuitions"
          value={applications.loading ? "—" : items.length}
          icon={FileText}
          tone="primary"
          hint="All tuition applications you have submitted."
          className={STAT_CLASS}
        />
        <DashboardStatCard
          label="Accepted Applications"
          value={applications.loading ? "—" : accepted}
          icon={CircleCheck}
          tone="success"
          hint="Tutors who replied positively to your application."
          className={STAT_CLASS}
        />
        <DashboardStatCard
          label="Pending Applications"
          value={applications.loading ? "—" : pending}
          icon={Clock}
          tone="warning"
          hint="Applications still awaiting a tutor response."
          className={STAT_CLASS}
        />
        <DashboardStatCard
          label="Current Plan"
          value={isPro ? "Pro" : "Free"}
          icon={Crown}
          tone={isPro ? "primary" : "default"}
          hint={getPlanLabel(user.plan)}
          href={isPro ? undefined : "/pricing"}
          className={STAT_CLASS}
        />
      </div>

      {applications.error ? (
        <DataError message={applications.error} onRetry={applications.reload} />
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
