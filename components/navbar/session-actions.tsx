"use client"

import { AuthButtons } from "./auth-buttons"
import type { NavbarSession } from "./session-utils"
import { UserMenu } from "./user-menu"

function SessionSkeleton({ stacked }: { stacked: boolean }) {
  if (stacked) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="size-9 animate-pulse rounded-full bg-muted" />
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
    </div>
  )
}

export type SessionActionsProps = {
  session: NavbarSession
  stacked?: boolean
  onNavigate?: () => void
}

/** One place decides what the navbar shows for each session state. */
export function SessionActions({
  session,
  stacked = false,
  onNavigate,
}: SessionActionsProps) {
  if (session.status === "loading") {
    return <SessionSkeleton stacked={stacked} />
  }

  if (session.status === "authenticated") {
    return (
      <UserMenu user={session.user} stacked={stacked} onNavigate={onNavigate} />
    )
  }

  return <AuthButtons stacked={stacked} onNavigate={onNavigate} />
}
