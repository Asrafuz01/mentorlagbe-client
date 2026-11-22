export type NavItem = {
  label: string
  href: string
}

/** Public links shown in every breakpoint. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/about" },
]

/** Single source of truth for auth/dashboard destinations. */
export const AUTH_PATHS = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
} as const

/** Home is exact-match only; section links also highlight on nested routes. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
