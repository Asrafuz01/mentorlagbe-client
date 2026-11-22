"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { AuthCard, AuthField } from "@/components/auth/auth-card"
import { validateEmail, validatePassword } from "@/components/auth/validation"
import { AUTH_PATHS } from "@/components/navbar/nav-config"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

type FormErrors = {
  email?: string
  password?: string
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 12.24c0-.72-.06-1.25-.18-1.8H12v3.32h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.89-1.74 2.74-4.3 2.74-7.04Z"
      />
      <path
        fill="currentColor"
        opacity=".85"
        d="M12 21.5c2.7 0 4.96-.9 6.61-2.42l-3.22-2.5c-.89.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.1v2.58A9.75 9.75 0 0 0 12 21.5Z"
      />
      <path
        fill="currentColor"
        opacity=".7"
        d="M6.41 13.41a5.85 5.85 0 0 1 0-3.72V7.11H3.1a9.75 9.75 0 0 0 0 8.78l3.31-2.48Z"
      />
      <path
        fill="currentColor"
        opacity=".55"
        d="M12 6.47c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.4 9.4 0 0 0 12 2.5a9.75 9.75 0 0 0-8.9 4.61l3.31 2.58C7.2 8.33 9.4 6.47 12 6.47Z"
      />
    </svg>
  )
}

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors: FormErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please fix the highlighted fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      })

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password.")
        return
      }

      toast.success("Welcome back to MentorLagbe!")
      router.replace(AUTH_PATHS.dashboard)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isRedirecting || isSubmitting) return
    setIsRedirecting(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: AUTH_PATHS.dashboard,
      })

      if (result.error) {
        toast.error(result.error.message || "Could not start Google sign-in.")
        setIsRedirecting(false)
        return
      }

      toast.success("Redirecting to Google…")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start Google sign-in."
      )
      setIsRedirecting(false)
    }
  }

  const isBusy = isSubmitting || isRedirecting

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue to your MentorLagbe dashboard."
      footer={
        <>
          New here?{" "}
          <Link
            href={AUTH_PATHS.signUp}
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={isBusy}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={isBusy}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isBusy}
          className="h-11 w-full"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isBusy}
        className="h-11 w-full"
      >
        {isRedirecting ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>
    </AuthCard>
  )
}
