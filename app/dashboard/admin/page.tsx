"use client"

import Link from "next/link"
import {
  ArrowRight,
  CircleCheck,
  Clock,
  CreditCard,
  GraduationCap,
  Users,
} from "lucide-react"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardStatCard,
  DataError,
  normalizePayment,
  normalizeTuition,
  normalizeUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { formatMoney } from "@/lib/dashboard-format"
import type { Payment, Tuition, User } from "@/types"

export default function AdminOverviewPage() {
  const users = useDashboardCollection<User>("/api/admin/users", normalizeUser)
  const tuitions = useDashboardCollection<Tuition>(
    "/api/admin/tuitions",
    normalizeTuition
  )
  const payments = useDashboardCollection<Payment>(
    "/api/admin/transactions",
    normalizePayment
  )

  if (users.loading && tuitions.loading && payments.loading) {
    return <DashboardSkeleton />
  }

  const pending = tuitions.items.filter(
    (item) => item.approvalStatus === "pending"
  ).length
  const approved = tuitions.items.filter(
    (item) => item.approvalStatus === "approved"
  ).length
  const tutors = users.items.filter((item) => item.role === "tutor").length
  const completed = payments.items.filter((item) => item.status === "completed")
  const revenue = completed.reduce((sum, item) => sum + item.amount, 0)

  const actions = [
    {
      label: "User Management",
      description: "Review accounts and change roles.",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Tuition Approvals",
      description: `Review ${pending} pending listing${pending === 1 ? "" : "s"}.`,
      href: "/dashboard/admin/tuitions",
      icon: CircleCheck,
    },
    {
      label: "Transactions",
      description: "Inspect Stripe payment records.",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Admin Overview"
        description="Platform health, moderation queue, and revenue at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total Users"
          value={users.loading ? "—" : users.items.length}
          icon={Users}
          tone="primary"
          hint="All registered MentorLagbe accounts."
          href="/dashboard/admin/users"
        />
        <DashboardStatCard
          label="Total Tutors"
          value={users.loading ? "—" : tutors}
          icon={GraduationCap}
          tone="success"
          hint="Accounts with the tutor role."
          href="/dashboard/admin/users"
        />
        <DashboardStatCard
          label="Pending Tuitions"
          value={tuitions.loading ? "—" : pending}
          icon={Clock}
          tone="warning"
          hint={`${approved} approved listing${approved === 1 ? "" : "s"} live.`}
          href="/dashboard/admin/tuitions"
        />
        <DashboardStatCard
          label="Total Stripe Revenue"
          value={
            payments.loading
              ? "—"
              : formatMoney(revenue, completed[0]?.currency || "USD")
          }
          icon={CreditCard}
          tone="success"
          hint={`${completed.length} completed payment${completed.length === 1 ? "" : "s"}.`}
          href="/dashboard/admin/transactions"
        />
      </div>

      {users.error ? (
        <DataError message={users.error} onRetry={users.reload} />
      ) : null}
      {tuitions.error ? (
        <DataError message={tuitions.error} onRetry={tuitions.reload} />
      ) : null}
      {payments.error ? (
        <DataError message={payments.error} onRetry={payments.reload} />
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Management</h2>
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
