import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { Brand } from "@/components/brand"
import { NAV_ITEMS } from "@/components/navbar/nav-config"
import { cn } from "@/lib/utils"

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: "hello@mentorlagbe.com",
    href: "mailto:hello@mentorlagbe.com",
  },
  {
    icon: Phone,
    label: "+880 1712-345678",
    href: "tel:+8801712345678",
  },
  {
    icon: MapPin,
    label: "Dhaka, Bangladesh",
    href: null,
  },
] as const

type SocialName = "x" | "linkedin" | "github"

const SOCIAL_LINKS: readonly {
  name: SocialName
  label: string
  href: string
}[] = [
  { name: "x", label: "MentorLagbe on X", href: "https://x.com/mentorlagbe" },
  {
    name: "linkedin",
    label: "MentorLagbe on LinkedIn",
    href: "https://www.linkedin.com/company/mentorlagbe",
  },
  {
    name: "github",
    label: "MentorLagbe on GitHub",
    href: "https://github.com/mentorlagbe",
  },
]

/** Local SVG marks keep the footer dependency-free; X uses the new logo. */
function SocialIcon({ name }: { name: SocialName }) {
  const paths: Record<SocialName, string> = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    linkedin:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    github:
      "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}

export type FooterProps = {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn("border-t border-border/80 bg-background", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <Brand />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              MentorLagbe connects students with trusted tutors for focused,
              affordable learning — anywhere in Bangladesh.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Quick links</h2>
            <ul className="mt-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="mt-4 space-y-2.5">
              {CONTACT_ITEMS.map(({ icon: Icon, label, href }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {href ? (
                    <a
                      href={href}
                      className="transition-colors outline-none hover:text-foreground focus-visible:underline"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} MentorLagbe. All rights reserved.
          </p>

          <ul className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ name, label, href }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SocialIcon name={name} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
