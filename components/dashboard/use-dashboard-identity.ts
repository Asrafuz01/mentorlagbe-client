"use client"

import { useAuthIdentity } from "@/lib/auth-identity"

import { toDashboardUser, type DashboardUser } from "./dashboard-user"

export type DashboardIdentityState = {
  user: DashboardUser | null
  isPending: boolean
  isUnauthenticated: boolean
  refresh: () => void
}

/** Dashboard-facing identity backed by the authoritative Express profile. */
export function useDashboardIdentity(): DashboardIdentityState {
  const { identity, isPending, isUnauthenticated, refresh } = useAuthIdentity()

  return {
    user: toDashboardUser(identity),
    isPending,
    isUnauthenticated,
    refresh,
  }
}
