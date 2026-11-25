"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"

import { API_BASE_URL } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { authenticatedFetch } from "@/lib/express-auth"

const VALID_ROLES = new Set(["student", "tutor", "admin"])
const VALID_PLANS = new Set(["free", "pro", "student-pro", "tutor-pro"])
const PROFILE_TTL_MS = 60 * 1000

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

type ProfileSnapshot = {
  email: string
  payload: Record<string, unknown> | null
  loaded: boolean
  attemptedAt: number
}

const EMPTY_SNAPSHOT: ProfileSnapshot = {
  email: "",
  payload: null,
  loaded: false,
  attemptedAt: 0,
}

// Navbar, dashboard shell, and page-level hooks all need the same Express
// profile. A tiny external store shares the result and its in-flight request.
const profileSnapshots = new Map<string, ProfileSnapshot>()
const profileRequests = new Map<string, Promise<void>>()
const profileRequestIds = new Map<string, number>()
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getProfileSnapshot(email: string): ProfileSnapshot {
  return email ? profileSnapshots.get(email) ?? EMPTY_SNAPSHOT : EMPTY_SNAPSHOT
}

function setProfileSnapshot(
  email: string,
  payload: Record<string, unknown> | null
) {
  profileSnapshots.set(email, {
    email,
    payload,
    loaded: true,
    attemptedAt: Date.now(),
  })
  emitChange()
}

/** Drops cached profiles and prevents in-flight requests from writing stale data. */
export function clearAuthIdentityCache(email?: string) {
  if (email) {
    profileSnapshots.delete(email)
    profileRequests.delete(email)
    profileRequestIds.delete(email)
  } else {
    profileSnapshots.clear()
    profileRequests.clear()
    profileRequestIds.clear()
  }
  emitChange()
}

async function fetchAuthProfile(email: string, force = false) {
  const inFlight = profileRequests.get(email)
  if (inFlight && !force) return inFlight

  const existing = profileSnapshots.get(email)
  if (
    !force &&
    existing?.loaded &&
    Date.now() - existing.attemptedAt < PROFILE_TTL_MS
  ) {
    return
  }

  const requestId = (profileRequestIds.get(email) ?? 0) + 1
  profileRequestIds.set(email, requestId)
  const isCurrent = () => profileRequestIds.get(email) === requestId

  const request = (async () => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/users/me`,
        { cache: "no-store" }
      )
      const data: unknown = await response.json().catch(() => null)
      if (response.ok && data && typeof data === "object") {
        if (isCurrent()) {
          setProfileSnapshot(email, data as Record<string, unknown>)
        }
        return
      }
    } catch {
      // Fall back to the BetterAuth session, but allow a retry after the TTL.
    }
    if (isCurrent()) setProfileSnapshot(email, null)
  })()

  profileRequests.set(email, request)
  try {
    await request
  } finally {
    if (profileRequests.get(email) === request) profileRequests.delete(email)
    if (profileRequestIds.get(email) === requestId) {
      profileRequestIds.delete(email)
    }
  }
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
  const sessionIdentity = fromSession(session?.user)
  const email = sessionIdentity?.email ?? ""
  const profile = useSyncExternalStore(
    subscribe,
    () => getProfileSnapshot(email),
    () => EMPTY_SNAPSHOT
  )

  const profilePayload =
    profile.email === email && profile.loaded ? profile.payload : null
  const identity = sessionIdentity
    ? profilePayload
      ? mergeProfile(sessionIdentity, profilePayload)
      : sessionIdentity
    : null
  const isCheckingProfile = Boolean(email) && profile.email !== email

  useEffect(() => {
    if (isPending || !email) return
    void fetchAuthProfile(email)
  }, [email, isPending])

  const refresh = useCallback(() => {
    if (!email) return
    clearAuthIdentityCache(email)
    void fetchAuthProfile(email, true)
  }, [email])

  return {
    identity,
    isPending: isPending || isCheckingProfile,
    isUnauthenticated: !isPending && !sessionIdentity,
    refresh,
  }
}
