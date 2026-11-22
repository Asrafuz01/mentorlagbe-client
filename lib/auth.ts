import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db("mentorlagbedb")

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

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  user: {
    additionalFields: {
      role: {
        type: ["student", "tutor", "admin"],
        defaultValue: "student",
      },
      plan: {
        type: ["free", "student-pro", "tutor-pro"],
        defaultValue: "free",
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
})
