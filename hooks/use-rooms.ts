"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Room } from "@/lib/room"

export type RoomWithMembership = Room & {
  my_membership?: { left_at: string | null; role: string }
  member_count?: number
  timeLeftMinutes?: number | null
}

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithMembership[]>([])
  const [myRoomIds, setMyRoomIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)

    const [roomsRes, myMembersRes, allMembersRes] = await Promise.all([
      supabase
        .from("rooms")
        .select(
          "id, host_id, name, topic, visibility, created_at, updated_at, tags, planned_duration_minutes, ends_at"
        )
        .order("updated_at", { ascending: false }),
      user
        ? supabase
            .from("room_members")
            .select("room_id, left_at, role")
            .eq("user_id", user.id)
        : { data: [] as { room_id: string; left_at: string | null; role: string }[] },
      user
        ? supabase.from("room_members").select("room_id").is("left_at", null)
        : { data: [] as { room_id: string }[] },
    ])

    const roomList = (roomsRes.data ?? []) as RoomWithMembership[]
    const myMembers = (myMembersRes.data ?? []) as { room_id: string; left_at: string | null; role: string }[]
    const allMembers = (allMembersRes.data ?? []) as { room_id: string }[]

    const inRoomIds = new Set(myMembers.filter((m) => !m.left_at).map((m) => m.room_id))

    const myByRoomId = new Map(myMembers.map((m) => [m.room_id, { left_at: m.left_at, role: m.role }]))
    const countsByRoomId = new Map<string, number>()
    allMembers.forEach((m) => {
      countsByRoomId.set(m.room_id, (countsByRoomId.get(m.room_id) ?? 0) + 1)
    })

    const now = Date.now()
    roomList.forEach((r) => {
      const membership = myByRoomId.get(r.id)
      if (membership) r.my_membership = membership

      r.member_count = countsByRoomId.get(r.id) ?? 0

      if (r.ends_at) {
        const msLeft = new Date(r.ends_at).getTime() - now
        r.timeLeftMinutes = msLeft > 0 ? Math.round(msLeft / 60000) : 0
      } else {
        r.timeLeftMinutes = null
      }
    })

    setRooms(roomList)
    setMyRoomIds(inRoomIds)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()

    // Keep rooms, member counts, and time-left reasonably fresh.
    const interval = setInterval(() => {
      void refresh()
    }, 30_000)

    return () => clearInterval(interval)
  }, [refresh])

  return { rooms, myRoomIds, loading, userId, refresh }
}
