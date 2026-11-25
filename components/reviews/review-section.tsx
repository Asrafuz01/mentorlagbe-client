"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { LoaderCircle, MessageSquareText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { useAuthIdentity } from "@/lib/auth-identity"
import { formatDate } from "@/lib/dashboard-format"
import { authenticatedFetch } from "@/lib/express-auth"
import { asString } from "@/lib/tuition-api"
import { cn } from "@/lib/utils"
import type { Review } from "@/types"

import { StarRating } from "./star-rating"

const FIELD_CLASS =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"

export type ReviewSectionProps = {
  tuitionId: string
  initialAverageRating?: number
  initialReviewCount?: number
}

function normalizeReview(value: unknown): Review | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const id = asString(raw._id) || asString(raw.id)
  if (!id) return null

  return {
    _id: id,
    tuitionId: asString(raw.tuitionId),
    studentId: asString(raw.studentId),
    studentName: asString(raw.studentName, "Student"),
    studentEmail: asString(raw.studentEmail),
    rating: Number(raw.rating) || 0,
    comment: asString(raw.comment),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt) || undefined,
  }
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  const record = payload as Record<string, unknown>
  return asString(record.message) || asString(record.error) || fallback
}

function readArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return []
  const record = payload as Record<string, unknown>
  for (const key of ["reviews", "data", "items"] as const) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  return []
}

export function ReviewSection({
  tuitionId,
  initialAverageRating = 0,
  initialReviewCount = 0,
}: ReviewSectionProps) {
  const { identity, isPending } = useAuthIdentity()
  const isStudent = identity?.role === "student"

  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    averageRating: initialAverageRating,
    reviewCount: initialReviewCount,
  })
  const [loading, setLoading] = useState(true)
  const [mine, setMine] = useState<{
    eligible: boolean
    review: Review | null
  } | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews?tuitionId=${encodeURIComponent(tuitionId)}`,
        { cache: "no-store" }
      )
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(readErrorMessage(payload, "Could not load reviews."))
      }
      const record =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : {}
      setReviews(
        readArray(payload)
          .map(normalizeReview)
          .filter((item): item is Review => item !== null)
      )
      setStats({
        averageRating: Number(record.averageRating) || 0,
        reviewCount: Number(record.reviewCount) || 0,
      })
    } catch {
      // The tuition's cached rating from the server remains visible.
    } finally {
      setLoading(false)
    }
  }, [tuitionId])

  const loadMine = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/reviews/mine?tuitionId=${encodeURIComponent(tuitionId)}`,
        { cache: "no-store" }
      )
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) return
      const record = (payload ?? {}) as Record<string, unknown>
      const review = normalizeReview(record.review)
      setMine({ eligible: Boolean(record.eligible), review })
      if (review) {
        setRating(review.rating)
        setComment(review.comment)
      }
    } catch {
      setMine(null)
    }
  }, [tuitionId])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  useEffect(() => {
    if (isPending || !isStudent) {
      setMine(null)
      return
    }
    void loadMine()
  }, [isPending, isStudent, loadMine])

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating < 1) {
      toast.error("Choose a star rating first.")
      return
    }

    setSaving(true)
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tuitionId, rating, comment }),
      })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        toast.error(readErrorMessage(payload, "Could not save your review."))
        return
      }
      toast.success(mine?.review ? "Review updated." : "Thanks for your review!")
      await Promise.all([loadReviews(), loadMine()])
    } catch {
      toast.error("Could not reach the server. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function removeReview() {
    if (!mine?.review) return
    setDeleting(true)
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/reviews/${encodeURIComponent(mine.review._id)}`,
        { method: "DELETE" }
      )
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        toast.error(readErrorMessage(payload, "Could not remove your review."))
        return
      }
      toast.success("Your review was removed.")
      setRating(0)
      setComment("")
      await Promise.all([loadReviews(), loadMine()])
    } catch {
      toast.error("Could not reach the server. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Student reviews</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Feedback from students whose applications were accepted.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5">
          <StarRating value={stats.averageRating} size="md" />
          <span className="text-sm font-semibold">
            {stats.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({stats.reviewCount})
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Loading reviews…
          </p>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No reviews yet. Accepted students can be the first to share feedback.
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review._id}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(review.studentName || "S").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{review.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              )}
            </article>
          ))
        )}
      </div>

      {!isPending && isStudent && (
        <div className="mt-6 border-t border-border pt-5">
          {mine === null ? (
            <p className="text-sm text-muted-foreground">
              Checking your review eligibility…
            </p>
          ) : !mine.eligible && !mine.review ? (
            <p className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
              <MessageSquareText
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              Only students with an accepted application can review this tuition.
            </p>
          ) : (
            <form onSubmit={submitReview}>
              <h3 className="text-sm font-semibold">
                {mine.review ? "Update your review" : "Rate this tuition"}
              </h3>

              <div
                className="mt-3 flex items-center gap-1"
                role="group"
                aria-label="Star rating"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={cn(
                        "size-6 transition-colors",
                        value <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/50"
                      )}
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.9 5.9 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3 1.2-6.5L2.5 9.3l6.6-.9L12 2.5z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {rating > 0 ? `${rating} / 5` : "Select 1–5 stars"}
                </span>
              </div>

              <label htmlFor="review-comment" className="sr-only">
                Your feedback
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="What was helpful? (optional)"
                className={cn(FIELD_CLASS, "mt-3 resize-y")}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || rating < 1}>
                  {saving && (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {mine.review ? "Update review" : "Submit review"}
                </Button>
                {mine.review && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting || saving}
                    onClick={removeReview}
                  >
                    {deleting ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                    Remove
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  )
}
