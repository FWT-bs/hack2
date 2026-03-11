import { NextRequest, NextResponse } from "next/server"
import {
  getDomainLists,
  addAllowed,
  removeAllowed,
  addBlocked,
  removeBlocked,
} from "@/lib/demo-domain-lists"
import { createClient } from "@/lib/supabase/server"
import { mergeRules } from "@/lib/rules"

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("room_id") ?? null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const [userRulesRes, roomRulesRes] = await Promise.all([
      supabase.from("user_rules").select("personal_allowed_domains, personal_blocked_domains").eq("user_id", user.id).maybeSingle(),
      roomId ? supabase.from("room_rules").select("allowed_domains, blocked_domains").eq("room_id", roomId).maybeSingle() : { data: null },
    ])
    const { allowed, blocked } = mergeRules(roomRulesRes.data, userRulesRes.data)
    return NextResponse.json({ allowed, blocked })
  }

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
