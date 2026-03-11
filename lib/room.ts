import type { RealtimeChannel } from "@supabase/supabase-js"

export type Room = {
  id: string
  host_id: string
  name: string
  topic: string | null
  visibility: string
  created_at: string
  updated_at: string
  tags?: string[] | null
  planned_duration_minutes?: number | null
  ends_at?: string | null
}

export type MessageRow = {
  id: string
  room_id: string
  user_id: string
  content: string
  type: "message" | "system" | "reaction"
  created_at: string
  profiles?: { full_name: string | null; username: string | null } | null
}

export type MessageInsert = Pick<MessageRow, "user_id" | "content" | "type"> & { room_id: string }

export function messageToDisplayName(row: MessageRow): string {
  const p = row.profiles
  if (p?.full_name?.trim()) return p.full_name.trim()
  if (p?.username?.trim()) return p.username.trim()
  return "Someone"
}
