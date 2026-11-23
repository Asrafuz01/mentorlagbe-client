import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { AUTH_PATHS } from "@/components/navbar/nav-config"

import { SignInForm } from "./sign-in-form"

export const metadata = {
  title: "Sign In | MentorLagbe",
  description: "Sign in to your MentorLagbe account.",
}

type SearchParamValue = string | string[] | undefined

type SignInPageProps = {
  searchParams: Promise<{ redirect?: SearchParamValue }>
}

/** Only allow same-origin relative paths after sign-in. */
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

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <SignInForm redirectTo={readRedirect(params.redirect)} />
      </main>
      <Footer />
    </div>
  )
}
