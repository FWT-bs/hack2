import { History } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">History</h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Session recaps and accountability history will show here after you complete focus sessions.
        </p>
      </div>
    </div>
  )
}
