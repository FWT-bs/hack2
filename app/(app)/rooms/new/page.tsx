"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const SUGGESTED_TAGS = [
  "calculus",
  "chemistry",
  "finals",
  "homework",
  "quiet",
  "pomodoro",
  "coding",
  "exam-prep",
  "essay-writing",
]

export default function NewRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [duration, setDuration] = useState<number>(50)

  function toggleTag(tag: string) {
    const value = tag.trim().toLowerCase()
    if (!value) return
    setTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value].slice(0, 8)
    )
  }

  function handleAddCustomTag() {
    const value = newTag.trim().toLowerCase().replace(/\s+/g, "-")
    if (!value) return
    if (!tags.includes(value)) {
      setTags((prev) => [...prev, value].slice(0, 8))
    }
    setNewTag("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = (formData.get("name") as string)?.trim() || "Study room"
    const topic = (formData.get("topic") as string)?.trim() || null

    const supabase = createClient()
    const { data: roomId, error: rpcError } = await supabase.rpc("create_room", {
      p_duration_minutes: duration,
      p_name: name,
      p_tags: tags,
      p_topic: topic,
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }
    if (!roomId) {
      setError("Failed to create room")
      setLoading(false)
      return
    }
    router.push(`/rooms/${roomId}`)
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create a room</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Room name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Algorithms study"
            className="rounded-xl"
            defaultValue=""
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic">Topic (optional)</Label>
          <Input
            id="topic"
            name="topic"
            placeholder="e.g. CS 101"
            className="rounded-xl"
            defaultValue=""
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <p className="text-xs text-muted-foreground">
            Add a few labels so other students can discover this room.
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => {
              const active = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs rounded-full border px-2 py-1 transition-all ${
                    active
                      ? "border-primary/70 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/70"
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="custom-tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag (e.g. physics-lab)"
              className="rounded-xl"
            />
            <Button type="button" size="sm" className="rounded-xl" onClick={handleAddCustomTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full text-[11px] cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Planned duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={15}
            max={180}
            className="rounded-xl w-24"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value || 50))}
          />
          <p className="text-xs text-muted-foreground">
            Used to show &quot;time left&quot; in discovery and in the room header.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? "Creating…" : "Create room"}
        </Button>
      </form>
    </div>
  )
}
