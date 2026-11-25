"use client"

import { useState } from "react"
import { Bookmark, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useBookmarks } from "./bookmark-provider"

export type BookmarkButtonProps = {
  tuitionId: string
  className?: string
}

/** Visible only to students; toast feedback comes from the shared provider. */
export function BookmarkButton({ tuitionId, className }: BookmarkButtonProps) {
  const { isStudent, isSaved, toggle } = useBookmarks()
  const [busy, setBusy] = useState(false)

  if (!isStudent) return null

  const saved = isSaved(tuitionId)
  const label = saved ? "Remove from saved tuitions" : "Save this tuition"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await toggle(tuitionId)
        } finally {
          setBusy(false)
        }
      }}
      className={cn(
        "size-9 shrink-0 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background",
        saved && "text-primary",
        className
      )}
    >
      {busy ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Bookmark
          className="size-4"
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
      )}
    </Button>
  )
}
