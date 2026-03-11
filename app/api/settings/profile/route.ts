import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, school, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  return NextResponse.json({
    email: user.email,
    profile: profile ?? null,
  })
}

export async function PATCH(request: NextRequest) {
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

  const updates: Record<string, string | null> = {}

  if (typeof body.full_name === "string") updates.full_name = body.full_name.trim() || null
  if (typeof body.school === "string") updates.school = body.school.trim() || null
  if (typeof body.bio === "string") updates.bio = body.bio.trim() || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

