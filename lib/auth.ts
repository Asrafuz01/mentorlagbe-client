import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db("mentorlagbedb")

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
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
