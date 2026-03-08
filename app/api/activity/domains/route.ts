import { NextRequest, NextResponse } from "next/server"
import {
  getDomainLists,
  addAllowed,
  removeAllowed,
  addBlocked,
  removeBlocked,
} from "@/lib/demo-domain-lists"

export async function GET() {
  const lists = getDomainLists()
  return NextResponse.json(lists)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.addAllowed && Array.isArray(body.addAllowed)) {
      body.addAllowed.forEach((d: string) => addAllowed(d))
    }
    if (body.removeAllowed && Array.isArray(body.removeAllowed)) {
      body.removeAllowed.forEach((d: string) => removeAllowed(d))
    }
    if (body.addBlocked && Array.isArray(body.addBlocked)) {
      body.addBlocked.forEach((d: string) => addBlocked(d))
    }
    if (body.removeBlocked && Array.isArray(body.removeBlocked)) {
      body.removeBlocked.forEach((d: string) => removeBlocked(d))
    }
    const lists = getDomainLists()
    return NextResponse.json(lists)
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
