# MentorLagbe — Client

## Project Name & Purpose

**MentorLagbe** is a Smart Tuition & Mentorship Platform connecting **Students, Tutors, and Admins**. This repository contains the Next.js App Router client: public marketing pages, the tuition catalog, authentication, Stripe checkout entry points, and role-based dashboards.

The companion API lives in the `mentorlagbe-server` repository.

## Live Site & Repositories

- **Live site:** https://mentorlagbe-client-g8ov.vercel.app
- **Live API:** https://mentorlagbe-server-blush.vercel.app
- **Client repository:** https://github.com/Asrafuz01/mentorlagbe-client
- **Server repository:** https://github.com/Asrafuz01/mentorlagbe-server

## Admin Credentials (Demo / Local Only)

No real credentials, passwords, tokens, or API keys are committed to this repository.

| Field | Placeholder / local setup |
| --- | --- |
| Email | `admin@mentorlagbe.com` (demo identity created by the server seed) |
| Password | **Not committed.** Create/set one locally through BetterAuth. |
| Role | `admin` |

To set up local admin access:

1. Configure and start the server, then run `npm run seed` in `mentorlagbe-server`. This upserts the demo admin identity with `role: "admin"` but does **not** store a password.
2. Sign up your own demo admin from `/sign-up` using a local-only email such as `admin.demo@example.com` and a password you choose.
3. Promote that BetterAuth user record's `role` to `admin` in MongoDB. BetterAuth uses its default user collection (`user` in this setup); the Express API reads the `users` collection.
4. Request a JWT from the server via `POST /api/auth/jwt`. Protected Express routes accept it as `Authorization: Bearer <token>`, `x-auth-token`, or a `token` cookie.

Use placeholder values only. Never commit the demo password, `JWT_SECRET`, Stripe keys, Google OAuth secrets, or ImgBB key.

## Key Features

- **Role-based authentication** with BetterAuth sessions (`student` / `tutor` / `admin`) plus JWT issuance and verification in the Express API.
- **Public tuition catalog** with server-side search, subject/class-level/mode filtering, and pagination.
- **ImgBB image upload** reused by profile editing and tutor tuition forms, with a manual URL fallback.
- **Student dashboard:** overview, applications, saved tuitions (quick unsave + view details), application cancellation, and Pro upgrade entry points.
- **Bookmarks:** students can save tuitions from cards and detail pages; Free accounts get 5 slots, Pro accounts are unlimited.
- **Reviews & ratings:** accepted students submit a 1–5 star review with short feedback; average rating and review list are visible on tuition pages and cards.
- **Visible theme switch:** accessible light/dark button in the navbar (desktop and mobile) alongside the existing `T` hotkey.
- **Tutor dashboard:** overview, tuition CRUD, applicant review, and accept/reject actions.
- **Admin dashboard:** overview stats, user role management, tuition approvals, and Stripe transactions.
- **Stripe checkout** for `student-pro` and `tutor-pro` plans, with success/cancel pages and server-side verification.
- **Defensive API layer:** shared normalizers, loading/empty/error states, and tolerant response parsing.
- **Responsive UI** built with Tailwind CSS, Base UI/shadcn components, and reusable brand components.

## Key npm Packages

| Package | Purpose |
| --- | --- |
| `next`, `react`, `react-dom` | App Router framework and UI runtime |
| `better-auth`, `@better-auth/mongo-adapter`, `mongodb` | Email/password + Google auth and MongoDB persistence |
| `typescript`, `@types/*` | Static typing |
| `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css` | Styling and animations |
| `@base-ui/react`, `shadcn`, `class-variance-authority` | Accessible UI primitives and variants |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `next-themes` | Theme handling |
| `eslint`, `eslint-config-next`, `prettier` | Linting and formatting |

## Environment Variables (Names Only)

Create `.env.local` locally. Do **not** commit real values.

```bash
MONGODB_URI=<local-or-hosted-mongodb-uri>
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<local-random-secret>
GOOGLE_CLIENT_ID=<optional-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<optional-google-oauth-client-secret>
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=<local-imgbb-key>
```

`NEXT_PUBLIC_API_URL` is optional: local development defaults to `http://localhost:5000`, while production builds default to `https://mentorlagbe-server-blush.vercel.app`.

## Getting Started

```bash
npm install
# Create .env.local using the variable names above
npm run dev
```

Open `http://localhost:3000`.

Useful scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Related Project

- Server API: `mentorlagbe-server` — Express, MongoDB, JWT auth, Stripe payments, admin routes, and the demo seed script.

See the server README for backend setup and API details.
