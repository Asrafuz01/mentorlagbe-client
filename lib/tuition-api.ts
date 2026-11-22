import type { Tuition } from "@/types"

export const TUITION_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

/** Maps an API record defensively so partial responses cannot crash a page. */
export function normalizeTuition(value: unknown): Tuition | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  const title = asString(raw.title)
  if (!id || !title) return null

  const status = asString(raw.approvalStatus, "pending").toLowerCase()
  const approvalStatus: Tuition["approvalStatus"] =
    status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : "pending"

  return {
    _id: id,
    title,
    subject: asString(raw.subject, "General"),
    classLevel: asString(raw.classLevel, "All levels"),
    mode: asString(raw.mode).toLowerCase() === "offline" ? "Offline" : "Online",
    location: asString(raw.location, "—"),
    monthlyFee: Number(raw.monthlyFee) || 0,
    daysPerWeek: Number(raw.daysPerWeek) || 0,
    bannerImage: asString(raw.bannerImage),
    description: asString(raw.description, "No description provided yet."),
    tutorName: asString(raw.tutorName, "MentorLagbe tutor"),
    tutorEmail: asString(raw.tutorEmail),
    approvalStatus,
    isActive: raw.isActive === undefined ? true : Boolean(raw.isActive),
    createdAt: asString(raw.createdAt),
  }
}

export type TuitionPage = {
  items: Tuition[]
  page: number
  totalPages: number
  total: number
}

export const EMPTY_TUITION_PAGE: TuitionPage = {
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
}

export type TuitionQuery = {
  search?: string
  subject?: string
  classLevel?: string
  mode?: string
  page?: number
}

function readArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return null

  const record = value as Record<string, unknown>
  for (const key of ["data", "tuitions", "items", "results"] as const) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  return null
}

function readPositiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

function getPaginationField(
  root: Record<string, unknown>,
  keys: readonly string[]
): unknown {
  for (const key of keys) {
    if (root[key] !== undefined && root[key] !== null) return root[key]
  }
  return undefined
}

function parseTuitionPage(
  payload: unknown,
  requestedPage: number
): TuitionPage {
  const records = readArray(payload)
  if (!records) return EMPTY_TUITION_PAGE

  const items = records
    .map(normalizeTuition)
    .filter((item): item is Tuition => item !== null)
    .filter((item) => item.approvalStatus === "approved" && item.isActive)

  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {}
  const pagination =
    root.pagination && typeof root.pagination === "object"
      ? (root.pagination as Record<string, unknown>)
      : {}
  const meta =
    root.meta && typeof root.meta === "object"
      ? (root.meta as Record<string, unknown>)
      : {}
  const sources = [root, pagination, meta]

  const field = (keys: readonly string[]) => {
    for (const source of sources) {
      const value = getPaginationField(source, keys)
      if (value !== undefined) return value
    }
    return undefined
  }

  return {
    items,
    page: readPositiveNumber(field(["page", "currentPage"]), requestedPage),
    totalPages: readPositiveNumber(field(["totalPages", "pages"]), 1),
    total: readPositiveNumber(field(["total", "count"]), items.length),
  }
}

export async function getFeaturedTuitions(limit = 6): Promise<Tuition[]> {
  try {
    const response = await fetch(
      `${TUITION_API_URL}/api/tuitions?limit=${limit}`,
      { cache: "no-store" }
    )
    if (!response.ok) return []

    const payload: unknown = await response.json()
    const records = readArray(payload)
    if (!records) return []

    return records
      .map(normalizeTuition)
      .filter((item): item is Tuition => item !== null)
      .filter((item) => item.approvalStatus === "approved" && item.isActive)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  } catch {
    // Backend may be offline — the home page still renders.
    return []
  }
}

export async function getTuitions(
  query: TuitionQuery = {}
): Promise<TuitionPage> {
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.subject) params.set("subject", query.subject)
  if (query.classLevel) params.set("classLevel", query.classLevel)
  if (query.mode) params.set("mode", query.mode)
  if (query.page && query.page > 1) params.set("page", String(query.page))

  try {
    const search = params.toString()
    const response = await fetch(
      `${TUITION_API_URL}/api/tuitions${search ? `?${search}` : ""}`,
      { cache: "no-store" }
    )
    if (!response.ok) return EMPTY_TUITION_PAGE

    const payload: unknown = await response.json()
    return parseTuitionPage(payload, query.page ?? 1)
  } catch {
    return EMPTY_TUITION_PAGE
  }
}

export async function getTuitionById(id: string): Promise<Tuition | null> {
  try {
    const response = await fetch(
      `${TUITION_API_URL}/api/tuitions/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    )
    if (!response.ok) return null

    const payload: unknown = await response.json()
    const record =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data: unknown }).data
        : payload

    return normalizeTuition(record)
  } catch {
    return null
  }
}
