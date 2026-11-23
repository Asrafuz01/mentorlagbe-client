"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  DashboardSkeleton,
  getDashboardHome,
  getDashboardRole,
  useDashboardIdentity,
} from "@/components/dashboard"

/** Sends each signed-in role to its own overview page. */
export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user, isPending, isUnauthenticated } = useDashboardIdentity()
  const email = user?.email ?? ""
  const target = getDashboardHome(getDashboardRole(user?.role))

  useEffect(() => {
    // The shell handles unauthenticated guests; we only move signed-in users.
    if (isPending || isUnauthenticated || !email) return
    router.replace(target)
  }, [email, isPending, isUnauthenticated, target, router])

  return <DashboardSkeleton />
}
