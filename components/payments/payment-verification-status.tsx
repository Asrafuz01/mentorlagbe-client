"use client"

import { useEffect, useState } from "react"
import { CircleCheck, Info, LoaderCircle, ShieldCheck } from "lucide-react"

import { API_BASE_URL } from "@/lib/api"
import { clearAuthIdentityCache } from "@/lib/auth-identity"
import { authenticatedFetch } from "@/lib/express-auth"
import { cn } from "@/lib/utils"

type VerificationState = "checking" | "confirmed" | "needs-attention"

type Copy = {
  heading: string
  description: string
  note: string
}

const COPY: Record<VerificationState, Copy> = {
  checking: {
    heading: "Confirming your payment",
    description: "We’re checking your checkout session with the server.",
    note: "This usually takes a moment. Keep this page open until verification finishes.",
  },
  confirmed: {
    heading: "Payment successful",
    description:
      "Thank you for upgrading your MentorLagbe experience. Your Pro benefits are on the way.",
    note: "Your payment has been confirmed and synced to your account.",
  },
  "needs-attention": {
    heading: "Payment submitted",
    description:
      "Your checkout may still be finalising. Check your dashboard shortly to confirm your Pro benefits.",
    note: "We couldn't confirm the payment automatically. Your provider will email you a receipt shortly.",
  },
}

export function PaymentVerificationStatus({
  sessionId,
}: {
  sessionId: string | null
}) {
  const [state, setState] = useState<VerificationState>(
    sessionId ? "checking" : "needs-attention"
  )

  useEffect(() => {
    if (!sessionId) return

    const sessionIdValue = sessionId
    let active = true
    const controller = new AbortController()

    async function verifyPayment() {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/payments/verify?session_id=${encodeURIComponent(sessionIdValue)}`,
          { cache: "no-store", signal: controller.signal }
        )
        if (!active) return

        if (response.ok) {
          // The server just activated the purchased plan.
          clearAuthIdentityCache()
          setState("confirmed")
        } else {
          setState("needs-attention")
        }
      } catch {
        if (active) setState("needs-attention")
      }
    }

    void verifyPayment()
    return () => {
      active = false
      controller.abort()
    }
  }, [sessionId])

  const copy = COPY[state]
  const isConfirmed = state === "confirmed"

  return (
    <>
      <span
        className={cn(
          "mx-auto grid size-16 place-items-center rounded-full",
          state === "checking"
            ? "bg-muted text-muted-foreground"
            : isConfirmed
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
        )}
      >
        {state === "checking" ? (
          <LoaderCircle className="size-9 animate-spin" aria-hidden="true" />
        ) : isConfirmed ? (
          <CircleCheck className="size-9" aria-hidden="true" />
        ) : (
          <Info className="size-9" aria-hidden="true" />
        )}
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        {copy.heading}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {copy.description}
      </p>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-3 text-left">
        {isConfirmed ? (
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">{copy.note}</p>
      </div>

      {sessionId ? (
        <p className="mt-3 truncate text-[0.7rem] text-muted-foreground">
          Session: {sessionId}
        </p>
      ) : null}
    </>
  )
}
