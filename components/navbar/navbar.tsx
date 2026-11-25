"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

import { Brand } from "@/components/brand"
import { cn } from "@/lib/utils"

import { isActivePath, NAV_ITEMS } from "./nav-config"
import { NavLink } from "./nav-link"
import { SessionActions } from "./session-actions"
import { ThemeToggle } from "./theme-toggle"
import { useNavbarSession } from "./use-nav-session"

const MENU_ID = "navbar-mobile-menu"

export type NavbarProps = {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const session = useNavbarSession()
  const [openMenuPath, setOpenMenuPath] = useState<string | undefined>(
    undefined
  )

  // Tying the menu to its opening pathname closes it on navigation without
  // needing to synchronize state from an effect.
  const isMenuOpen = openMenuPath !== undefined && openMenuPath === pathname
  const closeMenu = () => setOpenMenuPath(undefined)
  const toggleMenu = () =>
    setOpenMenuPath((current) => (current === pathname ? undefined : pathname))

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuPath(undefined)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75",
        className
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Brand />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </ul>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <ThemeToggle />
          <SessionActions session={session} />
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls={MENU_ID}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id={MENU_ID}
          className="border-t border-border/80 bg-background lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  mobile
                  active={isActivePath(pathname, item.href)}
                  onNavigate={closeMenu}
                />
              ))}
            </ul>

            <div className="border-t border-border/80 pt-4">
              <SessionActions
                session={session}
                stacked
                onNavigate={closeMenu}
              />
            </div>

            <div className="border-t border-border/80 pt-3">
              <ThemeToggle showLabel />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
