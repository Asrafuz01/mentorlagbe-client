"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, LoaderCircle, LogOut, UserRound } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { AUTH_PATHS } from "./nav-config"
import {
  getAvatarSrc,
  getDisplayName,
  getInitials,
  getRoleLabel,
  type NavbarUser,
} from "./session-utils"

const ROLE_BADGE_STYLES = {
  Student: "bg-primary/10 text-primary ring-primary/20",
  Tutor: "bg-secondary text-secondary-foreground ring-border",
  Admin: "bg-destructive/10 text-destructive ring-destructive/20",
} as const

function Avatar({ user }: { user: NavbarUser }) {
  const src = getAvatarSrc(user.image)

  return (
    <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
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
        <span aria-hidden="true">{getInitials(user)}</span>
      )}
    </span>
  )
}

function RoleBadge({ role }: { role?: string | null }) {
  const label = getRoleLabel(role)

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset",
        ROLE_BADGE_STYLES[label]
      )}
    >
      {label}
    </span>
  )
}

function UserSummary({
  user,
  stacked,
}: {
  user: NavbarUser
  stacked: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar user={user} />
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "truncate text-sm leading-tight font-medium",
            stacked ? "max-w-full" : "max-w-24 xl:max-w-32"
          )}
          title={getDisplayName(user)}
        >
          {getDisplayName(user)}
        </span>
        <RoleBadge role={user.role} />
      </div>
    </div>
  )
}

export type UserMenuProps = {
  user: NavbarUser
  stacked?: boolean
  onNavigate?: () => void
}

export function UserMenu({ user, stacked = false, onNavigate }: UserMenuProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      onNavigate?.()
      router.replace(AUTH_PATHS.home)
      router.refresh()
    } catch (error) {
      console.error("Failed to sign out", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const actionLinkClass = cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    stacked && "w-full justify-start"
  )

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        stacked && "flex-col items-stretch gap-3"
      )}
    >
      <UserSummary user={user} stacked={stacked} />

      <div
        className={cn(
          "flex items-center gap-1",
          stacked && "flex-col items-stretch gap-1 border-t border-border pt-3"
        )}
      >
        <Link
          href={AUTH_PATHS.dashboard}
          onClick={onNavigate}
          aria-label="Dashboard"
          title="Dashboard"
          className={actionLinkClass}
        >
          <LayoutDashboard aria-hidden="true" />
          <span className={cn(!stacked && "hidden xl:inline")}>Dashboard</span>
        </Link>

        <Link
          href={AUTH_PATHS.profile}
          onClick={onNavigate}
          aria-label="Update Profile"
          title="Update Profile"
          className={actionLinkClass}
        >
          <UserRound aria-hidden="true" />
          <span className={cn(!stacked && "hidden xl:inline")}>
            Update Profile
          </span>
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-label="Sign Out"
          title="Sign Out"
          className={cn(stacked && "w-full justify-start")}
        >
          {isSigningOut ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          <span className={cn(!stacked && "hidden xl:inline")}>
            {isSigningOut ? "Signing out…" : "Sign Out"}
          </span>
        </Button>
      </div>
    </div>
  )
}
