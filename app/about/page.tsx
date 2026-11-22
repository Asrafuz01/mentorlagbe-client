import { Globe, HeartHandshake, Sparkles } from "lucide-react"

import { Footer } from "@/components/footer"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "About & How It Works | MentorLagbe",
  description:
    "Learn how MentorLagbe connects students and tutors through smart tuition and mentorship.",
}

const PILLARS: readonly {
  icon: typeof Globe
  title: string
  description: string
}[] = [
  {
    icon: Globe,
    title: "Built for Bangladesh, open to the world",
    description:
      "Local tutors in Dhaka and beyond, with online sessions that work anywhere.",
  },
  {
    icon: HeartHandshake,
    title: "Mentorship, not just lessons",
    description:
      "Small batches and 1-on-1 guidance built around each learner's goals.",
  },
  {
    icon: Sparkles,
    title: "Simple by design",
    description:
      "Find a tutor, apply, and manage everything from one clean workspace.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-linear-to-b from-muted/50 to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                About MentorLagbe
              </span>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Smart Tuition &amp; Mentorship,{" "}
                <span className="text-primary">Made Simple</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                MentorLagbe is a modern tuition and mentorship platform from
                Bangladesh, connecting students with verified tutors across the
                country and worldwide. Whether you need focused 1-on-1 classes
                or a guided mentorship batch, we make the whole journey clear,
                flexible, and human.
              </p>
            </div>

            <ul className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-3">
              {PILLARS.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold">{title}</h2>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed text-muted-foreground"
                    )}
                  >
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}
