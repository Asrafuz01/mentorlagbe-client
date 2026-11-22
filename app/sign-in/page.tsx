import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

import { SignInForm } from "./sign-in-form"

export const metadata = {
  title: "Sign In | MentorLagbe",
  description: "Sign in to your MentorLagbe account.",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <SignInForm />
      </main>
      <Footer />
    </div>
  )
}
