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
import { Plus, MessageSquare, LogOut, LogIn, Users, Clock, Tag } from "lucide-react"
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
      if (sortBy === "topic") {
        const ta = (a.topic || "").toLowerCase()
        const tb = (b.topic || "").toLowerCase()
        return ta.localeCompare(tb)
      }
      if (sortBy === "people") {
        const ca = a.member_count ?? 0
        const cb = b.member_count ?? 0
        return cb - ca
      }
      // time left
      const ta = a.timeLeftMinutes ?? Number.MAX_SAFE_INTEGER
      const tb = b.timeLeftMinutes ?? Number.MAX_SAFE_INTEGER
      return ta - tb
    })
    return copy
  }

  function filterRooms(list: typeof rooms) {
    return sortRooms(
      list.filter((room) => {
        const matchesSearch =
          !search ||
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          (room.topic ?? "").toLowerCase().includes(search.toLowerCase())

        const tags = (room.tags ?? []).map((t) => t.toLowerCase())
        const matchesTag = !activeTag || tags.includes(activeTag)

        return matchesSearch && matchesTag
      })
    )
  }

  const myRooms = filterRooms(myRoomsRaw)
  const allRooms = filterRooms(allRoomsRaw)

  const allTags = Array.from(
    new Set(
      rooms.flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase()))
    )
  ).filter(Boolean)

  async function handleJoin(roomId: string) {
    setJoiningId(roomId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setJoiningId(null)
      return
    }
    await supabase.from("room_members").insert({ room_id: roomId, user_id: user.id, role: "member" })
    setJoiningId(null)
    refresh()
    router.push(`/rooms/${roomId}`)
    router.refresh()
  }

  async function handleLeave(roomId: string) {
    setLeavingId(roomId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLeavingId(null)
      return
    }
    await supabase
      .from("room_members")
      .update({ left_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", user.id)
    setLeavingId(null)
    refresh()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Rooms</h1>
        </div>
        <p className="text-muted-foreground text-sm">Loading rooms…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rooms</h1>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/rooms/new">
            <Plus className="h-4 w-4" />
            New room
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by name or topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl h-9 max-w-xs"
          />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger size="sm" className="rounded-xl h-9 min-w-[130px]">
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
            className="cursor-pointer rounded-full text-[11px]"
            onClick={() => setActiveTag(null)}
          >
            All tags
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className="cursor-pointer rounded-full text-[11px]"
              onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="my" className="rounded-lg">
            My rooms ({myRooms.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg">
            All rooms ({allRooms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-3">
          {myRooms.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                You’re not in any rooms yet. Create one or join from All rooms.
              </p>
              <Button asChild variant="secondary" className="rounded-xl">
                <Link href="/rooms/new">Create a room</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {myRooms.map((room) => (
                <li key={room.id}>
                  <RoomCard
                    room={room}
                    isMember
                    onLeave={() => handleLeave(room.id)}
                    leaveLoading={leavingId === room.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          {allRooms.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No rooms yet. Create the first one.</p>
              <Button asChild variant="secondary" className="rounded-xl mt-3">
                <Link href="/rooms/new">Create a room</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {allRooms.map((room) => (
                <li key={room.id}>
                  <RoomCard
                    room={room}
                    isMember={myRoomIds.has(room.id)}
                    onJoin={() => handleJoin(room.id)}
                    onLeave={() => handleLeave(room.id)}
                    joinLoading={joiningId === room.id}
                    leaveLoading={leavingId === room.id}
                  />
                </li>
              ))}
            </ul>
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
  const primaryTags = tags.slice(0, 3)
  const extraCount = Math.max(tags.length - primaryTags.length, 0)

  return (
    <div className="rounded-xl border border-border bg-card/90 p-4 flex items-center justify-between gap-4 hover:border-primary/40 hover:bg-card transition-colors">
      <Link href={`/rooms/${room.id}`} className="min-w-0 flex-1 space-y-1.5">
        <p className="font-medium truncate">{room.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {room.topic || "No topic"} · updated {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{room.member_count ?? 0} people</span>
          </span>
          {room.timeLeftMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{room.timeLeftMinutes} min left</span>
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {primaryTags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full text-[10px] px-2 py-0">
                {tag}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0">
                +{extraCount} more
              </Badge>
            )}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {isMember ? (
          <>
            <Button asChild size="sm" variant="default" className="rounded-lg">
              <Link href={`/rooms/${room.id}`}>Open</Link>
            </Button>
            {onLeave && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg gap-1"
                onClick={onLeave}
                disabled={leaveLoading}
              >
                <LogOut className="h-3.5 w-3.5" />
                Leave
              </Button>
            )}
          </>
        ) : (
          onJoin && (
            <Button
              size="sm"
              className="rounded-lg gap-1"
              onClick={onJoin}
              disabled={joinLoading}
            >
              <LogIn className="h-3.5 w-3.5" />
              {joinLoading ? "Joining…" : "Join"}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
