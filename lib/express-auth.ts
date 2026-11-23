import { API_BASE_URL } from "@/lib/api"
import { authClient } from "@/lib/auth-client"

type SessionUser = {
  email?: unknown
  name?: unknown
  role?: unknown
  plan?: unknown
  image?: unknown
}

type CachedToken = {
  token: string
  expiresAt: number
}

let tokenCache: CachedToken | null = null
let tokenRequest: Promise<string | null> | null = null
let tokenGeneration = 0
let signupHint: { email: string; role: string; plan: string } | null = null

const FALLBACK_TOKEN_TTL_MS = 6 * 24 * 60 * 60 * 1000
const EXPIRY_SKEW_MS = 60 * 1000
const VALID_ROLES = new Set(["student", "tutor", "admin"])
const VALID_PLANS = new Set(["free", "pro", "student-pro", "tutor-pro"])

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

function readSessionUser(result: unknown): SessionUser | null {
  if (!result || typeof result !== "object") return null

  const response = result as Record<string, unknown>
  const session = (response.data ?? response) as Record<string, unknown> | null
  if (!session || typeof session !== "object") return null

  const user = session.user
  return user && typeof user === "object" ? (user as SessionUser) : null
}

function getTokenExpiry(token: string): number {
  try {
    const payload = token.split(".")[1]
    if (!payload) return Date.now() + FALLBACK_TOKEN_TTL_MS

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    )
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown }
    if (typeof decoded.exp === "number") return decoded.exp * 1000
  } catch {
    // A non-standard token still works; it simply gets a conservative TTL.
  }
  return Date.now() + FALLBACK_TOKEN_TTL_MS
}

function resetTokenCache() {
  tokenGeneration += 1
  tokenCache = null
  tokenRequest = null
}

/** Clears the cached Express JWT when the BetterAuth session ends. */
export function clearExpressToken() {
  resetTokenCache()
  signupHint = null
}

/**
 * Carries the role chosen at signup into the first Express JWT exchange.
 * BetterAuth may omit custom fields from the session, so this prevents the
 * server from creating the Express profile with its default student role.
 */
export function setSignupRoleHint(input: {
  email: string
  role: string
  plan?: string
}) {
  const email = readText(input.email).toLowerCase()
  const role = readRole(input.role)
  if (!email || !role) return

  signupHint = {
    email,
    role,
    plan: readPlan(input.plan) || "free",
  }
}

/**
 * Exchanges the active BetterAuth session for a signed Express JWT.
 * Concurrent callers share one request, and successful tokens are cached
 * until shortly before they expire.
 */
export async function getExpressToken(
  forceRefresh = false
): Promise<string | null> {
  if (
    !forceRefresh &&
    tokenCache &&
    tokenCache.expiresAt > Date.now() + EXPIRY_SKEW_MS
  ) {
    return tokenCache.token
  }
  if (!forceRefresh && tokenRequest) return tokenRequest

  const generation = tokenGeneration
  const request = (async () => {
    const user = readSessionUser(await authClient.getSession())
    const email = readText(user?.email).toLowerCase()
    if (!user || !email) {
      resetTokenCache()
      return null
    }

    const hint = signupHint?.email === email ? signupHint : null
    const role = readRole(user.role) || hint?.role || ""
    const plan = readPlan(user.plan) || hint?.plan || ""
    const image = readText(user.image)

    const response = await fetch(`${API_BASE_URL}/api/auth/jwt`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: readText(user.name) || email.split("@")[0],
        ...(role ? { role } : {}),
        ...(plan ? { plan } : {}),
        ...(image ? { image } : {}),
      }),
    })

    if (!response.ok) {
      resetTokenCache()
      return null
    }

    const payload: unknown = await response.json().catch(() => null)
    const token =
      payload && typeof payload === "object"
        ? readText((payload as Record<string, unknown>).token)
        : ""

    if (!token) {
      resetTokenCache()
      return null
    }

    if (signupHint?.email === email) signupHint = null
    if (generation === tokenGeneration) {
      tokenCache = { token, expiresAt: getTokenExpiry(token) }
    }
    return token
  })()

  tokenRequest = request
  try {
    return await request
  } finally {
    if (tokenRequest === request) tokenRequest = null
  }
}

/** Adds the Express JWT to a request and retries once with a fresh token on 401. */
export async function authenticatedFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const send = async (token: string | null) => {
    const headers = new Headers(init.headers)
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return fetch(url, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    })
  }

  const token = await getExpressToken()
  const response = await send(token)
  if (response.status !== 401) return response

  const freshToken = await getExpressToken(true)
  if (!freshToken || freshToken === token) return response
  return send(freshToken)
}
