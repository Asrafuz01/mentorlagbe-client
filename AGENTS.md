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

- Auth: `lib/auth.ts` (user `role`/`plan` fields), `lib/auth-client.ts` (`inferAdditionalFields`), `app/api/auth/[...all]/route.ts`.
- Auth pages: `app/sign-up`, `app/sign-in` with shared UI in `components/auth/*`; `sonner` `<Toaster />` mounted in `app/layout.tsx`.
- UI: `components/brand.tsx`, `components/navbar/*`, `components/footer/*`, `components/home/*`, `components/shared/*`, `components/tuitions/*`, `components/payments/*`, `components/dashboard/*`.
- Tuitions: `lib/tuition-api.ts` (shared fetch/normalize), `/tuitions` with server search/filter/pagination, `/tuitions/[id]` with role-gated student application POST.
- Types: `types/index.ts` holds shared `User`, `Tuition`, `Application`, `Payment` interfaces and status unions.
- Home page: `app/page.tsx` wires Navbar + HeroSection + FeaturedTuitionsSection + HowItWorksSection + SubjectsStatsSection + PricingSection + Footer.
- Public pages: `/pricing` (interactive Stripe checkout via `components/payments/*`), `/about` (mission + reused HowItWorksSection), `/payment/success` (optional verify), `/payment/cancel`.
- Global UI: `app/loading.tsx` (accessible spinner/skeleton), `app/not-found.tsx` (404), `app/error.tsx` (client error boundary with `retry()`).
- API URLs: `lib/api.ts` exports shared `API_BASE_URL` for backend calls.
- Auth bridge: `lib/express-auth.ts` exchanges the BetterAuth session for a cached Express JWT, clears it on sign-out, and `authenticatedFetch` attaches it with one 401 retry across dashboard, application, checkout, and profile requests.
- Dashboard: `app/dashboard/layout.tsx` shell with session-safe guard (never redirects while `isPending`), collapsible sidebar + mobile drawer, role nav, `DashboardStatCard`; `/dashboard` role redirect; `/dashboard/profile` with ImgBB upload (`lib/imgbb.ts`) + auth/backend sync.
- ImgBB: `lib/imgbb.ts` `uploadImageToImgBB(file)` reuses `NEXT_PUBLIC_IMGBB_API_KEY` for profile and tutor tuition images.
- Role dashboards: `app/dashboard/student/*` (overview + applications), `app/dashboard/tutor/*` (overview, post/CRUD tuitions, applicants), `app/dashboard/admin/*` (overview, users, tuition approvals, transactions). Shared defensive fetch/mutations in `lib/dashboard-api.ts`, formats in `lib/dashboard-format.ts`, and reusable states/headers/badges/hook in `components/dashboard/*`.
