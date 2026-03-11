import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mergeRules } from "@/lib/rules"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const roomId = request.nextUrl.searchParams.get("room_id") ?? null

  const [userRulesRes, roomRulesRes] = await Promise.all([
    supabase.from("user_rules").select("personal_allowed_domains, personal_blocked_domains").eq("user_id", user.id).maybeSingle(),
    roomId
      ? supabase.from("room_rules").select("allowed_domains, blocked_domains").eq("room_id", roomId).maybeSingle()
      : { data: null, error: null },
  ])

  const userRules = userRulesRes.data
  const roomRules = roomRulesRes.data

  const { allowed, blocked } = mergeRules(roomRules, userRules)
  return NextResponse.json({ allowed, blocked })
}
