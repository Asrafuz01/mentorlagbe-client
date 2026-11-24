/**
 * Base URL for the Express backend, shared by client and server callers.
 *
 * NEXT_PUBLIC_ values are inlined at build time, so Vercel must set this before
 * `next build`. The production fallback keeps the deployed app usable if the
 * variable is forgotten; local development still targets localhost:5000.
 */
const PRODUCTION_API_URL = "https://mentorlagbe-server-blush.vercel.app"
const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? PRODUCTION_API_URL
    : "http://localhost:5000"

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "")
