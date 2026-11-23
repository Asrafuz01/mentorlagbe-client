import Link from "next/link"
import { CircleCheck, Info, LayoutDashboard, ShieldCheck } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { buttonVariants } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Payment Successful | MentorLagbe",
  description: "Your MentorLagbe Pro subscription payment was successful.",
}

type SearchParamValue = string | string[] | undefined

type VerifyResult = {
  checked: boolean
  confirmed: boolean
}

async function verifyPayment(sessionId: string): Promise<VerifyResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" }
    )
    return { checked: true, confirmed: response.ok }
  } catch {
    return { checked: false, confirmed: false }
  }
}

type PaymentSuccessPageProps = {
  searchParams: Promise<{ session_id?: SearchParamValue }>
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams
  const rawSessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id
  const sessionId = (rawSessionId ?? "").trim()

  const verification: VerifyResult | null = sessionId
    ? await verifyPayment(sessionId)
    : null

  const isConfirmed = Boolean(verification?.checked && verification.confirmed)
  const needsAttention = verification !== null && !isConfirmed

  const note = !verification
    ? "Your checkout session is being finalised. You can safely close this page."
    : isConfirmed
      ? "Your payment has been confirmed and synced to your account."
      : verification.checked
        ? "We couldn't confirm the payment automatically. Your provider will email you a receipt shortly."
        : "Our payment service is temporarily unreachable. Your subscription will sync once it is back online."

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-14 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <span
            className={cn(
              "mx-auto grid size-16 place-items-center rounded-full",
              needsAttention
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            {needsAttention ? (
              <Info className="size-9" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-9" aria-hidden="true" />
            )}
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            {needsAttention ? "Payment submitted" : "Payment successful"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {needsAttention
              ? "Your checkout may still be finalising. Check your dashboard shortly to confirm your Pro benefits."
              : "Thank you for upgrading your MentorLagbe experience. Your Pro benefits are on the way."}
          </p>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-3 text-left">
            {verification?.checked && verification.confirmed ? (
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : (
              <Info
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {note}
            </p>
          </div>

          {sessionId ? (
            <p className="mt-3 truncate text-[0.7rem] text-muted-foreground">
              Session: {sessionId}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "h-11")}
            >
              <LayoutDashboard aria-hidden="true" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11"
              )}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
