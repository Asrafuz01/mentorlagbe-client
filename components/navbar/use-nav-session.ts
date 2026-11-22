"use client"

import { useSession } from "@/lib/auth-client"

import { toNavbarUser, type NavbarSession } from "./session-utils"

/**
 * The auth client shape we rely on. Casting through `unknown` keeps this hook
 * compatible with both the current (better-auth) hook and a future provider.
 */
type SessionLike = {
  data?: { user?: unknown } | null
  isPending?: boolean
  isLoading?: boolean
}

export function useNavbarSession(): NavbarSession {
  const session = useSession() as unknown as SessionLike
  const isLoading = session.isPending ?? session.isLoading ?? false

  if (isLoading) return { status: "loading", user: null }

  const user = toNavbarUser(session.data?.user)
  return user
    ? { status: "authenticated", user }
    : { status: "unauthenticated", user: null }
}
