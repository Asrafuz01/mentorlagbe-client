"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, X } from "lucide-react"

import { Brand } from "@/components/brand"
import { isActivePath } from "@/components/navbar/nav-config"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DASHBOARD_NAV, type DashboardRole } from "./nav-config"

function NavList({
  role,
  collapsed,
  onNavigate,
}: {
  role: DashboardRole
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const items = DASHBOARD_NAV[role]

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {items.map(({ label, href, icon: Icon }, index) => {
        // Overview links are exact-only so nested pages don't highlight two items.
        const active =
          index === 0 ? pathname === href : isActivePath(pathname, href)

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {collapsed ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="truncate">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export type DashboardSidebarProps = {
  role: DashboardRole
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function DashboardSidebar({
  role,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-4",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <Link
              href="/dashboard"
              aria-label="MentorLagbe dashboard"
              className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
            >
              <GraduationCap className="size-5" aria-hidden="true" />
            </Link>
          ) : (
            <Brand href="/dashboard" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <NavList role={role} collapsed={collapsed} />
        </div>

        <p
          className={cn(
            "border-t border-border p-4 text-[0.7rem] text-muted-foreground",
            collapsed && "sr-only"
          )}
        >
          MentorLagbe workspace
        </p>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-background shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <Brand href="/dashboard" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCloseMobile}
                aria-label="Close navigation"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavList
                role={role}
                collapsed={false}
                onNavigate={onCloseMobile}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
