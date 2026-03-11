"use client"

import { AlertTriangle } from "lucide-react"

export function WarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          You appear to be off-task
        </p>
        <p className="text-xs text-muted-foreground">
          Return to an allowed site to clear this warning, or you&apos;ll be locked out soon.
        </p>
      </div>
    </div>
  )
}
