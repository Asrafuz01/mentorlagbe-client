import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

import { SignUpForm } from "./sign-up-form"

export const metadata = {
  title: "Sign Up | MentorLagbe",
  description: "Create a student or tutor account on MentorLagbe.",
}

type SignUpPageProps = {
  searchParams: Promise<{ role?: string | string[] }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role
  const initialRole = roleParam === "tutor" ? "tutor" : "student"

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <SignUpForm initialRole={initialRole} />
      </main>
      <Footer />
    </div>
  )
}
