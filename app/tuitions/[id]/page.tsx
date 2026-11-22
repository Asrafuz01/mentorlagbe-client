import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Clock,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  UserRound,
  Video,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ApplyPanel } from "@/components/tuitions"
import { getTuitionById } from "@/lib/tuition-api"

export const metadata = {
  title: "Tuition Details | MentorLagbe",
  description: "Explore tuition details and apply as a student.",
}

type TuitionDetailsPageProps = {
  params: Promise<{ id: string }>
}

function NotFoundState() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-16">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tuition not found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This tuition may have been removed, is no longer active, or the
            server is temporarily unavailable. Browse the directory to find
            other options.
          </p>
          <Link
            href="/tuitions"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Back to Tuitions
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default async function TuitionDetailsPage({
  params,
}: TuitionDetailsPageProps) {
  const { id } = await params
  const tuition = await getTuitionById(id)

  if (!tuition) return <NotFoundState />

  const hasBanner = tuition.bannerImage.trim().length > 0

  const details = [
    {
      icon: GraduationCap,
      label: "Class Level",
      value: tuition.classLevel,
    },
    { icon: Video, label: "Mode", value: tuition.mode },
    { icon: MapPin, label: "Location", value: tuition.location },
    {
      icon: CalendarDays,
      label: "Days / Week",
      value: String(tuition.daysPerWeek),
    },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1 border-t border-border/80 bg-muted/20 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to all tuitions
          </Link>

          <div className="relative mt-6 h-56 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/15 via-muted to-primary/5 sm:h-72 lg:h-80">
            {hasBanner ? (
              <Image
                src={tuition.bannerImage}
                alt={`${tuition.title} banner`}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-primary/40">
                <ImageIcon className="size-10" aria-hidden="true" />
                <span className="text-xs">No banner image</span>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {tuition.subject}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {tuition.mode}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {tuition.title}
              </h1>

              <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold">About this tuition</h2>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {tuition.description}
                </p>

                <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                  {details.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold">Meet your tutor</h2>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{tuition.tutorName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {tuition.tutorEmail || "Email available on request"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  Monthly Fee
                </p>
                <p className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-primary">
                  <Banknote className="size-6" aria-hidden="true" />৳
                  {tuition.monthlyFee.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {tuition.daysPerWeek} day
                  {tuition.daysPerWeek === 1 ? "" : "s"} per week
                </p>
              </div>

              <ApplyPanel
                tuitionId={tuition._id}
                tuitionTitle={tuition.title}
              />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
