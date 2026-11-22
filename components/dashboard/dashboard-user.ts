import { getRoleLabel } from "@/components/navbar/session-utils"

export type DashboardUser = {
  name: string
  email: string
  image: string | null
  role: string
  roleLabel: "Student" | "Tutor" | "Admin"
  plan: string
  planLabel: string
  phone: string
  bio: string
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function getPlanLabel(plan?: string | null): string {
  switch (plan?.trim().toLowerCase()) {
    case "student-pro":
      return "Pro Student"
    case "tutor-pro":
      return "Pro Tutor"
    default:
      return "Free"
  }
}

/** Defensively maps the session user so partial auth payloads cannot crash the shell. */
export function toDashboardUser(value: unknown): DashboardUser | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const role = asString(raw.role) || "student"
  const plan = asString(raw.plan) || "free"

  return {
    name: asString(raw.name),
    email: asString(raw.email),
    image: asString(raw.image) || null,
    role,
    roleLabel: getRoleLabel(role),
    plan,
    planLabel: getPlanLabel(plan),
    phone: asString(raw.phone),
    bio: asString(raw.bio),
  }
}
