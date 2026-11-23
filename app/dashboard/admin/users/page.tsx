"use client"

import { useState } from "react"
import { LoaderCircle, Mail, Search, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import {
  ConfirmDialog,
  DashboardPageHeader,
  DashboardSkeleton,
  DataEmpty,
  DataError,
  DataLoading,
  formatDate,
  normalizeUser,
  sendMutation,
  toDashboardUser,
  useDashboardCollection,
} from "@/components/dashboard"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { User, UserRole } from "@/types"

const ROLE_OPTIONS: readonly UserRole[] = ["student", "tutor", "admin"]
const SELECT_CLASS =
  "h-9 rounded-lg border border-input bg-background px-2 text-xs font-medium capitalize outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const currentUser = toDashboardUser(session?.user)
  const users = useDashboardCollection<User>("/api/admin/users", normalizeUser)
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<{
    id: string
    name: string
    role: UserRole
  } | null>(null)
  const anyBusy = busyId !== null

  if (!currentUser) return <DashboardSkeleton />

  async function handleRole(id: string, role: UserRole) {
    if (busyId) return
    setBusyId(id)
    try {
      await sendMutation(
        `/api/admin/users/${encodeURIComponent(id)}/role`,
        "PATCH",
        { role }
      )
      toast.success(`Role updated to ${role}.`)
      setPendingRole(null)
      users.reload()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not change the role."
      )
    } finally {
      setBusyId(null)
    }
  }

  const term = query.trim().toLowerCase()
  const visible = term
    ? users.items.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term)
      )
    : users.items

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="User Management"
        description="Search accounts and assign student, tutor, or admin roles."
      />

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search users"
          className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      {users.loading ? <DataLoading label="Loading users…" /> : null}
      {!users.loading && users.error ? (
        <DataError message={users.error} onRetry={users.reload} />
      ) : null}

      {!users.loading && !users.error ? (
        visible.length === 0 ? (
          <DataEmpty
            title={term ? "No matching users" : "No users found"}
            description={
              term
                ? "Try a different name or email address."
                : "Registered users will appear here."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((user) => {
                    const isBusy = busyId === user._id
                    const isSelf = user._id === currentUser.id
                    return (
                      <tr key={user._id} className="hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                              <ShieldCheck
                                className="size-4"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium">
                                {user.name}
                                {isSelf ? (
                                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    (you)
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="size-3" aria-hidden="true" />
                                {user.email}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Role for ${user.name}`}
                              value={user.role}
                              onChange={(event) =>
                                setPendingRole({
                                  id: user._id,
                                  name: user.name,
                                  role: event.target.value as UserRole,
                                })
                              }
                              disabled={anyBusy || isSelf}
                              className={cn(
                                SELECT_CLASS,
                                isSelf && "cursor-not-allowed"
                              )}
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            {isBusy ? (
                              <LoaderCircle
                                className="size-3.5 animate-spin text-muted-foreground"
                                aria-hidden="true"
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingRole)}
        title="Change this user's role?"
        description={
          pendingRole
            ? `${pendingRole.name} will become ${pendingRole.role === "admin" ? "an admin" : `a ${pendingRole.role}`}. This takes effect on their next session refresh.`
            : undefined
        }
        confirmLabel="Change role"
        destructive={pendingRole?.role === "admin"}
        loading={Boolean(pendingRole && busyId === pendingRole.id)}
        onConfirm={() => {
          if (pendingRole) void handleRole(pendingRole.id, pendingRole.role)
        }}
        onCancel={() => setPendingRole(null)}
      />
    </div>
  )
}
