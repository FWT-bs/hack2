"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Scan, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const LOCKIN_GET_TAB = "LOCKIN_GET_TAB"
const LOCKIN_TAB_RESULT = "LOCKIN_TAB_RESULT"
const PAGE_SOURCE = "lockin-page"

type FocusState = "on-task" | "warning" | "locked" | "approved-break"

type Props = {
  onFocusUpdate?: (state: FocusState, domain?: string) => void
}

export function CheckFocusButton({ onFocusUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [lastDomain, setLastDomain] = useState<string | null>(null)
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null)
  const respondedRef = useRef(false)

  const checkFocus = useCallback(() => {
    setLoading(true)
    setLastDomain(null)
    respondedRef.current = false
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== LOCKIN_TAB_RESULT || event.data?.source !== "lockin-content") return
      respondedRef.current = true
      window.removeEventListener("message", handler)
      setLoading(false)
      const payload = event.data.payload
      if (payload?.error) {
        setExtensionAvailable(false)
        toast.error("Extension not detected. Install the LockIn Chrome extension to check your current tab.")
        return
      }
      setExtensionAvailable(true)
      const domain = payload.domain
      const url = payload.url
      if (!domain) {
        toast.error("Could not read current tab.")
        return
      }
      setLastDomain(domain)
      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, url }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.focusState) onFocusUpdate?.(data.focusState, domain)
          const status = data.status
          if (status === "allowed") toast.success(`On task: ${domain}`)
          else if (status === "blocked") toast.error(`Blocked site: ${domain}`)
          else toast.warning(`Unlisted site: ${domain} — consider staying on allowed sites.`)
        })
        .catch(() => {
          toast.error("Failed to report focus state.")
        })
    }
    window.addEventListener("message", handler)
    window.postMessage({ type: LOCKIN_GET_TAB, source: PAGE_SOURCE }, "*")
    const t = setTimeout(() => {
      window.removeEventListener("message", handler)
      if (respondedRef.current) return
      setLoading(false)
      setExtensionAvailable(false)
      toast.info("Install the LockIn Chrome extension to check your current tab from this page.")
    }, 2000)
    return () => clearTimeout(t)
  }, [onFocusUpdate])

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" size="sm" onClick={checkFocus} disabled={loading} className="gap-2 motion-cta motion-cta-hover">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Scan className="h-4 w-4" />
        )}
        Check my focus
      </Button>
      {lastDomain && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Current tab: {lastDomain}
        </p>
      )}
      {extensionAvailable === false && !loading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          Extension required. Only your active browser tab is checked, not other apps.
        </p>
      )}
    </div>
  )
}
