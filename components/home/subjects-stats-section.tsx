import Link from "next/link"
import {
  ArrowRight,
  Atom,
  BadgeCheck,
  BookOpen,
  CodeXml,
  FlaskConical,
  type LucideIcon,
  Languages,
  Quote,
  Sigma,
  Star,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
  SECONDARY_CTA_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_SUBHEADING_CLASS,
} from "./hero-section"

const CARD_CLASS =
  "flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"

type Subject = {
  name: string
  slug: string
  blurb: string
  icon: LucideIcon
}

const SUBJECTS: readonly Subject[] = [
  {
    name: "Mathematics",
    slug: "mathematics",
    blurb: "From algebra to advanced calculus.",
    icon: Sigma,
  },
  {
    name: "Physics",
    slug: "physics",
    blurb: "Concepts, problems, and exam prep.",
    icon: Atom,
  },
  {
    name: "Programming",
    slug: "programming",
    blurb: "Code with guided, hands-on practice.",
    icon: CodeXml,
  },
  {
    name: "IELTS",
    slug: "ielts",
    blurb: "Band-focused speaking and writing.",
    icon: Languages,
  },
  {
    name: "Chemistry",
    slug: "chemistry",
    blurb: "Reactions, equations, and clarity.",
    icon: FlaskConical,
  },
  {
    name: "English",
    slug: "english",
    blurb: "Fluency, grammar, and confidence.",
    icon: BookOpen,
  },
]

type Stat = {
  value: string
  label: string
  detail: string
  icon: LucideIcon
}

const STATS: readonly Stat[] = [
  {
    value: "1,200+",
    label: "Verified Tutors",
    detail: "Profiles checked and approved",
    icon: BadgeCheck,
  },
  {
    value: "8,500+",
    label: "Active Students",
    detail: "Learning across Bangladesh",
    icon: Users,
  },
  {
    value: "40+",
    label: "Subjects Covered",
    detail: "Academic and skill-based",
    icon: BookOpen,
  },
  {
    value: "4.9/5",
    label: "Avg. Rating",
    detail: "From real session feedback",
    icon: Star,
  },
]

type Feedback = {
  quote: string
  name: string
  role: "student" | "tutor"
  location: string
}

const TESTIMONIALS: readonly Feedback[] = [
  {
    quote:
      "I found a physics tutor who actually explains the hard parts. My grades changed in one term.",
    name: "Ayesha Rahman",
    role: "student",
    location: "Dhaka",
  },
  {
    quote:
      "Posting a batch took minutes. Reviewing applicants and managing my schedule is simple now.",
    name: "Tanvir Ahmed",
    role: "tutor",
    location: "Chattogram",
  },
  {
    quote:
      "The IELTS mentorship batch gave me structure and honest feedback every single week.",
    name: "Sadia Islam",
    role: "student",
    location: "Sylhet",
  },
]

function BlockHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function SubjectsBlock() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <BlockHeading
          title="Popular Subject Categories"
          description="Pick a subject and find a tutor who fits your goals."
        />
        <Link href="/tuitions" className={SECONDARY_CTA_CLASS}>
          View all tuitions
        </Link>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map(({ name, slug, blurb, icon: Icon }) => (
          <li key={slug}>
            <Link
              href={`/tuitions?subject=${slug}`}
              className={cn(CARD_CLASS, "group")}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h4 className="mt-4 text-base font-semibold">{name}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Explore
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatsBlock() {
  return (
    <div className="border-t border-border/80 pt-12">
      <BlockHeading
        title="Verified Platform Statistics"
        description="A growing community of learners and trusted tutors."
      />

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ value, label, detail, icon: Icon }) => (
          <li key={label} className={CARD_CLASS}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

function TestimonialsBlock() {
  return (
    <div className="border-t border-border/80 pt-12">
      <BlockHeading
        title="What Students & Tutors Say"
        description="Short stories from the people learning and teaching here."
      />

      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((feedback) => (
          <li key={feedback.name} className={cn(CARD_CLASS, "gap-4")}>
            <Quote className="size-5 text-primary/60" aria-hidden="true" />
            <blockquote className="text-sm leading-relaxed text-foreground">
              “{feedback.quote}”
            </blockquote>

            <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
              <Initials name={feedback.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {feedback.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {feedback.role === "tutor" ? "Tutor" : "Student"} ·{" "}
                  {feedback.location}
                </p>
              </div>
              <div
                className="ml-auto flex shrink-0 gap-0.5"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className="size-3 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SubjectsStatsSection() {
  return (
    <section
      aria-labelledby="subjects-stats-heading"
      className="border-t border-border/80 bg-muted/30 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="subjects-stats-heading"
            className={cn("text-balance", SECTION_HEADING_CLASS)}
          >
            Top Subjects, Platform Statistics &amp; Testimonials
          </h2>
          <p className={cn("mt-4", SECTION_SUBHEADING_CLASS)}>
            Explore the subjects learners search for most, the community behind
            them, and the feedback that keeps us moving.
          </p>
        </div>

        <SubjectsBlock />
        <StatsBlock />
        <TestimonialsBlock />
      </div>
    </section>
  )
}

export default SubjectsStatsSection
