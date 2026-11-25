import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function StarRating({
  value,
  size = "sm",
}: {
  value: number
  size?: "sm" | "md"
}) {
  const rating = Math.round(Number(value) || 0)

  return (
    <span
      role="img"
      aria-label={`${(Number(value) || 0).toFixed(1)} out of 5 stars`}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
