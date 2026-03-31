// src/pages/api/auth/session.ts
import { getSession } from "next-auth/react"

export default async function handler(req, Request, res) {
  const session = await getSession()
  
  if (!session || !session.user) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  
  return res.status(200).json({
    user: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    }
  })
}
