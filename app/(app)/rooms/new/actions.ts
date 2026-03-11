"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createRoom(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not signed in" }
  }

  const name = (formData.get("name") as string)?.trim() || "Study room"
  const topic = (formData.get("topic") as string)?.trim() || null

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .insert({ host_id: user.id, name, topic, visibility: "friends" })
    .select("id")
    .single()

  if (roomErr) {
    return { error: roomErr.message }
  }

  await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id, role: "host" })
  await supabase.from("room_rules").insert({
    room_id: room.id,
    allowed_domains: ["docs.google.com", "stackoverflow.com", "github.com", "developer.mozilla.org", "localhost"],
    blocked_domains: ["youtube.com", "reddit.com", "twitter.com", "tiktok.com", "instagram.com", "x.com"],
    strictness: "standard",
  })

  redirect(`/rooms/${room.id}`)
}
