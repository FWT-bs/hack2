"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function WarningBanner() {
  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        You appear to be off-task. Return to an allowed site to dismiss this warning,
        or you&apos;ll be locked soon.
      </AlertDescription>
    </Alert>
  )
}
