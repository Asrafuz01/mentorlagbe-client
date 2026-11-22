"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, LoaderCircle, UserRound } from "lucide-react"
import { toast } from "sonner"

import { AuthCard, AuthField } from "@/components/auth/auth-card"
import {
  requiredField,
  validateEmail,
  validatePassword,
} from "@/components/auth/validation"
import { AUTH_PATHS } from "@/components/navbar/nav-config"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type Role = "student" | "tutor"

type FormErrors = {
  name?: string
  email?: string
  password?: string
}

const ROLE_OPTIONS: readonly {
  value: Role
  label: string
  description: string
  icon: typeof UserRound
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Find a tutor",
    icon: GraduationCap,
  },
  {
    value: "tutor",
    label: "Tutor",
    description: "Post tuitions",
    icon: UserRound,
  },
]

export type SignUpFormProps = {
  initialRole?: Role
}

export function SignUpForm({ initialRole = "student" }: SignUpFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>(initialRole)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors: FormErrors = {
      name: requiredField(name, "Full name") ?? undefined,
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
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        plan: "free",
      })

      if (result.error) {
        toast.error(result.error.message || "Could not create your account.")
        return
      }

      toast.success("Account created. Welcome to MentorLagbe!")
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

  return (
    <AuthCard
      title="Create your account"
      description="Join MentorLagbe to find a tutor, post a batch, or mentor learners."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={AUTH_PATHS.signIn}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={isSubmitting}
        />

        <fieldset disabled={isSubmitting}>
          <legend className="text-sm font-medium">I am a</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = role === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/60"
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthCard>
  )
}
