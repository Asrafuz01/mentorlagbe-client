import { API_BASE_URL } from "@/lib/api"
import { authenticatedFetch } from "@/lib/express-auth"
import { asString, normalizeTuition } from "@/lib/tuition-api"
import type { SavedTuition } from "@/types"

/** Normalizes the bookmark + joined tuition shape returned by the API. */
export function normalizeSavedTuition(value: unknown): SavedTuition | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  const tuitionId = asString(raw.tuitionId)
  if (!id || !tuitionId) return null

  return {
    _id: id,
    tuitionId,
    tuitionTitle: asString(raw.tuitionTitle),
    subject: asString(raw.subject),
    studentEmail: asString(raw.studentEmail),
    createdAt: asString(raw.createdAt),
    tuition: normalizeTuition(raw.tuition),
  }
}

function readRecords(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return []

  const record = payload as Record<string, unknown>
  for (const key of ["data", "bookmarks", "savedTuitions", "items"] as const) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  return []
}

/** Loads the signed-in student's saved tuition ids for global button state. */
export async function fetchSavedTuitionIds(): Promise<Set<string>> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/bookmarks`, {
    cache: "no-store",
  })
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "message" in payload
        ? asString((payload as Record<string, unknown>).message)
        : "Could not load saved tuitions."
    )
  }

  return new Set(
    readRecords(payload)
      .map((item) =>
        item && typeof item === "object"
          ? asString((item as Record<string, unknown>).tuitionId)
          : ""
      )
      .filter(Boolean)
  )
}
