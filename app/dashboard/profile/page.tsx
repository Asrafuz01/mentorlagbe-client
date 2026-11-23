"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Camera,
  Crown,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import {
  DashboardSkeleton,
  toDashboardUser,
  type DashboardUser,
} from "@/components/dashboard"
import { getAvatarSrc } from "@/components/navbar/session-utils"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth-client"
import { authenticatedFetch, clearExpressToken } from "@/lib/express-auth"
import { uploadImageToImgBB } from "@/lib/imgbb"
import { cn } from "@/lib/utils"

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
const READONLY_CLASS =
  "h-10 w-full cursor-default rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground"
const LABEL_CLASS = "mb-1.5 block text-xs font-medium"

type ProfileForm = {
  name: string
  phone: string
  bio: string
  image: string
}

/** Mounted only once the session resolves, so form state can start from props. */
function ProfileFields({ user }: { user: DashboardUser }) {
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>({
    name: user.name,
    phone: user.phone,
    bio: user.bio,
    image: user.image ?? "",
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profileLoadFailed, setProfileLoadFailed] = useState(false)

  useEffect(() => {
    const objectUrl = previewRef.current
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadExtendedProfile() {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/users/me`,
          { cache: "no-store" }
        )
        if (!response.ok) {
          if (!cancelled) setProfileLoadFailed(true)
          return
        }

        const payload: unknown = await response.json().catch(() => null)
        if (cancelled) return
        if (!payload || typeof payload !== "object") {
          setProfileLoadFailed(true)
          return
        }
        setProfileLoadFailed(false)

        const record = payload as Record<string, unknown>
        setForm((current) => ({
          ...current,
          phone:
            typeof record.phone === "string" ? record.phone : current.phone,
          bio: typeof record.bio === "string" ? record.bio : current.bio,
          image:
            typeof record.image === "string" && record.image
              ? record.image
              : current.image,
        }))
      } catch {
        // Keep session values, but block saving extended fields to avoid data loss.
        if (!cancelled) setProfileLoadFailed(true)
      }
    }

    void loadExtendedProfile()
    return () => {
      cancelled = true
    }
  }, [])

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setPreviewUrl(null)
  }

  function update(field: keyof ProfileForm, value: string) {
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
      update("image", url)
      toast.success("Photo ready. Save your profile to keep it.")
    } catch (error) {
      clearPreview()
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload your photo. Please try again."
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || uploading) return
    if (profileLoadFailed) {
      toast.error(
        "Could not load your saved profile details. Refresh the page before saving."
      )
      return
    }

    const name = form.name.trim()
    if (!name) {
      toast.error("Your name is required.")
      return
    }

    const image = form.image.trim() || null
    setSubmitting(true)

    try {
      // Keep BetterAuth's session identity in sync when name/photo changed.
      const identityChanged =
        name !== user.name || image !== (user.image || null)
      if (identityChanged) {
        const { error: authError } = await authClient.updateUser({
          name,
          image,
        })
        if (authError) {
          throw new Error(authError.message || "Could not update your account.")
        }
        // The JWT carries the display name/image, so discard the stale copy.
        clearExpressToken()
      }

      // Extended profile fields live on the Express users collection.
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/users/profile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone: form.phone.trim(),
            bio: form.bio.trim(),
            image,
          }),
        }
      )

      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message: unknown }).message)
            : "Could not save your profile."
        throw new Error(message)
      }

      toast.success("Profile updated successfully.")
      clearPreview()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update your profile. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const avatarSrc = previewUrl ?? getAvatarSrc(form.image)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Update Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your contact details and public profile up to date.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
      >
        <section className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Profile Photo</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a photo so tutors and students can recognize you.
          </p>

          <div className="mt-6 flex flex-col items-center text-center">
            <span className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="Profile photo preview"
                  width={112}
                  height={112}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <UserRound
                  className="size-10 text-muted-foreground"
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
              htmlFor="avatar-file"
              className="mt-5 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Camera aria-hidden="true" />
              Upload Photo
            </label>
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading || submitting}
              className="sr-only"
            />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              PNG, JPG, or WEBP up to 5 MB.
            </p>
            {previewUrl || form.image ? (
              <button
                type="button"
                disabled={uploading || submitting}
                onClick={() => {
                  clearPreview()
                  update("image", "")
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
              >
                <RotateCcw aria-hidden="true" />
                Remove Photo
              </button>
            ) : null}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <label htmlFor="image-url" className={LABEL_CLASS}>
              Or paste a photo URL
            </label>
            <div className="relative">
              <ImagePlus
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="image-url"
                type="url"
                value={form.image}
                onChange={(event) => {
                  clearPreview()
                  update("image", event.target.value)
                }}
                placeholder="https://example.com/photo.jpg"
                disabled={uploading || submitting}
                className={cn(FIELD_CLASS, "pl-9")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Account details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Email, role, and plan are managed by your account administrator.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className={LABEL_CLASS}>
                Full Name
              </label>
              <input
                id="profile-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                autoComplete="name"
                disabled={submitting}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="profile-email" className={LABEL_CLASS}>
                Email{" "}
                <span className="font-normal text-muted-foreground">
                  (read only)
                </span>
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className={READONLY_CLASS}
              />
            </div>

            <div>
              <label htmlFor="profile-role" className={LABEL_CLASS}>
                Role{" "}
                <span className="font-normal text-muted-foreground">
                  (read only)
                </span>
              </label>
              <input
                id="profile-role"
                value={user.roleLabel}
                readOnly
                className={READONLY_CLASS}
              />
            </div>

            <div>
              <label htmlFor="profile-plan" className={LABEL_CLASS}>
                Plan{" "}
                <span className="font-normal text-muted-foreground">
                  (read only)
                </span>
              </label>
              <div className="relative">
                {user.plan !== "free" ? (
                  <Crown
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary"
                    aria-hidden="true"
                  />
                ) : null}
                <input
                  id="profile-plan"
                  value={user.planLabel}
                  readOnly
                  className={cn(READONLY_CLASS, user.plan !== "free" && "pl-9")}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-phone" className={LABEL_CLASS}>
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                disabled={submitting}
                className={FIELD_CLASS}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-bio" className={LABEL_CLASS}>
                Bio
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
                placeholder="Tell the community a little about yourself…"
                disabled={submitting}
                className={cn(FIELD_CLASS, "h-auto resize-y py-2")}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Changes are saved to your MentorLagbe account.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || uploading}
              className="h-10 shrink-0"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </section>
      </form>
    </div>
  )
}

export default function UpdateProfilePage() {
  const { data: session, isPending } = useSession()
  const user = toDashboardUser(session?.user)

  if (isPending || !user) return <DashboardSkeleton />
  return <ProfileFields user={user} />
}
