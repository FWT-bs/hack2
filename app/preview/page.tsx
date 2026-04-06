"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Clock, ArrowRight } from "lucide-react"

const MOCK_ROOMS = [
  { id: "1", name: "Algorithms sprint", topic: "LeetCode", members: 4, minutesLeft: 42 },
  { id: "2", name: "Chem midterm cram", topic: "Chemistry", members: 6, minutesLeft: 55 },
  { id: "3", name: "Quiet reading", topic: "English", members: 2, minutesLeft: 30 },
]

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowLeft className="h-3.5 w-3.5" />Back
          </Link>
          <span className="font-semibold text-sm tracking-tight">Preview</span>
          <span className="w-16" aria-hidden />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Offline demo</p>
          <h1 className="text-xl font-semibold tracking-tight">Sample rooms</h1>
          <p className="text-sm text-muted-foreground">
            Static placeholders. Open the interactive demo for the full UI.
          </p>
        </div>

        <Button asChild className="rounded-sm gap-2 text-sm">
          <Link href="/room">Open demo room <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Button>

        <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
          {MOCK_ROOMS.map((r) => (
            <Link key={r.id} href="/room">
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors duration-200">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.topic}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.members}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.minutesLeft}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
