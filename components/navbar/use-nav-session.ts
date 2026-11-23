"use client"

import { useAuthIdentity } from "@/lib/auth-identity"

import { toNavbarUser, type NavbarSession } from "./session-utils"

export function useNavbarSession(): NavbarSession {
  const { identity, isPending } = useAuthIdentity()

  if (isPending) return { status: "loading", user: null }

  const user = toNavbarUser(identity)
  return user
    ? { status: "authenticated", user }
    : { status: "unauthenticated", user: null }
}
