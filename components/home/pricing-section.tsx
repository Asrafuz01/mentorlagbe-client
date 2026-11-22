import Link from "next/link"
import {
  BadgeCheck,
  Check,
  Crown,
  GraduationCap,
  type LucideIcon,
  Sparkles,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
  PRIMARY_CTA_CLASS,
  SECONDARY_CTA_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_SUBHEADING_CLASS,
} from "./hero-section"

type Plan = {
  id: string
  name: string
  audience: string
  price: string
  period: string
  description: string
  features: readonly string[]
  ctaLabel: string
  ctaHref: string
  icon: LucideIcon
  featured?: boolean
}

const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    audience: "Students & Tutors",
    price: "$0",
    period: "/month",
    description: "Start exploring and connecting without a subscription.",
    features: [
      "Basic student applications",
      "Up to 2 tuition posts for tutors",
      "Browse public tuition listings",
      "Community support",
    ],
    ctaLabel: "Get started free",
    ctaHref: "/sign-up",
    icon: Users,
  },
  {
    id: "student-pro",
    name: "Pro Student",
    audience: "For Students",
    price: "$10",
    period: "/month",
    description: "Move faster and stand out when applying for the right tutor.",
    features: [
      "Priority booking",
      "Unlimited saved tuitions",
      "Verified student badge",
      "Everything in Free",
    ],
    ctaLabel: "Subscribe with Stripe",
    ctaHref: "/pricing?plan=student-pro",
    icon: GraduationCap,
    featured: true,
  },
  {
    id: "tutor-pro",
    name: "Pro Tutor",
    audience: "For Tutors",
    price: "$15",
    period: "/month",
    description: "Grow your tutoring practice with visibility and control.",
    features: [
      "Unlimited tuition posts",
      "Verified tutor badge",
      "Priority listing placement",
      "Everything in Free",
    ],
    ctaLabel: "Subscribe with Stripe",
    ctaHref: "/pricing?plan=tutor-pro",
    icon: Crown,
    featured: true,
  },
]

function PlanCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon

  return (
    <li
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        plan.featured
          ? "border-primary/40 ring-1 ring-primary/10"
          : "border-border"
      )}
    >
      {plan.featured ? (
        <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
          <Sparkles className="size-3" aria-hidden="true" />
          Pro
        </span>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {plan.audience}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {plan.description}
      </p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {plan.price}
        </span>
        <span className="text-sm text-muted-foreground">{plan.period}</span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={cn(
          "mt-6 w-full justify-center",
          plan.featured ? PRIMARY_CTA_CLASS : SECONDARY_CTA_CLASS
        )}
      >
        {plan.ctaLabel}
      </Link>
    </li>
  )
}

export type PricingSectionProps = {
  className?: string
  /** Hide the intro on /pricing where the page supplies its own heading. */
  showIntro?: boolean
  id?: string
}

export function PricingSection({
  className,
  showIntro = true,
  id = "pricing",
}: PricingSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={showIntro ? `${id}-heading` : undefined}
      className={cn(
        "border-t border-border/80 bg-background py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showIntro ? (
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <BadgeCheck
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              Simple, transparent pricing
            </span>
            <h2
              id={`${id}-heading`}
              className={cn("mt-5 text-balance", SECTION_HEADING_CLASS)}
            >
              Pricing that grows with your learning
            </h2>
            <p className={cn("mt-4", SECTION_SUBHEADING_CLASS)}>
              Start free, then upgrade to the Pro plan that fits how you learn
              or teach.
            </p>
          </div>
        ) : null}

        <ul className={cn("grid gap-5 md:grid-cols-3", showIntro && "mt-12")}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default PricingSection
