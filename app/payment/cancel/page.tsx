import Link from "next/link"
import { CircleX, RotateCcw } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Payment Cancelled | MentorLagbe",
  description: "Your MentorLagbe checkout was cancelled.",
}

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-14 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
            <CircleX className="size-9" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            Payment cancelled
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            No charge was made. You can return to the pricing page whenever you
            are ready — your free plan is still active.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg" }), "h-11")}
            >
              <RotateCcw aria-hidden="true" />
              Try Again
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
