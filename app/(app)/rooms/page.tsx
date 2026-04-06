"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRooms } from "@/hooks/use-rooms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Plus, MessageSquare, LogOut, LogIn, Users, Clock, Tag, ArrowRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

export default function RoomsPage() {
  const router = useRouter()
  const { rooms, myRoomIds, loading, refresh } = useRooms()
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [leavingId, setLeavingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"topic" | "time" | "people">("time")
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const myRoomsRaw = rooms.filter((r) => myRoomIds.has(r.id))
  const allRoomsRaw = rooms

  function sortRooms(list: typeof rooms) {
    const copy = [...list]
    copy.sort((a, b) => {
      if (sortBy === "topic") return (a.topic || "").localeCompare(b.topic || "")
      if (sortBy === "people") return (b.member_count ?? 0) - (a.member_count ?? 0)
      return (a.timeLeftMinutes ?? Number.MAX_SAFE_INTEGER) - (b.timeLeftMinutes ?? Number.MAX_SAFE_INTEGER)
    })
    return copy
  }

  function filterRooms(list: typeof rooms) {
    return sortRooms(
      list.filter((room) => {
        const matchesSearch = !search || room.name.toLowerCase().includes(search.toLowerCase()) || (room.topic ?? "").toLowerCase().includes(search.toLowerCase())
        const tags = (room.tags ?? []).map((t) => t.toLowerCase())
        const matchesTag = !activeTag || tags.includes(activeTag)
        return matchesSearch && matchesTag
      })
    )
  }

  const myRooms = filterRooms(myRoomsRaw)
  const allRooms = filterRooms(allRoomsRaw)
  const allTags = Array.from(new Set(rooms.flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase())))).filter(Boolean)

  async function handleJoin(roomId: string) {
    setJoiningId(roomId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setJoiningId(null); return }
    await supabase.from("room_members").upsert({ room_id: roomId, user_id: user.id, role: "member", left_at: null }, { onConflict: "room_id,user_id" })
    setJoiningId(null)
    refresh()
    router.push(`/rooms/${roomId}`)
    router.refresh()
  }

  async function handleLeave(roomId: string) {
    setLeavingId(roomId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLeavingId(null); return }
    await supabase.from("room_members").update({ left_at: new Date().toISOString() }).eq("room_id", roomId).eq("user_id", user.id)
    setLeavingId(null)
    refresh()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold tracking-tight">Rooms</h1>
        <p className="text-sm text-muted-foreground">Loading rooms…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Rooms</h1>
        <Button asChild className="rounded-sm gap-1.5 h-8 text-xs">
          <Link href="/rooms/new"><Plus className="h-3.5 w-3.5" />New room</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 border border-border rounded-sm p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by name or topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-sm h-8 max-w-xs text-sm"
          />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger size="sm" className="rounded-sm h-8 min-w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time left</SelectItem>
              <SelectItem value="people">People</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1 md:pt-0">
          <Badge
            variant={activeTag === null ? "default" : "outline"}
            className="cursor-pointer rounded-sm text-[10px]"
            onClick={() => setActiveTag(null)}
          >
            All tags
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className="cursor-pointer rounded-sm text-[10px]"
              onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="rounded-sm">
          <TabsTrigger value="my" className="rounded-sm text-xs">My rooms ({myRooms.length})</TabsTrigger>
          <TabsTrigger value="all" className="rounded-sm text-xs">All rooms ({allRooms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-0">
          {myRooms.length === 0 ? (
            <div className="border border-border rounded-sm p-8 text-center">
              <MessageSquare className="h-5 w-5 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">You&apos;re not in any rooms yet.</p>
              <Button asChild variant="outline" className="rounded-sm text-xs h-8">
                <Link href="/rooms/new">Create a room</Link>
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
              {myRooms.map((room) => (
                <RoomCard key={room.id} room={room} isMember onLeave={() => handleLeave(room.id)} leaveLoading={leavingId === room.id} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-0">
          {allRooms.length === 0 ? (
            <div className="border border-border rounded-sm p-8 text-center">
              <p className="text-sm text-muted-foreground">No rooms yet. Create the first one.</p>
              <Button asChild variant="outline" className="rounded-sm mt-3 text-xs h-8">
                <Link href="/rooms/new">Create a room</Link>
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
              {allRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isMember={myRoomIds.has(room.id)}
                  onJoin={() => handleJoin(room.id)}
                  onLeave={() => handleLeave(room.id)}
                  joinLoading={joiningId === room.id}
                  leaveLoading={leavingId === room.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RoomCard({
  room,
  isMember,
  onJoin,
  onLeave,
  joinLoading,
  leaveLoading,
}: {
  room: {
    id: string
    name: string
    topic: string | null
    updated_at: string
    tags?: string[] | null
    member_count?: number
    timeLeftMinutes?: number | null
  }
  isMember: boolean
  onJoin?: () => void
  onLeave?: () => void
  joinLoading?: boolean
  leaveLoading?: boolean
}) {
  const tags = room.tags ?? []

  return (
    <div className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors duration-200">
      <Link href={`/rooms/${room.id}`} className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium truncate">{room.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {room.topic || "No topic"} · {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.member_count ?? 0}</span>
          {room.timeLeftMinutes != null && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{room.timeLeftMinutes}m left</span>}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            <Tag className="h-2.5 w-2.5 text-muted-foreground" />
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground border border-border rounded-sm px-1.5 py-px">{tag}</span>
            ))}
            {tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {isMember ? (
          <>
            <Button asChild size="sm" className="rounded-sm h-7 text-xs">
              <Link href={`/rooms/${room.id}`}>Open</Link>
            </Button>
            {onLeave && (
              <Button size="sm" variant="outline" className="rounded-sm gap-1 h-7 text-xs" onClick={onLeave} disabled={leaveLoading}>
                <LogOut className="h-3 w-3" />Leave
              </Button>
            )}
          </>
        ) : (
          onJoin && (
            <Button size="sm" className="rounded-sm gap-1 h-7 text-xs" onClick={onJoin} disabled={joinLoading}>
              <LogIn className="h-3 w-3" />{joinLoading ? "Joining…" : "Join"}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
