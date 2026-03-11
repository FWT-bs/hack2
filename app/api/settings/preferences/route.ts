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

  const [{ data: settings }, { data: focus }] = await Promise.all([
    supabase
      .from("user_settings")
      .select(
        "email_room_invites, email_focus_recaps, push_break_reminders, show_real_name, share_current_room_with_friends, share_focus_history_with_room, theme, density"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_focus_settings")
      .select(
        "default_strictness, grace_seconds_before_warning, max_warnings_before_lock, allow_break_requests, auto_share_off_task_events"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  return NextResponse.json({
    settings: settings ?? null,
    focus: focus ?? null,
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

  const { settings, focus } = body as {
    settings?: Record<string, unknown>
    focus?: Record<string, unknown>
  }

  const tasks: Promise<unknown>[] = []

  if (settings && typeof settings === "object") {
    const s: Record<string, unknown> = {}
    if (typeof settings.email_room_invites === "boolean") s.email_room_invites = settings.email_room_invites
    if (typeof settings.email_focus_recaps === "boolean") s.email_focus_recaps = settings.email_focus_recaps
    if (typeof settings.push_break_reminders === "boolean") s.push_break_reminders = settings.push_break_reminders
    if (typeof settings.show_real_name === "boolean") s.show_real_name = settings.show_real_name
    if (typeof settings.share_current_room_with_friends === "boolean")
      s.share_current_room_with_friends = settings.share_current_room_with_friends
    if (typeof settings.share_focus_history_with_room === "boolean")
      s.share_focus_history_with_room = settings.share_focus_history_with_room
    if (typeof settings.theme === "string") s.theme = settings.theme
    if (typeof settings.density === "string") s.density = settings.density

    if (Object.keys(s).length > 0) {
      tasks.push(
        supabase
          .from("user_settings")
          .upsert({ user_id: user.id, ...s }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) throw new Error(error.message)
          })
      )
    }
  }

  if (focus && typeof focus === "object") {
    const f: Record<string, unknown> = {}
    if (typeof focus.default_strictness === "string") f.default_strictness = focus.default_strictness
    if (typeof focus.grace_seconds_before_warning === "number")
      f.grace_seconds_before_warning = focus.grace_seconds_before_warning
    if (typeof focus.max_warnings_before_lock === "number") f.max_warnings_before_lock = focus.max_warnings_before_lock
    if (typeof focus.allow_break_requests === "boolean") f.allow_break_requests = focus.allow_break_requests
    if (typeof focus.auto_share_off_task_events === "boolean")
      f.auto_share_off_task_events = focus.auto_share_off_task_events

    if (Object.keys(f).length > 0) {
      tasks.push(
        supabase
          .from("user_focus_settings")
          .upsert({ user_id: user.id, ...f }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) throw new Error(error.message)
          })
      )
    }
  }

  if (tasks.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  try {
    await Promise.all(tasks)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to update preferences" }, { status: 400 })
  }
}

