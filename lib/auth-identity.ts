"use client"

import { useEffect, useState } from "react"

import { API_BASE_URL } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { authenticatedFetch } from "@/lib/express-auth"

const VALID_ROLES = new Set(["student", "tutor", "admin"])
const VALID_PLANS = new Set(["free", "pro", "student-pro", "tutor-pro"])

export type AuthIdentity = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  plan: string
  phone: string
  bio: string
}

type ProfileState = {
  email: string
  payload: Record<string, unknown> | null
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function readRole(value: unknown): string {
  const role = readText(value).toLowerCase()
  return VALID_ROLES.has(role) ? role : ""
}

function readPlan(value: unknown): string {
  const plan = readText(value).toLowerCase()
  return VALID_PLANS.has(plan) ? plan : ""
}

function fromSession(value: unknown): AuthIdentity | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const email = readText(raw.email).toLowerCase()
  if (!email) return null

  return {
    id: readText(raw.id) || readText(raw._id),
    name: readText(raw.name),
    email,
    image: readText(raw.image) || null,
    role: readRole(raw.role),
    plan: readPlan(raw.plan),
    phone: readText(raw.phone),
    bio: readText(raw.bio),
  }
}

/** The Express profile is authoritative for role and plan. */
function mergeProfile(
  session: AuthIdentity,
  payload: Record<string, unknown>
): AuthIdentity {
  return {
    id: readText(payload.id) || readText(payload._id) || session.id,
    name: readText(payload.name) || session.name,
    email: readText(payload.email).toLowerCase() || session.email,
    image:
      readText(payload.image) || (payload.image === null ? null : session.image),
    role: readRole(payload.role) || session.role,
    plan: readPlan(payload.plan) || session.plan,
    phone: readText(payload.phone) || session.phone,
    bio: readText(payload.bio) || session.bio,
  }
}

/**
 * Resolves the signed-in identity from Express first. BetterAuth sessions can
 * omit custom fields such as role, so dashboard and role-gated UI must not
 * treat the session alone as authoritative.
 */
export function useAuthIdentity() {
  const { data: session, isPending } = useSession()
  const [profile, setProfile] = useState<ProfileState | null>(null)

  const sessionIdentity = fromSession(session?.user)
  const email = sessionIdentity?.email ?? ""
  const profileForEmail = profile?.email === email ? profile.payload : null
  const identity = sessionIdentity
    ? profileForEmail
      ? mergeProfile(sessionIdentity, profileForEmail)
      : sessionIdentity
    : null
  const isCheckingProfile = Boolean(email) && profile?.email !== email

  useEffect(() => {
    if (isPending || !email || profile?.email === email) return

    let cancelled = false

    async function loadProfile() {
      let payload: Record<string, unknown> | null = null
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/users/me`,
          { cache: "no-store" }
        )
        const data: unknown = await response.json().catch(() => null)
        if (response.ok && data && typeof data === "object") {
          payload = data as Record<string, unknown>
        }
      } catch {
        // Keep the session identity as a fallback when the profile is unavailable.
      }
      if (!cancelled) setProfile({ email, payload })
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [email, isPending, profile?.email])

  return {
    identity,
    isPending: isPending || isCheckingProfile,
    isUnauthenticated: !isPending && !sessionIdentity,
  }
}
