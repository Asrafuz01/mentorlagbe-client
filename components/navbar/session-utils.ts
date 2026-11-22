export type UserRole = "Student" | "Tutor" | "Admin"

export type NavbarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

export type NavbarSession =
  | { status: "loading"; user: null }
  | { status: "unauthenticated"; user: null }
  | { status: "authenticated"; user: NavbarUser }

/** Normalize whatever the auth provider returns into a small, stable shape. */
export function toNavbarUser(value: unknown): NavbarUser | null {
  if (!value || typeof value !== "object") return null

  const user = value as Record<string, unknown>
  return {
    name: typeof user.name === "string" ? user.name : null,
    email: typeof user.email === "string" ? user.email : null,
    image: typeof user.image === "string" ? user.image : null,
    role: typeof user.role === "string" ? user.role : null,
  }
}

export function getRoleLabel(role?: string | null): UserRole {
  switch (role?.trim().toLowerCase()) {
    case "tutor":
    case "instructor":
    case "teacher":
      return "Tutor"
    case "admin":
    case "administrator":
      return "Admin"
    default:
      return "Student"
  }
}

export function getDisplayName(user: NavbarUser): string {
  const name = user.name?.trim()
  if (name) return name

  const emailName = user.email?.split("@")[0]?.trim()
  return emailName || "My account"
}

export function getInitials(user: NavbarUser): string {
  const parts = getDisplayName(user).split(/\s+/).filter(Boolean).slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "M"
}

/** Avoid handing malformed avatar values to next/image. */
export function getAvatarSrc(image?: string | null): string | null {
  if (!image) return null

  const value = image.trim()
  if (
    value.startsWith("/") ||
    value.startsWith("data:image/") ||
    /^https?:\/\//i.test(value)
  ) {
    return value
  }

  return null
}
