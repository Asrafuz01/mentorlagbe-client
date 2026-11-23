"use client"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  formatDate,
  formatMoney,
  normalizePayment,
  StatusBadge,
  useDashboardCollection,
} from "@/components/dashboard"
import type { Payment } from "@/types"

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  "student-pro": "Student Pro",
  "tutor-pro": "Tutor Pro",
}

export default function AdminTransactionsPage() {
  const payments = useDashboardCollection<Payment>(
    "/api/admin/transactions",
    normalizePayment
  )

  if (payments.loading && payments.items.length === 0) {
    return <DashboardSkeleton />
  }

  const completed = payments.items.filter((item) => item.status === "completed")
  const revenue = completed.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Transactions"
        description="Stripe payment records across all MentorLagbe accounts."
      />

      {payments.loading ? <DataLoading label="Loading transactions…" /> : null}
      {!payments.loading && payments.error ? (
        <DataError message={payments.error} onRetry={payments.reload} />
      ) : null}

      {!payments.loading && !payments.error ? (
        payments.items.length === 0 ? (
          <DataEmpty
            title="No transactions yet"
            description="Completed Stripe checkouts will appear here once payments are recorded."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-sm shadow-sm">
              <span className="text-muted-foreground">
                Records:{" "}
                <span className="font-medium text-foreground">
                  {payments.items.length}
                </span>
              </span>
              <span className="text-muted-foreground">
                Completed:{" "}
                <span className="font-medium text-foreground">
                  {completed.length}
                </span>
              </span>
              <span className="text-muted-foreground">
                Revenue:{" "}
                <span className="font-semibold text-foreground">
                  {formatMoney(revenue, completed[0]?.currency || "USD")}
                </span>
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[54rem] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">User Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Plan Name</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Transaction ID</th>
                      <th className="px-5 py-3 font-medium">Payment Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.items.map((payment) => (
                      <tr key={payment._id} className="hover:bg-muted/30">
                        <td className="px-5 py-3 font-medium">
                          {payment.userName || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {payment.userEmail || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground capitalize">
                          {payment.userRole || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          {PLAN_LABELS[payment.plan] ?? payment.plan}
                        </td>
                        <td className="px-5 py-3 font-semibold">
                          {formatMoney(payment.amount, payment.currency)}
                        </td>
                        <td className="px-5 py-3">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
                            {payment.stripePaymentIntentId ||
                              payment.stripeSessionId ||
                              payment._id}
                          </code>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      ) : null}
    </div>
  )
}
