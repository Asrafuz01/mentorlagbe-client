import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

// Keep browser auth requests on the current deployment origin. A build-time
// NEXT_PUBLIC_BETTER_AUTH_URL can point at an old Vercel deployment (or a
// different domain), which breaks cookies and token exchange after redeploys.
// BetterAuth falls back to window.location.origin when no baseURL is supplied.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = authClient
