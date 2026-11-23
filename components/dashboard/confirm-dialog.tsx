"use client"

import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { LoaderCircle, TriangleExclamationPoint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  const loadingRef = useRef(loading)

  useEffect(() => {
    onCancelRef.current = onCancel
    loadingRef.current = loading
  }, [onCancel, loading])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusFrame = requestAnimationFrame(() => cancelRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingRef.current) {
        event.preventDefault()
        onCancelRef.current()
        return
      }
      if (event.key !== "Tab" || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onCancel}
        disabled={loading}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative my-auto w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 text-left shadow-2xl max-h-[calc(100vh-2rem)] sm:p-6"
      >
        <div className="flex gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              destructive
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}
            aria-hidden="true"
          >
            <TriangleExclamationPoint className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "w-full sm:w-auto",
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
