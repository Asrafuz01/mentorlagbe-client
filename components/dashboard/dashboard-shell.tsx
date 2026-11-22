"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/lib/auth-client"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { DashboardTopbar } from "./dashboard-topbar"
import { toDashboardUser } from "./dashboard-user"
import { getDashboardRole } from "./nav-config"

export type DashboardShellProps = {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const rawUser = session?.user
  const user = toDashboardUser(rawUser)
  const isUnauthenticated = !isPending && !rawUser

  useEffect(() => {
    // Guests are redirected only after the session has finished loading.
    if (isUnauthenticated) router.replace("/sign-in")
  }, [isUnauthenticated, router])

  // CRITICAL: while the session resolves (including a hard reload), keep the
  // skeleton on screen. Redirecting here would bounce authenticated users.
  if (isPending || !rawUser || !user) return <DashboardSkeleton />

  const role = getDashboardRole(user.role)

  return (
    <div className="flex min-h-svh bg-muted/20">
      <DashboardSidebar
        role={role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          user={user}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
