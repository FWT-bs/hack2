import { NextRequest, NextResponse } from "next/server"
import { setFocusState } from "@/lib/demo-activity-store"
import { classifyDomain } from "@/lib/demo-domain-lists"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const domain = typeof body.domain === "string" ? body.domain : ""
    if (!domain) {
      return NextResponse.json({ error: "Missing domain" }, { status: 400 })
    }

    const status = classifyDomain(domain)
    let focusState = "on-task"
    if (status === "blocked") focusState = "locked"
    else if (status === "unlisted") focusState = "warning"

    setFocusState(focusState)
    return NextResponse.json({ status, focusState })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
