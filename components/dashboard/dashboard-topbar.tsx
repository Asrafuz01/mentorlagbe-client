"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Crown,
  House,
  LoaderCircle,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

import {
  getAvatarSrc,
  getDisplayName,
  getInitials,
} from "@/components/navbar/session-utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import type { DashboardUser } from "./dashboard-user"

const ROLE_BADGE_STYLES = {
  Student: "bg-primary/10 text-primary ring-primary/20",
  Tutor: "bg-secondary text-secondary-foreground ring-border",
  Admin: "bg-destructive/10 text-destructive ring-destructive/20",
} as const

function Avatar({ user }: { user: DashboardUser }) {
  const src = getAvatarSrc(user.image)

  return (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
      {src ? (
        <Image
          src={src}
          alt=""
          width={36}
          height={36}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">
          {getInitials({ name: user.name, email: user.email })}
        </span>
      )}
    </span>
  )
}

export type DashboardTopbarProps = {
  user: DashboardUser
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobile: () => void
}

export function DashboardTopbar({
  user,
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: DashboardTopbarProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isPro = user.plan !== "free"

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOut()
      router.replace("/")
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onOpenMobile}
        aria-label="Open navigation"
        className="lg:hidden"
      >
        <Menu aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:inline-flex"
      >
        {collapsed ? (
          <PanelLeftOpen aria-hidden="true" />
        ) : (
          <PanelLeftClose aria-hidden="true" />
        )}
      </Button>

      <Link
        href="/"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <House aria-hidden="true" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="hidden min-w-0 text-right md:block">
          <span
            className="block max-w-40 truncate text-sm leading-tight font-medium"
            title={getDisplayName({ name: user.name, email: user.email })}
          >
            {getDisplayName({ name: user.name, email: user.email })}
          </span>
          <span className="mt-0.5 flex items-center justify-end gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold ring-1 ring-inset",
                ROLE_BADGE_STYLES[user.roleLabel]
              )}
            >
              {user.roleLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold ring-1 ring-inset",
                isPro
                  ? "bg-primary/10 text-primary ring-primary/20"
                  : "bg-muted text-muted-foreground ring-border"
              )}
            >
              {isPro ? <Crown className="size-2.5" aria-hidden="true" /> : null}
              {user.planLabel}
            </span>
          </span>
        </span>

        <Avatar user={user} />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-label="Sign Out"
          className="shrink-0"
        >
          {isSigningOut ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {isSigningOut ? "Signing out…" : "Sign Out"}
          </span>
        </Button>
      </div>
    </header>
  )
}
