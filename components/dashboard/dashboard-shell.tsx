"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { clearExpressToken } from "@/lib/express-auth"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { DashboardTopbar } from "./dashboard-topbar"
import { getDashboardHome, getDashboardRole } from "./nav-config"
import { useDashboardIdentity } from "./use-dashboard-identity"

export type DashboardShellProps = {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isPending, isUnauthenticated } = useDashboardIdentity()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = getDashboardRole(user?.role)
  const requestedRole = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/tutor")
      ? "tutor"
      : pathname.startsWith("/dashboard/student")
        ? "student"
        : null
  const wrongRoleSection = requestedRole !== null && requestedRole !== role

  useEffect(() => {
    // Guests are redirected only after the identity has finished resolving.
    if (isUnauthenticated) {
      clearExpressToken()
      router.replace("/sign-in")
      return
    }
    // Server routes remain the real guard; this avoids flashing another
    // role's empty shell when a URL is typed directly.
    if (!isPending && user && wrongRoleSection) {
      router.replace(getDashboardHome(role))
    }
  }, [isUnauthenticated, isPending, role, router, user, wrongRoleSection])

  // CRITICAL: while the profile-backed identity resolves (including a hard
  // reload), keep the skeleton on screen. Redirecting here would bounce users.
  if (isPending || !user || wrongRoleSection) return <DashboardSkeleton />

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
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
