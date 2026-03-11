import { NextRequest, NextResponse } from "next/server"
import { setFocusState } from "@/lib/demo-activity-store"
import { classifyDomain } from "@/lib/demo-domain-lists"
import { createClient } from "@/lib/supabase/server"
import { mergeRules, classifyFromLists } from "@/lib/rules"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const domain = typeof body.domain === "string" ? body.domain : ""
    if (!domain) {
      return NextResponse.json({ error: "Missing domain" }, { status: 400 })
    }
    const roomId = typeof body.room_id === "string" ? body.room_id : null

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let status: "allowed" | "blocked" | "unlisted"
    if (user && roomId) {
      const [userRulesRes, roomRulesRes] = await Promise.all([
        supabase.from("user_rules").select("personal_allowed_domains, personal_blocked_domains").eq("user_id", user.id).maybeSingle(),
        supabase.from("room_rules").select("allowed_domains, blocked_domains").eq("room_id", roomId).maybeSingle(),
      ])
      const lists = mergeRules(roomRulesRes.data, userRulesRes.data)
      status = classifyFromLists(domain, lists)
    } else {
      status = classifyDomain(domain)
    }

    let focusState = "on-task"
    if (status === "blocked") focusState = "locked"
    else if (status === "unlisted") focusState = "warning"

    if (!user) setFocusState(focusState)
    return NextResponse.json({ status, focusState })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
