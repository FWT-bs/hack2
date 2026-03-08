"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, LayoutList, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const LOCKIN_GET_ALL_TABS = "LOCKIN_GET_ALL_TABS"
const LOCKIN_ALL_TABS_RESULT = "LOCKIN_ALL_TABS_RESULT"
const PAGE_SOURCE = "lockin-page"

export type TabInfo = {
  id: number
  title: string
  url: string
  domain: string
  active: boolean
}

export function TabSearchButton() {
  const [open, setOpen] = useState(false)
  const [tabs, setTabs] = useState<TabInfo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const respondedRef = useRef(false)
  const fetchTabs = useCallback(() => {
    setLoading(true)
    setError(null)
    setTabs(null)
    respondedRef.current = false
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== LOCKIN_ALL_TABS_RESULT || event.data?.source !== "lockin-content") return
      respondedRef.current = true
      window.removeEventListener("message", handler)
      setLoading(false)
      const payload = event.data.payload
      if (Array.isArray(payload)) {
        setTabs(payload)
      } else if (payload?.error) {
        setError(payload.error)
        toast.error("Install the LockIn Chrome extension to search your tabs.")
      } else {
        setError("Could not load tabs")
      }
    }
    window.addEventListener("message", handler)
    window.postMessage({ type: LOCKIN_GET_ALL_TABS, source: PAGE_SOURCE }, "*")
    const t = setTimeout(() => {
      window.removeEventListener("message", handler)
      if (respondedRef.current) return
      setLoading(false)
      setError("Extension not detected")
      toast.info("Install the LockIn Chrome extension to enable tab search.")
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (open) fetchTabs()
  }, [open])

  const filteredTabs = useMemo(() => {
    if (!tabs) return []
    const q = query.trim().toLowerCase()
    if (!q) return tabs
    return tabs.filter(
      (tab) =>
        tab.title.toLowerCase().includes(q) ||
        tab.domain.toLowerCase().includes(q) ||
        tab.url.toLowerCase().includes(q)
    )
  }, [tabs, query])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <LayoutList className="h-4 w-4" />
        Enable tab search
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tab search</DialogTitle>
            <DialogDescription>
              Search and view your open browser tabs. Requires the LockIn extension.
            </DialogDescription>
          </DialogHeader>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading tabs…
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error === "Extension not detected" ? "Install the LockIn Chrome extension to search your tabs." : String(error)}
            </div>
          )}
          {tabs && !loading && (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or URL…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="h-[280px] rounded-lg border border-border">
                <ul className="p-2 space-y-0.5">
                  {filteredTabs.length === 0 ? (
                    <li className="py-4 text-center text-sm text-muted-foreground">
                      {query.trim() ? "No tabs match your search." : "No tabs in this window."}
                    </li>
                  ) : (
                    filteredTabs.map((tab) => (
                      <li key={tab.id}>
                        <a
                          href={tab.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col gap-0.5 rounded-md px-2 py-2 hover:bg-muted/80 transition-colors text-left"
                        >
                          <span className="text-sm font-medium truncate" title={tab.title}>
                            {tab.title || "Untitled"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate" title={tab.url}>
                            {tab.domain}
                          </span>
                          {tab.active && (
                            <span className="text-xs text-primary">Current tab</span>
                          )}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
