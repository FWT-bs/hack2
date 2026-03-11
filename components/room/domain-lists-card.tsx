"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldX, Plus, X, Loader2, UserCircle2 } from "lucide-react"
import { toast } from "sonner"

function normalize(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase().trim()
}

type AuditEvent = {
  id: number
  domain: string
  list: "allowed" | "blocked"
  action: "add" | "remove"
  actor: string
  createdAt: string
}

export function DomainListsCard() {
  const [allowed, setAllowed] = useState<string[]>([])
  const [blocked, setBlocked] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [addAllowedInput, setAddAllowedInput] = useState("")
  const [addBlockedInput, setAddBlockedInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [audit, setAudit] = useState<AuditEvent[]>([])

  const fetchLists = useCallback(async () => {
    try {
      const res = await fetch("/api/activity/domains")
      if (!res.ok) return
      const data = await res.json()
      setAllowed(data.allowed || [])
      setBlocked(data.blocked || [])
    } catch {
      toast.error("Could not load domain lists")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  async function postUpdate(updates: {
    addAllowed?: string[]
    removeAllowed?: string[]
    addBlocked?: string[]
    removeBlocked?: string[]
  }) {
    setBusy(true)
    try {
      const res = await fetch("/api/activity/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Update failed")
      const data = await res.json()
      setAllowed(data.allowed || [])
      setBlocked(data.blocked || [])
    } catch {
      toast.error("Could not update lists")
    } finally {
      setBusy(false)
    }
  }

  function handleAddAllowed() {
    const d = normalize(addAllowedInput)
    if (!d) {
      toast.error("Enter a domain (e.g. example.com)")
      return
    }
    if (allowed.some((a) => normalize(a) === d)) {
      toast.info("Already in allowed list")
      return
    }
    if (blocked.some((b) => normalize(b) === d)) {
      toast.error("Domain is in blocked list. Remove it from blocked first.")
      return
    }
    setAddAllowedInput("")
    const actor = "You"
    setAudit((prev) => [
      {
        id: Date.now(),
        domain: d,
        list: "allowed",
        action: "add",
        actor,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    postUpdate({ addAllowed: [d] })
    toast.success("Added to allowed")
  }

  function handleRemoveAllowed(domain: string) {
    const actor = "You"
    setAudit((prev) => [
      {
        id: Date.now(),
        domain,
        list: "allowed",
        action: "remove",
        actor,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    postUpdate({ removeAllowed: [domain] })
    toast.success("Removed from allowed")
  }

  function handleAddBlocked() {
    const d = normalize(addBlockedInput)
    if (!d) {
      toast.error("Enter a domain (e.g. example.com)")
      return
    }
    if (blocked.some((b) => normalize(b) === d)) {
      toast.info("Already in blocked list")
      return
    }
    if (allowed.some((a) => normalize(a) === d)) {
      toast.error("Domain is in allowed list. Remove it from allowed first.")
      return
    }
    setAddBlockedInput("")
    const actor = "You"
    setAudit((prev) => [
      {
        id: Date.now() + 1,
        domain: d,
        list: "blocked",
        action: "add",
        actor,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    postUpdate({ addBlocked: [d] })
    toast.success("Added to blocked")
  }

  function handleRemoveBlocked(domain: string) {
    const actor = "You"
    setAudit((prev) => [
      {
        id: Date.now() + 2,
        domain,
        list: "blocked",
        action: "remove",
        actor,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    postUpdate({ removeBlocked: [domain] })
    toast.success("Removed from blocked")
  }

  if (loading) {
    return (
      <Card className="rounded-xl border-border shadow-sm">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Allowed & blocked sites</CardTitle>
        <p className="text-xs text-muted-foreground">
          Allowed: no overlay. Blocked: lock overlay on that site. Other sites show a warning.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Allowed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <ShieldCheck className="h-4 w-4" />
            Allowed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allowed.map((d) => (
              <Badge
                key={d}
                variant="secondary"
                className="gap-1 pr-1 font-mono text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
              >
                {d}
                <button
                  type="button"
                  onClick={() => handleRemoveAllowed(d)}
                  disabled={busy}
                  className="rounded p-0.5 hover:bg-green-500/20"
                  aria-label={`Remove ${d}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. notion.so"
              value={addAllowedInput}
              onChange={(e) => setAddAllowedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAllowed()}
              className="font-mono text-sm h-8"
            />
            <Button size="sm" onClick={handleAddAllowed} disabled={busy} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>

        {/* Blocked */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
            <ShieldX className="h-4 w-4" />
            Blocked
          </div>
          <div className="flex flex-wrap gap-1.5">
            {blocked.map((d) => (
              <Badge
                key={d}
                variant="secondary"
                className="gap-1 pr-1 font-mono text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
              >
                {d}
                <button
                  type="button"
                  onClick={() => handleRemoveBlocked(d)}
                  disabled={busy}
                  className="rounded p-0.5 hover:bg-red-500/20"
                  aria-label={`Remove ${d}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. youtube.com"
              value={addBlockedInput}
              onChange={(e) => setAddBlockedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddBlocked()}
              className="font-mono text-sm h-8"
            />
            <Button size="sm" variant="destructive" onClick={handleAddBlocked} disabled={busy} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>

        {/* Audit log (per room, this browser only) */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            Audit log
          </div>
          {audit.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No changes yet. When someone adds or removes a domain in this room, it will show up here.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
              {audit.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-muted-foreground">
                  <span className={e.list === "blocked" ? "text-red-400" : "text-green-400"}>
                    {e.list === "blocked" ? "Blocked" : "Allowed"}
                  </span>
                  <span className="font-mono">{e.domain}</span>
                  <span>— {e.action === "add" ? "added by" : "removed by"} {e.actor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
