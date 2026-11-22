"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"

import type { NavItem } from "./nav-config"

export type NavLinkProps = NavItem & {
  active: boolean
  mobile?: boolean
  onNavigate?: () => void
}

export function NavLink({
  label,
  href,
  active,
  mobile = false,
  onNavigate,
}: NavLinkProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-md font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          mobile ? "px-3 py-2.5 text-base" : "px-2.5 py-2 text-sm",
          active
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {label}
      </Link>
    </li>
  )
}
