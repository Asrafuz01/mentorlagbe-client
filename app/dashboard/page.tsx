"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  DashboardSkeleton,
  getDashboardHome,
  getDashboardRole,
  toDashboardUser,
} from "@/components/dashboard"
import { useSession } from "@/lib/auth-client"

/** Sends each signed-in role to its own overview page. */
export default function DashboardRedirectPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const rawUser = session?.user
  const user = toDashboardUser(rawUser)
  const target = getDashboardHome(getDashboardRole(user?.role))

  useEffect(() => {
    // The shell handles unauthenticated guests; we only move signed-in users.
    if (isPending || !rawUser) return
    router.replace(target)
  }, [isPending, rawUser, target, router])

  return <DashboardSkeleton />
}
