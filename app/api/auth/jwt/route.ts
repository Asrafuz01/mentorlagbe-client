import { NextResponse } from "next/server"

import { API_BASE_URL } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = new Headers({
      "Content-Type": request.headers.get("content-type") || "application/json",
    })
    const cookie = request.headers.get("cookie")
    if (cookie) headers.set("cookie", cookie)

    const response = await fetch(`${API_BASE_URL}/api/auth/jwt`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    })

    const text = await response.text()
    const contentType = response.headers.get("content-type") || "application/json"
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": contentType },
    })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the authentication service." },
      { status: 503 }
    )
  }
}
