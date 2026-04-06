"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { StudyRoom } from "@/components/room/study-room"
import { useRoom } from "@/hooks/use-room"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { room, messages, members, sendMessage, loading, userId } = useRoom(roomId)

  async function handleLeaveRoom() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("room_members")
      .update({ left_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", user.id)
    router.push("/rooms")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Loading room…</p>
      </div>
    )
  }
  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Room not found.</p>
        <Button asChild variant="outline">
          <Link href="/rooms">Back to rooms</Link>
        </Button>
      </div>
    )
  }

  return (
    <StudyRoom
      roomId={roomId}
      roomName={room.name}
      roomTopic={room.topic ?? undefined}
      messages={messages}
      members={members}
      currentUserId={userId ?? undefined}
      startedAt={room.created_at}
      durationMinutes={room.planned_duration_minutes ?? 60}
      onSendMessage={sendMessage}
      onLeaveRoom={handleLeaveRoom}
    />
  )
}
