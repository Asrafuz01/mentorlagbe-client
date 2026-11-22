<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MentorLagbe conventions

- Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn Base UI, BetterAuth; Express + MongoDB backend.
- Roles: `student` | `tutor` | `admin`. Collections: `users`, `tuitions`, `applications`, `payments`.
- Keep components modular, responsive, and cleanly typed. Reuse `components/brand.tsx` for all branding.
- Do not run full `tsc` checks unless explicitly asked.
- Briefly update this file after major milestones.
- After every completed feature/step, create a clean, meaningful Git commit (use conventional prefixes such as `feat:`, `fix:`, `chore:`) so the client repo builds toward 20+ meaningful commits.

## Completed

- Auth: `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`.
- UI: `components/brand.tsx`, `components/navbar/*`, `components/footer/*`, `components/home/*`.
- Home page: `app/page.tsx` wires Navbar + HeroSection + HowItWorksSection + SubjectsStatsSection + Footer.
