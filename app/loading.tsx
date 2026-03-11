import { Lock } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading LockIn…</p>
      </div>
    </div>
  )
}
