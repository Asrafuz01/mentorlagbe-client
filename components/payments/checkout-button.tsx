"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { useAuthIdentity } from "@/lib/auth-identity"
import { authenticatedFetch } from "@/lib/express-auth"

export type ProPlan = "student-pro" | "tutor-pro"

export const PRO_PLAN_LABELS: Record<ProPlan, string> = {
  "student-pro": "Pro Student",
  "tutor-pro": "Pro Tutor",
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function extractCheckoutUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : {}

  return (
    [record.url, record.checkoutUrl, data.url, data.checkoutUrl]
      .map(readString)
      .find((value) => /^https?:\/\//i.test(value ?? "")) ?? null
  )
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  return readString(record.message) ?? readString(record.error)
}

export type CheckoutButtonProps = {
  plan: ProPlan
  children?: ReactNode
  className?: string
}

export function CheckoutButton({
  plan,
  children,
  className,
}: CheckoutButtonProps) {
  const router = useRouter()
  const { identity, isPending } = useAuthIdentity()
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    if (isLoading || isPending) return

    if (!identity) {
      toast.error("Sign in to subscribe to a Pro plan.")
      router.push(
        `/sign-in?redirect=${encodeURIComponent(`/pricing?plan=${plan}`)}`
      )
      return
    }

    setIsLoading(true)
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            userEmail: identity.email,
            userName: identity.name,
            userRole: identity.role || "student",
          }),
        }
      )

      const payload: unknown = await response.json().catch(() => null)
      const url = extractCheckoutUrl(payload)

      if (!response.ok || !url) {
        throw new Error(
          extractErrorMessage(payload) ??
            "Could not start checkout. Please try again."
        )
      }

      toast.success("Opening secure Stripe checkout…")
      window.location.assign(url)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Payment service is unavailable right now. Please try again later."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isPending}
      className={className}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Opening checkout…
        </>
      ) : (
        (children ?? "Subscribe with Stripe")
      )}
    </Button>
  )
}

export function UpgradeBanner({ plan }: { plan: ProPlan }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Selected plan
          </p>
          <p className="mt-1 text-lg font-semibold">
            {PRO_PLAN_LABELS[plan]} is ready when you are
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Sign in and continue to secure Stripe checkout to activate your
            upgrade.
          </p>
        </div>
        <CheckoutButton plan={plan} className="h-11 shrink-0 px-5">
          Continue to Checkout
        </CheckoutButton>
      </div>
    </div>
  )
}
