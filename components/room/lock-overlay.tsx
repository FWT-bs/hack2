"use client"

import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, MessageSquare } from "lucide-react"

type Props = {
  onReturnToTask: () => void
  onRequestReview: () => void
}

export function LockOverlay({ onReturnToTask, onRequestReview }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Session Locked</h2>
          <p className="text-muted-foreground mt-2">
            You&apos;ve been off-task for too long. Return to an allowed website
            or submit a break request for your group to review.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={onReturnToTask} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            I&apos;m back on task
          </Button>
          <Button variant="outline" onClick={onRequestReview} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Request accountability review
          </Button>
        </div>
      </div>
    </div>
  )
}
