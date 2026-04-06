"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Clock, ArrowRight, Activity } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"
import { createClient } from "@/lib/supabase/client"

type FriendNow = { id: string; name: string; avatarUrl: string | null; inRoom: boolean }

export default function HomePage() {
  const { rooms, myRoomIds } = useRooms()
  const [friends, setFriends] = useState<FriendNow[]>([])

  useEffect(() => {
    async function loadFriends() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setFriends([]); return }
      const { data: friendRows } = await supabase.from("friends").select("user_id, friend_id, status").or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq("status", "accepted")
      if (!friendRows || friendRows.length === 0) { setFriends([]); return }
      const friendIds = Array.from(new Set(friendRows.map((row) => (row.user_id === user.id ? row.friend_id : row.user_id))))
      const [{ data: profiles }, { data: memberships }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url").in("id", friendIds),
        supabase.from("room_members").select("user_id, left_at").in("user_id", friendIds).is("left_at", null),
      ])
      const activeSet = new Set((memberships ?? []).filter(m => !m.left_at).map(m => m.user_id as string))
      setFriends(profiles?.map(p => ({
        id: p.id as string,
        name: (p.full_name as string | null) || "Friend",
        avatarUrl: (p.avatar_url as string | null) ?? null,
        inRoom: activeSet.has(p.id as string),
      })) ?? [])
    }
    void loadFriends()
    const interval = setInterval(() => void loadFriends(), 30_000)
    return () => clearInterval(interval)
  }, [])

  const myRooms = useMemo(() => rooms.filter(r => myRoomIds.has(r.id)), [rooms, myRoomIds])
  const activeRoom = useMemo(() => myRooms.find(r => r.timeLeftMinutes != null && r.timeLeftMinutes > 0) ?? myRooms[0], [myRooms])
  const otherRooms = useMemo(() => rooms.filter(r => !myRoomIds.has(r.id)).slice(0, 4), [rooms, myRoomIds])

  return (
    <div className="space-y-10">

      {/* Active session */}
      {activeRoom ? (
        <div className="border border-border rounded-sm p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-slow" />
                Active session
              </p>
              <h2 className="text-lg font-semibold tracking-tight">{activeRoom.name}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{activeRoom.member_count ?? 0} members</span>
                {activeRoom.timeLeftMinutes != null && (
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activeRoom.timeLeftMinutes}m left</span>
                )}
              </div>
            </div>
            <Button asChild className="rounded-sm gap-2 h-9 text-xs">
              <Link href={`/rooms/${activeRoom.id}`}>Resume <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-sm p-8 text-center space-y-4">
          <Activity className="h-5 w-5 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No active session. Create or join a room to start.</p>
          <Button asChild className="rounded-sm gap-2 h-9 text-xs">
            <Link href="/rooms/new"><Plus className="h-3 w-3" />Create a room</Link>
          </Button>
        </div>
      )}

      {/* Friends */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Friends</h2>
          <Link href="/friends" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">Manage</Link>
        </div>
        {friends.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {friends.map(f => (
              <div key={f.id} className="flex items-center gap-2 border border-border rounded-sm px-3 py-2">
                <div className="relative">
                  <Avatar className="h-6 w-6 rounded-sm">
                    <AvatarImage src={f.avatarUrl ?? ""} />
                    <AvatarFallback className="text-[9px] rounded-sm">{f.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-background ${f.inRoom ? "bg-foreground" : "bg-muted-foreground/30"}`} />
                </div>
                <div>
                  <p className="text-xs font-medium">{f.name}</p>
                  <p className={`text-[10px] ${f.inRoom ? "text-foreground" : "text-muted-foreground"}`}>{f.inRoom ? "In session" : "Offline"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Add friends to see who&apos;s studying.</p>
        )}
      </section>

      {/* Live rooms */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Live rooms</h2>
          <Link href="/rooms" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">View all</Link>
        </div>
        {otherRooms.length > 0 ? (
          <div className="grid gap-px border border-border rounded-sm overflow-hidden">
            {otherRooms.map(room => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="bg-card p-4 hover:bg-muted/40 transition-colors duration-200 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium tracking-tight truncate">{room.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.member_count ?? 0}</span>
                      {room.timeLeftMinutes != null && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{room.timeLeftMinutes}m</span>}
                      {room.topic && <span className="truncate">{room.topic}</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-sm p-8 text-center">
            <p className="text-xs text-muted-foreground">No rooms active. Be the first.</p>
            <Button asChild variant="outline" size="sm" className="rounded-sm mt-3 h-8 text-xs">
              <Link href="/rooms/new">Create a room</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
