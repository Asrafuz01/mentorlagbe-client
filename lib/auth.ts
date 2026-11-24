import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db(process.env.DB_NAME || "mentorlagbedb")

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}

/**
 * Prefer the explicit, server-only frontend origin. On Vercel, VERCEL_URL is
 * always the active deployment, so it must outrank a build-time public URL that
 * may still point at an old deployment.
 */
function resolveAuthBaseURL(): string | undefined {
  if (process.env.BETTER_AUTH_URL?.trim()) return process.env.BETTER_AUTH_URL.trim()
  if (process.env.VERCEL_URL?.trim()) {
    const host = process.env.VERCEL_URL.trim()
    return host.startsWith("http") ? host : `https://${host}`
  }
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || undefined
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: resolveAuthBaseURL(),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: true,
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
})
