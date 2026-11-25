"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Crown,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  TriangleExclamationPoint,
} from "lucide-react"
import { toast } from "sonner"

import {
  DashboardPageHeader,
  DashboardSkeleton,
  getAvatarSrc,
  isOwnRecord,
  normalizeOwnTuition,
  sendMutation,
  useDashboardCollection,
  useDashboardIdentity,
  type DashboardUser,
} from "@/components/dashboard"
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/components/tuitions"
import { Button } from "@/components/ui/button"
import { uploadImageToImgBB } from "@/lib/imgbb"
import { cn } from "@/lib/utils"
import type { Tuition } from "@/types"

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
const LABEL_CLASS = "mb-1.5 block text-xs font-medium"

type TuitionForm = {
  title: string
  subject: string
  classLevel: string
  mode: "Online" | "Offline"
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
  bannerImage: string
}

const INITIAL_FORM: TuitionForm = {
  title: "",
  subject: SUBJECT_OPTIONS[0],
  classLevel: CLASS_LEVEL_OPTIONS[0],
  mode: "Online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  description: "",
  bannerImage: "",
}

export default function PostTuitionPage() {
  const { user } = useDashboardIdentity()
  return user ? <PostTuitionForm user={user} /> : <DashboardSkeleton />
}

function PostTuitionForm({
  user,
}: {
  user: DashboardUser
}) {
  const router = useRouter()
  const [form, setForm] = useState<TuitionForm>(INITIAL_FORM)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const tuitions = useDashboardCollection<Tuition>(
    "/api/tuitions?mine=true&limit=50",
    normalizeOwnTuition
  )
  const isPro = user.plan !== "free"
  const tuitionCount = tuitions.items.filter((item) =>
    isOwnRecord(item, user, "tutor")
  ).length
  const atFreeLimit = !isPro && !tuitions.loading && tuitionCount >= 2

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setPreviewUrl(null)
  }

  function update<K extends keyof TuitionForm>(
    field: K,
    value: TuitionForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || uploading || submitting) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 5 MB.")
      return
    }

    clearPreview()
    const objectUrl = URL.createObjectURL(file)
    previewRef.current = objectUrl
    setPreviewUrl(objectUrl)
    setUploading(true)
    try {
      const url = await uploadImageToImgBB(file)
      update("bannerImage", url)
      toast.success("Image ready. Submit your tuition to save it.")
    } catch (error) {
      clearPreview()
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload your image. Please try again."
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || uploading || atFreeLimit) return

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      toast.error("Title, location, and description are required.")
      return
    }
    if (Number(form.monthlyFee) <= 0 || Number(form.daysPerWeek) <= 0) {
      toast.error("Enter a valid monthly fee and number of days per week.")
      return
    }

    setSubmitting(true)
    try {
      await sendMutation("/api/tuitions", "POST", {
        title: form.title.trim(),
        subject: form.subject,
        classLevel: form.classLevel,
        mode: form.mode,
        location: form.location.trim(),
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
        description: form.description.trim(),
        bannerImage: form.bannerImage.trim(),
        approvalStatus: "pending",
        isActive: true,
        tutorId: user.id,
        tutorName: user.name,
        tutorEmail: user.email,
      })
      toast.success("Tuition submitted for admin approval.")
      router.push("/dashboard/tutor/my-tuitions")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not publish the tuition."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const bannerSrc = previewUrl ?? getAvatarSrc(form.bannerImage)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Post a Tuition"
        description="Describe your class and submit it for admin approval."
        actions={
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="text-sm font-medium text-primary hover:underline"
          >
            View my tuitions
          </Link>
        }
      />

      {atFreeLimit ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <TriangleExclamationPoint
              className="mt-0.5 size-5 shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">Free plan limit reached</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Free tutors can publish up to 2 tuitions. Upgrade to Pro for
                unlimited listings.
              </p>
            </div>
          </div>
          <Link
            href="/pricing?plan=tutor-pro"
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            )}
          >
            <Crown aria-hidden="true" />
            Upgrade to Pro
          </Link>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Tuition details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="tuition-title" className={LABEL_CLASS}>
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="tuition-title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. HSC Physics — Mechanics Bootcamp"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="tuition-subject" className={LABEL_CLASS}>
                Subject
              </label>
              <select
                id="tuition-subject"
                value={form.subject}
                onChange={(event) => update("subject", event.target.value)}
                className={FIELD_CLASS}
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tuition-class" className={LABEL_CLASS}>
                Class Level
              </label>
              <select
                id="tuition-class"
                value={form.classLevel}
                onChange={(event) => update("classLevel", event.target.value)}
                className={FIELD_CLASS}
              >
                {CLASS_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tuition-mode" className={LABEL_CLASS}>
                Mode
              </label>
              <select
                id="tuition-mode"
                value={form.mode}
                onChange={(event) =>
                  update("mode", event.target.value as TuitionForm["mode"])
                }
                className={FIELD_CLASS}
              >
                {MODE_OPTIONS.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tuition-location" className={LABEL_CLASS}>
                Location <span className="text-destructive">*</span>
              </label>
              <input
                id="tuition-location"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder="Dhaka or 'Online'"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="tuition-fee" className={LABEL_CLASS}>
                Monthly Fee (৳) <span className="text-destructive">*</span>
              </label>
              <input
                id="tuition-fee"
                type="number"
                min="0"
                value={form.monthlyFee}
                onChange={(event) => update("monthlyFee", event.target.value)}
                placeholder="3000"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="tuition-days" className={LABEL_CLASS}>
                Days / Week <span className="text-destructive">*</span>
              </label>
              <input
                id="tuition-days"
                type="number"
                min="1"
                max="7"
                value={form.daysPerWeek}
                onChange={(event) => update("daysPerWeek", event.target.value)}
                placeholder="2"
                className={FIELD_CLASS}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tuition-description" className={LABEL_CLASS}>
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="tuition-description"
                rows={6}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What will students learn? Share your teaching approach and schedule…"
                className={cn(FIELD_CLASS, "h-auto resize-y py-2")}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              New listings are reviewed by an admin before going live.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || uploading || atFreeLimit}
              className="shrink-0"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Publishing…
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Tuition Image</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a clear image that shows what your class is about.
          </p>
          <div className="mt-5 flex flex-col items-center text-center">
            <span className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-xl bg-muted ring-1 ring-border">
              {bannerSrc ? (
                <Image
                  src={bannerSrc}
                  alt="Tuition image preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ImagePlus
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              {uploading ? (
                <span className="absolute inset-0 grid place-items-center bg-black/45">
                  <LoaderCircle
                    className="size-6 animate-spin text-white"
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </span>
            <label
              htmlFor="tuition-banner"
              className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Camera aria-hidden="true" />
              Upload Image
            </label>
            <input
              id="tuition-banner"
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading || submitting}
              className="sr-only"
            />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              PNG, JPG, or WEBP up to 5 MB.
            </p>
            {form.bannerImage ? (
              <button
                type="button"
                onClick={() => {
                  clearPreview()
                  update("bannerImage", "")
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
              >
                <RotateCcw aria-hidden="true" />
                Remove Image
              </button>
            ) : null}
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <label htmlFor="tuition-banner-url" className={LABEL_CLASS}>
              Or paste an image URL
            </label>
            <input
              id="tuition-banner-url"
              type="url"
              value={form.bannerImage}
              onChange={(event) => {
                clearPreview()
                update("bannerImage", event.target.value)
              }}
              placeholder="https://example.com/banner.jpg"
              disabled={uploading || submitting}
              className={FIELD_CLASS}
            />
          </div>
        </aside>
      </form>
    </div>
  )
}
