import {
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

export type DashboardRole = "student" | "tutor" | "admin"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/** Single source of truth for the role-specific sidebar links. */
export const DASHBOARD_NAV: Record<DashboardRole, readonly DashboardNavItem[]> =
  {
    student: [
      { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
      {
        label: "My Applications",
        href: "/dashboard/student/my-applications",
        icon: ClipboardList,
      },
      { label: "Update Profile", href: "/dashboard/profile", icon: UserRound },
    ],
    tutor: [
      { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
      {
        label: "Post a Tuition",
        href: "/dashboard/tutor/post-tuition",
        icon: Upload,
      },
      {
        label: "My Tuitions",
        href: "/dashboard/tutor/my-tuitions",
        icon: FileText,
      },
      {
        label: "Manage Applicants",
        href: "/dashboard/tutor/applicants",
        icon: ListChecks,
      },
      { label: "Update Profile", href: "/dashboard/profile", icon: UserRound },
    ],
    admin: [
      { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "User Management", href: "/dashboard/admin/users", icon: Users },
      {
        label: "Tuition Approvals",
        href: "/dashboard/admin/tuitions",
        icon: ShieldCheck,
      },
      {
        label: "Transactions",
        href: "/dashboard/admin/transactions",
        icon: CreditCard,
      },
      { label: "Update Profile", href: "/dashboard/profile", icon: UserRound },
    ],
  }

/** Normalizes any stored role string into one of our three dashboard roles. */
export function getDashboardRole(role?: string | null): DashboardRole {
  const value = role?.trim().toLowerCase()
  return value === "admin" || value === "tutor" ? value : "student"
}

/** Destination used by the /dashboard role redirect. */
export function getDashboardHome(role: DashboardRole): string {
  return DASHBOARD_NAV[role][0].href
}
