import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  type LucideIcon,
  MessageCircle,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react"

import { Brand } from "@/components/brand"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Shared tokens so later home sections match the hero's type and CTAs. */
export const SECTION_HEADING_CLASS =
  "text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl"
export const SECTION_SUBHEADING_CLASS =
  "text-base leading-relaxed text-muted-foreground sm:text-lg"
export const PRIMARY_CTA_CLASS = cn(
  buttonVariants({ variant: "default", size: "lg" }),
  "h-11 gap-2 px-5 text-sm sm:text-base"
)
export const SECONDARY_CTA_CLASS = cn(
  buttonVariants({ variant: "outline", size: "lg" }),
  "h-11 gap-2 px-5 text-sm sm:text-base"
)

function HeroEyebrow() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
      <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
      Online &amp; Offline Tuition
      <span className="text-border" aria-hidden="true">
        •
      </span>
      1-on-1 Mentorship
    </span>
  )
}

function HeroCopy() {
  return (
    <div className="flex flex-col items-start">
      <HeroEyebrow />

      <h1
        id="hero-heading"
        className={cn("mt-6 text-balance", SECTION_HEADING_CLASS)}
      >
        Find Your <span className="text-primary">Ideal Tutor</span> or
        Mentorship Batch Today
      </h1>

      <p className={cn("mt-5 max-w-xl", SECTION_SUBHEADING_CLASS)}>
        Learn from verified tutors in Dhaka and beyond — online or in person.
        Book focused 1-on-1 sessions or join a mentorship batch built around
        your goals.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Link href="/tuitions" className={PRIMARY_CTA_CLASS}>
          Browse Tuitions
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/sign-up?role=tutor" className={SECONDARY_CTA_CLASS}>
          Become a Tutor
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
        <li className="inline-flex items-center gap-1.5">
          <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
          Verified tutors
        </li>
        <li className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          Flexible schedules
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Star
            className="size-4 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          Loved by learners
        </li>
      </ul>
    </div>
  )
}

function InfoTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative w-full">
      <div
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-foreground/5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <span
              className="size-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Live now
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Physics — HSC Batch
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Verified tutor · Dhaka
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted p-3">
              <Video className="size-4 text-primary" aria-hidden="true" />
              <p className="mt-2 text-xs font-medium sm:text-sm">
                Online / Offline
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <CalendarDays
                className="size-4 text-primary"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-medium sm:text-sm">
                Flexible timing
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium">
              <Star
                className="size-4 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              4.9
              <span className="font-normal text-muted-foreground">
                (120+ reviews)
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              Details
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoTile
            icon={Users}
            title="1-on-1 focus"
            description="Personal attention"
          />
          <InfoTile
            icon={MessageCircle}
            title="Mentorship"
            description="Guided batches"
          />
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-linear-to-b from-muted/40 to-background"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <HeroCopy />
        <HeroVisual />
      </div>
    </section>
  )
}

export default HeroSection
