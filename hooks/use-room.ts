"use client"

import { useState, useEffect, useCallback } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Room } from "@/lib/room"
import type { DemoMessage } from "@/components/room/demo-room"
import { messageToDisplayName, type MessageRow } from "@/lib/room"

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data: roomData, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single()
      if (roomErr || !roomData) {
        setRoom(null)
        setLoading(false)
        return
      }
      setRoom(roomData as Room)

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, profiles(full_name, username)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
      const list = (messagesData ?? []).map((row: MessageRow) => ({
        id: row.id,
        user_id: row.user_id,
        content: row.content,
        type: row.type as "message" | "system",
        created_at: row.created_at,
        displayName: messageToDisplayName(row),
      }))
      setMessages(list)

      channel = supabase
        .channel(`room:${roomId}:messages`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
          (payload) => {
            const newRow = payload.new as { id: string; user_id: string; content: string; type: string; created_at: string }
            setMessages((prev) => [
              ...prev,
              {
                id: newRow.id,
                user_id: newRow.user_id,
                content: newRow.content,
                type: newRow.type as "message" | "system",
                created_at: newRow.created_at,
                displayName: newRow.user_id === userId ? "You" : "Someone",
              },
            ])
          }
        )
        .subscribe()
      setLoading(false)
    }

    load()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [roomId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!roomId || !userId) return
      const supabase = createClient()
      const { data: inserted } = await supabase
        .from("messages")
        .insert({ room_id: roomId, user_id: userId, content, type: "message" })
        .select("id, user_id, content, type, created_at")
        .single()
      if (inserted) {
        const { data: profile } = await supabase.from("profiles").select("full_name, username").eq("id", userId).single()
        const displayName = profile?.full_name?.trim() || profile?.username?.trim() || "You"
        setMessages((prev) => [
          ...prev,
          {
            id: inserted.id,
            user_id: inserted.user_id,
            content: inserted.content,
            type: inserted.type as "message" | "system",
            created_at: inserted.created_at,
            displayName,
          },
        ])
      }
    },
    [roomId, userId]
  )

  return { room, messages, sendMessage, loading, userId }
}
