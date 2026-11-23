import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { AUTH_PATHS } from "@/components/navbar/nav-config"

import { SignUpForm } from "./sign-up-form"

export const metadata = {
  title: "Sign Up | MentorLagbe",
  description: "Create a student or tutor account on MentorLagbe.",
}

type SearchParamValue = string | string[] | undefined

type SignUpPageProps = {
  searchParams: Promise<{ role?: SearchParamValue; redirect?: SearchParamValue }>
}

/** Only allow same-origin relative paths after sign-up. */
function readRedirect(value: SearchParamValue): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\")
  ) {
    return AUTH_PATHS.dashboard
  }
  return raw
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role
  const initialRole = roleParam === "tutor" ? "tutor" : "student"
  const redirectTo = readRedirect(params.redirect)

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <SignUpForm initialRole={initialRole} redirectTo={redirectTo} />
      </main>
      <Footer />
    </div>
  )
}
