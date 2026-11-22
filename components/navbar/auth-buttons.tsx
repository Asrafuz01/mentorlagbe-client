import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AUTH_PATHS } from "./nav-config"

export type AuthButtonsProps = {
  stacked?: boolean
  onNavigate?: () => void
}

export function AuthButtons({ stacked = false, onNavigate }: AuthButtonsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        stacked && "flex-col items-stretch"
      )}
    >
      <Link
        href={AUTH_PATHS.signIn}
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          stacked && "w-full"
        )}
      >
        Sign In
      </Link>
      <Link
        href={AUTH_PATHS.signUp}
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          stacked && "w-full"
        )}
      >
        Sign Up
      </Link>
    </div>
  )
}
