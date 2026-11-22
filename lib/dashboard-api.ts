import { API_BASE_URL } from "@/lib/api"
import { asString, normalizeTuition } from "@/lib/tuition-api"
import type {
  Application,
  ApplicationStatus,
  Payment,
  SubscriptionPlan,
  Tuition,
  User,
  UserRole,
} from "@/types"

export { normalizeTuition }

export type CollectionResult<T> = {
  items: T[]
  error: string | null
}

const ARRAY_KEYS = [
  "data",
  "items",
  "results",
  "applications",
  "tuitions",
  "users",
  "payments",
  "transactions",
] as const

function readRecords(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return null

  const record = payload as Record<string, unknown>
  for (const key of ARRAY_KEYS) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  if (record.data && typeof record.data === "object") {
    return readRecords(record.data)
  }
  return null
}

/** Pulls a human-friendly message out of any backend error payload. */
export function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  const record = payload as Record<string, unknown>
  return asString(record.message) || asString(record.error) || fallback
}

function asOptional(value: unknown): string | undefined {
  return asString(value) || undefined
}

function toRole(value: unknown): UserRole {
  const role = asString(value).trim().toLowerCase()
  return role === "tutor" || role === "admin" ? role : "student"
}

function toPlan(value: unknown): SubscriptionPlan {
  const plan = asString(value).trim().toLowerCase()
  return plan === "student-pro" || plan === "tutor-pro" ? plan : "free"
}

function toApplicationStatus(value: unknown): ApplicationStatus {
  const status = asString(value).trim().toLowerCase()
  return status === "accepted" || status === "rejected" ? status : "pending"
}

export function normalizeApplication(value: unknown): Application | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  if (!id) return null

  const tuition =
    raw.tuition && typeof raw.tuition === "object"
      ? (raw.tuition as Record<string, unknown>)
      : {}

  return {
    _id: id,
    tuitionId:
      asString(raw.tuitionId) || asString(tuition._id) || asString(tuition.id),
    studentId: asString(raw.studentId),
    studentName: asString(raw.studentName) || asString(raw.name),
    studentEmail: asString(raw.studentEmail) || asString(raw.email),
    status: toApplicationStatus(raw.status),
    message: asOptional(raw.message),
    studentPhone: asString(raw.studentPhone),
    preferredSchedule: asString(raw.preferredSchedule),
    studentNote: asString(raw.studentNote) || asString(raw.note),
    tuitionTitle: asString(raw.tuitionTitle) || asString(tuition.title),
    monthlyFee: Number(raw.monthlyFee ?? tuition.monthlyFee) || undefined,
    tutorId: asString(raw.tutorId) || asString(tuition.tutorId),
    tutorName: asString(raw.tutorName),
    tutorEmail: asString(raw.tutorEmail),
    createdAt: asString(raw.createdAt),
    updatedAt: asOptional(raw.updatedAt),
  }
}

/** Keeps the tutor owner fields that the public normalizer intentionally drops. */
export function normalizeOwnTuition(value: unknown): Tuition | null {
  const tuition = normalizeTuition(value)
  if (!tuition || !value || typeof value !== "object") return tuition

  const raw = value as Record<string, unknown>
  const tutor =
    raw.tutor && typeof raw.tutor === "object"
      ? (raw.tutor as Record<string, unknown>)
      : {}

  return {
    ...tuition,
    tutorId:
      asString(raw.tutorId) ||
      asString(raw.userId) ||
      asString(tutor._id) ||
      asString(tutor.id),
    updatedAt: asOptional(raw.updatedAt),
  }
}

type OwnerFields = {
  tutorId?: string
  tutorEmail?: string
  studentId?: string
  studentEmail?: string
}

/** Filters scoped API results when the backend does not narrow them itself. */
export function isOwnRecord(
  record: OwnerFields,
  user: { id: string; email: string },
  kind: "tutor" | "student"
): boolean {
  const id = (kind === "tutor" ? record.tutorId : record.studentId)?.trim()
  const email = (kind === "tutor" ? record.tutorEmail : record.studentEmail)
    ?.trim()
    .toLowerCase()
  const userId = user.id.trim()
  const userEmail = user.email.trim().toLowerCase()

  // No owner metadata means the endpoint is expected to have filtered already.
  if (!id && !email) return true
  return (
    Boolean(id && userId && id === userId) ||
    Boolean(email && userEmail && email === userEmail)
  )
}

export function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  const email = asString(raw.email)
  if (!id || !email) return null

  return {
    _id: id,
    name: asString(raw.name) || email.split("@")[0],
    email,
    role: toRole(raw.role),
    plan: toPlan(raw.plan),
    emailVerified: Boolean(raw.emailVerified),
    image: asOptional(raw.image),
    phone: asOptional(raw.phone),
    location: asOptional(raw.location),
    bio: asOptional(raw.bio),
    createdAt: asString(raw.createdAt),
    updatedAt: asOptional(raw.updatedAt),
  }
}

export function normalizePayment(value: unknown): Payment | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  if (!id) return null

  const user =
    raw.user && typeof raw.user === "object"
      ? (raw.user as Record<string, unknown>)
      : {}

  return {
    _id: id,
    userId: asString(raw.userId) || asString(user._id) || asString(user.id),
    plan: toPlan(raw.plan),
    amount: Number(raw.amount) || 0,
    currency: asString(raw.currency, "USD"),
    status: (["completed", "pending", "failed", "refunded"] as const).includes(
      asString(raw.status) as Payment["status"]
    )
      ? (asString(raw.status) as Payment["status"])
      : "pending",
    userName: asString(raw.userName) || asString(user.name),
    userEmail: asString(raw.userEmail) || asString(user.email),
    userRole:
      raw.userRole || user.role ? toRole(raw.userRole || user.role) : undefined,
    tuitionId: asOptional(raw.tuitionId),
    stripeSessionId: asOptional(raw.stripeSessionId),
    stripePaymentIntentId: asOptional(raw.stripePaymentIntentId),
    createdAt: asString(raw.createdAt),
    updatedAt: asOptional(raw.updatedAt),
  }
}

/** Authenticated collection fetch with a tolerant response parser. */
export async function getCollection<T>(
  path: string,
  normalize: (value: unknown) => T | null
): Promise<CollectionResult<T>> {
  if (!path) return { items: [], error: null }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      cache: "no-store",
    })
    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        items: [],
        error: getErrorMessage(
          payload,
          "Could not load this data. Please try again."
        ),
      }
    }

    const records = readRecords(payload)
    if (!records) return { items: [], error: null }

    return {
      items: records.map(normalize).filter((item): item is T => item !== null),
      error: null,
    }
  } catch {
    return {
      items: [],
      error: "Could not reach the server. Please try again later.",
    }
  }
}

/** Authenticated POST/PATCH/PUT/DELETE that throws a display-ready error. */
export async function sendMutation(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error("Could not reach the server. Please try again later.")
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "The request could not be completed.")
    )
  }
}
