import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const {
    room_id,
    session_id,
    event_type,
    domain,
    url,
  } = body as {
    room_id?: string | null
    session_id?: string | null
    event_type?: string
    domain?: string | null
    url?: string | null
  }

  if (!event_type || typeof event_type !== "string") {
    return NextResponse.json({ error: "Missing event_type" }, { status: 400 })
  }

  const { error } = await supabase.from("focus_events").insert({
    user_id: user.id,
    room_id: room_id ?? null,
    session_id: session_id ?? null,
    event_type,
    domain: domain ?? null,
    url: url ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

