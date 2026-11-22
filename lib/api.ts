/** Base URL for the Express backend, shared by client and server callers. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")
