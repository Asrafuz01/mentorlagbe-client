import Link from "next/link"
import { LayoutDashboard } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PaymentVerificationStatus } from "@/components/payments/payment-verification-status"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Payment Successful | MentorLagbe",
  description: "Your MentorLagbe Pro subscription payment was successful.",
}

type SearchParamValue = string | string[] | undefined

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
  const sessionId = (rawSessionId ?? "").trim() || null

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-14 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <PaymentVerificationStatus key={sessionId ?? "none"} sessionId={sessionId} />

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
