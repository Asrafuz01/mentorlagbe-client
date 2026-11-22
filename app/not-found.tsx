import Link from "next/link"
import { Compass, House } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-14 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-semibold tracking-widest text-primary uppercase">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Page not found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The page you are looking for has moved, never existed, or is
            temporarily unavailable. Let&apos;s get you back on track.
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11")}
          >
            <House aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
