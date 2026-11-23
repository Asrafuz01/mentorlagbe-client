import Image from "next/image"
import Link from "next/link"
import {
  Banknote,
  CalendarDays,
  Clock,
  GraduationCap,
  Image as ImageIcon,
  type LucideIcon,
  MapPin,
  UserRound,
  Video,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Tuition } from "@/types"

const VIEW_DETAILS_CLASS = cn(
  buttonVariants({ variant: "default", size: "lg" }),
  "h-10 w-full justify-center gap-2 px-4 text-sm"
)

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium" title={value}>
        {value || "—"}
      </dd>
    </div>
  )
}

export type TuitionCardProps = {
  tuition: Tuition
  className?: string
}

export function TuitionCard({ tuition, className }: TuitionCardProps) {
  const hasBanner =
    typeof tuition.bannerImage === "string" &&
    tuition.bannerImage.trim().length > 0

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative h-40 w-full overflow-hidden bg-linear-to-br from-primary/15 via-muted to-primary/5 sm:h-44">
        {hasBanner ? (
          <Image
            src={tuition.bannerImage}
            alt={`${tuition.title} banner`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/40">
            <ImageIcon className="size-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-3 left-3 max-w-[calc(100%-7rem)] truncate rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {tuition.subject}
        </span>
        <span className="absolute top-3 right-3 inline-flex max-w-[6rem] items-center gap-1 truncate rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <Video className="size-3" aria-hidden="true" />
          {tuition.mode}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className="line-clamp-2 text-base leading-snug font-semibold"
          title={tuition.title}
        >
          {tuition.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {tuition.description}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-4">
          <Detail
            icon={GraduationCap}
            label="Class Level"
            value={tuition.classLevel}
          />
          <Detail icon={CalendarDays} label="Mode" value={tuition.mode} />
          <Detail icon={MapPin} label="Location" value={tuition.location} />
          <Detail
            icon={Clock}
            label="Days / Week"
            value={String(tuition.daysPerWeek)}
          />
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <UserRound
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="truncate" title={tuition.tutorName}>
              {tuition.tutorName}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
            <Banknote className="size-4" aria-hidden="true" />৳
            {tuition.monthlyFee.toLocaleString()}
            <span className="font-normal text-muted-foreground">/mo</span>
          </span>
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={`/tuitions/${tuition._id}`}
            className={VIEW_DETAILS_CLASS}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}

export default TuitionCard
