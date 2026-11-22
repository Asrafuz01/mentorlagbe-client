import { Footer } from "@/components/footer"
import {
  HeroSection,
  HowItWorksSection,
  SubjectsStatsSection,
} from "@/components/home"
import { Navbar } from "@/components/navbar"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <SubjectsStatsSection />
      </main>
      <Footer />
    </div>
  )
}
