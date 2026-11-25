/** Shared collection types for the MentorLagbe client and API responses. */

export type UserRole = "student" | "tutor" | "admin"
export type TuitionMode = "Online" | "Offline"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type ApplicationStatus = "pending" | "accepted" | "rejected"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export type SubscriptionPlan = "free" | "pro" | "student-pro" | "tutor-pro"

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  plan?: SubscriptionPlan
  emailVerified?: boolean
  image?: string
  phone?: string
  location?: string
  bio?: string
  createdAt: string
  updatedAt?: string
}

export interface Tuition {
  _id: string
  title: string
  subject: string
  classLevel: string
  mode: TuitionMode
  location: string
  monthlyFee: number
  daysPerWeek: number
  bannerImage: string
  description: string
  tutorName: string
  tutorEmail: string
  approvalStatus: ApprovalStatus
  isActive: boolean
  createdAt: string
  tutorId?: string
  averageRating?: number
  reviewCount?: number
  updatedAt?: string
}

export interface SavedTuition {
  _id: string
  tuitionId: string
  tuitionTitle?: string
  subject?: string
  studentEmail?: string
  createdAt: string
  tuition: Tuition | null
}

export interface Review {
  _id: string
  tuitionId: string
  studentId?: string
  studentName: string
  studentEmail?: string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
}

export interface Application {
  _id: string
  tuitionId: string
  studentId: string
  studentName: string
  studentEmail: string
  status: ApplicationStatus
  message?: string
  studentPhone?: string
  preferredSchedule?: string
  studentNote?: string
  tuitionTitle?: string
  monthlyFee?: number
  tutorId?: string
  tutorName?: string
  tutorEmail?: string
  createdAt: string
  updatedAt?: string
}

export interface Payment {
  _id: string
  userId: string
  plan: SubscriptionPlan
  amount: number
  currency: string
  status: PaymentStatus
  userName?: string
  userEmail?: string
  userRole?: UserRole
  tuitionId?: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt?: string
}
