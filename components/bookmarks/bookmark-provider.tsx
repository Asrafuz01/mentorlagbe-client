"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { fetchSavedTuitionIds } from "@/lib/bookmark-api"
import { API_BASE_URL } from "@/lib/api"
import { useAuthIdentity } from "@/lib/auth-identity"
import { getErrorMessage } from "@/lib/dashboard-api"
import { authenticatedFetch } from "@/lib/express-auth"

type BookmarkContextValue = {
  savedIds: ReadonlySet<string>
  isStudent: boolean
  loading: boolean
  isSaved: (tuitionId: string) => boolean
  toggle: (tuitionId: string) => Promise<boolean | null>
  refresh: () => Promise<void>
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

/**
 * One shared saved-tuition state so cards, detail pages, and the dashboard
 * always agree after a save or unsave. Non-students never load the list.
 */
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { identity, isPending } = useAuthIdentity()
  const email = identity?.email ?? ""
  const isStudent = identity?.role === "student"
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    if (isPending || !isStudent || !email) {
      setSavedIds(new Set())
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    void fetchSavedTuitionIds()
      .then((ids) => {
        if (active) setSavedIds(ids)
      })
      .catch(() => {
        // The list page surfaces load errors; button actions show their own.
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [email, isPending, isStudent])

  const refresh = useCallback(async () => {
    if (!isStudent || !email) {
      setSavedIds(new Set())
      return
    }
    setLoading(true)
    try {
      setSavedIds(await fetchSavedTuitionIds())
    } catch {
      toast.error("Could not refresh saved tuitions.")
    } finally {
      setLoading(false)
    }
  }, [email, isStudent])

  const isSaved = useCallback(
    (tuitionId: string) => savedIds.has(tuitionId),
    [savedIds]
  )

  const toggle = useCallback(
    async (tuitionId: string): Promise<boolean | null> => {
      if (!isStudent) {
        toast.error("Only students can save tuitions.")
        return null
      }

      const wasSaved = savedIds.has(tuitionId)
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/bookmarks${
            wasSaved ? `/${encodeURIComponent(tuitionId)}` : ""
          }`,
          {
            method: wasSaved ? "DELETE" : "POST",
            headers: wasSaved ? undefined : { "Content-Type": "application/json" },
            body: wasSaved ? undefined : JSON.stringify({ tuitionId }),
          }
        )
        const payload: unknown = await response.json().catch(() => null)
        if (!response.ok) {
          toast.error(getErrorMessage(payload, "Could not update saved tuitions."))
          return null
        }

        setSavedIds((current) => {
          const next = new Set(current)
          if (wasSaved) next.delete(tuitionId)
          else next.add(tuitionId)
          return next
        })
        toast.success(
          wasSaved
            ? "Removed from your saved tuitions."
            : "Saved to your tuition list."
        )
        return !wasSaved
      } catch {
        toast.error("Could not reach the server. Please try again.")
        return null
      }
    },
    [isStudent, savedIds]
  )

  return (
    <BookmarkContext.Provider
      value={{ savedIds, isStudent, loading, isSaved, toggle, refresh }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks(): BookmarkContextValue {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error("useBookmarks must be used inside BookmarkProvider")
  }
  return context
}
