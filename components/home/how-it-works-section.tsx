import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  type LucideIcon,
  Search,
  Sparkles,
  UserRoundPlus,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
  PRIMARY_CTA_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_SUBHEADING_CLASS,
} from "./hero-section"

type Step = {
  number: string
  icon: LucideIcon
  title: string
  description: string
  student: string
  tutor: string
}

const STEPS: readonly Step[] = [
  {
    number: "01",
    icon: UserRoundPlus,
    title: "Create your profile",
    description: "Tell us what you are looking for — or what you can teach.",
    student: "Share goals, class level, and preferred schedule.",
    tutor: "Add subjects, experience, and availability.",
  },
  {
    number: "02",
    icon: Search,
    title: "Find the right match",
    description:
      "Explore verified tutors and mentorship batches that fit your needs.",
    student: "Browse tuitions by subject, mode, or location.",
    tutor: "Post a batch or list a 1-on-1 session.",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "Apply & connect",
    description:
      "Start a conversation and agree on the details before day one.",
    student: "Apply to tuitions and chat with shortlisted tutors.",
    tutor: "Review applicants, shortlist, and message back.",
  },
  {
    number: "04",
    icon: BookOpenCheck,
    title: "Learn & manage",
    description:
      "Keep the whole journey in one place, from first class to last.",
    student: "Join online or offline sessions and track progress.",
    tutor: "Manage your schedule and applicants from the dashboard.",
  },
]

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon

  return (
    <li className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          Step {step.number}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>

      <dl className="mt-5 space-y-3 border-t border-border pt-4 text-xs">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-semibold">Students</dt>
          <dd className="text-muted-foreground">{step.student}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-semibold">Tutors</dt>
          <dd className="text-muted-foreground">{step.tutor}</dd>
        </div>
      </dl>
    </li>
  )
}

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-border/80 bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Simple from start to finish
          </span>
          <h2
            id="how-it-works-heading"
            className={cn("mt-5 text-balance", SECTION_HEADING_CLASS)}
          >
            How MentorLagbe Works
          </h2>
          <p className={cn("mt-4 text-center", SECTION_SUBHEADING_CLASS)}>
            From finding a tutor to running a mentorship batch, four clear steps
            work for learners and tutors alike.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <Link href="/sign-up" className={PRIMARY_CTA_CLASS}>
            Get started
            <ArrowRight aria-hidden="true" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Free to join as a student or tutor.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
