"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    setTags((prev) => prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value].slice(0, 8))
  }

  function handleAddCustomTag() {
    const value = newTag.trim().toLowerCase().replace(/\s+/g, "-")
    if (!value) return
    if (!tags.includes(value)) setTags((prev) => [...prev, value].slice(0, 8))
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
    const { data: roomId, error: rpcError } = await supabase.rpc("create_room", { p_name: name, p_topic: topic })

    if (rpcError) { setError(rpcError.message); setLoading(false); return }
    if (!roomId) { setError("Failed to create room"); setLoading(false); return }

    const endsAt = typeof duration === "number" && duration > 0 ? new Date(Date.now() + duration * 60_000).toISOString() : null
    await supabase.from("rooms").update({ tags, planned_duration_minutes: duration, ends_at: endsAt }).eq("id", roomId)

    router.push(`/rooms/${roomId}`)
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">New session</p>
        <h1 className="text-lg font-semibold tracking-tight">Configure your room</h1>
      </div>

      <form onSubmit={handleSubmit} className="border border-border rounded-sm p-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs">Room name</Label>
          <Input id="name" name="name" placeholder="e.g. Algorithms study" className="rounded-sm" defaultValue="" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic" className="text-xs">Topic (optional)</Label>
          <Input id="topic" name="topic" placeholder="e.g. CS 101" className="rounded-sm" defaultValue="" />
        </div>

        <div className="space-y-3">
          <Label className="text-xs">Tags</Label>
          <p className="text-[11px] text-muted-foreground">Add labels so others can discover this room.</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const active = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] rounded-sm border px-2 py-1 transition-colors duration-200 ${
                    active
                      ? "border-foreground/50 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Custom tag"
              className="rounded-sm text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomTag() } }}
            />
            <Button type="button" size="sm" variant="outline" className="rounded-sm h-8 text-xs shrink-0" onClick={handleAddCustomTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="text-[10px] rounded-sm border border-foreground/30 bg-foreground/5 text-foreground px-2 py-0.5 hover:bg-foreground/10 transition-colors duration-200"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-xs">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={15}
            max={180}
            className="rounded-sm w-24"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value || 50))}
          />
          <p className="text-[11px] text-muted-foreground">Shows &quot;time left&quot; in discovery and room header.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full rounded-sm" disabled={loading}>
          {loading ? "Creating…" : "Create room"}
        </Button>
      </form>
    </div>
  )
}
