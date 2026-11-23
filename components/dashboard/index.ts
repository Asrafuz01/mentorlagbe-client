export { DashboardShell, type DashboardShellProps } from "./dashboard-shell"
export {
  DashboardSidebar,
  type DashboardSidebarProps,
} from "./dashboard-sidebar"
export { DashboardSkeleton } from "./dashboard-skeleton"
export { DashboardTopbar, type DashboardTopbarProps } from "./dashboard-topbar"
export {
  getPlanLabel,
  toDashboardUser,
  type DashboardUser,
} from "./dashboard-user"
export {
  DASHBOARD_NAV,
  getDashboardHome,
  getDashboardRole,
  type DashboardNavItem,
  type DashboardRole,
} from "./nav-config"
export { DashboardStatCard, type DashboardStatCardProps } from "./stat-card"
export {
  DashboardPageHeader,
  type DashboardPageHeaderProps,
} from "./page-header"
export { StatusBadge } from "./status-badge"
export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog"
export {
  DataEmpty,
  DataError,
  DataLoading,
  type DataEmptyProps,
} from "./data-states"
export {
  useDashboardCollection,
  type DashboardCollectionState,
} from "./use-dashboard-collection"
export {
  useDashboardIdentity,
  type DashboardIdentityState,
} from "./use-dashboard-identity"
export {
  getErrorMessage,
  isOwnRecord,
  normalizeApplication,
  normalizeOwnTuition,
  normalizePayment,
  normalizeTuition,
  normalizeUser,
  sendMutation,
  type CollectionResult,
} from "@/lib/dashboard-api"
export { formatDate, formatMoney } from "@/lib/dashboard-format"
export { getAvatarSrc } from "@/components/navbar/session-utils"
