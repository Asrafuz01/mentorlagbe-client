import { Footer } from "@/components/footer"
import { PricingSection } from "@/components/home/pricing-section"
import { Navbar } from "@/components/navbar"
import {
  UpgradeBanner,
  type ProPlan,
} from "@/components/payments/checkout-button"

export const metadata = {
  title: "Pricing | MentorLagbe",
  description:
    "Choose a free or Pro plan for students and tutors on MentorLagbe.",
}

type SearchParamValue = string | string[] | undefined

function parsePlan(value: SearchParamValue): ProPlan | null {
  const plan = Array.isArray(value) ? value[0] : value
  return plan === "student-pro" || plan === "tutor-pro" ? plan : null
}

type PricingPageProps = {
  searchParams: Promise<{ plan?: SearchParamValue }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const plan = parsePlan(params.plan)

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Plans &amp; Pricing
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Start free, then upgrade to unlock priority booking, unlimited
            listings, and a verified badge.
          </p>
        </div>
        {plan ? <UpgradeBanner plan={plan} /> : null}
        <PricingSection checkout showIntro={false} />
      </main>
      <Footer />
    </div>
  )
}
